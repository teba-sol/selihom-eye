import React from 'react';
import { MultiSelect } from '../components/MultiSelect';
import { useEncounterStore } from '../store/useEncounterStore';

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-start gap-4 py-2">
      <div className="pt-1.5">
        <span className="text-sm font-bold text-slate-800 block">{label}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, placeholder = '0', unit }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
      {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
    </div>
  );
}

const CORNEAL_SHAPE = ['Select...','Regular Astigmatism','Irregular Astigmatism','Keratoconus (Mild)','Keratoconus (Moderate)','Keratoconus (Advanced)','Pellucid Marginal Degeneration','Post-LASIK','Post-RK','Normal'];
const TEAR_QUALITY = ['Select...','Good (Normal TBUT)','Borderline (TBUT 5–10 sec)','Poor (TBUT < 5 sec)','Absent'];
const PUPIL_SIZE = ['Select...','< 4 mm (Small)','4–5 mm (Normal)','5–6 mm (Large)','>6 mm (Very large)'];
const EYELID_OPTIONS = ['Normal position','Ectropion','Entropion','Ptosis','Lagophthalmos','Blepharitis','MGD'];
const CONJ_OPTIONS = ['Clear / WNL','Hyperemia','Papillae','Follicles','Pinguecula','Pterygium','Chemosis'];
const CORNEA_OPTIONS = ['Clear / WNL','SPK','Epithelial defect','Scarring','Edema','Vascularization','Keratoconus'];
const INDICATION = ['Select...','Refractive (Myopia/Hyperopia/Astigmatism)','Keratoconus','Post-surgical (post-LASIK/RK)','Cosmetic/Tinted','Therapeutic (Bandage CL)','Presbyopia','Anisometropia','Orthokeratology'];
const MOTIVATION = ['Select...','High','Moderate','Low','Unclear'];

type BiomState = { od: string[]; os: string[] };

