import React, { useState } from 'react';

export const Worth4DotView: React.FC = () => {
  const [distResult, setDistResult] = useState('4 Dots (Fusion Present)');
  const [nearResult, setNearResult] = useState('4 Dots (Fusion Present)');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Worth 4 Dot Test</h1>

      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Distance (6m)</label>
          <select
            value={distResult}
            onChange={(e) => setDistResult(e.target.value)}
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="4 Dots (Fusion Present)">4 Dots (Fusion Present)</option>
            <option value="2 Red Dots (OD Dominant / OS Suppressed)">2 Red Dots (OD Dominant / OS Suppressed)</option>
            <option value="3 Green Dots (OS Dominant / OD Suppressed)">3 Green Dots (OS Dominant / OD Suppressed)</option>
            <option value="5 Dots (Diplopia)">5 Dots (Diplopia)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Near (33cm)</label>
          <select
            value={nearResult}
            onChange={(e) => setNearResult(e.target.value)}
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="4 Dots (Fusion Present)">4 Dots (Fusion Present)</option>
            <option value="2 Red Dots (OD Dominant)">2 Red Dots (OD Dominant)</option>
            <option value="3 Green Dots (OS Dominant)">3 Green Dots (OS Dominant)</option>
            <option value="5 Dots (Diplopia)">5 Dots (Diplopia)</option>
          </select>
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
