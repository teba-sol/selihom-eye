import React, { useState } from 'react';

function EyeRow({ label, sub, od, os, onOd, onOs }: {
  label: string; sub?: string;
  od: string; os: string;
  onOd: (v: string) => void; onOs: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr_1fr] items-end gap-4 py-2">
      <div>
        <span className="text-sm font-bold text-slate-800 block">{label}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input type="number" value={od} onChange={e => onOd(e.target.value)} placeholder="0"
          className="flex-1 px-3 py-2 text-sm text-center border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        <span className="text-xs text-slate-500 font-bold shrink-0">OD</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" value={os} onChange={e => onOs(e.target.value)} placeholder="0"
          className="flex-1 px-3 py-2 text-sm text-center border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        <span className="text-xs text-slate-500 font-bold shrink-0">OS</span>
      </div>
    </div>
  );
}

export const PachymetryView: React.FC = () => {
  const [device, setDevice] = useState('Optical (Pentacam / Topography)');
  const [cct, setCct]         = useState({ od: '545', os: '548' });
  const [thinnest, setThinnest] = useState({ od: '540', os: '542' });
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Pachymetry</h1>

      <div className="space-y-4 max-w-3xl mb-8">
        {/* Device */}
        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
          <span className="text-sm font-bold text-slate-800">Device Used</span>
          <select value={device} onChange={e => setDevice(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option>Optical (Pentacam / Topography)</option>
            <option>Ultrasound Pachymetry</option>
            <option>AS-OCT (Corneal Pachymetry Map)</option>
            <option>Specular Microscopy</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          <EyeRow label="Central CCT" sub="(microns μm)"
            od={cct.od} os={cct.os}
            onOd={v => setCct(p=>({...p,od:v}))} onOs={v => setCct(p=>({...p,os:v}))} />
          <EyeRow label="Thinnest Location" sub="(microns μm)"
            od={thinnest.od} os={thinnest.os}
            onOd={v => setThinnest(p=>({...p,od:v}))} onOs={v => setThinnest(p=>({...p,os:v}))} />
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
