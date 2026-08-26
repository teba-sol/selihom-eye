import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, History, UserPlus, X } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddPatientModal } from '../components/AddPatientModal';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { extractRegionZone, calcAge } from '../data/mockData';
import { buildAppointmentTime } from '../lib/encounterDefaults';
import type { Patient, Appointment } from '../store/useAppStore';

import type { NavigateFunction } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function openExamForPatient(
  patient: Patient,
  appointmentId: string,
  apt: { date: string; startTime: string; reason: string; consentObtained: boolean },
  loadFromAppointment: ReturnType<typeof useEncounterStore.getState>['loadFromAppointment'],
  navigate: NavigateFunction,
) {
  loadFromAppointment({
    appointmentId,
    consentObtained: apt.consentObtained,
    reasonForVisit: apt.reason,
    patient: {
      id: patient.id,
      mrn: patient.mrn || patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      age: patient.dateOfBirth ? calcAge(patient.dateOfBirth) : 0,
      gender: patient.gender || '',
      appointmentTime: buildAppointmentTime(apt.date, apt.startTime),
      reasonForVisit: apt.reason,
    },
  });
  navigate(`/exam/${appointmentId}`);
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-yellow-100 text-yellow-700',
  walkin: 'bg-purple-100 text-purple-700',
};

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const patients = useAppStore((s) => s.patients);
  const fetchPatients = useAppStore((s) => s.fetchPatients);
  const searchPatients = useAppStore((s) => s.searchPatients);
  const addPatient = useAppStore((s) => s.addPatient);
  const createWalkInAppointment = useAppStore((s) => s.createWalkInAppointment);
  const fetchAppointmentsForPatient = useAppStore((s) => s.fetchAppointmentsForPatient);
  const loadFromAppointment = useEncounterStore((s) => s.loadFromAppointment);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [pastExamsPatient, setPastExamsPatient] = useState<Patient | null>(null);
  const [pastExamsList, setPastExamsList] = useState<Appointment[]>([]);
  const [pastExamsLoading, setPastExamsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = useMemo(() => searchPatients(search), [search, searchPatients, patients]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return (b.mrn || '').localeCompare(a.mrn || '');
    });
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'isNew' | 'lastVisit'>) => {
    try {
      await addPatient(patientData);
      setShowAddModal(false);
      setPage(1);
      showToast('Patient registered successfully.');
    } catch {
      showToast('Failed to register patient.');
    }
  };

  const handleImport = () => {
    setShowImportModal(false);
    showToast('Import feature will connect to your file system.');
  };

  const handleOpenExam = async (patient: Patient) => {
    try {
      const apt = await createWalkInAppointment(patient.id);
      openExamForPatient(patient, apt.id, apt, loadFromAppointment, navigate);
    } catch {
      showToast('Failed to start examination.');
    }
  };

  const handleShowDetail = async (patient: Patient) => {
    setSelectedPatient(patient);
    await fetchAppointmentsForPatient(patient.id);
    const apts = useAppStore.getState().appointments.filter((a) => a.patientId === patient.id);
    setPatientAppointments(apts);
  };

  const handlePastExams = async (patient: Patient) => {
    setPastExamsPatient(patient);
    setPastExamsLoading(true);
    setPastExamsList([]);
    try {
      await fetchAppointmentsForPatient(patient.id);
      const apts = useAppStore.getState().appointments.filter((a) => a.patientId === patient.id);
      setPastExamsList(apts);
    } catch {
      showToast('Failed to load past examinations.');
    } finally {
      setPastExamsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2563eb]" />
            <h1 className="text-2xl font-semibold text-[#2563eb]">Patients</h1>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by phone, name, MRN or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-72 px-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors"
            >
              Add patient
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-5 py-2 bg-white border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 text-sm font-medium rounded-md transition-colors"
            >
              Import patients
            </button>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
            {sorted.length} patients
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a5f] text-white text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">MRN</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Gender</th>
                  <th className="px-4 py-3 text-left font-semibold">Age</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Region</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => {
                  const { region } = extractRegionZone(p.address);
                  const fullName = [p.firstName, p.lastName, p.grandfatherName].filter(Boolean).join(' ');
                  return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 hover:bg-emerald-50/60 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-700 font-semibold">{p.mrn || p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-slate-800">{fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                    <td className="px-4 py-3 text-slate-600">{p.dateOfBirth ? calcAge(p.dateOfBirth) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{region}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShowDetail(p); }}
                          className="text-slate-500 hover:text-[#2563eb]"
                          title="View patient details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePastExams(p); }}
                          className="text-slate-500 hover:text-[#2563eb]"
                          title="Past examinations"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenExam(p); }}
                          className="text-slate-500 hover:text-[#2563eb]"
                          title="Start examination"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} / Page</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1 text-sm rounded ${
                    n === currentPage
                      ? 'bg-[#2563eb] text-white'
                      : 'border border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 8 && <span className="px-1 text-slate-400">…</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddPatientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPatient}
      />

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Import Patients</h2>
              <button onClick={() => setShowImportModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">Upload a CSV file with patient records.</p>
            <input type="file" accept=".csv" className="w-full text-sm mb-4" />
            <button onClick={handleImport} className="w-full py-2.5 bg-[#2563eb] text-white rounded-md text-sm font-medium hover:bg-[#1d4ed8]">Import</button>
          </div>
        </div>
      )}

      {pastExamsPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Past Examinations</h2>
                <p className="text-sm text-slate-500">
                  {[pastExamsPatient.firstName, pastExamsPatient.lastName, pastExamsPatient.grandfatherName].filter(Boolean).join(' ')}
                </p>
              </div>
              <button onClick={() => setPastExamsPatient(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {pastExamsLoading ? (
                <div className="text-center text-sm text-slate-400 py-8">Loading...</div>
              ) : pastExamsList.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-8">No past examinations found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                      <th className="px-3 py-2 text-left font-semibold">Reason</th>
                      <th className="px-3 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastExamsList.map((apt) => (
                      <tr
                        key={apt.id}
                        onClick={() => { setPastExamsPatient(null); navigate(`/exam/${apt.id}`); }}
                        className="border-b border-slate-100 hover:bg-blue-50/60 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2.5 text-slate-700">{apt.date}</td>
                        <td className="px-3 py-2.5 text-slate-600">{apt.reason}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          appointments={patientAppointments}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </DashboardLayout>
  );
};
