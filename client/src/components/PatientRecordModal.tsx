import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Eye, Calendar, Plus, Loader2, Trash2, History, CalendarDays,
} from 'lucide-react';
import type { Patient } from '../store/useAppStore';
import { Field } from './ExamDetails';
import { formatAge, formatEthiopianDate } from '../lib/formatters';
import { usePatientRecordData, type ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { doctorName, humanize } from '../lib/examHistory';
import { buildClinicalDashboard } from '../lib/clinicalDashboard';
import { useToast } from '../lib/toast';
import { ConfirmDialog } from './ConfirmDialog';
import { ExamHistoryModal } from './ExamHistoryModal';
import { ClinicalSummarySection } from './ClinicalSummarySection';

interface PatientRecordModalProps {
  patient: Patient;
  onClose: () => void;
  onOpenExam: () => void;
}

const FACILITY = 'SELIHOME Ophthalmic Medium Clinic';

export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({ patient, onClose, onOpenExam }) => {
  const navigate = useNavigate();
  const record = usePatientRecordData(patient.id);
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExamHistoryEntry | null>(null);
  const [showPastExams, setShowPastExams] = useState(false);

  const handleDeleteDraft = async (entry: ExamHistoryEntry) => {
    setDeletingId(entry.id);
    try {
      const { api } = await import('../lib/api');
      await api.delete(`/clinical/encounter/${entry.id}`);
      toast.success('Draft examination deleted.');
      record.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to delete the draft examination.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    if (!record.loading) record.preloadSnapshots();
  }, [record.loading, record.preloadSnapshots]);

  const dashboard = useMemo(
    () => buildClinicalDashboard(record.history, record.encounters),
    [record.history, record.encounters],
  );

  const openExam = useCallback((id: string) => {
    onClose();
    navigate(`/exam/${id}`);
  }, [navigate, onClose]);

  const inProgress = useMemo(
    () =>
      record.history
        .filter((entry) => !entry.isLocked && entry.appointmentStatus !== 'COMPLETED')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [record.history],
  );

  const nextAppointment = useMemo(() => {
    const today = new Date();
    const apts = (record.appointments ?? [])
      .filter((a) => a.scheduledDate && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
      .map((a) => ({ ...a, t: new Date(a.scheduledDate + (a.startTime ? `T${a.startTime}:00` : 'T00:00:00')).getTime() }))
      .filter((a) => !Number.isNaN(a.t) && a.t >= today.getTime() - 86400000)
      .sort((a, b) => a.t - b.t);
    return apts[0] ?? null;
  }, [record.appointments]);

  const previousAppointments = useMemo(() => {
    const today = new Date().getTime();
    return (record.appointments ?? [])
      .map((a) => ({ ...a, t: new Date(a.scheduledDate).getTime() }))
      .filter((a) => !Number.isNaN(a.t) && a.t < today)
      .sort((a, b) => b.t - a.t)
      .slice(0, 3);
  }, [record.appointments]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Patient Record</h2>
              <p className="text-xs text-slate-500">
                {patient.firstName} {patient.lastName} · {patient.mrn ?? `SEL-${patient.id}`} · {formatAge(patient.dateOfBirth)} · {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenExam} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
              <Eye className="w-3.5 h-3.5"/> New examination
            </button>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {record.loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin"/> Loading patient record…</div>
          ) : (
            <div className="p-5 space-y-6">
              <section>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Patient identity</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="MRN" value={patient.mrn ?? `SEL-${patient.id}`}/>
                  <Field label="Full Name" value={`${patient.firstName} ${patient.lastName}`}/>
                  <Field label="Father's / Grandfather" value={patient.grandfatherName ?? '-'}/>
                  <Field label="Sex" value={patient.gender}/>
                  <Field label="Date of Birth" value={patient.dateOfBirth ? formatEthiopianDate(patient.dateOfBirth) : '-'}/>
                  <Field label="Age" value={formatAge(patient.dateOfBirth)}/>
                  <Field label="Phone" value={patient.phone}/>
                  <Field label="Registered" value={patient.createdAt ? formatEthiopianDate(patient.createdAt) : '-'}/>
                  <Field label="Address" value={patient.address ?? '—'} wide/>
                  <Field label="Facility" value={FACILITY} wide/>
                </div>
              </section>

              <section>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Patient Status" value={patient.isNew ? 'New Patient' : 'Returning Patient'}/>
                  <Field label="Last Visit" value={record.history.length > 0 ? formatEthiopianDate(record.history[0].createdAt ?? record.history[0].appointmentDate) : 'First Visit'}/>
                  <Field label="Next Appointment" value={nextAppointment ? formatEthiopianDate(nextAppointment.scheduledDate) : '—'}/>
                </div>
              </section>

              <ClinicalSummarySection dashboard={dashboard} onOpenExam={openExam} />

              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Active examinations <span className="text-slate-400">({inProgress.length})</span>
                  </p>
                  <button
                    onClick={() => setShowPastExams(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline"
                  >
                    <History className="w-3.5 h-3.5"/> View past examinations
                  </button>
                </div>

                {inProgress.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40"/>
                    <p className="text-sm font-semibold text-slate-500">No active examinations.</p>
                    <p className="text-xs mt-1 mb-3">Start an examination to begin the patient's record.</p>
                    <button onClick={onOpenExam}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md transition-colors">
                      <Plus className="w-3.5 h-3.5"/> Create examination
                    </button>
                  </div>
                ) : (
                  inProgress.map((entry) => (
                    <div key={entry.id} className="border border-amber-200 bg-amber-50 rounded-xl overflow-hidden mb-3">
                      <div className="flex items-start justify-between px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-800">
                              {formatEthiopianDate(entry.createdAt ?? entry.appointmentDate)}
                            </span>
                            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 rounded-full px-2 py-0.5 uppercase tracking-wide">
                              {entry.appointmentReason || 'Routine Eye Examination'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                              Draft
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {entry.doctor ? doctorName(entry.doctor.firstName, entry.doctor.lastName) : '—'}
                          </p>
                        </div>
                        <div className="ml-3 mt-0.5 flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setConfirmDelete(entry)}
                            disabled={deletingId === entry.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
                          >
                            {deletingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                            Delete draft
                          </button>
                          <button
                            onClick={() => openExam(entry.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5"/> Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>

              {(nextAppointment || previousAppointments.length > 0) && (
                <section>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    <CalendarDays className="w-3.5 h-3.5 inline mr-1"/> Appointments
                  </p>
                  <div className="space-y-2">
                    {nextAppointment && (
                      <div className="border border-emerald-200 bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-800">{formatEthiopianDate(nextAppointment.scheduledDate)}</p>
                          <p className="text-xs text-emerald-700">{nextAppointment.reason || 'Routine Eye Examination'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-wide">Next</span>
                      </div>
                    )}
                    {previousAppointments.map((a) => (
                      <div key={a.id} className="border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{formatEthiopianDate(a.scheduledDate)}</p>
                          <p className="text-xs text-slate-500">{a.reason || 'Routine Eye Examination'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">{humanize(a.status) || 'Recorded'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete draft examination?"
          message={
            <>
              This will permanently remove the in-progress examination for{' '}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
              </span>
              . This cannot be undone.
            </>
          }
          busy={deletingId === confirmDelete.id}
          onConfirm={() => handleDeleteDraft(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showPastExams && (
        <ExamHistoryModal
          patient={patient}
          onClose={() => setShowPastExams(false)}
          onCreateExam={() => { setShowPastExams(false); onOpenExam(); }}
        />
      )}
    </div>
  );
};
 