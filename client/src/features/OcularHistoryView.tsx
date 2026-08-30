import React from 'react';
import type { OcularConditionDetail } from '../store/useEncounterStore';
import { useEncounterStore } from '../store/useEncounterStore';

const CONDITIONS_CONFIG: Array<{
  key: keyof ReturnType<typeof useEncounterStore.getState>['ocularHistory']['conditions'];
  title: string;
  types: string[];
}> = [
  { key: 'surgery', title: 'Surgery', types: ['Cataract', 'Trabeculectomy', 'LASIK/PRK', 'Corneal Graft / PKP', 'Vitrectomy'] },
  { key: 'trauma', title: 'Trauma', types: ['Blunt Trauma', 'Penetrating Injury', 'Chemical Splash', 'Foreign Body'] },
  { key: 'infection', title: 'Infection', types: ['Corneal', 'Conjunctival', 'Blepharitis', 'Keratitis', 'Endophthalmitis'] },
  { key: 'glaucoma', title: 'Glaucoma', types: ['POAG', 'PACG', 'Secondary Glaucoma', 'Ocular Hypertension'] },
  { key: 'retinalDetachment', title: 'Retinal Detachment / Disease', types: ['Retinal Tear', 'Macular Hole', 'Diabetic Retinopathy', 'RVO/RAO'] },
  { key: 'amblyopia', title: 'Amblyopia / Squint', types: ['Strabismic', 'Refractive / Anisometropic', 'Deprivation'] },
];

export const OcularHistoryView: React.FC = () => {
  const {
    ocularHistory,
    updateOcularCondition,
    setOcularGeneralRemarks,
    setNoOcularHistory,
  } = useEncounterStore();
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const extra = (sectionData['ocular-history'] ?? { showInDischarge: false }) as {
    showInDischarge: boolean;
  };
  const updateExtra = (patch: Partial<typeof extra>) =>
    setSectionData('ocular-history', { ...extra, ...patch });

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-[#2563eb]">Ocular History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record past ocular pathologies, surgeries, and trauma with discharge summary flags.
        </p>
      </div>

      {/* No Ocular History Reported */}
      <div>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={ocularHistory.noHistoryReported}
            onChange={(e) => setNoOcularHistory(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
          />
          <span>No Ocular History Reported</span>
        </label>
      </div>

      {/* Dynamic Condition List */}
      {!ocularHistory.noHistoryReported && (
        <div className="space-y-4">
          {CONDITIONS_CONFIG.map((config) => {
            const detail: OcularConditionDetail = ocularHistory.conditions[config.key];
            return (
              <div
                key={config.key}
                className={`border rounded-lg transition-all ${
                  detail.active
                    ? 'border-slate-300 bg-slate-50/70 p-4 shadow-xs'
                    : 'border-transparent p-2 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detail.active}
                      onChange={() => updateOcularCondition(config.key, { active: !detail.active })}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
                    />
                    <span>{config.title}</span>
                  </label>
                </div>

                {/* Sub-form drawer for every active condition */}
                {detail.active && (
                  <div className="ml-7 space-y-4 pt-3 mt-2 border-t border-slate-200">
                    {/* Eye Selector */}
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-1.5">Select eye</span>
                      <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-xs">
                        {(['Left Eye', 'Right Eye', 'Both Eyes'] as const).map((eyeOption) => (
                          <button
                            key={eyeOption}
                            type="button"
                            onClick={() => updateOcularCondition(config.key, { eye: eyeOption })}
                            className={`px-5 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                              detail.eye === eyeOption
                                ? 'bg-[#1E40AF] text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {eyeOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date and Type */}
                    <div className="grid grid-cols-2 gap-4 max-w-lg">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Date</label>
                        <input
                          type="text"
                          placeholder="dd/mm/yyyy"
                          value={detail.date}
                          onChange={(e) => updateOcularCondition(config.key, { date: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Type</label>
                        <select
                          value={detail.type || config.types[0]}
                          onChange={(e) => updateOcularCondition(config.key, { type: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600 font-medium"
                        >
                          {config.types.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Remarks</label>
                      <textarea
                        rows={2}
                        value={detail.remarks}
                        onChange={(e) => updateOcularCondition(config.key, { remarks: e.target.value })}
                        placeholder={`Details about ${config.title.toLowerCase()}...`}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Global General Remarks */}
      <div className="pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Any other ocular history / General Remarks
        </label>
        <textarea
          rows={3}
          value={ocularHistory.generalRemarks}
          onChange={(e) => setOcularGeneralRemarks(e.target.value)}
          placeholder="Enter any additional ocular history, family notes, or observations not captured above..."
          className="w-full p-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={extra.showInDischarge}
            onChange={(e) => updateExtra({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
