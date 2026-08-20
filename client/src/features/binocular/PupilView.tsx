import React, { useState } from 'react';

export const PupilView: React.FC = () => {
  const [perrl, setPerrl] = useState(true);
  const [sluggishDirect, setSluggishDirect] = useState(false);
  const [rapd, setRapd] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Pupils</h1>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={perrl}
            onChange={(e) => {
              setPerrl(e.target.checked);
              if (e.target.checked) {
                setSluggishDirect(false);
                setRapd(false);
              }
            }}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>PERRL (Equal, Round, Reactive to Light)</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={sluggishDirect}
            disabled={perrl}
            onChange={(e) => setSluggishDirect(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Sluggish Direct / Consensual Reflex</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={rapd}
            disabled={perrl}
            onChange={(e) => setRapd(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>RAPD Positive (Marcus Gunn)</span>
        </label>
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
