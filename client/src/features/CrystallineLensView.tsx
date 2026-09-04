import React from 'react';
import { MultiSelect } from '../components/MultiSelect';
import { useEncounterStore } from '../store/useEncounterStore';

// ── LOCS III Grading Component ────────────────────────────────────────────────
type LocsGrade = { od: number; os: number };
type LocsState = { no: LocsGrade; nc: LocsGrade; c: LocsGrade; p: LocsGrade };

function GradeSlider({ label, description, maxGrade, value, onChange }: {
  label: string; description: string; maxGrade: number;
  value: LocsGrade; onChange: (v: LocsGrade) => void;
}) {
  const grades = Array.from({ length: maxGrade + 1 }, (_, i) => i);
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-bold text-slate-800">{label}</span>
          <span className="text-xs text-slate-400 ml-2">({description})</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {(['od', 'os'] as const).map(eye => (
          <div key={eye}>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{eye === 'od' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {grades.map(g => (
                <button key={g} type="button"
                  onClick={() => onChange({ ...value, [eye]: g })}
                  className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all ${
                    value[eye] === g
                      ? g === 0 ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : g <= 2 ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {value[eye] === 0 ? 'Clear / WNL'
                : value[eye] === 1 ? 'Trace'
                : value[eye] === 2 ? 'Mild'
                : value[eye] === 3 ? 'Moderate'
                : value[eye] === 4 ? 'Dense'
                : 'Very dense / Mature'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocsIIIGrading({ locs, onChange }: { locs: LocsState; onChange: (key: keyof LocsState, v: LocsGrade) => void }) {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <strong>LOCS III</strong> — Lens Opacities Classification System III. Grade each eye independently.
        <span className="ml-2 text-blue-500">0 = Clear · 1 = Trace · 2 = Mild · 3 = Moderate · 4 = Dense · 5+ = Mature</span>
      </div>

      <GradeSlider label="Nuclear Opalescence (NO)" description="0 – 6" maxGrade={6} value={locs.no} onChange={v => onChange('no', v)} />
      <GradeSlider label="Nuclear Color (NC)" description="0 – 6" maxGrade={6} value={locs.nc} onChange={v => onChange('nc', v)} />
      <GradeSlider label="Cortical Cataract (C)" description="0 – 5" maxGrade={5} value={locs.c} onChange={v => onChange('c', v)} />
      <GradeSlider label="Posterior Subcapsular (P)" description="0 – 5" maxGrade={5} value={locs.p} onChange={v => onChange('p', v)} />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const LENS_OPTIONS = [
  'Clear / Within Normal Limits',
  'Congenital Cataract',
  'Nuclear sclerosis',
  'Cortical cataract',
  'Mature Cataract',
  'Hypermature Cataract',
  'Traumatic Cataract',
  'Complicated Cataract',
  'Posterior Subcapsular Cataract (PSC)',
  'Nuclear Sclerosis Grade 1 (NC1/NO1)',
  'Nuclear Sclerosis Grade 2 (NC2/NO2)',
  'Nuclear Sclerosis Grade 3 (NC3/NO3)',
  'Pseudophakic (PCIOL in situ / Clear axis)',
  'Posterior Capsular Opacification (PCO)',
  'Aphakic',
  'Subluxated / Dislocated Lens',
  'Anterior Polar Cataract',
  'Posterior Polar Cataract',
];

const MYDRIATIC_OPTIONS = [
  'None',
  'Tropicamide 0.5%',
  'Tropicamide 0.8%',
  'Tropicamide 1%',
  'Phenylephrine 2.5%',
  'Phenylephrine 5%',
  'Phenylephrine 10%',
  'Tropicamide 0.8% + Phenylephrine 5%',
  'Tropicamide 1% + Phenylephrine 5%',
  'Cyclopentolate 1%',
  'Homatropine 2%',
  'Atropine 1%',
];

type CrystallineLensData = {
  activeTab: 'Form' | 'LOCS III Grading scale';
  mydriaticDrug: string[];
  instrument: 'Torch Light' | 'Slit Lamp';
  odObs: string[];
  osObs: string[];
  sameForOS: boolean;
  locs: LocsState;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_LOCS: LocsState = {
  no: { od: 0, os: 0 },
  nc: { od: 0, os: 0 },
  c: { od: 0, os: 0 },
  p: { od: 0, os: 0 },
};

const DEFAULT_CRYSTALLINE: CrystallineLensData = {
  activeTab: 'Form',
  mydriaticDrug: [],
  instrument: 'Slit Lamp',
  odObs: [],
  osObs: [],
  sameForOS: false,
  locs: DEFAULT_LOCS,
  remarks: '',
  showInDischarge: false,
};

export const CrystallineLensView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const raw = Object.assign({}, DEFAULT_CRYSTALLINE, sectionData['crystalline-lens'] ?? {}) as CrystallineLensData;
  const locs: LocsState = {
    no: { od: raw.locs?.no?.od ?? 0, os: raw.locs?.no?.os ?? 0 },
    nc: { od: raw.locs?.nc?.od ?? 0, os: raw.locs?.nc?.os ?? 0 },
    c: { od: raw.locs?.c?.od ?? 0, os: raw.locs?.c?.os ?? 0 },
    p: { od: raw.locs?.p?.od ?? 0, os: raw.locs?.p?.os ?? 0 },
  };
  const f: CrystallineLensData = { ...raw, locs };
  const patch = (p: Partial<CrystallineLensData>) => setSectionData('crystalline-lens', { ...f, ...p });
  const { activeTab, mydriaticDrug, instrument, odObs, osObs, sameForOS, remarks, showInDischarge } = f;

  const handleOdChange = (v: string[]) => {
    patch({ odObs: v, ...(sameForOS ? { osObs: v } : {}) });
  };

  const handleSame = (checked: boolean) => {
    patch({ sameForOS: checked, ...(checked ? { osObs: odObs } : {}) });
  };

  const updateLocs = (key: keyof LocsState, v: LocsGrade) =>
    patch({ locs: { ...locs, [key]: v } });

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-2">Crystalline Lens Evaluation</h1>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'LOCS III Grading scale'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => patch({ activeTab: tab })}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-blue-700 border-blue-700 font-semibold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'LOCS III Grading scale' ? (
        <LocsIIIGrading locs={locs} onChange={updateLocs} />
      ) : (
        <div className="space-y-5 max-w-4xl mb-8">
          {/* Mydriatic Drug */}
          <div className="grid grid-cols-[200px_1fr] items-start gap-4">
            <span className="text-sm font-bold text-slate-800 pt-2">Mydriatic Drug</span>
            <MultiSelect options={MYDRIATIC_OPTIONS} value={mydriaticDrug} onChange={v => patch({ mydriaticDrug: v })} placeholder="Select mydriatic drug..." />
          </div>

          {/* Instrument */}
          <div className="grid grid-cols-[200px_1fr] items-center gap-4">
            <span className="text-sm font-bold text-slate-800">Instrument</span>
            <div className="flex items-center gap-6 text-sm text-slate-700">
              {(['Torch Light', 'Slit Lamp'] as const).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="lensInstrument" checked={instrument === opt} onChange={() => patch({ instrument: opt })}
                    className="w-4 h-4 text-blue-600 accent-blue-600 focus:ring-0" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[200px_1fr_1fr] gap-4 pt-2">
            <span className="text-sm font-bold text-slate-800">Ocular Structure</span>
            <span className="text-sm font-bold text-slate-800">Right Eye Observation</span>
            <span className="text-sm font-bold text-slate-800">Left Eye Observation</span>
          </div>

          {/* Crystalline Lens Row */}
          <div className="grid grid-cols-[200px_1fr_1fr] gap-4 items-start">
            <span className="text-sm font-semibold text-slate-700 pt-2">Crystalline Lens</span>
            <div>
              <MultiSelect options={LENS_OPTIONS} value={odObs} onChange={handleOdChange} />
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                <input type="checkbox" checked={sameForOS} onChange={e => handleSame(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0" />
                <span className="text-xs text-slate-500">Same for left eye</span>
              </label>
            </div>
            <MultiSelect options={LENS_OPTIONS} value={sameForOS ? odObs : osObs}
              onChange={v => !sameForOS && patch({ osObs: v })} disabled={sameForOS} />
          </div>
        </div>
      )}

      <div className="mb-6 max-w-4xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-4xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};