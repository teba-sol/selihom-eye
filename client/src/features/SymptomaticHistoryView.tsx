import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { PlusCircle, Trash2 } from 'lucide-react';

const COMMON_SYMPTOM_PRESETS = [
  'Reduced Distance Vision',
  'Reduced Near Vision',
  'Fluctuating Vision',
  'Burning Sensation',
  'Watering / Epiphora',
  'Headache',
  'Redness / Hyperemia',
  'Eye Strain / Asthenopia',
  'Glare / Halos',
  'Double Vision (Diplopia)',
  'Foreign Body Sensation',
];

export const SymptomaticHistoryView: React.FC = () => {
  const { symptoms, addOrToggleSymptom, updateSymptom } = useEncounterStore();

  return (
    <div className="p-8 max-w-4xl bg-white rounded-xl shadow-xs border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A8A]">Symptomatic History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select patient-reported symptoms to expand severity, duration, and laterality controls.
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mb-8">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
          Common Symptoms (Quick Tag)
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOM_PRESETS.map((preset) => {
            const isSelected = symptoms.some((s) => s.name === preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => addOrToggleSymptom(preset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Cascading Symptom Details Cards */}
      <div className="space-y-4">
        {symptoms.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
            No symptoms selected. Click any tag above to log a complaint.
          </div>
        )}

        {symptoms.map((symptom) => (
          <div
            key={symptom.id}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 relative transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                {symptom.name}
              </span>
              <button
                onClick={() => addOrToggleSymptom(symptom.name)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                title="Remove symptom"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Eye Laterality Segmented Control */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select Eye
                </label>
                <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-xs w-full">
                  {(['Left Eye', 'Right Eye', 'Both Eyes'] as const).map((eyeOption) => (
                    <button
                      key={eyeOption}
                      type="button"
                      onClick={() => updateSymptom(symptom.id, { eye: eyeOption })}
                      className={`flex-1 py-1 text-xs font-bold rounded-sm transition-colors ${
                        symptom.eye === eyeOption
                          ? 'bg-[#1E40AF] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {eyeOption === 'Left Eye' ? 'OS' : eyeOption === 'Right Eye' ? 'OD' : 'OU'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Values */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={symptom.durationValue}
                    onChange={(e) =>
                      updateSymptom(symptom.id, { durationValue: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-16 px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-center font-bold focus:outline-hidden focus:border-teal-600"
                  />
                  <select
                    value={symptom.durationUnit}
                    onChange={(e) =>
                      updateSymptom(symptom.id, { durationUnit: e.target.value as any })
                    }
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Severity Chips */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Severity
                </label>
                <div className="flex gap-1">
                  {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => updateSymptom(symptom.id, { severity: sev })}
                      className={`flex-1 py-1 text-xs font-semibold rounded-md border ${
                        symptom.severity === sev
                          ? sev === 'Severe'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Remarks / Triggers */}
            <div className="mt-3">
              <input
                type="text"
                value={symptom.remarks || ''}
                onChange={(e) => updateSymptom(symptom.id, { remarks: e.target.value })}
                placeholder="Additional notes (e.g., worse in mornings, constant pain)..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
