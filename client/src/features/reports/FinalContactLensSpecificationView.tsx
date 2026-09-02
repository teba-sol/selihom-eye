import React from 'react';
import { downloadContactLensSpecificationPdf } from '../../lib/generatePdf';
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

const SECTION_KEY = 'final-contact-lens-specification';

interface FclData {
  clType: string;
  brand: string;
  modality: string;
  material: string;
  od: EyeSpec;
  os: EyeSpec;
  sameForOs: boolean;
  solution: string;
  wearingSchedule: string;
  reviewDate: string;
  remarks: string;
  showInDischarge: boolean;
}

const DEFAULT_FCL: FclData = {
  clType: '', brand: '', modality: '', material: '',
  od: emptySpec(), os: emptySpec(), sameForOs: false,
  solution: '', wearingSchedule: '', reviewDate: '', remarks: '', showInDischarge: false,
};

export const FinalContactLensSpecificationView: React.FC = () => {
  const encounterState = useEncounterStore.getState();
  const sectionData = useEncounterStore(s => s.sectionData);
  const setSectionData = useEncounterStore(s => s.setSectionData);
  const d = Object.assign({}, DEFAULT_FCL, sectionData[SECTION_KEY] ?? {}) as FclData;
  const od = d.od ?? emptySpec();
  const os = d.os ?? emptySpec();
  const patch = (p: Partial<FclData>) => setSectionData(SECTION_KEY, { ...d, ...p });

  const updOd = (field: keyof EyeSpec, v: string) => {
    const nextOd = { ...od, [field]: v };
    const next: FclData = { ...d, od: nextOd };
    if (d.sameForOs) next.os = { ...os, [field]: v };
    setSectionData(SECTION_KEY, next);
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl" id="contact-lens-specification-report">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#2563eb]">Final Contact Lens Specification</h1>
          <div className="flex gap-2">
            <button onClick={() => downloadContactLensSpecificationPdf(encounterState)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Download PDF</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Share</button>
          </div>
        </div>

        {/* Lens details */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'CL Type', value: d.clType, onChange: (v: string) => patch({ clType: v }), type: 'select', options: CL_TYPE_OPTIONS },
            { label: 'Brand / Product', value: d.brand, onChange: (v: string) => patch({ brand: v }), type: 'text', placeholder: 'e.g. Acuvue Oasys, Dailies Total1' },
            { label: 'Modality', value: d.modality, onChange: (v: string) => patch({ modality: v }), type: 'select', options: MODALITY_OPTIONS },
            { label: 'Material', value: d.material, onChange: (v: string) => patch({ material: v }), type: 'select', options: MATERIAL_OPTIONS },
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
                <RxCell value={d.sameForOs ? od[f.key] : os[f.key]} onChange={v => !d.sameForOs && patch({ os: { ...os, [f.key]: v } })} placeholder={d.sameForOs ? od[f.key] || '—' : '—'} />
              </Row>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={d.sameForOs} onChange={e => { const v = e.target.checked; setSectionData(SECTION_KEY, { ...d, sameForOs: v, os: v ? { ...od } : os }); }}
              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
            <span className="text-xs text-slate-500">Same for Left Eye</span>
          </label>
        </div>

        {/* Additional info */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'Lens Solution', value: d.solution, onChange: (v: string) => patch({ solution: v }), placeholder: 'e.g. Clear Care, Biotrue, No solution (Daily)' },
            { label: 'Wearing Schedule', value: d.wearingSchedule, onChange: (v: string) => patch({ wearingSchedule: v }), placeholder: 'e.g. 8 hrs/day, daily wear' },
            { label: 'Review Date', value: d.reviewDate, onChange: (v: string) => patch({ reviewDate: v }), placeholder: 'e.g. 2 weeks, 1 month' },
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
          <textarea rows={3} value={d.remarks} onChange={e => patch({ remarks: e.target.value })} placeholder="Add any remarks..."
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={d.showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
            Show in Discharge Summary
          </label>
          <button onClick={() => downloadContactLensSpecificationPdf(encounterState)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
};
