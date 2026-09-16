import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

const DEFAULT_FLAGS = {
  occupation: '',
  hobbies: '',
  remarks: '',
  showInDischarge: false,
};

export const LifestyleView: React.FC = () => {
  const lifestyleDemands = useEncounterStore((s) => s.lifestyleDemands);
  const updateLifestyle = useEncounterStore((s) => s.updateLifestyle);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const flags = Object.assign({}, DEFAULT_FLAGS, sectionData['lifestyle'] ?? {});
  const occupation = lifestyleDemands.occupation;

  const updateOccupation = (value: string) => updateLifestyle({ occupation: value });
  const updateHobbies = (value: string) => {
    updateLifestyle({ hobbies: value });
    setSectionData('lifestyle', { ...flags, hobbies: value });
  };
  const updateExtra = (patch: Partial<typeof DEFAULT_FLAGS>) =>
    setSectionData('lifestyle', { ...flags, ...patch });

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Lifestyle</h1>

      <div className="space-y-5 mb-8">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Occupation</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => updateOccupation(e.target.value)}
            placeholder="e.g. Cook, Accountant, Driver..."
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Hobbies</label>
          <input
            type="text"
            value={lifestyleDemands.hobbies}
            onChange={(e) => updateHobbies(e.target.value)}
            placeholder="e.g. Reading, watching TV, Swimming..."
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={flags.remarks}
          onChange={(e) => updateExtra({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={flags.showInDischarge}
            onChange={(e) => updateExtra({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};