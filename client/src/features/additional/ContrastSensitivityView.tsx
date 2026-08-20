import React, { useState } from 'react';

export const ContrastSensitivityView: React.FC = () => {
  const [chart, setChart] = useState('Pelli-Robson Chart (1m)');
  const [logCsOd, setLogCsOd] = useState('1.95');
  const [logCsOs, setLogCsOs] = useState('1.95');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Contrast Sensitivity</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Chart Used</label>
          <div className="md:col-span-2">
            <select
              value={chart}
              onChange={(e) => setChart(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Pelli-Robson Chart (1m)">Pelli-Robson Chart (1m)</option>
              <option value="Mars Letter Contrast Test">Mars Letter Contrast Test</option>
              <option value="CSV-1000">CSV-1000 (Sine Wave Gratings)</option>
              <option value="Lea Low Contrast Test">Lea Low Contrast Test</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Right Eye</label>
            <span className="text-[11px] text-slate-500 font-semibold">(log CS score)</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              value={logCsOd}
              onChange={(e) => setLogCsOd(e.target.value)}
              placeholder="e.g. 1.95"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Left Eye</label>
            <span className="text-[11px] text-slate-500 font-semibold">(log CS score)</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              value={logCsOs}
              onChange={(e) => setLogCsOs(e.target.value)}
              placeholder="e.g. 1.95"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

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