type ClPreFitData = {
  indication: string;
  motivation: string;
  previousCL: string;
  cornealShape: string;
  tearQuality: string;
  pupilSize: string;
  biom: {
    eyelids: BiomState;
    conj: BiomState;
    cornea: BiomState;
  };
  k: {
    od: { k1: string; k2: string; axis: string };
    os: { k1: string; k2: string; axis: string };
  };
  hvd: { od: string; os: string };
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_CL_PRE_FIT: ClPreFitData = {
  indication: 'Select...',
  motivation: 'Select...',
  previousCL: '',
  cornealShape: 'Select...',
  tearQuality: 'Select...',
  pupilSize: 'Select...',
  biom: {
    eyelids: { od: [], os: [] },
    conj: { od: [], os: [] },
    cornea: { od: [], os: [] },
  },
  k: {
    od: { k1: '', k2: '', axis: '' },
    os: { k1: '', k2: '', axis: '' },
  },
  hvd: { od: '', os: '' },
  remarks: '',
  showInDischarge: false,
};

export const ClPreFitView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const raw = Object.assign({}, DEFAULT_CL_PRE_FIT, sectionData['cl-pre-fit'] ?? {}) as ClPreFitData;
  const biom: ClPreFitData['biom'] = {
    eyelids: { od: raw.biom?.eyelids?.od ?? [], os: raw.biom?.eyelids?.os ?? [] },
    conj: { od: raw.biom?.conj?.od ?? [], os: raw.biom?.conj?.os ?? [] },
    cornea: { od: raw.biom?.cornea?.od ?? [], os: raw.biom?.cornea?.os ?? [] },
  };
  const k: ClPreFitData['k'] = {
    od: { k1: raw.k?.od?.k1 ?? '', k2: raw.k?.od?.k2 ?? '', axis: raw.k?.od?.axis ?? '' },
    os: { k1: raw.k?.os?.k1 ?? '', k2: raw.k?.os?.k2 ?? '', axis: raw.k?.os?.axis ?? '' },
  };
  const hvd = { od: raw.hvd?.od ?? '', os: raw.hvd?.os ?? '' };
  const f: ClPreFitData = { ...raw, biom, k, hvd };
  const patch = (p: Partial<ClPreFitData>) => setSectionData('cl-pre-fit', { ...f, ...p });
  const { indication, motivation, previousCL, cornealShape, tearQuality, pupilSize, remarks, showInDischarge } = f;

  const setBiom = (key: keyof ClPreFitData['biom'], side: 'od' | 'os', v: string[]) =>
    patch({ biom: { ...biom, [key]: { ...biom[key], [side]: v } } });
  const setK = (eye: 'od' | 'os', field: keyof ClPreFitData['k']['od'], v: string) =>
    patch({ k: { ...k, [eye]: { ...k[eye], [field]: v } } });

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Pre-Fitting Evaluation</h1>

      <div className="space-y-3 max-w-3xl mb-8 divide-y divide-slate-100">
        <Row label="Indication for CL"><Select value={indication} onChange={v => patch({ indication: v })} options={INDICATION}/></Row>
        <Row label="Patient Motivation"><Select value={motivation} onChange={v => patch({ motivation: v })} options={MOTIVATION}/></Row>
        <Row label="Previous CL Wear">
          <input type="text" value={previousCL} onChange={e => patch({ previousCL: e.target.value })} placeholder="e.g. Soft daily for 2 years"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Corneal Shape (Topography)"><Select value={cornealShape} onChange={v => patch({ cornealShape: v })} options={CORNEAL_SHAPE}/></Row>
        <Row label="Tear Film Quality"><Select value={tearQuality} onChange={v => patch({ tearQuality: v })} options={TEAR_QUALITY}/></Row>
        <Row label="Pupil Size (Scotopic)"><Select value={pupilSize} onChange={v => patch({ pupilSize: v })} options={PUPIL_SIZE}/></Row>

        {/* Keratometry */}
        <div className="py-2">
          <p className="text-sm font-bold text-slate-800 mb-3">Keratometry (K-Readings)</p>
          <div className="grid grid-cols-2 gap-6">
            {(['od', 'os'] as const).map(eye => (
              <div key={eye} className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">{eye === 'od' ? 'OD (Right)' : 'OS (Left)'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">K1</span>
                  <NumberInput value={k[eye].k1} onChange={v => setK(eye, 'k1', v)} placeholder="e.g. 7.80" unit="mm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">K2</span>
                  <NumberInput value={k[eye].k2} onChange={v => setK(eye, 'k2', v)} placeholder="e.g. 7.65" unit="mm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">Axis</span>
                  <NumberInput value={k[eye].axis} onChange={v => setK(eye, 'axis', v)} placeholder="e.g. 180" unit="°" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HVD */}
        <div className="py-2">
          <p className="text-sm font-bold text-slate-800 mb-3">Horizontal Visible Iris Diameter (HVID)</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-12">OD</span><NumberInput value={hvd.od} onChange={v => patch({ hvd: { ...hvd, od: v } })} placeholder="e.g. 11.8" unit="mm" /></div>
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-12">OS</span><NumberInput value={hvd.os} onChange={v => patch({ hvd: { ...hvd, os: v } })} placeholder="e.g. 11.8" unit="mm" /></div>
          </div>
        </div>

        {/* Biomicroscopy */}
        <div className="py-2">
          <p className="text-sm font-bold text-slate-800 mb-3">Biomicroscopy</p>
          <div className="grid grid-cols-[140px_1fr_1fr] gap-4 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase pt-2">Structure</span>
            <span className="text-xs font-bold text-slate-500 uppercase">OD</span>
            <span className="text-xs font-bold text-slate-500 uppercase">OS</span>
          </div>
          {[
            { label: 'Eyelids', key: 'eyelids' as const, opts: EYELID_OPTIONS },
            { label: 'Conjunctiva', key: 'conj' as const, opts: CONJ_OPTIONS },
            { label: 'Cornea', key: 'cornea' as const, opts: CORNEA_OPTIONS },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-[140px_1fr_1fr] gap-4 mb-2 items-start">
              <span className="text-sm font-semibold text-slate-700 pt-2">{row.label}</span>
              <MultiSelect options={row.opts} value={biom[row.key].od} onChange={v => setBiom(row.key, 'od', v)} />
              <MultiSelect options={row.opts} value={biom[row.key].os} onChange={v => setBiom(row.key, 'os', v)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};