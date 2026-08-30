import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

// Simplified Hess screen — 9 gaze positions, record deviation for each eye
const POSITIONS = [
  'Up Left', 'Up', 'Up Right',
  'Left', 'Primary', 'Right',
  'Down Left', 'Down', 'Down Right',
];

type HessScreenData = {
  odData: Record<string, string>;
  osData: Record<string, string>;
  underaction: string;
  overaction: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: HessScreenData = {
  odData: {},
  osData: {},
  underaction: '',
  overaction: '',
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

export const HessScreenView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['hess-screen'] ?? {}) as HessScreenData;
  const patch = (p: Partial<HessScreenData>) => setSectionData('hess-screen', { ...f, ...p });
  const { odData, osData, underaction, overaction, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Hess Screen</h1>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* OD */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">Right Eye (OD) — Deviation (Δ)</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {POSITIONS.map(pos => (
              <div key={pos}>
                <label className="block text-[10px] text-slate-400 mb-0.5">{pos}</label>
                <input type="number" value={odData[pos] ?? ''} onChange={e => patch({ odData: { ...odData, [pos]: e.target.value } })}
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-xs text-center border border-slate-300 rounded bg-white font-semibold focus:outline-none focus:border-blue-600" />
              </div>
            ))}
          </div>
        </div>

        {/* OS */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">Left Eye (OS) — Deviation (Δ)</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {POSITIONS.map(pos => (
              <div key={pos}>
                <label className="block text-[10px] text-slate-400 mb-0.5">{pos}</label>
                <input type="number" value={osData[pos] ?? ''} onChange={e => patch({ osData: { ...osData, [pos]: e.target.value } })}
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-xs text-center border border-slate-300 rounded bg-white font-semibold focus:outline-none focus:border-blue-600" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Underaction">
          <input type="text" value={underaction} onChange={e => patch({ underaction: e.target.value })} placeholder="e.g. Right Superior Oblique"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Overaction">
          <input type="text" value={overaction} onChange={e => patch({ overaction: e.target.value })} placeholder="e.g. Left Inferior Oblique"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
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