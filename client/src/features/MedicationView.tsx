import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { MedicationEntry } from '../store/useEncounterStore';

const DEFAULT_FLAGS = {
  none: false,
  eyeDrops: false,
  tablets: false,
  injection: false,
  remarks: '',
  showInDischarge: false,
};

export const MedicationView: React.FC = () => {
  const setPatientMedications = useEncounterStore((s) => s.setPatientMedications);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const flags = Object.assign({}, DEFAULT_FLAGS, sectionData['medication'] ?? {});

  const syncMeds = (f: typeof DEFAULT_FLAGS) => {
    if (f.none) {
      setPatientMedications([]);
      return;
    }
    const build = (route: MedicationEntry['route'], name: string): MedicationEntry => ({
      id: crypto.randomUUID(),
      drugName: name,
      dosage: '',
      frequency: '',
      route,
      targetEye: 'Both Eyes',
      compliance: 'Compliant',
      showInDischarge: f.showInDischarge,
    });
    const list: MedicationEntry[] = [];
    if (f.eyeDrops) list.push(build('Ophthalmic Drops', 'Eye Drops'));
    if (f.tablets) list.push(build('Oral', 'Tablets'));
    if (f.injection) list.push(build('Subcutaneous', 'Injection'));
    setPatientMedications(list);
  };

  const setFlag = (patch: Partial<typeof DEFAULT_FLAGS>) => {
    const next = { ...flags, ...patch };
    setSectionData('medication', next);
    syncMeds(next);
  };

  const handleNoneChange = (checked: boolean) => {
    setFlag({
      none: checked,
      eyeDrops: checked ? false : flags.eyeDrops,
      tablets: checked ? false : flags.tablets,
      injection: checked ? false : flags.injection,
    });
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Medication</h1>

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
            checked={flags.eyeDrops}
            disabled={flags.none}
            onChange={(e) => setFlag({ eyeDrops: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Eye Drops</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.tablets}
            disabled={flags.none}
            onChange={(e) => setFlag({ tablets: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Tablets</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.injection}
            disabled={flags.none}
            onChange={(e) => setFlag({ injection: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Injection</span>
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
