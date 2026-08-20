import React, { useState } from 'react';

interface EyeObservation {
  od: string;
  os: string;
  sameForLeft: boolean;
}

const VITREOUS_OPTIONS = [
  'Select...',
  'Clean and clear / Within normal limits',
  'Posterior Vitreous Detachment (PVD)',
  'Vitreous Floaters / Opacities',
  'Asteroid Hyalosis',
  'Vitreous Hemorrhage',
  'Shafer\'s Sign / Tobacco Dust',
];

const ONH_OPTIONS = [
  'Select...',
  'Pink, well-defined margins / Within normal limits',
  'Pale optic disc / Atrophy',
  'Suspicious glaucomatous cupping',
  'Notching of neuroretinal rim',
  'Disc swelling / Papilledema',
  'Optic disc drusen',
  'Coloboma',
];

const MACULA_OPTIONS = [
  'Select...',
  'Clean and healthy / Within normal limits',
  'Normal foveal reflex',
  'Drusen (Hard / Soft)',
  'Macular edema / CME',
  'Dry AMD (RPE changes / Geographic atrophy)',
  'Wet AMD / CNVM',
  'Macular hole',
  'Epiretinal membrane (ERM)',
];

const VESSELS_OPTIONS = [
  'Select...',
  'Normal caliber and course / Within normal limits',
  'Arteriolar attenuation / Copper wiring',
  'AV nicking / Crossing changes',
  'Dot and blot hemorrhages',
  'Flame hemorrhages',
  'Microaneurysms',
  'Neovascularization of disc (NVD)',
  'Neovascularization elsewhere (NVE)',
];

const PERIPHERY_OPTIONS = [
  'Select...',
  'Flat and intact 360\u00b0 / Within normal limits',
  'Lattice degeneration',
  'Retinal tear / Hole',
  'Retinal detachment',
  'Pavingstone degeneration',
  'Retinoschisis',
];

export const PosteriorSegmentEvaluationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Form' | 'Diagram'>('Form');
  const [mydriaticDrug, setMydriaticDrug] = useState('');
  const [instrument, setInstrument] = useState('');

  const [vitreous, setVitreous] = useState<EyeObservation>({ od: '', os: '', sameForLeft: false });
  const [onh, setOnh] = useState<EyeObservation>({ od: '', os: '', sameForLeft: false });
  const [cdrOd, setCdrOd] = useState('0.3');
  const [cdrOs, setCdrOs] = useState('0.3');

  const [macula, setMacula] = useState<EyeObservation>({ od: '', os: '', sameForLeft: false });
  const [vessels, setVessels] = useState<EyeObservation>({ od: '', os: '', sameForLeft: false });
  const [periphery, setPeriphery] = useState<EyeObservation>({ od: '', os: '', sameForLeft: false });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const handleObsChange = (
    setter: React.Dispatch<React.SetStateAction<EyeObservation>>,
    eye: 'od' | 'os',
    val: string
  ) => {
    setter((prev) => {
      if (eye === 'od' && prev.sameForLeft) {
        return { ...prev, od: val, os: val };
      }
      return { ...prev, [eye]: val };
    });
  };

  const handleSameChange = (
    setter: React.Dispatch<React.SetStateAction<EyeObservation>>,
    checked: boolean
  ) => {
    setter((prev) => ({
      ...prev,
      sameForLeft: checked,
      os: checked ? prev.od : prev.os,
    }));
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-2">Posterior Segment Evaluation</h1>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'Diagram'] as const).map((tab) => (
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

      {activeTab === 'Diagram' ? (
        <div className="p-8 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
          Posterior Segment Retina &amp; Disc Drawing Canvas
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mb-8">
          {/* Mydriatic Drug */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-xs font-bold text-slate-800">Mydriatic Drug</label>
            <div className="md:col-span-3">
              <select
                value={mydriaticDrug}
                onChange={(e) => setMydriaticDrug(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">Select...</option>
                <option value="Tropicamide 0.8% + Phenylephrine 5%">Tropicamide 0.8% + Phenylephrine 5%</option>
                <option value="Tropicamide 1%">Tropicamide 1%</option>
                <option value="Cyclopentolate 1%">Cyclopentolate 1%</option>
                <option value="None / Undilated">None / Undilated</option>
              </select>
            </div>
          </div>

          {/* Instrument */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-xs font-bold text-slate-800">Instrument</label>
            <div className="md:col-span-3">
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">Select...</option>
                <option value="Slit Lamp Biomicroscopy (90D / 78D / SuperField)">Slit Lamp Biomicroscopy (90D / 78D / SuperField)</option>
                <option value="Binocular Indirect Ophthalmoscopy (BIO 20D)">Binocular Indirect Ophthalmoscopy (BIO 20D)</option>
                <option value="Direct Ophthalmoscopy">Direct Ophthalmoscopy</option>
              </select>
            </div>
          </div>

          {/* Observation Grid */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-2.5 px-4 text-left font-bold text-slate-900 w-1/4">Ocular Structure</th>
                  <th className="py-2.5 px-4 text-left font-bold text-slate-900 w-[37.5%]">Right Eye Observation</th>
                  <th className="py-2.5 px-4 text-left font-bold text-slate-900 w-[37.5%]">Left Eye Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {/* 1. Vitreous */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 align-top">Vitreous</td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={vitreous.od}
                      onChange={(e) => handleObsChange(setVitreous, 'od', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 mb-1"
                    >
                      {VITREOUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitreous.sameForLeft}
                        onChange={(e) => handleSameChange(setVitreous, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span>Same for left eye</span>
                    </label>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={vitreous.os}
                      disabled={vitreous.sameForLeft}
                      onChange={(e) => handleObsChange(setVitreous, 'os', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {VITREOUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* 2. Optic Nerve Head */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 align-top">Optic Nerve Head</td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={onh.od}
                      onChange={(e) => handleObsChange(setOnh, 'od', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 mb-1"
                    >
                      {ONH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={onh.sameForLeft}
                        onChange={(e) => handleSameChange(setOnh, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span>Same for left eye</span>
                    </label>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700">Cup Disc Ratio</span>
                      <input
                        type="text"
                        value={cdrOd}
                        onChange={(e) => setCdrOd(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={onh.os}
                      disabled={onh.sameForLeft}
                      onChange={(e) => handleObsChange(setOnh, 'os', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 disabled:bg-slate-100 mb-6"
                    >
                      {ONH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700">Cup Disc Ratio</span>
                      <input
                        type="text"
                        value={cdrOs}
                        onChange={(e) => setCdrOs(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold"
                      />
                    </div>
                  </td>
                </tr>

                {/* 3. Macula */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 align-top">Macula</td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={macula.od}
                      onChange={(e) => handleObsChange(setMacula, 'od', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 mb-1"
                    >
                      {MACULA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={macula.sameForLeft}
                        onChange={(e) => handleSameChange(setMacula, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span>Same for left eye</span>
                    </label>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={macula.os}
                      disabled={macula.sameForLeft}
                      onChange={(e) => handleObsChange(setMacula, 'os', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {MACULA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* 4. Retinal Vessels */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 align-top">Retinal Vessels</td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={vessels.od}
                      onChange={(e) => handleObsChange(setVessels, 'od', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 mb-1"
                    >
                      {VESSELS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vessels.sameForLeft}
                        onChange={(e) => handleSameChange(setVessels, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span>Same for left eye</span>
                    </label>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={vessels.os}
                      disabled={vessels.sameForLeft}
                      onChange={(e) => handleObsChange(setVessels, 'os', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {VESSELS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* 5. Peripheral Retina */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 align-top">Peripheral Retina</td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={periphery.od}
                      onChange={(e) => handleObsChange(setPeriphery, 'od', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 mb-1"
                    >
                      {PERIPHERY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={periphery.sameForLeft}
                        onChange={(e) => handleSameChange(setPeriphery, e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span>Same for left eye</span>
                    </label>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <select
                      value={periphery.os}
                      disabled={periphery.sameForLeft}
                      onChange={(e) => handleObsChange(setPeriphery, 'os', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {PERIPHERY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
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
