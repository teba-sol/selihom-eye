import React, { useState } from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const AccommodativeFacilityView: React.FC = () => {
  const [method, setMethod] = useState('');
  const [od, setOd] = useState('');
  const [os, setOs] = useState('');
  const [ou, setOu] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Accommodative Facility</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Method">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option value="">Select...</option>
            <option>±2.00 D Flipper (Monocular)</option>
            <option>±2.00 D Flipper (Binocular)</option>
            <option>±1.50 D Flipper (Monocular)</option>
            <option>±1.50 D Flipper (Binocular)</option>
          </select>
        </Row>
        <Row label="Right Eye (OD) — cpm">
          <input type="number" value={od} onChange={e => setOd(e.target.value)} placeholder="e.g. 12"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Left Eye (OS) — cpm">
          <input type="number" value={os} onChange={e => setOs(e.target.value)} placeholder="e.g. 10"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Both Eyes (OU) — cpm">
          <input type="number" value={ou} onChange={e => setOu(e.target.value)} placeholder="e.g. 8"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
