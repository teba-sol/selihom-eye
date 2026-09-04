import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, FileText, UserPlus, X } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddPatientModal } from '../components/AddPatientModal';
import { PatientRecordModal } from '../components/PatientRecordModal';
import { ExamHistoryModal } from '../components/ExamHistoryModal';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { formatDobEthiopian, formatAge, patientFullName, formatEthiopianDate } from '../lib/formatters';
import { useToast } from '../lib/toast';
import type { Patient } from '../store/useAppStore';

import type { NavigateFunction } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function openExamForPatient(
  patient: Patient,
  encounter: Record<string, any>,
  startExam: ReturnType<typeof useEncounterStore.getState>['startExam'],
  loadEncounterFromDb: ReturnType<typeof useEncounterStore.getState>['loadEncounterFromDb'],
  navigate: NavigateFunction,
) {
  const encounterId = encounter.id;
  // The POST /clinical/encounter response is the fully hydrated encounter, so
  // hydrate the store directly here. The exam screen's useExamLoader then sees
  // dataLoaded === true and skips its own GET — no second round-trip.
  let reason = '';
  if (typeof encounter.reasonForVisit === 'string') reason = encounter.reasonForVisit;
  else reason = encounter.reasonForVisit?.selectedReason ?? '';

  startExam({
    encounterId,
    appointmentId: encounter.appointmentId ?? null,
    consentObtained: false,
    reasonForVisit: reason,
    patient: {
      id: patient.id,
      mrn: patient.mrn ?? patient.id,
      name: patientFullName(patient),
      age: formatAge(patient.dateOfBirth),
      gender: patient.gender,
      appointmentTime: '',
      reasonForVisit: reason,
    },
  });
  loadEncounterFromDb(encounter);
  navigate(`/exam/${encounterId}`);
}

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const patients = useAppStore((s) => s.patients);
  const fetchPatients = useAppStore((s) => s.fetchPatients);
  const searchPatients = useAppStore((s) => s.searchPatients);
  const addPatient = useAppStore((s) => s.addPatient);
  const startExam = useEncounterStore((s) => s.startExam);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [paperRecordPatient, setPaperRecordPatient] = useState<Patient | null>(null);
  const [examHistoryPatient, setExamHistoryPatient] = useState<Patient | null>(null);
  const toast = useToast();

  const filtered = useMemo(() => searchPatients(search), [search, searchPatients, patients]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      await addPatient(patientData);
      setPage(1);
      return true;
    } catch {
      toast.error('Registration failed. The MRN may already exist, or the server is unreachable.');
      return false;
    }
  };

  const handleImport = () => {
    setShowImportModal(false);
    toast.success('Import feature will connect to your file system.');
  };

  const [completedExamCounts, setCompletedExamCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!patients.length) return;
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import('../lib/api');
        const ids = patients.map((p) => p.id).join(',');
        const rows = await api.get<Array<{ patientId: string; count: number }>>(
          `/clinical/encounters/completed-counts?patientIds=${encodeURIComponent(ids)}`,
        );
        if (cancelled) return;
        const counts = new Map<string, number>();
        (rows ?? []).forEach((r) => counts.set(r.patientId, r.count));
        setCompletedExamCounts(counts);
      } catch {
        if (!cancelled) setCompletedExamCounts(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patients]);

  const handleOpenExam = async (patient: Patient) => {
    try {
      const { api } = await import('../lib/api');
      const loadEncounterFromDb = useEncounterStore.getState().loadEncounterFromDb;

      // Single round-trip: POST /clinical/encounter both resumes an existing
      // in-progress (unlocked) encounter for this patient and otherwise creates
      // one new exam — the backend's active-exam safety net guarantees at most
      // one open encounter, and its response is the fully hydrated exam. The
      // response hydrates the store directly, so the exam screen opens with no
      // additional fetch (no delay) and preserves any existing reason/data.
      const encounter = await api.post<any>('/clinical/encounter', {
        patientId: patient.id,
      });
      openExamForPatient(patient, encounter, startExam, loadEncounterFromDb, navigate);
    } catch {
      toast.error('Failed to start examination.');
    }
  };

  const handlePastExams = (patient: Patient) => {
    setExamHistoryPatient(patient);
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
              placeholder="Search by MRN, name, or phone"
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
            {filtered.length} patients
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a5f] text-white text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">MRN</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Father's Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Registered On</th>
                  <th className="px-4 py-3 text-left font-semibold">Gender</th>
                  <th className="px-4 py-3 text-left font-semibold">Date of Birth</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => {
                    const completedExamCount = completedExamCounts.get(p.id) ?? 0;
                    const isNewPatient = completedExamCount === 0;
                    return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-100 hover:bg-emerald-50/60 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-700 font-semibold">{p.mrn ?? p.id}</td>
                    <td className="px-4 py-3 text-slate-800">{p.firstName}</td>
                    <td className="px-4 py-3 text-slate-800">{p.lastName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.createdAt ? formatEthiopianDate(p.createdAt) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.dateOfBirth ? formatDobEthiopian(p.dateOfBirth) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        {isNewPatient && (
                          <span className="text-xs text-slate-400 italic">New patient</span>
                        )}
                        <button
                          onClick={() => handlePastExams(p)}
                          className="flex items-center gap-1.5 text-[#2563eb] hover:underline text-xs"
                        >
                          <History className="w-3.5 h-3.5" />
                          Past exams ({completedExamCount})
                        </button>
                        <button
                          onClick={() => setPaperRecordPatient(p)}
                          className="flex items-center gap-1.5 text-[#2563eb] hover:underline text-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Patient record
                        </button>
                        <button
                          onClick={() => handleOpenExam(p)}
                          className="text-[#2563eb] hover:text-[#1d4ed8]"
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

      {/* Patient Record Modal */}
      {paperRecordPatient && (
        <PatientRecordModal
          patient={paperRecordPatient}
          onClose={() => setPaperRecordPatient(null)}
          onOpenExam={() => { setPaperRecordPatient(null); handleOpenExam(paperRecordPatient); }}
        />
      )}

      {/* Past Exams Modal */}
      {examHistoryPatient && (
        <ExamHistoryModal
          patient={examHistoryPatient}
          onClose={() => setExamHistoryPatient(null)}
          onCreateExam={() => { setExamHistoryPatient(null); handleOpenExam(examHistoryPatient); }}
        />
      )}
    </DashboardLayout>
  );
};