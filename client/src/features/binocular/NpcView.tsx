import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type NpcData = {
  breakCm: string;
  recoveryCm: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT: NpcData = {
  breakCm: '',
  recoveryCm: '',
  remarks: '',
  showInDischarge: false,
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const NpcView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT, sectionData['near-point-of-convergence'] ?? {}) as NpcData;
  const patch = (p: Partial<NpcData>) => setSectionData('near-point-of-convergence', { ...f, ...p });
  const { breakCm, recoveryCm, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Near Point Of Convergence</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Break">
          <input
            type="number"
            value={breakCm}
            onChange={e => patch({ breakCm: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
            placeholder="0"
          />
        </Row>

        <Row label="Recovery">
          <input
            type="number"
            value={recoveryCm}
            onChange={e => patch({ recoveryCm: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
            placeholder="0"
          />
        </Row>
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
          />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};