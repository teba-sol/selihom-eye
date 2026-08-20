import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

export const OcularHistoryView: React.FC = () => {
  const { ocularHistory, toggleOcularCondition, updateOcularInfection } = useEncounterStore();
  const { infection } = ocularHistory;

  return (
    <div className="p-8 max-w-4xl bg-white rounded-xl shadow-xs border border-slate-200">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Ocular History</h1>

      {/* No Ocular History Reported Checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={ocularHistory.noHistoryReported}
            onChange={() => {}}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
          />
          <span>No Ocular History Reported</span>
        </label>
      </div>

      <div className="space-y-6">
        {/* Surgery */}
        <div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={ocularHistory.surgery.active}
              onChange={() => toggleOcularCondition('surgery')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
            />
            <span>Surgery</span>
          </label>
        </div>

        {/* Trauma */}
        <div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={ocularHistory.trauma.active}
              onChange={() => toggleOcularCondition('trauma')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
            />
            <span>Trauma</span>
          </label>
        </div>

        {/* Infection (Cascading Sub-Section) */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-900 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={infection.active}
              onChange={() => toggleOcularCondition('infection')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
            />
            <span>Infection</span>
          </label>

          {infection.active && (
            <div className="ml-7 space-y-4 pt-2">
              {/* Eye Selector Segmented Control */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Select eye</span>
                <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-xs">
                  {(['Left Eye', 'Right Eye', 'Both Eyes'] as const).map((eyeOption) => (
                    <button
                      key={eyeOption}
                      type="button"
                      onClick={() => updateOcularInfection({ eye: eyeOption })}
                      className={`px-5 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                        infection.eye === eyeOption
                          ? 'bg-[#1E40AF] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {eyeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Type Selectors */}
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={infection.date}
                    onChange={(e) => updateOcularInfection({ date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Type</label>
                  <select
                    value={infection.type}
                    onChange={(e) => updateOcularInfection({ type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                  >
                    <option value="Corneal">Corneal</option>
                    <option value="Conjunctival">Conjunctival</option>
                    <option value="Blepharitis">Blepharitis</option>
                    <option value="Keratitis">Keratitis</option>
                  </select>
                </div>
              </div>

              {/* Specific Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={infection.remarks}
                  onChange={(e) => updateOcularInfection({ remarks: e.target.value })}
                  placeholder="Additional observations..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Glaucoma */}
        <div>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={ocularHistory.glaucoma.active}
              onChange={() => toggleOcularCondition('glaucoma')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
            />
            <span>Glaucoma</span>
          </label>
        </div>
      </div>
    </div>
  );
};
