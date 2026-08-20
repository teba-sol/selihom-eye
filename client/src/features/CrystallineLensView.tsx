import React, { useState } from 'react';

const LENS_OBSERVATIONS = [
  'Clean and clear / Within normal limits',
  'Clear crystalline lens',
  'Nuclear Sclerosis Grade 1 (NC1/NO1)',
  'Nuclear Sclerosis Grade 2 (NC2/NO2)',
  'Nuclear Sclerosis Grade 3 (NC3/NO3)',
  'Cortical Cataract (C1 - C5)',
  'Posterior Subcapsular Cataract (P1 - P5)',
  'Pseudophakic (PCIOL in situ / Clear axis)',
  'Posterior Capsular Opacification (PCO)',
  'Aphakic',
  'Subluxated / Dislocated Lens',
];

const MYDRIATIC_OPTIONS = [
  'Select...',
  'None / Undilated',
  'Tropicamide 0.8% + Phenylephrine 5%',
  'Tropicamide 1%',
  'Cyclopentolate 1%',
  'Homatropine 2%',
  'Atropine 1%',
];

export const CrystallineLensView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Form' | 'LOCS III Grading scale'>('Form');
  const [mydriaticDrug, setMydriaticDrug] = useState('');
  const [instrument, setInstrument] = useState<'Torch Light' | 'Slit Lamp'>('Slit Lamp');
  const [rightEyeObs, setRightEyeObs] = useState('');
  const [leftEyeObs, setLeftEyeObs] = useState('');
  const [sameForLeftEye, setSameForLeftEye] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const handleRightEyeChange = (val: string) => {
    setRightEyeObs(val);
    if (sameForLeftEye) {
      setLeftEyeObs(val);
    }
  };

  const handleSameForLeftEyeChange = (checked: boolean) => {
    setSameForLeftEye(checked);
    if (checked) {
      setLeftEyeObs(rightEyeObs);
    }
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-2">Crystalline Lens Evaluation</h1>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'LOCS III Grading scale'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === tab
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'LOCS III Grading scale' ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-6">
          <p className="font-bold text-slate-800 mb-2">LOCS III Reference Standard:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nuclear Opalescence (NO1 - NO6) &amp; Nuclear Color (NC1 - NC6)</li>
            <li>Cortical Cataract (C1 - C5)</li>
            <li>Posterior Subcapsular (P1 - P5)</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-5 max-w-4xl mb-8">
          {/* Mydriatic Drug */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-xs font-bold text-slate-800">Mydriatic Drug</label>
            <div className="md:col-span-3">
              <select
                value={mydriaticDrug}
                onChange={(e) => setMydriaticDrug(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              >
                {MYDRIATIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt === 'Select...' ? '' : opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instrument */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-xs font-bold text-slate-800">Instrument</label>
            <div className="md:col-span-3 flex items-center gap-6 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lensInstrument"
                  value="Torch Light"
                  checked={instrument === 'Torch Light'}
                  onChange={() => setInstrument('Torch Light')}
                  className="text-blue-600 focus:ring-0"
                />
                <span>Torch Light</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lensInstrument"
                  value="Slit Lamp"
                  checked={instrument === 'Slit Lamp'}
                  onChange={() => setInstrument('Slit Lamp')}
                  className="text-blue-600 focus:ring-0"
                />
                <span>Slit Lamp</span>
              </label>
            </div>
          </div>

          {/* Table-like Structure Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-2">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">Ocular Structure</span>
              <span className="text-xs font-medium text-slate-700">Crystalline Lens</span>
            </div>

            {/* Right Eye Observation */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Right Eye Observation</label>
              <select
                value={rightEyeObs}
                onChange={(e) => handleRightEyeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600 mb-2"
              >
                <option value="">Select...</option>
                {LENS_OBSERVATIONS.map((obs) => (
                  <option key={obs} value={obs}>
                    {obs}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameForLeftEye}
                  onChange={(e) => handleSameForLeftEyeChange(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-0"
                />
                <span>Same for left eye</span>
              </label>
            </div>

            {/* Left Eye Observation */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Left Eye Observation</label>
              <select
                value={leftEyeObs}
                disabled={sameForLeftEye}
                onChange={(e) => setLeftEyeObs(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Select...</option>
                {LENS_OBSERVATIONS.map((obs) => (
                  <option key={obs} value={obs}>
                    {obs}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Any remarks */}
      <div className="mb-6">
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
      <div className="flex justify-end">
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
