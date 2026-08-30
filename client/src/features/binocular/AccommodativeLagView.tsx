import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type AccommodativeLagData = {
  method: string;
  od: string;
  os: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: AccommodativeLagData = {
  method: '',
  od: '',
  os: '',
  remarks: '',
  showInDischarge: false,
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const AccommodativeLagView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['accommodative-lag'] ?? {}) as AccommodativeLagData;
  const patch = (p: Partial<AccommodativeLagData>) => setSectionData('accommodative-lag', { ...f, ...p });
  const { method, od, os, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Accommodative Lag</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Method">
          <select value={method} onChange={e => patch({ method: e.target.value })}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option value="">Select...</option>
            <option>MEM (Monocular Estimation Method)</option>
            <option>Nott Retinoscopy</option>
            <option>Bell Retinoscopy</option>
            <option>±2.00D Flipper</option>
          </select>
        </Row>
        <Row label="Right Eye (OD) — D">
          <input type="number" step="0.25" value={od} onChange={e => patch({ od: e.target.value })} placeholder="e.g. +0.50"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Left Eye (OS) — D">
          <input type="number" step="0.25" value={os} onChange={e => patch({ os: e.target.value })} placeholder="e.g. +0.75"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};