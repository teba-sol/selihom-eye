import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Plus, Loader2, ExternalLink, Pencil } from 'lucide-react';
import type { Patient } from '../store/useAppStore';
import { formatAge } from '../lib/formatters';
import { usePatientRecordData, type ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { fmtDate, StatusBadge, SummaryChips, doctorName, parseAddendums } from '../lib/examHistory';

interface ExamHistoryModalProps {
  patient: Patient;
  onClose: () => void;
  onCreateExam: () => void;
}

export function isCompletedExam(entry: ExamHistoryEntry): boolean {
  return entry.isLocked || entry.appointmentStatus === 'COMPLETED';
}

function ExamRow({ entry, action, onAction }: {
  entry: ExamHistoryEntry;
  action: 'view' | 'continue';
  onAction: () => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between px-4 py-3 bg-white">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{fmtDate(entry.appointmentDate ?? entry.createdAt)}</span>
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 rounded-full px-2 py-0.5 uppercase tracking-wide">{entry.appointmentReason || 'Examination'}</span>
            <StatusBadge entry={entry}/>
            {action === 'continue' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 uppercase tracking-wide">Draft</span>
            )}
            {entry.addendumNotes && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                {parseAddendums(entry.addendumNotes).length} correction{parseAddendums(entry.addendumNotes).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {entry.doctor ? doctorName(entry.doctor.firstName, entry.doctor.lastName) : '—'}
          </p>
          <SummaryChips entry={entry}/>
        </div>
        <button onClick={onAction}
          className="ml-3 mt-0.5 shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline">
          {action === 'view' ? (
            <>
              View exam
              <ExternalLink className="w-3.5 h-3.5"/>
            </>
          ) : (
            <>
              Continue examination
              <Pencil className="w-3.5 h-3.5"/>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export const ExamHistoryModal: React.FC<ExamHistoryModalProps> = ({ patient, onClose, onCreateExam }) => {
  const navigate = useNavigate();
  const record = usePatientRecordData(patient.id);

  const completed = record.history.filter(isCompletedExam);
  const current = record.history.filter((e) => !isCompletedExam(e));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Past examinations <span className="text-slate-400 font-semibold">({completed.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                {patient.firstName} {patient.lastName} · MRN: {patient.mrn ?? `SEL-${patient.id}`} · {formatAge(patient.dateOfBirth)}
              </p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {record.loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin"/> Loading examinations…</div>
          ) : record.history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-3 opacity-40"/>
              <p className="text-sm font-semibold text-slate-500">No previous examinations found.</p>
              <p className="text-xs mt-1 mb-5">This patient has no recorded clinical encounters yet.</p>
              <button onClick={onCreateExam}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md transition-colors">
                <Plus className="w-3.5 h-3.5"/> Create examination
              </button>
            </div>
          ) : (
            <div className="p-5">
              {/* Completed examinations */}
              <div className="mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Completed examinations</p>
                {completed.length === 0 ? (
                  <p className="text-xs text-slate-400 mb-3">No completed examinations yet.</p>
                ) : (
                  completed.map((entry) => (
                    <ExamRow
                      key={entry.id}
                      entry={entry}
                      action="view"
                      onAction={() => navigate(`/exam/${entry.id}`)}
                    />
                  ))
                )}
              </div>

              {/* Current visit */}
              {current.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Current visit</p>
                  {current.map((entry) => (
                    <ExamRow
                      key={entry.id}
                      entry={entry}
                      action="continue"
                      onAction={() => navigate(`/exam/${entry.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};