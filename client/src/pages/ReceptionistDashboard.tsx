import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Calendar, Users, LogOut, Printer, CheckCircle2, Eye, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { AddPatientModal } from '../components/AddPatientModal';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { formatDobEthiopian, patientFullName, formatEthiopianDate } from '../lib/formatters';
import { listOpticalOrders, deliverOpticalOrder, type OpticalOrder } from '../lib/opticalOrders';
import { printOpticalRx } from '../components/OpticalRxCard';

interface BillingLineItem { id: string; name: string; price: number; }
interface BillingData { items: BillingLineItem[]; total: number; confirmedAt: string; }

interface BillingQueueEntry {
  encounterId: string;
  patientName: string;
  mrn: string;
  billing: BillingData | null;
  medicationPricing: BillingData | null;
  prescriptionPricing: BillingData | null;
  grandTotal: number;
  confirmedAt: string;
}

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
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiPatient[]>([]);
  const [searching, setSearching] = useState(false);

  const [todayAppts, setTodayAppts] = useState<ApiAppointment[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<ApiPatient[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OpticalOrder[]>([]);
  const [billingQueue, setBillingQueue] = useState<BillingQueueEntry[]>([]);
  const [dismissedBillings, setDismissedBillings] = useState<Set<string>>(new Set());
  const [doneBillings, setDoneBillings] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchOpticalOrders = async () => {
    try {
      const orders = await listOpticalOrders('READY_TO_DELIVER');
      setPendingOrders(orders);
    } catch {
      // silent
    }
  };

  const fetchBillingQueue = async (todayApts: ApiAppointment[]) => {
    try {
      const inExamOrCompleted = todayApts.filter(
        (a) => a.status === 'in_exam' || a.status === 'completed' || a.status === 'IN_EXAM' || a.status === 'COMPLETED',
      );
      const entries: BillingQueueEntry[] = [];
      await Promise.all(
        inExamOrCompleted.map(async (apt) => {
          try {
            const enc = await api.get<any>(`/clinical/appointment/${apt.id}`);
            const aa = enc?.sectionData?.['action-and-advice'] ?? {};
            const billing: BillingData | null = aa.billing ?? null;
            const medPricing: BillingData | null = aa.medicationPricing ?? null;
            const rxPricing: BillingData | null = aa.prescriptionPricing ?? null;
            const hasAny = billing || medPricing || rxPricing;
            if (hasAny) {
              const grandTotal =
                (billing?.total ?? 0) + (medPricing?.total ?? 0) + (rxPricing?.total ?? 0);
              const confirmedAt =
                billing?.confirmedAt ?? medPricing?.confirmedAt ?? rxPricing?.confirmedAt ?? '';
              const pName = apt.patient
                ? `${apt.patient.firstName} ${apt.patient.lastName}`
                : 'Unknown';
              entries.push({
                encounterId: enc.id,
                patientName: pName,
                mrn: enc.patient?.mrn ?? '',
                billing,
                medicationPricing: medPricing,
                prescriptionPricing: rxPricing,
                grandTotal,
                confirmedAt,
              });
            }
          } catch {
            // skip this encounter
          }
        }),
      );
      entries.sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime());
      setBillingQueue(entries);
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
      fetchBillingQueue(todayApts);

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
    // Poll billing queue every 30 s so edits from the doctor appear automatically
    const interval = setInterval(() => fetchDashboardData(), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.get<ApiPatient[]>(`/patients?q=${encodeURIComponent(q)}`);
        if (active) {
          setSearchResults(results);
          setSearching(false);
        }
      } catch {
        if (active) {
          setSearchResults([]);
          setSearching(false);
        }
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSave = async (data: any) => {
    try {
      await addPatient(data);
      setShowModal(false);
      fetchDashboardData();
      return true;
    } catch {
      toast.error('Failed to register patient');
      return false;
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
      toast.success(`${order.patient ? order.patient.firstName + ' ' + order.patient.lastName : 'Order'} marked as delivered`);
    } catch {
      toast.error('Failed to mark as delivered');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30">
      {/* Header - Vibrant gradient with glow */}
      <header className="w-full bg-gradient-to-r from-[#0a1e2f] via-[#0f2a40] to-[#1a3a52] text-white shadow-2xl border-b border-teal-400/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 drop-shadow-lg">
                SELIHOME
              </span>
              <span className="text-[10px] font-medium bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-teal-100 px-3 py-1 rounded-full border border-teal-400/30 backdrop-blur-sm shadow-lg shadow-teal-500/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Receptionist Portal
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-slate-200 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <span>Today, <span className="font-semibold text-white">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center text-xs font-bold text-[#0a1e2f]">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-slate-200 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 border border-white/20 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Page header — title with gradient icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-2xl shadow-lg shadow-teal-200/50">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Reception</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-teal-400"></span>
                Register and manage patient intake
              </p>
            </div>
          </div>

          {/* Main feature card — 50/50 register | search - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 overflow-hidden mb-8 hover:shadow-teal-100/40 transition-shadow duration-300">
            <div className="grid md:grid-cols-2 md:min-h-[520px]">
              {/* LEFT — register */}
              <div className="flex flex-col items-center justify-center text-center px-12 py-16 md:border-r border-slate-200/60 bg-gradient-to-br from-teal-50/40 via-white to-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center mb-6 shadow-2xl shadow-teal-300/50 animate-pulse">
                    <UserPlus className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800">Register New Patient</h2>
                  <p className="text-sm text-slate-500 max-w-xs mt-2">
                    Create a new patient record and start the intake process instantly.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-teal-400/30 hover:shadow-teal-400/50 transition-all hover:scale-105 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    Register patient
                  </button>
                </div>
              </div>

              {/* RIGHT — search */}
              <div className="flex flex-col px-10 py-10 bg-white/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100">
                    <Search className="w-4 h-4 text-teal-600" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Patient Search</h2>
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Find an existing patient by name, MRN, or phone.
                </p>
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="Search by name, MRN, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50/80 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all placeholder:text-slate-400 pr-12"
                  />
                  {searching && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-teal-500 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                      Searching...
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0">
                  {searchResults.length > 0 ? (
                    <div className="h-full overflow-y-auto rounded-2xl bg-slate-50/50 p-1">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-400 uppercase border-b-2 border-slate-200/60">
                            <th className="pb-2 font-semibold">MRN</th>
                            <th className="pb-2 font-semibold">Name</th>
                            <th className="pb-2 font-semibold">Phone</th>
                            <th className="pb-2 font-semibold">DOB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((p) => (
                            <tr key={p.id} className="border-b border-slate-100/80 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/50 transition-all group">
                              <td className="py-2.5 font-semibold text-slate-700 group-hover:text-teal-700">{p.mrn}</td>
                              <td className="py-2.5 text-slate-800 font-medium">{p.firstName} {p.lastName}</td>
                              <td className="py-2.5 text-slate-600">{p.phone}</td>
                              <td className="py-2.5 text-slate-600">{formatDobEthiopian(p.dob || '')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : searchQuery.trim() && !searching ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                          <Search className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400">No patients found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center mx-auto mb-2">
                          <Search className="w-5 h-5 text-teal-300" />
                        </div>
                        <p className="text-sm text-slate-400">Type to search patients</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Queue */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 p-6 mb-8 hover:shadow-teal-100/30 transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                  <Receipt className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Billing Queue</h2>
              </div>
              <span className="text-xs font-bold bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                {billingQueue.filter((b) => !dismissedBillings.has(b.encounterId) && !doneBillings.has(b.encounterId)).length} pending
              </span>
            </div>

            {billingQueue.filter((b) => !dismissedBillings.has(b.encounterId)).length > 0 ? (
              <div className="space-y-4">
                {billingQueue
                  .filter((b) => !dismissedBillings.has(b.encounterId))
                  .map((entry) => {
                    const isDone = doneBillings.has(entry.encounterId);
                    return (
                      <div key={entry.encounterId} className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${isDone ? 'border-emerald-200' : 'border-teal-100'}`}>
                        {/* Patient header */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-800">{entry.patientName}</span>
                            {entry.mrn && <span className="text-xs text-slate-500">MRN: {entry.mrn}</span>}
                            {!isDone && (
                              <span className="text-[10px] text-slate-400">
                                {new Date(entry.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {isDone && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isDone && (
                              <button
                                onClick={() => setDoneBillings((prev) => new Set([...prev, entry.encounterId]))}
                                className="flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                              </button>
                            )}
                            <button
                              onClick={() => setDismissedBillings((prev) => new Set([...prev, entry.encounterId]))}
                              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-white transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>

                        {/* Line items — hidden when Done */}
                        {!isDone && (
                          <div className="px-4 py-3 bg-white space-y-3">
                            {[
                              { label: 'Billing', data: entry.billing, color: 'text-teal-700' },
                              { label: 'Medication', data: entry.medicationPricing, color: 'text-blue-700' },
                              { label: 'Prescription', data: entry.prescriptionPricing, color: 'text-purple-700' },
                            ]
                              .filter((s) => s.data && s.data.items?.length > 0)
                              .map((section) => (
                                <div key={section.label}>
                                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${section.color}`}>{section.label}</p>
                                  <table className="w-full text-xs">
                                    <tbody>
                                      {section.data!.items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50">
                                          <td className="py-1 text-slate-700">{item.name}</td>
                                          <td className="py-1 text-slate-700 text-right font-mono">{item.price.toLocaleString()}</td>
                                        </tr>
                                      ))}
                                      <tr>
                                        <td className="pt-1 text-xs font-semibold text-slate-600">Subtotal</td>
                                        <td className={`pt-1 text-xs font-semibold text-right font-mono ${section.color}`}>
                                          {section.data!.total.toLocaleString()} ETB
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            <div className="border-t-2 border-slate-200 pt-2 flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-800">Grand Total</span>
                              <span className="text-sm font-bold text-teal-600 font-mono">
                                {entry.grandTotal.toLocaleString()} ETB
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No billing orders yet</p>
                <p className="text-xs text-slate-400 mt-1">Billing will appear here once the doctor confirms it from the exam room.</p>
              </div>
            )}
          </div>

          {/* Optical Orders / Dispensing Queue - Enhanced */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 p-6 mb-8 hover:shadow-teal-100/30 transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                  <Eye className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Optical Orders / Dispensing Queue</h2>
              </div>
              <span className="text-xs font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {pendingOrders.length} pending
              </span>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-teal-50/50">
                    <tr className="text-left text-xs text-slate-500 uppercase border-b-2 border-slate-200">
                      <th className="px-4 py-3 font-semibold">Patient Name</th>
                      <th className="px-4 py-3 font-semibold">Prescription (OD / OS)</th>
                      <th className="px-4 py-3 font-semibold">Lens Type</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
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
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-emerald-50/30 transition-all group">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{name}</p>
                            {order.patient?.mrn && <p className="text-xs text-slate-400">MRN: {order.patient.mrn}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-mono">OD: {od} / OS: {os}</td>
                          <td className="px-4 py-3 text-slate-700">{lens}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 shadow-sm">
                              Ready to Deliver
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => printOpticalRx(order)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:from-slate-200 hover:to-slate-300 transition-all shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print Rx
                              </button>
                              <button
                                onClick={() => handleDeliver(order)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-teal-400/20 hover:shadow-teal-400/40"
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
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No pending optical orders</p>
                <p className="text-xs text-slate-400 mt-1">Orders will appear here once the doctor sends them from the exam room.</p>
              </div>
            )}
          </div>

          {/* Lower grid — 3:1 - Enhanced */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)] gap-6 lg:items-stretch">
            {/* Recent registrations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 p-6 min-w-0 lg:min-h-[340px] hover:shadow-indigo-100/30 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Recent Registrations</h2>
                <span className="ml-auto text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full shadow-inner flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                  {recentRegistrations.length} new
                </span>
              </div>

              {recentRegistrations.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 uppercase border-b-2 border-slate-200/60">
                        <th className="pb-2.5 font-semibold">MRN</th>
                        <th className="pb-2.5 font-semibold">Name</th>
                        <th className="pb-2.5 font-semibold">Phone</th>
                        <th className="pb-2.5 font-semibold">Registered (Ethiopian)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all group">
                          <td className="py-2.5 font-semibold text-slate-700 group-hover:text-indigo-700">{p.mrn}</td>
                          <td className="py-2.5 text-slate-800 font-medium">{p.firstName} {p.lastName}</td>
                          <td className="py-2.5 text-slate-600">{p.phone}</td>
                          <td className="py-2.5 text-slate-600">
                            {p.createdAt ? formatEthiopianDate(p.createdAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">No patients registered yet</p>
                </div>
              )}
            </div>

            {/* Today's appointments */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 p-6 min-w-0 lg:min-h-[340px] hover:shadow-rose-100/30 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Today's Appointments</h2>
                <span className="ml-auto text-xs font-bold bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 px-3 py-1 rounded-full shadow-inner flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                  {todayAppts.length}
                </span>
              </div>

              {todayAppts.length > 0 ? (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {todayAppts.map((apt) => {
                    const name = apt.patient
                      ? `${apt.patient.firstName} ${apt.patient.lastName}`
                      : 'Unknown';
                    const statusColor =
                      apt.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : apt.status === 'IN_EXAM'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : apt.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200';
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group">
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-teal-300"></span>
                            {apt.reason || 'Routine Eye Examination'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{apt.startTime || '-'}</p>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColor} shadow-sm`}>
                            {apt.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">No appointments today</p>
                </div>
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

    </div>
  );
};