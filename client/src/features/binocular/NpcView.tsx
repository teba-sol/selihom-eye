import React, { useState } from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const NpcView: React.FC = () => {
  const [breakCm, setBreakCm] = useState('8');
  const [recoveryCm, setRecoveryCm] = useState('10');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Near Point Of Convergence</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Break">
          <input
            type="number"
            value={breakCm}
            onChange={e => setBreakCm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
            placeholder="0"
          />
        </Row>

        <Row label="Recovery">
          <input
            type="number"
            value={recoveryCm}
            onChange={e => setRecoveryCm(e.target.value)}
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
          onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
          />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
