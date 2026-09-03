import React from 'react';
import { X } from 'lucide-react';
import { CataractSurgeryForm } from './CataractSurgeryForm';
import { GenericSurgeryForm } from './GenericSurgeryForm';
import {
  SURGERY_OPTIONS, SURGERY_STATUSES, SURGERY_STATUS_LABELS,
  newSurgeryEntry, freshCataractDetails, freshGenericDetails,
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

  // When the surgery type changes, reset that entry's embedded details so the
  // new type starts with fresh, empty data (no leakage across types).
  const changeType = (id: string, newType: string) => {
    onChange(surgeries.map((s) => {
      if (s.id !== id) return s;
      const base = { ...s, type: newType };
      if (newType === 'Cataract Surgery') {
        return { ...base, cataractDetails: freshCataractDetails(), genericDetails: undefined };
      }
      return { ...base, genericDetails: freshGenericDetails(), cataractDetails: undefined };
    }));
  };

  const add = () => onChange([...surgeries, newSurgeryEntry()]);
  const remove = (id: string) => onChange(surgeries.filter((s) => s.id !== id));

  const status = (s: SurgeryEntry): SurgeryStatus => s.status ?? 'PLANNED';

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
                  onChange={(e) => patchEntry(s.id, { status: e.target.value as SurgeryStatus })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                >
                  {SURGERY_STATUSES.map((st) => (
                    <option key={st} value={st}>{SURGERY_STATUS_LABELS[st]}</option>
                  ))}
                </select>
              </div>

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
            className="px-3 py-2 text-xs font-semibold rounded-md border border-dashed border-slate-400 text-slate-600 hover:border-blue-500 hover:text-blue-600"
          >
            ＋ Add Surgery
          </button>
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
