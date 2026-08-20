import React, { useState } from 'react';

interface SymptomState {
  active: boolean;
  eye: 'Left Eye' | 'Right Eye' | 'Both Eyes' | 'Left Side' | 'Right Side' | 'Both Sides';
  since: string;
  frequency: string;
  severity: string;
}

const SYMPTOM_DEFINITIONS: Array<{ id: string; label: string; isHeadache?: boolean }> = [
  { id: 'reduced_distance', label: 'Reduced Vision Distance' },
  { id: 'reduced_near', label: 'Reduced Vision Near' },
  { id: 'reduced_intermediate', label: 'Reduced Vision Intermediate' },
  { id: 'headache', label: 'Headache', isHeadache: true },
  { id: 'diplopia', label: 'Diplopia' },
  { id: 'pain', label: 'Pain' },
  { id: 'redness', label: 'Redness' },
  { id: 'discharge', label: 'Discharge' },
  { id: 'burning', label: 'Burning' },
  { id: 'watering', label: 'Watering' },
  { id: 'photophobia', label: 'Photophobia' },
  { id: 'floaters_flashes', label: 'Floaters / Flashes' },
];

const SINCE_OPTIONS = [
  'Select...',
  '1 day',
  '2-3 days',
  '1 week',
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
  '6 months',
  '1 year',
  'More than 1 year',
];

const FREQUENCY_OPTIONS = [
  'Select...',
  'Occasional',
  'Intermittent',
  'Constant',
];

const SEVERITY_OPTIONS = [
  'Select...',
  'Mild',
  'Moderate',
  'Severe',
];

export const SymptomaticHistoryView: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Record<string, SymptomState>>({
    reduced_near: {
      active: true,
      eye: 'Right Eye',
      since: '1 month',
      frequency: 'Constant',
      severity: 'Moderate',
    },
    headache: {
      active: true,
      eye: 'Right Side',
      since: '1 month',
      frequency: '',
      severity: '',
    },
  });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const toggleSymptom = (id: string, isHeadache?: boolean) => {
    setSymptoms((prev) => {
      const current = prev[id];
      if (current?.active) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return {
        ...prev,
        [id]: {
          active: true,
          eye: isHeadache ? 'Both Sides' : 'Both Eyes',
          since: '',
          frequency: '',
          severity: '',
        },
      };
    });
  };

  const updateSymptom = (id: string, field: keyof SymptomState, val: any) => {
    setSymptoms((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: val },
    }));
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Symptomatic History</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {SYMPTOM_DEFINITIONS.map((def) => {
          const item = symptoms[def.id];
          const isActive = !!item?.active;

          return (
            <div key={def.id} className="space-y-3">
              {/* Checkbox Header */}
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleSymptom(def.id, def.isHeadache)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
                />
                <span>{def.label}</span>
              </label>

              {/* Revealed Controls */}
              {isActive && (
                <div className="ml-7 space-y-3 pt-1">
                  {/* Laterality Segmented Toggle */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {def.isHeadache ? 'Select side' : 'Select eye'}
                    </span>
                    <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
                      {def.isHeadache ? (
                        <>
                          {(['Left Side', 'Right Side', 'Both Sides'] as const).map((side) => (
                            <button
                              key={side}
                              type="button"
                              onClick={() => updateSymptom(def.id, 'eye', side)}
                              className={`px-5 py-1.5 text-xs font-semibold transition-colors border-r last:border-r-0 border-slate-200 ${
                                item.eye === side
                                  ? 'bg-[#1E40AF] text-white font-bold'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {side}
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {(['Left Eye', 'Right Eye', 'Both Eyes'] as const).map((eyeOption) => (
                            <button
                              key={eyeOption}
                              type="button"
                              onClick={() => updateSymptom(def.id, 'eye', eyeOption)}
                              className={`px-5 py-1.5 text-xs font-semibold transition-colors border-r last:border-r-0 border-slate-200 ${
                                item.eye === eyeOption
                                  ? 'bg-[#1E40AF] text-white font-bold'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {eyeOption}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3-Field Row: Since | Frequency | Severity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Since */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Since</label>
                      <select
                        value={item.since}
                        onChange={(e) => updateSymptom(def.id, 'since', e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 bg-white ${
                          item.since ? 'border-slate-300 text-slate-800' : 'border-slate-200 text-slate-400'
                        }`}
                      >
                        {SINCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt === 'Select...' ? '' : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Frequency</label>
                      <select
                        value={item.frequency}
                        onChange={(e) => updateSymptom(def.id, 'frequency', e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 bg-white ${
                          item.frequency ? 'border-slate-300 text-slate-800' : 'border-slate-200 text-slate-400'
                        }`}
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt === 'Select...' ? '' : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Severity */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Severity</label>
                      <select
                        value={item.severity}
                        onChange={(e) => updateSymptom(def.id, 'severity', e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 bg-white ${
                          item.severity ? 'border-slate-300 text-slate-800' : 'border-slate-200 text-slate-400'
                        }`}
                      >
                        {SEVERITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt === 'Select...' ? '' : opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-3xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
