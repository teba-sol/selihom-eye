import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type RelativeAccommodationData = {
  nraOd: string;
  nraOs: string;
  nraOu: string;
  praOd: string;
  praOs: string;
  praOu: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: RelativeAccommodationData = {
  nraOd: '',
  nraOs: '',
  nraOu: '',
  praOd: '',
  praOs: '',
  praOu: '',
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

export const RelativeAccommodationView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['relative-accommodation'] ?? {}) as RelativeAccommodationData;
  const patch = (p: Partial<RelativeAccommodationData>) => setSectionData('relative-accommodation', { ...f, ...p });
  const { nraOd, nraOs, nraOu, praOd, praOs, praOu, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Relative Accommodation</h1>

      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">NRA — Negative Relative Accommodation</p>
      <div className="space-y-4 max-w-2xl mb-7">
        <Row label="Right Eye (OD) — D">
          <input type="number" step="0.25" value={nraOd} onChange={e => patch({ nraOd: e.target.value })} placeholder="+2.50"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Left Eye (OS) — D">
          <input type="number" step="0.25" value={nraOs} onChange={e => patch({ nraOs: e.target.value })} placeholder="+2.25"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Both Eyes (OU) — D">
          <input type="number" step="0.25" value={nraOu} onChange={e => patch({ nraOu: e.target.value })} placeholder="+2.50"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
      </div>

      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">PRA — Positive Relative Accommodation</p>
      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Right Eye (OD) — D">
          <input type="number" step="0.25" value={praOd} onChange={e => patch({ praOd: e.target.value })} placeholder="-2.50"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Left Eye (OS) — D">
          <input type="number" step="0.25" value={praOs} onChange={e => patch({ praOs: e.target.value })} placeholder="-2.25"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Both Eyes (OU) — D">
          <input type="number" step="0.25" value={praOu} onChange={e => patch({ praOu: e.target.value })} placeholder="-2.50"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
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