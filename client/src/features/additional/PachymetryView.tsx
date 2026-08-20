import React, { useState } from 'react';

export const PachymetryView: React.FC = () => {
  const [device, setDevice] = useState('Optical (Pentacam / Topography)');
  const [cctOd, setCctOd] = useState('545');
  const [cctOs, setCctOs] = useState('548');
  const [thinnestOd, setThinnestOd] = useState('540');
  const [thinnestOs, setThinnestOs] = useState('542');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Pachymetry</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Device Used</label>
          <div className="md:col-span-2">
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Optical (Pentacam / Topography)">Optical (Pentacam / Topography)</option>
              <option value="Ultrasound Pachymetry">Ultrasound Pachymetry</option>
              <option value="AS-OCT (Corneal Pachymetry Map)">AS-OCT</option>
              <option value="Specular Microscopy">Specular Microscopy</option>
            </select>
          </div>
        </div>

        {/* Central Corneal Thickness (CCT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Central CCT</label>
            <span className="text-[11px] text-slate-500 font-semibold">(microns &#181;m)</span>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="relative flex items-center">
              <input
                type="number"
                value={cctOd}
                onChange={(e) => setCctOd(e.target.value)}
                placeholder="Right Eye"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-center font-medium focus:outline-none focus:border-blue-600"
              />
              <span className="absolute right-3 text-xs text-slate-400">OD</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                value={cctOs}
                onChange={(e) => setCctOs(e.target.value)}
                placeholder="Left Eye"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-center font-medium focus:outline-none focus:border-blue-600"
              />
              <span className="absolute right-3 text-xs text-slate-400">OS</span>
            </div>
          </div>
        </div>

        {/* Thinnest Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Thinnest Location</label>
            <span className="text-[11px] text-slate-500 font-semibold">(microns &#181;m)</span>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="relative flex items-center">
              <input
                type="number"
                value={thinnestOd}
                onChange={(e) => setThinnestOd(e.target.value)}
                placeholder="Right Eye"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-center font-medium focus:outline-none focus:border-blue-600"
              />
              <span className="absolute right-3 text-xs text-slate-400">OD</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                value={thinnestOs}
                onChange={(e) => setThinnestOs(e.target.value)}
                placeholder="Left Eye"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md text-center font-medium focus:outline-none focus:border-blue-600"
              />
              <span className="absolute right-3 text-xs text-slate-400">OS</span>
            </div>
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
