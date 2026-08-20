import React, { useState } from 'react';

const METHOD_OPTIONS = [
  'Minus Lens to Blur',
  'MEM (Monocular Estimation Method)',
  'NRA/BRA',
];

export const AccommodativeLagView: React.FC = () => {
  const [method, setMethod] = useState('MEM (Monocular Estimation Method)');
  const [lagOd, setLagOd] = useState('');
  const [lagOs, setLagOs] = useState('');
  const [unit, setUnit] = useState('D');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Accommodative Lag</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Method */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Method</label>
          <div className="md:col-span-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* OD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Right Eye (OD)</label>
            <span className="text-[11px] text-slate-500 font-semibold">Lag ({unit})</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              step="0.25"
              value={lagOd}
              onChange={(e) => setLagOd(e.target.value)}
              placeholder="e.g. +0.50"
              className="w-full px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* OS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Left Eye (OS)</label>
            <span className="text-[11px] text-slate-500 font-semibold">Lag ({unit})</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              step="0.25"
              value={lagOs}
              onChange={(e) => setLagOs(e.target.value)}
              placeholder="e.g. +0.75"
              className="w-full px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-3xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-3xl">
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
