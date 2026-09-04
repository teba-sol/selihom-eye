import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CataractSurgeryForm } from './CataractSurgeryForm';
import { GenericSurgeryForm } from './GenericSurgeryForm';
import {
  SURGERY_OPTIONS, SURGERY_STATUSES, SURGERY_STATUS_LABELS,
  newSurgeryEntry, freshCataractDetails, freshGenericDetails,
  hasInProgressSurgery, validateSurgeryCompletion,
  type SurgeryEntry, type SurgeryStatus,
} from '../lib/surgery';

interface Props {
  open: boolean;
  surgeries: SurgeryEntry[];
  onChange: (list: SurgeryEntry[]) => void;
  onClose: () => void;
}

export const SurgeryModal: React.FC<Props> = ({ open, surgeries, onChange, onClose }) => {
  if (!open) return null;

  const patchEntry = (id: string, p: Partial<SurgeryEntry>) => {
    onChange(surgeries.map((s) => (s.id === id ? { ...s, ...p, status: (p.status ?? s.status ?? 'PLANNED') } : s)));
  };

  const patchCataract = (id: string, d: Parameters<typeof CataractSurgeryForm>[0]['data']) =>
    patchEntry(id, { cataractDetails: d });
  const patchGeneric = (id: string, d: Parameters<typeof GenericSurgeryForm>[0]['data'], type: string) =>
    patchEntry(id, { genericDetails: d, otherName: type });

  // When the surgery type changes, preserve any previously entered detail data
  // instead of wiping it. Both cataract and generic details are carried on the
  // entry across switches, so nothing the doctor typed is lost when toggling
  // between types or later switching back. Each detail object is only
  // initialized to fresh defaults if it does not already exist.
  const changeType = (id: string, newType: string) => {
    onChange(surgeries.map((s) => {
      if (s.id !== id) return s;
      return {
        ...s,
        type: newType,
        cataractDetails: s.cataractDetails ?? freshCataractDetails(),
        genericDetails: s.genericDetails ?? freshGenericDetails(),
      };
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Block adding a new surgery while an existing one in this exam is still in
  // progress (not COMPLETED or CANCELLED) — one active surgery per exam.
  const canAdd = !hasInProgressSurgery(surgeries);
  const add = () => {
    if (!canAdd) return;
    onChange([...surgeries, newSurgeryEntry()]);
  };
  const remove = (id: string) => onChange(surgeries.filter((s) => s.id !== id));

  const status = (s: SurgeryEntry): SurgeryStatus => s.status ?? 'PLANNED';

  // Setting a surgery to COMPLETED requires all core basics to be filled.
  const changeStatus = (s: SurgeryEntry, next: SurgeryStatus) => {
    if (next === 'COMPLETED') {
      const missing = validateSurgeryCompletion(s);
      if (missing.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [s.id]: `Complete the following before marking as completed: ${missing.join(', ')}`,
        }));
        return;
      }
    }
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[s.id];
      return nextErrors;
    });
    patchEntry(s.id, { status: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-[#1E3A8A]">Surgery</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {surgeries.length === 0 && (
            <p className="text-xs text-slate-400 italic">No surgeries added yet.</p>
          )}

          {surgeries.map((s, i) => (
            <div key={s.id} className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Surgery #{i + 1}</span>
                <button type="button" onClick={() => remove(s.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={s.type}
                  onChange={(e) => changeType(s.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                >
                  {SURGERY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt === 'None' ? '' : opt}>{opt}</option>
                  ))}
                </select>

                <select
                  value={status(s)}
                  onChange={(e) => changeStatus(s, e.target.value as SurgeryStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                >
                  {SURGERY_STATUSES.map((st) => (
                    <option key={st} value={st}>{SURGERY_STATUS_LABELS[st]}</option>
                  ))}
                </select>
              </div>

              {errors[s.id] && (
                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errors[s.id]}
                </div>
              )}

              {(status(s) === 'PLANNED' || status(s) === 'RE-SCHEDULED') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="whitespace-nowrap">{status(s) === 'RE-SCHEDULED' ? 'Re-scheduled Date:' : 'Planned Date:'}</span>
                    <input
                      type="text"
                      value={s.plannedOn ?? ''}
                      onChange={(e) => patchEntry(s.id, { plannedOn: e.target.value })}
                      placeholder="e.g. 2026-09-10"
                      className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5"
                    />
                  </div>
                </div>
              )}

              {status(s) === 'COMPLETED' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="whitespace-nowrap">Completion Date:</span>
                      <input
                        type="text"
                        value={s.completedOn ?? ''}
                        onChange={(e) => patchEntry(s.id, { completedOn: e.target.value })}
                        placeholder="e.g. 2026-09-10"
                        className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={s.outcome ?? ''}
                    onChange={(e) => patchEntry(s.id, { outcome: e.target.value })}
                    placeholder="Outcome / post-op notes..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                  />
                </>
              )}

              {status(s) === 'CANCELLED' && (
                <input
                  type="text"
                  value={s.cancelledReason ?? ''}
                  onChange={(e) => patchEntry(s.id, { cancelledReason: e.target.value })}
                  placeholder="Reason for cancellation..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                />
              )}

              {s.type === 'Other (Enter Manually)' && (
                <input
                  type="text"
                  value={s.otherName}
                  onChange={(e) => patchEntry(s.id, { otherName: e.target.value })}
                  placeholder="Enter surgery name..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                />
              )}

              {s.type === 'Other (Enter Manually)' && s.otherName.trim() && (
                <GenericSurgeryForm
                  surgeryType={s.otherName.trim() || 'Custom Surgery'}
                  data={s.genericDetails ?? freshGenericDetails()}
                  onChange={(d) => patchGeneric(s.id, d, s.otherName)}
                />
              )}

              {s.type === 'Cataract Surgery' && status(s) !== 'CANCELLED' && (
                <CataractSurgeryForm
                  data={s.cataractDetails ?? freshCataractDetails()}
                  onChange={(d) => patchCataract(s.id, d)}
                />
              )}

              {s.type && s.type !== 'None' && s.type !== 'Cataract Surgery' && s.type !== 'Other (Enter Manually)' && status(s) !== 'CANCELLED' && (
                <GenericSurgeryForm
                  surgeryType={s.type}
                  data={s.genericDetails ?? freshGenericDetails()}
                  onChange={(d) => patchGeneric(s.id, d, s.type)}
                />
              )}

              {s.type && s.type !== 'None' && (
                <textarea
                  rows={2}
                  value={s.remarks}
                  onChange={(e) => patchEntry(s.id, { remarks: e.target.value })}
                  placeholder="Surgery remarks / details..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="px-3 py-2 text-xs font-semibold rounded-md border border-dashed border-slate-400 text-slate-600 hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-400 disabled:hover:text-slate-600"
          >
            ＋ Add Surgery
          </button>
          {!canAdd && (
            <p className="text-xs text-amber-600">
              Complete or cancel the current in-progress surgery before adding another.
            </p>
          )}
        </div>

        <div className="flex justify-end px-5 py-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-[#1e3a5f] text-white hover:bg-[#2a4a78]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
