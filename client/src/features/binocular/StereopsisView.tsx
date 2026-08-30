import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type StereopsisData = {
  testType: string;
  arcSec: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: StereopsisData = {
  testType: '',
  arcSec: '',
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

export const StereopsisView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['stereopsis'] ?? {}) as StereopsisData;
  const patch = (p: Partial<StereopsisData>) => setSectionData('stereopsis', { ...f, ...p });
  const { testType, arcSec, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Stereopsis</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Test Used">
          <select value={testType} onChange={e => patch({ testType: e.target.value })}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option value="">Select...</option>
            <option>Titmus / Wirt Rings</option>
            <option>TNO Random Dot</option>
            <option>Lang Stereotest</option>
            <option>Frisby Stereotest</option>
            <option>Randot Stereotest</option>
          </select>
        </Row>

        <Row label="Stereoacuity (arc sec)">
          <input type="number" value={arcSec} onChange={e => patch({ arcSec: e.target.value })} placeholder="e.g. 40"
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