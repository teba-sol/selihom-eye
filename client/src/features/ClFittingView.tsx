import React, { useState } from 'react';

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <div className="pt-1.5">
        <span className="text-sm font-bold text-slate-800 block">{label}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Select({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 ${className}`}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Num({ value, onChange, placeholder = '0', unit }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-28 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
      {unit && <span className="text-xs text-slate-500 font-medium shrink-0">{unit}</span>}
    </div>
  );
}

const CL_TYPE = ['Select...','Soft Spherical','Soft Toric','Soft Multifocal','Rigid Gas Permeable (RGP)','Scleral','Mini-Scleral','Orthokeratology','Bandage CL','Custom Soft'];
const MODALITY = ['Select...','Daily Disposable','2-Weekly Replacement','Monthly Replacement','3-Monthly Replacement','Extended Wear','Continuous Wear','Reusable (RGP)'];
const MATERIAL = ['Select...','Silicone Hydrogel (High Dk)','Hydrogel (HEMA)','Fluorosilicone Acrylate (RGP)','Scleral (Boston XO)','Custom polymer'];
const CENTRATION = ['Select...','Well centred','Slightly superior','Slightly inferior','Slightly nasal','Slightly temporal','Decentred'];
const COVERAGE = ['Select...','Full corneal coverage','Slightly incomplete','Incomplete'];
const MOVEMENT = ['Select...','Adequate (0.5–1.0 mm)','Insufficient (<0.5 mm)','Excessive (>1.0 mm)','Good lag','Poor lag'];
const FLUORESCEIN = ['Select...','Alignment (ideal)','Apical clearance','Apical touch','Edge clearance','Edge seal','Central clearance','Peripheral seal'];
const VISION_QUAL = ['Select...','Clear and stable','Slightly blurred','Blurred','Variable'];
const COMFORT = ['Select...','Comfortable','Mild discomfort','Moderate discomfort','Significant discomfort'];

interface EyeRx { bc: string; dia: string; sph: string; cyl: string; axis: string; add: string; }
const emptyRx = (): EyeRx => ({ bc: '', dia: '', sph: '', cyl: '', axis: '', add: '' });

export const ClFittingView: React.FC = () => {
  const [clType, setClType] = useState('Select...');
  const [modality, setModality] = useState('Select...');
  const [material, setMaterial] = useState('Select...');
  const [brand, setBrand] = useState('');
  const [odRx, setOdRx] = useState<EyeRx>(emptyRx());
  const [osRx, setOsRx] = useState<EyeRx>(emptyRx());
  const [sameForOs, setSameForOs] = useState(false);
  const [centrationOd, setCentrationOd] = useState('Select...');
  const [centrationOs, setCentrationOs] = useState('Select...');
  const [coverageOd, setCoverageOd] = useState('Select...');
  const [coverageOs, setCoverageOs] = useState('Select...');
  const [movementOd, setMovementOd] = useState('Select...');
  const [movementOs, setMovementOs] = useState('Select...');
  const [fluoresceinOd, setFluoresceinOd] = useState('Select...');
  const [fluoresceinOs, setFluoresceinOs] = useState('Select...');
  const [visionOd, setVisionOd] = useState('Select...');
  const [visionOs, setVisionOs] = useState('Select...');
  const [vaOd, setVaOd] = useState('');
  const [vaOs, setVaOs] = useState('');
  const [comfort, setComfort] = useState('Select...');
  const [wearingTime, setWearingTime] = useState('');
  const [followUp, setFollowUp] = useState('Select...');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const updOd = (f: keyof EyeRx, v: string) => {
    setOdRx(p => ({ ...p, [f]: v }));
    if (sameForOs) setOsRx(p => ({ ...p, [f]: v }));
  };

  const RxFields = ({ rx, upd }: { rx: EyeRx; upd: (f: keyof EyeRx, v: string) => void }) => (
    <div className="grid grid-cols-3 gap-2">
      {(['bc','dia','sph','cyl','axis','add'] as (keyof EyeRx)[]).map(f => (
        <div key={f}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">{f === 'bc' ? 'Base Curve' : f === 'dia' ? 'Diameter' : f === 'sph' ? 'Sphere' : f === 'cyl' ? 'Cylinder' : f === 'axis' ? 'Axis' : 'Add'}</label>
          <input type="text" value={rx[f]} onChange={e => upd(f, e.target.value)}
            placeholder={f === 'dia' ? 'e.g. 14.0' : f === 'bc' ? 'e.g. 8.6' : f === 'axis' ? '1–180' : '—'}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white font-semibold text-center text-slate-800 focus:outline-none focus:border-blue-600" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Lens Fitting Assessment</h1>

      <div className="space-y-0 max-w-3xl mb-8">
        <Row label="CL Type"><Select value={clType} onChange={setClType} options={CL_TYPE}/></Row>
        <Row label="Modality / Replacement"><Select value={modality} onChange={setModality} options={MODALITY}/></Row>
        <Row label="Material"><Select value={material} onChange={setMaterial} options={MATERIAL}/></Row>
        <Row label="Brand / Product">
          <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Acuvue Oasys, Dailies Total1"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>

        {/* Trial lens Rx */}
        <div className="py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800 mb-3">Trial Lens Parameters</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">OD (Right)</p>
              <RxFields rx={odRx} upd={updOd} />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={sameForOs} onChange={e => { setSameForOs(e.target.checked); if (e.target.checked) setOsRx({ ...odRx }); }}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 focus:ring-0" />
                <span className="text-xs text-slate-500">Same for OS</span>
              </label>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">OS (Left)</p>
              <RxFields rx={sameForOs ? odRx : osRx} upd={sameForOs ? () => {} : (f,v) => setOsRx(p => ({ ...p, [f]: v }))} />
            </div>
          </div>
        </div>

        {/* Fitting assessment OD/OS */}
        <div className="py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800 mb-3">Fitting Assessment</p>
          <div className="grid grid-cols-[180px_1fr_1fr] gap-4 mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Parameter</span>
            <span className="text-xs font-bold text-slate-500 uppercase">OD</span>
            <span className="text-xs font-bold text-slate-500 uppercase">OS</span>
          </div>
          {[
            { label: 'Centration', od: centrationOd, setOd: setCentrationOd, os: centrationOs, setOs: setCentrationOs, opts: CENTRATION },
            { label: 'Coverage', od: coverageOd, setOd: setCoverageOd, os: coverageOs, setOs: setCoverageOs, opts: COVERAGE },
            { label: 'Movement / Lag', od: movementOd, setOd: setMovementOd, os: movementOs, setOs: setMovementOs, opts: MOVEMENT },
            { label: 'Fluorescein Pattern', od: fluoresceinOd, setOd: setFluoresceinOd, os: fluoresceinOs, setOs: setFluoresceinOs, opts: FLUORESCEIN },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-[180px_1fr_1fr] gap-4 mb-2 items-center">
              <span className="text-sm font-semibold text-slate-700">{row.label}</span>
              <select value={row.od} onChange={e => row.setOd(e.target.value)}
                className="px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600">
                {row.opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={row.os} onChange={e => row.setOs(e.target.value)}
                className="px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600">
                {row.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Over-refraction / VA */}
        <div className="py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800 mb-3">Over-Refraction &amp; Visual Acuity</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Quality OD</label>
              <Select value={visionOd} onChange={setVisionOd} options={VISION_QUAL} />
              <div className="flex items-center gap-2 mt-2">
                <input type="text" value={vaOd} onChange={e => setVaOd(e.target.value)} placeholder="VA e.g. 6/6"
                  className="w-24 px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-center focus:outline-none focus:border-blue-600" />
                <span className="text-xs text-slate-500">Snellen</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vision Quality OS</label>
              <Select value={visionOs} onChange={setVisionOs} options={VISION_QUAL} />
              <div className="flex items-center gap-2 mt-2">
                <input type="text" value={vaOs} onChange={e => setVaOs(e.target.value)} placeholder="VA e.g. 6/6"
                  className="w-24 px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-center focus:outline-none focus:border-blue-600" />
                <span className="text-xs text-slate-500">Snellen</span>
              </div>
            </div>
          </div>
        </div>

        <Row label="Patient Comfort"><Select value={comfort} onChange={setComfort} options={COMFORT}/></Row>
        <Row label="Wearing Time" sub="(hours/day)">
          <Num value={wearingTime} onChange={setWearingTime} placeholder="e.g. 8" unit="hrs/day" />
        </Row>
        <Row label="Follow-up">
          <Select value={followUp} onChange={setFollowUp} options={['Select...','1 week','2 weeks','1 month','3 months','6 months','As needed']}/>
        </Row>
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
