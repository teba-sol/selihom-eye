import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type AccommodationData = {
  method: string;
  od: string;
  os: string;
  ou: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: AccommodationData = {
  method: 'Push-up (RAF Rule)',
  od: '',
  os: '',
  ou: '',
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

function NumberInput({ value, onChange, placeholder = '0' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      step="0.25"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
    />
  );
}

export const AccommodationView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['amplitude-of-accommodation'] ?? {}) as AccommodationData;
  const patch = (p: Partial<AccommodationData>) => setSectionData('amplitude-of-accommodation', { ...f, ...p });
  const { method, od, os, ou, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Amplitude Of Accommodation</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Method">
          <select
            value={method}
            onChange={e => patch({ method: e.target.value })}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          >
            <option>Push-up (RAF Rule)</option>
            <option>Minus Lens to Blur</option>
            <option>Sheard&apos;s Method</option>
            <option>Push-down method</option>
          </select>
        </Row>

        <Row label="Right Eye (OD) — D"><NumberInput value={od} onChange={v => patch({ od: v })} placeholder="e.g. 8.50" /></Row>
        <Row label="Left Eye (OS) — D"><NumberInput value={os} onChange={v => patch({ os: v })} placeholder="e.g. 8.50" /></Row>
        <Row label="Both Eyes (OU) — D"><NumberInput value={ou} onChange={v => patch({ ou: v })} placeholder="e.g. 9.50" /></Row>
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