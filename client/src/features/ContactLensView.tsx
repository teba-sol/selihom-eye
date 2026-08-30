import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { ContactLensState } from '../store/useEncounterStore';

const DEFAULT_FLAGS = {
  none: true,
  softDaily: false,
  softMonthly: false,
  extendedWear: false,
  rgpHard: false,
  scleral: false,
  remarks: '',
  showInDischarge: false,
};

export const ContactLensView: React.FC = () => {
  const contactLensHistory = useEncounterStore((s) => s.contactLensHistory);
  const setContactLensHistory = useEncounterStore((s) => s.setContactLensHistory);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const flags = Object.assign({}, DEFAULT_FLAGS, sectionData['contact-lens'] ?? {});

  const syncLens = (f: typeof DEFAULT_FLAGS) => {
    if (f.none) {
      setContactLensHistory({ ...contactLensHistory, currentWearer: false, remarks: f.remarks });
      return;
    }
    const modality: ContactLensState['modality'] = f.softDaily
      ? 'Daily Disposable'
      : f.softMonthly
        ? 'Monthly Replacement'
        : f.extendedWear
          ? 'Extended Wear'
          : f.rgpHard
            ? 'RGP / Hard'
            : 'Scleral';
    setContactLensHistory({ ...contactLensHistory, currentWearer: true, modality, remarks: f.remarks });
  };

  const setFlag = (patch: Partial<typeof DEFAULT_FLAGS>) => {
    const next = { ...flags, ...patch };
    setSectionData('contact-lens', next);
    syncLens(next);
  };

  const handleNoneChange = (checked: boolean) => {
    setFlag({
      none: checked,
      softDaily: checked ? false : flags.softDaily,
      softMonthly: checked ? false : flags.softMonthly,
      extendedWear: checked ? false : flags.extendedWear,
      rgpHard: checked ? false : flags.rgpHard,
      scleral: checked ? false : flags.scleral,
    });
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Contact Lens</h1>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.none}
            onChange={(e) => handleNoneChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>None</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.softDaily}
            disabled={flags.none}
            onChange={(e) => setFlag({ softDaily: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Soft Daily Disposable</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.softMonthly}
            disabled={flags.none}
            onChange={(e) => setFlag({ softMonthly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Soft Monthly Disposable</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.extendedWear}
            disabled={flags.none}
            onChange={(e) => setFlag({ extendedWear: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Extended Wear</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.rgpHard}
            disabled={flags.none}
            onChange={(e) => setFlag({ rgpHard: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>RGP / Hard</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.scleral}
            disabled={flags.none}
            onChange={(e) => setFlag({ scleral: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Scleral</span>
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