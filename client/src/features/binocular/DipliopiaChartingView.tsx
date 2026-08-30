import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

const GAZE_POSITIONS = [
  { key: 'up-left', label: 'Up Left', col: 1, row: 1 },
  { key: 'up', label: 'Up', col: 2, row: 1 },
  { key: 'up-right', label: 'Up Right', col: 3, row: 1 },
  { key: 'left', label: 'Left', col: 1, row: 2 },
  { key: 'primary', label: 'Primary', col: 2, row: 2 },
  { key: 'right', label: 'Right', col: 3, row: 2 },
  { key: 'down-left', label: 'Down Left', col: 1, row: 3 },
  { key: 'down', label: 'Down', col: 2, row: 3 },
  { key: 'down-right', label: 'Down Right', col: 3, row: 3 },
];

type GazeResult = 'none' | 'diplopia' | 'worse';

type DiplopiaChartingData = {
  gazeData: Record<string, GazeResult>;
  type: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: DiplopiaChartingData = {
  gazeData: {},
  type: '',
  remarks: '',
  showInDischarge: false,
};

export const DipliopiaChartingView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['diplopia-charting'] ?? {}) as DiplopiaChartingData;
  const patch = (p: Partial<DiplopiaChartingData>) => setSectionData('diplopia-charting', { ...f, ...p });
  const { gazeData, type, remarks, showInDischarge } = f;

  const toggle = (key: string) => {
    const cur = gazeData[key] ?? 'none';
    const next: GazeResult = cur === 'none' ? 'diplopia' : cur === 'diplopia' ? 'worse' : 'none';
    patch({ gazeData: { ...gazeData, [key]: next } });
  };

  const colorFor = (r: GazeResult) =>
    r === 'worse' ? 'bg-red-500 text-white border-red-500' :
    r === 'diplopia' ? 'bg-amber-400 text-white border-amber-400' :
    'bg-white text-slate-500 border-slate-300 hover:border-blue-400';

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-5">Diplopia Charting</h1>

      <div className="flex gap-6 mb-6 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block"/> No diplopia</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block"/> Diplopia</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block"/> Worse / Incomitant</span>
        <span className="text-slate-400 italic">(Click to cycle)</span>
      </div>

      {/* 3×3 Gaze grid */}
      <div className="grid grid-cols-3 gap-2 w-fit mb-8">
        {GAZE_POSITIONS.map(pos => {
          const result = gazeData[pos.key] ?? 'none';
          return (
            <button key={pos.key} type="button" onClick={() => toggle(pos.key)}
              className={`w-24 h-16 rounded-lg border-2 text-xs font-semibold transition-all ${colorFor(result)}`}>
              {pos.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl space-y-4 mb-8">
        <div className="grid grid-cols-[180px_1fr] items-center gap-4">
          <span className="text-sm font-semibold text-slate-800">Type</span>
          <select value={type} onChange={e => patch({ type: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600">
            <option value="">Select...</option>
            <option>Comitant</option>
            <option>Incomitant</option>
            <option>Horizontal</option>
            <option>Vertical</option>
            <option>Torsional</option>
          </select>
        </div>
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