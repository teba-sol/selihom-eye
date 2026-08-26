import React, { useState } from 'react';
import { MultiSelect } from '../components/MultiSelect';

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

export const ClPreFitView: React.FC = () => {
  const [indication, setIndication] = useState('Select...');
  const [motivation, setMotivation] = useState('Select...');
  const [previousCL, setPreviousCL] = useState('');
  const [cornealShape, setCornealShape] = useState('Select...');
  const [tearQuality, setTearQuality] = useState('Select...');
  const [pupilSize, setPupilSize] = useState('Select...');
  const [eyelidOd, setEyelidOd] = useState<string[]>([]);
  const [eyelidOs, setEyelidOs] = useState<string[]>([]);
  const [conjOd, setConjOd] = useState<string[]>([]);
  const [conjOs, setConjOs] = useState<string[]>([]);
  const [corneaOd, setCorneaOd] = useState<string[]>([]);
  const [corneaOs, setCorneaOs] = useState<string[]>([]);
  // K-readings
  const [k1Od, setK1Od] = useState('');
  const [k2Od, setK2Od] = useState('');
  const [axisOd, setAxisOd] = useState('');
  const [k1Os, setK1Os] = useState('');
  const [k2Os, setK2Os] = useState('');
  const [axisOs, setAxisOs] = useState('');
  const [hvdOd, setHvdOd] = useState('');
  const [hvdOs, setHvdOs] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Pre-Fitting Evaluation</h1>

      <div className="space-y-3 max-w-3xl mb-8 divide-y divide-slate-100">
        <Row label="Indication for CL"><Select value={indication} onChange={setIndication} options={INDICATION}/></Row>
        <Row label="Patient Motivation"><Select value={motivation} onChange={setMotivation} options={MOTIVATION}/></Row>
        <Row label="Previous CL Wear">
          <input type="text" value={previousCL} onChange={e => setPreviousCL(e.target.value)} placeholder="e.g. Soft daily for 2 years"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Corneal Shape (Topography)"><Select value={cornealShape} onChange={setCornealShape} options={CORNEAL_SHAPE}/></Row>
        <Row label="Tear Film Quality"><Select value={tearQuality} onChange={setTearQuality} options={TEAR_QUALITY}/></Row>
        <Row label="Pupil Size (Scotopic)"><Select value={pupilSize} onChange={setPupilSize} options={PUPIL_SIZE}/></Row>

        {/* Keratometry */}
        <div className="py-2">
          <p className="text-sm font-bold text-slate-800 mb-3">Keratometry (K-Readings)</p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'OD (Right)', k1: k1Od, setK1: setK1Od, k2: k2Od, setK2: setK2Od, axis: axisOd, setAxis: setAxisOd },
              { label: 'OS (Left)', k1: k1Os, setK1: setK1Os, k2: k2Os, setK2: setK2Os, axis: axisOs, setAxis: setAxisOs },
            ].map(eye => (
              <div key={eye.label} className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">{eye.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">K1</span>
                  <NumberInput value={eye.k1} onChange={eye.setK1} placeholder="e.g. 7.80" unit="mm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">K2</span>
                  <NumberInput value={eye.k2} onChange={eye.setK2} placeholder="e.g. 7.65" unit="mm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">Axis</span>
                  <NumberInput value={eye.axis} onChange={eye.setAxis} placeholder="e.g. 180" unit="°" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HVD */}
        <div className="py-2">
          <p className="text-sm font-bold text-slate-800 mb-3">Horizontal Visible Iris Diameter (HVID)</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-12">OD</span><NumberInput value={hvdOd} onChange={setHvdOd} placeholder="e.g. 11.8" unit="mm" /></div>
            <div className="flex items-center gap-2"><span className="text-xs text-slate-500 w-12">OS</span><NumberInput value={hvdOs} onChange={setHvdOs} placeholder="e.g. 11.8" unit="mm" /></div>
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
            { label: 'Eyelids', od: eyelidOd, setOd: setEyelidOd, os: eyelidOs, setOs: setEyelidOs, opts: EYELID_OPTIONS },
            { label: 'Conjunctiva', od: conjOd, setOd: setConjOd, os: conjOs, setOs: setConjOs, opts: CONJ_OPTIONS },
            { label: 'Cornea', od: corneaOd, setOd: setCorneaOd, os: corneaOs, setOs: setCorneaOs, opts: CORNEA_OPTIONS },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-[140px_1fr_1fr] gap-4 mb-2 items-start">
              <span className="text-sm font-semibold text-slate-700 pt-2">{row.label}</span>
              <MultiSelect options={row.opts} value={row.od} onChange={row.setOd} />
              <MultiSelect options={row.opts} value={row.os} onChange={row.setOs} />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
