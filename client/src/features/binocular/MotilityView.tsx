import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

const OPTIONS = [
  'Smooth, Accurate, Full and Extensive',
  'V Exo Pattern',
  'V Eso Pattern',
  'A Exo Pattern',
  'A Eso Pattern',
  'EOM Palsy',
];

type MotilityData = {
  selected: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: MotilityData = {
  selected: 'Smooth, Accurate, Full and Extensive',
  remarks: '',
  showInDischarge: false,
};

export const MotilityView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['ocular-motility'] ?? {}) as MotilityData;
  const patch = (p: Partial<MotilityData>) => setSectionData('ocular-motility', { ...f, ...p });
  const { selected, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Ocular Motility</h1>

      <div className="space-y-3 mb-8 max-w-lg">
        {OPTIONS.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="motility"
              value={opt}
              checked={selected === opt}
              onChange={() => patch({ selected: opt })}
              className="w-4 h-4 text-blue-600 accent-blue-600 focus:ring-0"
            />
            <span className="text-sm font-medium text-slate-800">{opt}</span>
          </label>
        ))}
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
          />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};