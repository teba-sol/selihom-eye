import React, { useState } from 'react';
import { downloadEncounterPdf } from '../../lib/generatePdf';
import { useEncounterStore } from '../../store/useEncounterStore';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr_1fr] items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-800 pt-1.5">{label}</span>
      {children}
    </div>
  );
}

function RxCell({ value, onChange, placeholder = '—' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-2 py-1.5 text-sm text-center border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
  );
}

const CL_TYPE_OPTIONS = ['','Soft Spherical','Soft Toric','Soft Multifocal','RGP Spherical','RGP Toric','Scleral','Mini-Scleral','Orthokeratology','Bandage CL'];
const MODALITY_OPTIONS = ['','Daily Disposable','2-Weekly','Monthly','3-Monthly','Reusable (RGP)'];
const MATERIAL_OPTIONS = ['','Silicone Hydrogel','Hydrogel (HEMA)','Fluorosilicone Acrylate','Boston XO (Scleral)'];

interface EyeSpec { bc: string; dia: string; sph: string; cyl: string; axis: string; add: string; va: string; }
const emptySpec = (): EyeSpec => ({ bc: '', dia: '', sph: '', cyl: '', axis: '', add: '', va: '' });

export const FinalContactLensSpecificationView: React.FC = () => {
  const encounterState = useEncounterStore.getState();
  const [clType, setClType] = useState('');
  const [brand, setBrand] = useState('');
  const [modality, setModality] = useState('');
  const [material, setMaterial] = useState('');
  const [od, setOd] = useState<EyeSpec>(emptySpec());
  const [os, setOs] = useState<EyeSpec>(emptySpec());
  const [sameForOs, setSameForOs] = useState(false);
  const [solution, setSolution] = useState('');
  const [wearingSchedule, setWearingSchedule] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const updOd = (f: keyof EyeSpec, v: string) => {
    setOd(p => ({ ...p, [f]: v }));
    if (sameForOs) setOs(p => ({ ...p, [f]: v }));
  };

  const fields: { key: keyof EyeSpec; label: string }[] = [
    { key: 'bc', label: 'Base Curve (mm)' },
    { key: 'dia', label: 'Diameter (mm)' },
    { key: 'sph', label: 'Sphere (D)' },
    { key: 'cyl', label: 'Cylinder (D)' },
    { key: 'axis', label: 'Axis (°)' },
    { key: 'add', label: 'Addition (D)' },
    { key: 'va', label: 'Visual Acuity' },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#2563eb]">Final Contact Lens Specification</h1>
          <div className="flex gap-2">
            <button onClick={() => downloadEncounterPdf(encounterState)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Download PDF</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Share</button>
          </div>
        </div>

        {/* Lens details */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'CL Type', value: clType, onChange: setClType, type: 'select', options: CL_TYPE_OPTIONS },
            { label: 'Brand / Product', value: brand, onChange: setBrand, type: 'text', placeholder: 'e.g. Acuvue Oasys, Dailies Total1' },
            { label: 'Modality', value: modality, onChange: setModality, type: 'select', options: MODALITY_OPTIONS },
            { label: 'Material', value: material, onChange: setMaterial, type: 'select', options: MATERIAL_OPTIONS },
          ].map(f => (
            <div key={f.label} className="grid grid-cols-[200px_1fr] items-center gap-4">
              <span className="text-sm font-bold text-slate-800">{f.label}</span>
              {f.type === 'select'
                ? <select value={f.value} onChange={e => f.onChange(e.target.value)}
                    className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600">
                    {(f.options||[]).map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                  </select>
                : <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={(f as any).placeholder}
                    className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600" />
              }
            </div>
          ))}
        </div>

        {/* Prescription table */}
        <div className="mb-6">
          <div className="grid grid-cols-[200px_1fr_1fr] gap-4 mb-2 px-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Parameter</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Right Eye (OD)</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Left Eye (OS)</span>
          </div>
          <div className="space-y-1">
            {fields.map(f => (
              <Row key={f.key} label={f.label}>
                <RxCell value={od[f.key]} onChange={v => updOd(f.key, v)} />
                <RxCell value={sameForOs ? od[f.key] : os[f.key]} onChange={v => !sameForOs && setOs(p => ({ ...p, [f.key]: v }))} placeholder={sameForOs ? od[f.key] || '—' : '—'} />
              </Row>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={sameForOs} onChange={e => { setSameForOs(e.target.checked); if (e.target.checked) setOs({ ...od }); }}
              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
            <span className="text-xs text-slate-500">Same for Left Eye</span>
          </label>
        </div>

        {/* Additional info */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'Lens Solution', value: solution, onChange: setSolution, placeholder: 'e.g. Clear Care, Biotrue, No solution (Daily)' },
            { label: 'Wearing Schedule', value: wearingSchedule, onChange: setWearingSchedule, placeholder: 'e.g. 8 hrs/day, daily wear' },
            { label: 'Review Date', value: reviewDate, onChange: setReviewDate, placeholder: 'e.g. 2 weeks, 1 month' },
          ].map(f => (
            <div key={f.label} className="grid grid-cols-[200px_1fr] items-center gap-4">
              <span className="text-sm font-bold text-slate-800">{f.label}</span>
              <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600" />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
          <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any remarks..."
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
            Show in Discharge Summary
          </label>
          <button onClick={() => downloadEncounterPdf(encounterState)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
};
