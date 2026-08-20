import React, { useState } from 'react';

export const CoverTestView: React.FC = () => {
  const [distPhoria, setDistPhoria] = useState('Exophoria');
  const [distPrism, setDistPrism] = useState('10');
  const [nearPhoria, setNearPhoria] = useState('Orthophoric');
  const [nearPrism, setNearPrism] = useState('0');
  const [recovery, setRecovery] = useState('Good / Rapid');
  const [remarks, setRemarks] = useState('Good control with rapid recovery.');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Ocular Motor Balance / Cover Test</h1>

      <div className="space-y-5 mb-8">
        <div>
          <span className="text-xs font-bold text-slate-800 block mb-2">Distance (6m)</span>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phoria / Tropia</label>
              <select
                value={distPhoria}
                onChange={(e) => setDistPhoria(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
              >
                <option value="Orthophoric">Orthophoric</option>
                <option value="Exophoria">Exophoria (X)</option>
                <option value="Esophoria">Esophoria (E)</option>
                <option value="Exotropia">Exotropia (XT)</option>
                <option value="Esotropia">Esotropia (ET)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Prism Diopters</label>
              <input
                type="number"
                value={distPrism}
                onChange={(e) => setDistPrism(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 block mb-2">Near (33cm)</span>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phoria / Tropia</label>
              <select
                value={nearPhoria}
                onChange={(e) => setNearPhoria(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
              >
                <option value="Orthophoric">Orthophoric</option>
                <option value="Exophoria">Exophoria (X')</option>
                <option value="Esophoria">Esophoria (E')</option>
                <option value="Exotropia">Exotropia (XT')</option>
                <option value="Esotropia">Esotropia (ET')</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Prism Diopters</label>
              <input
                type="number"
                value={nearPrism}
                onChange={(e) => setNearPrism(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Recovery</label>
          <select
            value={recovery}
            onChange={(e) => setRecovery(e.target.value)}
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium"
          >
            <option value="Good / Rapid">Good / Rapid</option>
            <option value="Delayed">Delayed</option>
            <option value="Poor">Poor</option>
          </select>
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
