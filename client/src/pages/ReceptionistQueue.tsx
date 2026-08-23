/**
 * ReceptionistQueue - Simplified patient queue management for receptionist role
 * 
 * This is a basic implementation for receptionist dashboard.
 * For full triage features, see Selihom_eye_clinic/src/pages/QueuePage.tsx
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Users, UserPlus, Calendar, RefreshCw, ListOrdered } from 'lucide-react';

interface QueuePatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  queueNumber: number;
  status: 'waiting' | 'in-triage' | 'ready-for-doctor' | 'with-doctor' | 'completed';
  appointmentTime?: string;
  reasonForVisit: string;
}

const DEMO_PATIENTS: QueuePatient[] = [
  {
    id: '1',
    mrn: '1132/18',
    name: 'Abebe Bekele Kebede',
    age: 38,
    gender: 'M',
    phone: '0911223344',
    queueNumber: 1,
    status: 'waiting',
    appointmentTime: '09:00 AM',
    reasonForVisit: 'Routine Eye Check-up',
  },
  {
    id: '2',
    mrn: '1133/18',
    name: 'Aster Tadesse Alemu',
    age: 45,
    gender: 'F',
    phone: '0922334455',
    queueNumber: 2,
    status: 'ready-for-doctor',
    appointmentTime: '09:30 AM',
    reasonForVisit: 'Blurry Vision - Left Eye',
  },
];

export const ReceptionistQueue: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [patients, setPatients] = useState<QueuePatient[]>(DEMO_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'waiting': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Waiting' },
      'in-triage': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Triage' },
      'ready-for-doctor': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Ready for Doctor' },
      'with-doctor': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'With Doctor' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const stats = {
    total: patients.length,
    waiting: patients.filter(p => p.status === 'waiting').length,
    readyForDoctor: patients.filter(p => p.status === 'ready-for-doctor').length,
    completed: patients.filter(p => p.status === 'completed').length,
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.includes(searchQuery) ||
    String(p.queueNumber).includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0F2038] text-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-wider text-teal-400 font-mono">SELIHOME</span>
            <span className="text-xs bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-500/40">
              Receptionist Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600">
              <ListOrdered size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Queue Management</h1>
              <p className="text-sm text-slate-500">Today's queue and appointment flow</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-sm">
              <UserPlus size={16} />
              Register New Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Total Today</div>
            <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-1">Waiting</div>
            <div className="text-3xl font-bold text-slate-700">{stats.waiting}</div>
          </div>
          <div className="bg-teal-50 rounded-lg border border-teal-200 p-4 shadow-sm">
            <div className="text-xs font-semibold text-teal-600 mb-1">Ready for Doctor</div>
            <div className="text-3xl font-bold text-teal-700">{stats.readyForDoctor}</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4 shadow-sm">
            <div className="text-xs font-semibold text-green-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-700">{stats.completed}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, MRN, or queue number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Queue #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Appointment Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No patients found</div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-teal-600">#{patient.queueNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{patient.name}</div>
                        <div className="text-xs text-slate-500">MRN: {patient.mrn} • {patient.age}y • {patient.gender}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{patient.appointmentTime || 'Walk-in'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">{patient.reasonForVisit}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                          Start Triage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
