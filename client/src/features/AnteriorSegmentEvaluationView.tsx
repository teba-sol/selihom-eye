import React, { useState } from 'react';
import { AnteriorDrawingView } from './AnteriorDrawingView';

interface StructureObservation {
  od: string;
  os: string;
}

const STRUCTURE_OPTIONS: Record<string, string[]> = {
  'Lids/Lashes': [
    'Clean and healthy / Within normal limits',
    'Chronic anterior Blepharitis',
    'Chronic posterior Blepharitis',
    'Demodex Blepharitis',
    'Phthiriasis palpebrum',
    'Angular blepharitis',
    'Childhood blepharoconjunctivitis',
    'Simple Congenital ptosis',
    'Meibomian Gland Dysfunction (MGD)',
    'Trichiasis / Distichiasis',
    'Chalazion / Stye',
  ],
  'Orbit and Lacrimal System': [
    'Normal / Within normal limits',
    'Punctal stenosis',
    'Dacryocystitis',
    'Nasolacrimal duct obstruction (NLDO)',
    'Dry eye / Reduced tear meniscus',
    'Epiphora',
  ],
  'Conjunctiva': [
    'Clean and healthy / Within normal limits',
    'Hyperemia / Injection',
    'Ciliary flush / Circumcorneal congestion',
    'Papillae / Follicles',
    'Subconjunctival hemorrhage',
    'Pinguecula / Pterygium',
    'Allergic conjunctivitis',
  ],
  'Cornea': [
    'Clean and clear / Within normal limits',
    'Central corneal scarring / Opacity',
    'Superficial Punctate Keratitis (SPK)',
    'Epithelial defect / Fluorescein staining',
    'Stromal infiltrate / Ulcer',
    'Corneal edema / Descemet folds',
    'Keratoconus / Thinning',
  ],
  'Anterior Chamber': [
    'Deep and quiet / Within normal limits',
    'Shallow anterior chamber',
    'Cells & Flare (1+ / 2+)',
    'Hypopyon',
    'Hyphema',
  ],
  'Iris': [
    'Normal pattern and color / Within normal limits',
    'Iris atrophy',
    'Neovascularization of iris (NVI / Rubeosis)',
    'Posterior synechiae',
    'Coloboma',
  ],
  'Pupil': [
    'Round, regular, reactive OU',
    'Sluggish reaction',
    'Afferent Pupillary Defect (RAPD)',
    'Irregular / Corectopia',
  ],
  'Lens': [
    'Clean and clear / Within normal limits',
    'Early nuclear sclerosis (NS 1+)',
    'Nuclear cataract (NS 2+ / 3+)',
    'Cortical cataract',
    'Posterior subcapsular cataract (PSC)',
    'Pseudophakic (PCIOL in situ / Clear axis)',
    'Posterior capsular opacification (PCO)',
  ],
};

export const AnteriorSegmentEvaluationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'Form' | 'Diagram'>('Form');
  const [instrument, setInstrument] = useState<'Torch Light' | 'Slit Lamp'>('Slit Lamp');

  const [observations, setObservations] = useState<Record<string, StructureObservation>>({
    'Lids/Lashes': { od: 'Clean and healthy / Within normal limits', os: 'Clean and healthy / Within normal limits' },
    'Orbit and Lacrimal System': { od: '', os: '' },
    'Conjunctiva': { od: 'Clean and healthy / Within normal limits', os: 'Clean and healthy / Within normal limits' },
    'Cornea': { od: 'Central corneal scarring / Opacity', os: 'Clean and clear / Within normal limits' },
    'Anterior Chamber': { od: 'Deep and quiet / Within normal limits', os: 'Deep and quiet / Within normal limits' },
    'Iris': { od: 'Normal pattern and color / Within normal limits', os: 'Normal pattern and color / Within normal limits' },
    'Pupil': { od: 'Round, regular, reactive OU', os: 'Round, regular, reactive OU' },
    'Lens': { od: 'Clean and clear / Within normal limits', os: 'Clean and clear / Within normal limits' },
  });

  const [remarks, setRemarks] = useState('Central corneal scar OD; otherwise anterior segment within normal limits OU.');
  const [showInDischarge, setShowInDischarge] = useState(true);

  const updateObservation = (structure: string, eye: 'od' | 'os', value: string) => {
    setObservations((prev) => ({
      ...prev,
      [structure]: { ...prev[structure], [eye]: value },
    }));
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-2">Anterior Segment Evaluation</h1>

      {/* Form vs Diagram Sub-tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveSubTab('Form')}
          className={`pb-2 text-xs font-bold tracking-wider transition-colors ${
            activeSubTab === 'Form'
              ? 'text-blue-700 border-b-2 border-blue-700 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('Diagram')}
          className={`pb-2 text-xs font-bold tracking-wider transition-colors ${
            activeSubTab === 'Diagram'
              ? 'text-blue-700 border-b-2 border-blue-700 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Diagram
        </button>
      </div>

      {activeSubTab === 'Diagram' ? (
        <AnteriorDrawingView />
      ) : (
        <div className="space-y-6">
          {/* Instrument Selector */}
          <div className="flex items-center gap-6 text-xs text-slate-700 mb-6">
            <span className="font-bold text-slate-900">Instrument</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="instrument"
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
                name="instrument"
                value="Slit Lamp"
                checked={instrument === 'Slit Lamp'}
                onChange={() => setInstrument('Slit Lamp')}
                className="text-blue-600 focus:ring-0"
              />
              <span>Slit Lamp</span>
            </label>
          </div>

          {/* 3-Column Observation Table */}
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
                {Object.keys(STRUCTURE_OPTIONS).map((structure) => {
                  const options = STRUCTURE_OPTIONS[structure];
                  const obs = observations[structure] || { od: '', os: '' };

                  return (
                    <tr key={structure} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 align-middle">
                        {structure}
                      </td>

                      {/* Right Eye Observation (OD) */}
                      <td className="py-2 px-3 align-middle">
                        <select
                          value={obs.od}
                          onChange={(e) => updateObservation(structure, 'od', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                            obs.od
                              ? 'border-blue-300 bg-blue-50/20 text-slate-900'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          <option value="">Select...</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt} className="text-slate-900">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Left Eye Observation (OS) */}
                      <td className="py-2 px-3 align-middle">
                        <select
                          value={obs.os}
                          onChange={(e) => updateObservation(structure, 'os', e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                            obs.os
                              ? 'border-blue-300 bg-blue-50/20 text-slate-900'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          <option value="">Select...</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt} className="text-slate-900">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Any remarks? */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Show in Discharge Summary Checkbox */}
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
      )}
    </div>
  );
};
