import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, History, FileText, UserPlus, ClipboardList, X, RefreshCw, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddPatientModal } from '../components/AddPatientModal';
import { PatientRecordModal } from '../components/PatientRecordModal';
import { ExamHistoryModal } from '../components/ExamHistoryModal';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { formatDobEthiopian, formatAge, patientFullName, formatEthiopianDate } from '../lib/formatters';
import { useToast } from '../lib/toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { api } from '../lib/api';
import type { Patient } from '../store/useAppStore';

import type { NavigateFunction } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function openExamForPatient(
  patient: Patient,
  encounter: Record<string, any>,
  startExam: ReturnType<typeof useEncounterStore.getState>['startExam'],
  navigate: NavigateFunction,
) {
  const encounterId = encounter.id;
  let reason = '';
  if (typeof encounter.reasonForVisit === 'string') reason = encounter.reasonForVisit;
  else reason = encounter.reasonForVisit?.selectedReason ?? '';

  // Seed the store so the exam screen mounts into a clean "loading" state, but
  // leave dataLoaded === false. The exam screen's useExamLoader then hydrates
  // from the DB and applies any newer locally-saved draft — so resuming via
  // the patient-list icon picks up "from where the doctor left off" exactly
  // like the patient-record "Continue" button does.
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
  navigate(`/exam/${encounterId}`);
}

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const patients = useAppStore((s) => s.patients);
  const loading = useAppStore((s) => s.loading);
  const fetchPatients = useAppStore((s) => s.fetchPatients);
  const searchPatients = useAppStore((s) => s.searchPatients);
  const addPatient = useAppStore((s) => s.addPatient);
  const startExam = useEncounterStore((s) => s.startExam);
  const completedExamCounts = useAppStore((s) => s.completedExamCounts);
  const completedCountsLoaded = useAppStore((s) => s.completedCountsLoaded);
  const fetchCompletedExamCounts = useAppStore((s) => s.fetchCompletedExamCounts);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    fetchCompletedExamCounts();
  }, [patients, fetchCompletedExamCounts]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [paperRecordPatient, setPaperRecordPatient] = useState<Patient | null>(null);
  const [examHistoryPatient, setExamHistoryPatient] = useState<Patient | null>(null);
  const toast = useToast();

  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  // Maps patientId -> id of their in-progress (unlocked) exam, if any. Drives
  // the "Continue examination" label so the list never falsely suggests
  // starting a brand-new exam while a draft is in progress.
  const [inProgressExams, setInProgressExams] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadInProgressExams = async () => {
    const map: Record<string, string> = {};
    await Promise.all(
      patients.map(async (p) => {
        try {
          const history = await api.get<any[]>(`/clinical/patient/${p.id}/history`);
          const draft = (history ?? []).find(
            (h: any) => !h.isLocked && h.appointmentStatus !== 'COMPLETED',
          );
          map[p.id] = draft?.id ?? '';
        } catch {
          map[p.id] = '';
        }
      }),
    );
    setInProgressExams(map);
  };

  useEffect(() => {
    loadInProgressExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([fetchPatients(undefined, true), fetchCompletedExamCounts(true)]);
      await loadInProgressExams();
    } catch {
      toast.error('Failed to refresh patients');
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleOpenExam = async (patient: Patient) => {
    setStartingExamId(patient.id);
    try {
      // Continue an in-progress draft/unsaved examination straight away — no
      // create call is made while one exists.
      const history = await api.get<any[]>(`/clinical/patient/${patient.id}/history`);
      const draft = (history ?? []).find(
        (h: any) => !h.isLocked && h.appointmentStatus !== 'COMPLETED',
      );
      if (draft) {
        navigate(`/exam/${draft.id}`);
        return;
      }

      // No open draft: start a brand-new examination.
      const encounter = await api.post<any>(
        '/clinical/encounter',
        { patientId: patient.id },
        { toast: false },
      );
      toast.success('Examination started successfully.');
      openExamForPatient(patient, encounter, startExam, navigate);
    } catch (e: any) {
      // Rare race: another tab created a draft between the history fetch and
      // the create call. Just continue it instead of erroring out.
      if (e?.code === 'DRAFT_EXISTS' || e?.payload?.code === 'DRAFT_EXISTS') {
        const draftId = e?.payload?.draftEncounterId ?? e?.draftEncounterId;
        if (draftId) {
          navigate(`/exam/${draftId}`);
          return;
        }
      }
      toast.error('Failed to start examination.');
    } finally {
      setStartingExamId(null);
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
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh patients"
              className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
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

          {loading ? (
            <TableSkeleton rows={10} cols={8} />
          ) : (
          <>
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">{search ? 'No patients match your search' : 'No patients registered yet'}</p>
              </div>
            ) : (
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
                    const completedExamCount = completedExamCounts[p.id] ?? 0;
                    const isNewPatient = completedCountsLoaded ? completedExamCount === 0 : false;
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
                          Exams
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
                          disabled={startingExamId !== null}
                          className="flex items-center gap-1.5 text-[#2563eb] hover:underline text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          title={inProgressExams[p.id] ? 'Continue examination' : 'Start examination'}
                        >
                          {startingExamId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : inProgressExams[p.id] ? (
                            <ClipboardList className="w-3.5 h-3.5" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          {inProgressExams[p.id] ? 'Continue examination' : 'Start examination'}
                        </button>
                      </div>
</td>
                  </tr>
                    );
                  })}
                </tbody>
            </table>
            )}
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
          </>
          )}
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