import React, { useState } from 'react';

export const AccommodationView: React.FC = () => {
  const [method, setMethod] = useState('Push-up (RAF Rule)');
  const [aoaOd, setAoaOd] = useState('8.50');
  const [aoaOs, setAoaOs] = useState('8.50');
  const [aoaOu, setAoaOu] = useState('9.50');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Amplitude of Accommodation</h1>

      <div className="space-y-5 mb-8">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full max-w-xs px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
          >
            <option value="Push-up (RAF Rule)">Push-up (RAF Rule)</option>
            <option value="Minus Lens to Blur">Minus Lens to Blur</option>
            <option value="Sheard's Method">Sheard&apos;s Method</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Right Eye (OD)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aoaOd}
                onChange={(e) => setAoaOd(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
              />
              <span className="text-xs text-slate-500 font-medium">D</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Left Eye (OS)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aoaOs}
                onChange={(e) => setAoaOs(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
              />
              <span className="text-xs text-slate-500 font-medium">D</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Both Eyes (OU)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aoaOu}
                onChange={(e) => setAoaOu(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
              />
              <span className="text-xs text-slate-500 font-medium">D</span>
            </div>
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
