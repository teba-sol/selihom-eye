import React, { useState } from 'react';

const METHOD_OPTIONS = [
  '±2.00 D Flipper (Monocular)',
  '±2.00 D Flipper (Binocular)',
  '±1.00 D Flipper (Monocular)',
  '±1.00 D Flipper (Binocular)',
];

export const AccommodativeFacilityView: React.FC = () => {
  const [method, setMethod] = useState('±2.00 D Flipper (Monocular)');
  const [cycPerMinOd, setCycPerMinOd] = useState('');
  const [cycPerMinOs, setCycPerMinOs] = useState('');
  const [cycPerMinOu, setCycPerMinOu] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Accommodative Facility</h1>

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
          <label className="text-xs font-bold text-slate-900">Right Eye (OD)</label>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="number"
              value={cycPerMinOd}
              onChange={(e) => setCycPerMinOd(e.target.value)}
              placeholder="e.g. 12"
              className="w-28 px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
            <span className="text-xs text-slate-500 font-semibold">cycles / min</span>
          </div>
        </div>

        {/* OS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Left Eye (OS)</label>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="number"
              value={cycPerMinOs}
              onChange={(e) => setCycPerMinOs(e.target.value)}
              placeholder="e.g. 10"
              className="w-28 px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
            <span className="text-xs text-slate-500 font-semibold">cycles / min</span>
          </div>
        </div>

        {/* OU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Both Eyes (OU)</label>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="number"
              value={cycPerMinOu}
              onChange={(e) => setCycPerMinOu(e.target.value)}
              placeholder="e.g. 14"
              className="w-28 px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
            <span className="text-xs text-slate-500 font-semibold">cycles / min</span>
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
