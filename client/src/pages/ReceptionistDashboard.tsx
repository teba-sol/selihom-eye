import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Calendar, Users, LogOut, Printer, CheckCircle2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { AddPatientModal } from '../components/AddPatientModal';
import { api } from '../lib/api';
import { formatDobEthiopian, patientFullName } from '../lib/formatters';
import { listOpticalOrders, deliverOpticalOrder, type OpticalOrder } from '../lib/opticalOrders';
import { printOpticalRx } from '../components/OpticalRxCard';

function formatRxShort(v?: string | number | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  const out = n === 0 ? '0' : String(n);
  return out.replace('-0', '0');
}

interface ApiPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  grandfatherName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string;
  createdAt: string;
}

interface ApiAppointment {
  id: string;
  patientId: string;
  scheduledDate: string;
  startTime: string | null;
  reason: string | null;
  status: string;
  patient?: { firstName: string; lastName: string; phone: string };
}

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const addPatient = useAppStore((s) => s.addPatient);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiPatient[]>([]);
  const [searching, setSearching] = useState(false);

  const [todayAppts, setTodayAppts] = useState<ApiAppointment[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<ApiPatient[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OpticalOrder[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchOpticalOrders = async () => {
    try {
      const orders = await listOpticalOrders('READY_TO_DELIVER');
      setPendingOrders(orders);
    } catch {
      // silent
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [todayApts, allPatients] = await Promise.all([
        api.get<ApiAppointment[]>(`/appointments?from=${todayStr}&to=${todayStr}`),
        api.get<ApiPatient[]>('/patients'),
      ]);
      setTodayAppts(todayApts);

      const recent = allPatients
        .slice()
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, 8);
      setRecentRegistrations(recent);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOpticalOrders();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.get<ApiPatient[]>(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSave = async (data: any) => {
    try {
      await addPatient(data);
      setShowModal(false);
      showToast('Patient registered successfully');
      fetchDashboardData();
    } catch {
      showToast('Failed to register patient');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeliver = async (order: OpticalOrder) => {
    try {
      await deliverOpticalOrder(order.id);
      setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast(`${order.patient ? order.patient.firstName + ' ' + order.patient.lastName : 'Order'} marked as delivered`);
    } catch {
      showToast('Failed to mark as delivered');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="w-full bg-[#0F2038] text-white shadow-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-wider text-teal-400 font-mono">SELIHOME</span>
            <span className="text-xs bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-500/40">
              Receptionist Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Page header — title left, primary button right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" />
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Reception</h1>
                <p className="text-sm text-slate-500">Register and manage patient intake</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Register New Patient
            </button>
          </div>

          {/* Main feature card — 50/50 register | search */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
            <div className="grid md:grid-cols-2 md:min-h-[520px]">
              {/* LEFT — register */}
              <div className="flex flex-col items-center justify-center text-center px-12 py-16 md:border-r border-slate-200">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-6">
                  <UserPlus className="w-10 h-10 text-teal-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Register New Patient</h2>
                <p className="text-sm text-slate-500 max-w-xs mt-3">
                  Create a new patient record and start the intake process.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Register patient
                </button>
              </div>

              {/* RIGHT — search */}
              <div className="flex flex-col px-10 py-10">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-slate-500" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Patient Search</h2>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Find an existing patient by name, MRN, or phone.
                </p>
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="Search by name, MRN, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                  {searching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Searching...</span>
                  )}
                </div>

                <div className="flex-1 min-h-0">
                  {searchResults.length > 0 ? (
                    <div className="h-full overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                            <th className="pb-2 font-semibold">MRN</th>
                            <th className="pb-2 font-semibold">Name</th>
                            <th className="pb-2 font-semibold">Phone</th>
                            <th className="pb-2 font-semibold">DOB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((p) => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2 font-semibold text-slate-700">{p.mrn}</td>
                              <td className="py-2 text-slate-800">{p.firstName} {p.lastName}</td>
                              <td className="py-2 text-slate-600">{p.phone}</td>
                              <td className="py-2 text-slate-600">{formatDobEthiopian(p.dob || '')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : searchQuery.trim() && !searching ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-slate-400">No patients found</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-slate-400">Type to search patients</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optical Orders / Dispensing Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Optical Orders / Dispensing Queue</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">{pendingOrders.length} pending</span>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                      <th className="pb-2 font-semibold">Patient Name</th>
                      <th className="pb-2 font-semibold">Prescription (OD / OS)</th>
                      <th className="pb-2 font-semibold">Lens Type</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => {
                      const name = order.patient
                        ? patientFullName(order.patient) || 'Unknown'
                        : 'Unknown';
                      const od = formatRxShort(order.rx?.od?.sph);
                      const os = formatRxShort(order.rx?.os?.sph);
                      const lens = [order.lensType, order.lensMaterial].filter(Boolean).join(' ') || (
                        order.coatings?.length ? order.coatings.join(', ') : 'Spectacle'
                      );
                      return (
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2.5">
                            <p className="font-semibold text-slate-800">{name}</p>
                            {order.patient?.mrn && <p className="text-xs text-slate-400">MRN: {order.patient.mrn}</p>}
                          </td>
                          <td className="py-2.5 text-slate-700 whitespace-nowrap">OD: {od} / OS: {os}</td>
                          <td className="py-2.5 text-slate-700">{lens}</td>
                          <td className="py-2.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Ready to Deliver
                            </span>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => printOpticalRx(order)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print Rx
                              </button>
                              <button
                                onClick={() => handleDeliver(order)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Delivered
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-10">No pending optical orders. Orders will appear here once the doctor sends them from the exam room.</p>
            )}
          </div>

          {/* Lower grid — 3:1 */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)] gap-6 lg:items-stretch">
            {/* Recent registrations */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 min-w-0 lg:min-h-[340px]">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Registrations</h2>
              </div>

              {recentRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                        <th className="pb-2 font-semibold">MRN</th>
                        <th className="pb-2 font-semibold">Name</th>
                        <th className="pb-2 font-semibold">Phone</th>
                        <th className="pb-2 font-semibold">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2.5 font-semibold text-slate-700">{p.mrn}</td>
                          <td className="py-2.5 text-slate-800">{p.firstName} {p.lastName}</td>
                          <td className="py-2.5 text-slate-600">{p.phone}</td>
                          <td className="py-2.5 text-slate-600">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">No patients registered yet</p>
              )}
            </div>

            {/* Today's appointments */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 min-w-0 lg:min-h-[340px]">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Today's Appointments</h2>
              </div>

              {todayAppts.length > 0 ? (
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {todayAppts.map((apt) => {
                    const name = apt.patient
                      ? `${apt.patient.firstName} ${apt.patient.lastName}`
                      : 'Unknown';
                    const statusColor =
                      apt.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : apt.status === 'IN_EXAM'
                        ? 'bg-blue-100 text-blue-700'
                        : apt.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600';
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{name}</p>
                          <p className="text-xs text-slate-500">{apt.reason || 'Routine Eye Examination'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{apt.startTime || '-'}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                            {apt.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">No appointments today</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddPatientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
};