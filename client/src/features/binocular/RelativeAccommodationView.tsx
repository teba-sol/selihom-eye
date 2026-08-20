import React, { useState } from 'react';

export const RelativeAccommodationView: React.FC = () => {
  const [nraOd, setNraOd] = useState('');
  const [nraOs, setNraOs] = useState('');
  const [nraOu, setNraOu] = useState('');
  const [praOd, setPraOd] = useState('');
  const [praOs, setPraOs] = useState('');
  const [praOu, setPraOu] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Relative Accommodation</h1>

      {/* NRA Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-4">NRA (Positive Relative Accommodation)</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Right Eye (OD)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nraOd}
                onChange={(e) => setNraOd(e.target.value)}
                placeholder="+2.50"
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
                value={nraOs}
                onChange={(e) => setNraOs(e.target.value)}
                placeholder="+2.25"
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
                value={nraOu}
                onChange={(e) => setNraOu(e.target.value)}
                placeholder="+2.50"
                className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
              />
              <span className="text-xs text-slate-500 font-medium">D</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRA Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-4">PRA (Negative Relative Accommodation)</h2>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Right Eye (OD)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={praOd}
                onChange={(e) => setPraOd(e.target.value)}
                placeholder="-2.50"
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
                value={praOs}
                onChange={(e) => setPraOs(e.target.value)}
                placeholder="-2.25"
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
                value={praOu}
                onChange={(e) => setPraOu(e.target.value)}
                placeholder="-2.50"
                className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
              />
              <span className="text-xs text-slate-500 font-medium">D</span>
            </div>
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
