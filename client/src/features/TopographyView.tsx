import React, { useState } from 'react';

const DEVICE_OPTIONS = [
  'Orbscan',
  'Pentacam',
  'Galilei G6',
  'Sirius',
  'Keratograph',
  'Topolyzer',
];

const TOPOGRAPHY_TYPE_OPTIONS = [
  'Axial / Sagittal',
  'Tangential',
  'Elevation',
  'Refractive',
  'Corneal Wavefront',
];

export const TopographyView: React.FC = () => {
  const [device, setDevice] = useState('Pentacam');
  const [topoType, setTopoType] = useState('Axial / Sagittal');
  const [keratometryOd, setKeratometryOd] = useState({ flat: '', steep: '', axis: '' });
  const [keratometryOs, setKeratometryOs] = useState({ flat: '', steep: '', axis: '' });
  const [kMaxOd, setKMaxOd] = useState('');
  const [kMaxOs, setKMaxOs] = useState('');
  const [pupilSizeOd, setPupilSizeOd] = useState('');
  const [pupilSizeOs, setPupilSizeOs] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Corneal Topography</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Device */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Device</label>
          <div className="md:col-span-2">
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {DEVICE_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topography Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Topography Type</label>
          <div className="md:col-span-2">
            <select
              value={topoType}
              onChange={(e) => setTopoType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {TOPOGRAPHY_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keratometry OD */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 mb-3">Right Eye (OD) — Keratometry</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Flat K (D)</label>
              <input
                type="text"
                value={keratometryOd.flat}
                onChange={(e) => setKeratometryOd({ ...keratometryOd, flat: e.target.value })}
                placeholder="43.50"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Steep K (D)</label>
              <input
                type="text"
                value={keratometryOd.steep}
                onChange={(e) => setKeratometryOd({ ...keratometryOd, steep: e.target.value })}
                placeholder="44.75"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Axis</label>
              <input
                type="text"
                value={keratometryOd.axis}
                onChange={(e) => setKeratometryOd({ ...keratometryOd, axis: e.target.value })}
                placeholder="180"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">K-Max (D)</label>
              <input
                type="text"
                value={kMaxOd}
                onChange={(e) => setKMaxOd(e.target.value)}
                placeholder="46.00"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pupil Size (mm)</label>
              <input
                type="text"
                value={pupilSizeOd}
                onChange={(e) => setPupilSizeOd(e.target.value)}
                placeholder="3.5"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
          </div>
        </div>

        {/* Keratometry OS */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 mb-3">Left Eye (OS) — Keratometry</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Flat K (D)</label>
              <input
                type="text"
                value={keratometryOs.flat}
                onChange={(e) => setKeratometryOs({ ...keratometryOs, flat: e.target.value })}
                placeholder="43.25"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Steep K (D)</label>
              <input
                type="text"
                value={keratometryOs.steep}
                onChange={(e) => setKeratometryOs({ ...keratometryOs, steep: e.target.value })}
                placeholder="44.50"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Axis</label>
              <input
                type="text"
                value={keratometryOs.axis}
                onChange={(e) => setKeratometryOs({ ...keratometryOs, axis: e.target.value })}
                placeholder="175"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">K-Max (D)</label>
              <input
                type="text"
                value={kMaxOs}
                onChange={(e) => setKMaxOs(e.target.value)}
                placeholder="45.75"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pupil Size (mm)</label>
              <input
                type="text"
                value={pupilSizeOs}
                onChange={(e) => setPupilSizeOs(e.target.value)}
                placeholder="3.5"
                className="w-full px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold"
              />
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
