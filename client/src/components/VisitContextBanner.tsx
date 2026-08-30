import React from 'react';
import { Lock, History, CheckCircle2, PenLine, Loader2 } from 'lucide-react';
import { useEncounterStore } from '../store/useEncounterStore';
import { usePatientRecordData, type ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { isCompletedExam } from '../components/ExamHistoryModal';
import { fmtDate, SummaryChips, parseAddendums } from '../lib/examHistory';

interface VisitContextBannerProps {
  onOpenHistory: () => void;
  onFinalize: () => void;
  onOpenCorrection: () => void;
  finalizing: boolean;
  finalizeError: string | null;
}

export const VisitContextBanner: React.FC<VisitContextBannerProps> = ({
  onOpenHistory,
  onFinalize,
  onOpenCorrection,
  finalizing,
  finalizeError,
}) => {
  const patientId = useEncounterStore((s) => s.patient.id);
  const patientName = useEncounterStore((s) => s.patient.name);
  const patientMrn = useEncounterStore((s) => s.patient.mrn);
  const appointmentId = useEncounterStore((s) => s.appointmentId);
  const isLocked = useEncounterStore((s) => s.isLocked);
  const addendumNotes = useEncounterStore((s) => s.addendumNotes);

  const record = usePatientRecordData(patientId || null);
  const completedPast = record.history.filter(
    (h: ExamHistoryEntry) => h.appointmentId !== appointmentId && isCompletedExam(h),
  );
  const pastCount = completedPast.length;
  const lastExam = completedPast[0] ?? null;
  const isFollowUp = pastCount > 0;
  const addendums = parseAddendums(addendumNotes);

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
            isFollowUp
              ? 'bg-blue-100 text-blue-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isFollowUp ? 'Follow-up examination' : 'First examination'}
          </span>
          <span className="text-sm font-semibold text-slate-700">{patientName}</span>
          <span className="text-xs text-slate-500">MRN: {patientMrn || '—'}</span>
          {pastCount > 0 && (
            <span className="text-xs text-slate-400">
              · {pastCount} previous visit{pastCount !== 1 ? 's' : ''}
            </span>
          )}
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Examination finalized
              <Lock className="w-3 h-3" />
              <span className="normal-case font-semibold">Read-only</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pastCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563eb] bg-blue-50 hover:bg-blue-100 rounded-md"
            >
              <History className="w-3.5 h-3.5" />
              Previous examinations ({pastCount})
            </button>
          )}
          {isLocked ? (
            <button
              onClick={onOpenCorrection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md"
            >
              <PenLine className="w-3.5 h-3.5" />
              Add correction
            </button>
          ) : (
            <button
              onClick={onFinalize}
              disabled={finalizing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-md disabled:opacity-60"
            >
              {finalizing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {finalizing ? 'Finalizing…' : 'Finalize examination'}
            </button>
          )}
        </div>
      </div>

      {finalizeError && (
        <p className="text-xs text-red-600 mt-2">{finalizeError}</p>
      )}

      {!isLocked && lastExam && (
        <div className="mt-2.5 flex items-center gap-3 flex-wrap bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Last examination
          </span>
          <span className="text-xs font-semibold text-slate-700">{fmtDate(lastExam.appointmentDate ?? lastExam.createdAt)}</span>
          <span className="text-xs text-slate-500">{lastExam.appointmentReason || 'Examination'}</span>
          <SummaryChips entry={lastExam} />
        </div>
      )}

      {isLocked && addendums.length > 0 && (
        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
            Corrections ({addendums.length})
          </p>
          <div className="space-y-2">
            {addendums.map((a, idx) => (
              <div key={idx} className="text-xs">
                <p className="text-amber-700 font-semibold">
                  {a.author || 'Clinician'}
                  {a.at && ` · ${new Date(a.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                </p>
                <p className="text-slate-700 whitespace-pre-wrap mt-0.5">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};