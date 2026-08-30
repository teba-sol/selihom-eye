import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { FamilyHistoryItem } from '../store/useEncounterStore';

const DEFAULT_FLAGS = {
  noHistory: true,
  parent: false,
  sibling: false,
  grandparent: false,
  remarks: '',
  showInDischarge: false,
};

export const FamilySystemicHistoryView: React.FC = () => {
  const setFamilySystemicHistory = useEncounterStore((s) => s.setFamilySystemicHistory);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const flags = Object.assign({}, DEFAULT_FLAGS, sectionData['family-systemic-history'] ?? {});

  const syncFamily = (f: typeof DEFAULT_FLAGS) => {
    if (f.noHistory) {
      setFamilySystemicHistory([]);
      return;
    }
    const build = (relation: FamilyHistoryItem['relation']): FamilyHistoryItem => ({
      id: crypto.randomUUID(),
      relation,
      condition: '',
      notes: f.remarks,
      showInDischarge: f.showInDischarge,
    });
    const items: FamilyHistoryItem[] = [];
    if (f.parent) items.push(build('Parent'));
    if (f.sibling) items.push(build('Sibling'));
    if (f.grandparent) items.push(build('Grandparent'));
    setFamilySystemicHistory(items);
  };

  const setFlag = (patch: Partial<typeof DEFAULT_FLAGS>) => {
    const next = { ...flags, ...patch };
    setSectionData('family-systemic-history', next);
    syncFamily(next);
  };

  const handleNoHistoryChange = (checked: boolean) => {
    setFlag({
      noHistory: checked,
      parent: checked ? false : flags.parent,
      sibling: checked ? false : flags.sibling,
      grandparent: checked ? false : flags.grandparent,
    });
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Family Systemic History</h1>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.noHistory}
            onChange={(e) => handleNoHistoryChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>No Family Systemic History Reported</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.parent}
            disabled={flags.noHistory}
            onChange={(e) => setFlag({ parent: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Parent</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.sibling}
            disabled={flags.noHistory}
            onChange={(e) => setFlag({ sibling: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Sibling</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.grandparent}
            disabled={flags.noHistory}
            onChange={(e) => setFlag({ grandparent: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Grandparent</span>
        </label>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={flags.remarks}
          onChange={(e) => setFlag({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.showInDischarge}
            onChange={(e) => setFlag({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};