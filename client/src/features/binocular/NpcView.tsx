import React, { useState } from 'react';

export const NpcView: React.FC = () => {
  const [breakCm, setBreakCm] = useState('6');
  const [recoveryCm, setRecoveryCm] = useState('8');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Near Point of Convergence (NPC)</h1>

      <div className="space-y-4 mb-8 max-w-md">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Break</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={breakCm}
              onChange={(e) => setBreakCm(e.target.value)}
              className="w-28 px-3 py-1.5 text-xs border border-slate-300 rounded font-bold"
              placeholder="6"
            />
            <span className="text-xs font-medium text-slate-500">cm</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Recovery</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={recoveryCm}
              onChange={(e) => setRecoveryCm(e.target.value)}
              className="w-28 px-3 py-1.5 text-xs border border-slate-300 rounded font-bold"
              placeholder="8"
            />
            <span className="text-xs font-medium text-slate-500">cm</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
