import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Calendar, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { AddPatientModal } from '../components/AddPatientModal';
import { api } from '../lib/api';
import { formatDobEthiopian } from '../data/mockData';

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
  const [stats, setStats] = useState({ today: 0, week: 0, appointmentsToday: 0 });

  const todayStr = new Date().toISOString().split('T')[0];

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const fetchDashboardData = async () => {
    try {
      const [todayApts, allPatients] = await Promise.all([
        api.get<ApiAppointment[]>(`/appointments?from=${todayStr}&to=${todayStr}`),
        api.get<ApiPatient[]>('/patients'),
      ]);
      setTodayAppts(todayApts);

      const todayCount = allPatients.filter((p) => {
        return p.createdAt ? p.createdAt.split('T')[0] === todayStr : false;
      }).length;

      const weekCount = allPatients.filter((p) => {
        return p.createdAt ? p.createdAt.split('T')[0] >= weekStartStr : false;
      }).length;

      setStats({
        today: todayCount || todayApts.length,
        week: weekCount || allPatients.length,
        appointmentsToday: todayApts.length,
      });
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const statCards = [
    { label: 'Registered Today', value: stats.today, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { label: 'This Week', value: stats.week, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Appointments Today', value: stats.appointmentsToday, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

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

      <div className="flex-1 overflow-y-auto p-6">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-semibold text-slate-800">Reception</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Register New Patient
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Patient Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Patient Search</h2>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search by name, MRN, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Searching...</span>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
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
                        <td className="py-2 text-slate-800">{p.firstName} {p.lastName} {p.grandfatherName || ''}</td>
                        <td className="py-2 text-slate-600">{p.phone}</td>
                        <td className="py-2 text-slate-600">{formatDobEthiopian(p.dob || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {searchQuery.trim() && !searching && searchResults.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No patients found</p>
            )}
            {!searchQuery.trim() && (
              <p className="text-sm text-slate-400 text-center py-4">Type to search patients</p>
            )}
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
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
              <p className="text-sm text-slate-400 text-center py-8">No appointments today</p>
            )}
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
