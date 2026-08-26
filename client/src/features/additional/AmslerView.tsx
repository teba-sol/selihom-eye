import React, { useState } from 'react';

export const AmslerView: React.FC = () => {
  const [chartType, setChartType] = useState('Standard Grid 1 (White on Black)');
  const [rightEyeResult, setRightEyeResult] = useState('Normal / Clear grid lines');
  const [leftEyeResult, setLeftEyeResult] = useState('Normal / Clear grid lines');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Amsler Grid</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Chart Type</label>
          <div className="md:col-span-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Standard Grid 1 (White on Black)">Standard Grid 1 (White on Black)</option>
              <option value="Grid 2 (Diagonal lines - central scotoma)">Grid 2 (Diagonal lines)</option>
              <option value="Grid 3 (Red lines on Black)">Grid 3 (Red lines on Black)</option>
              <option value="Grid 7 (Fine central subdivisions)">Grid 7 (Fine central subdivisions)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Right Eye Observation</label>
          <div className="md:col-span-2">
            <select
              value={rightEyeResult}
              onChange={(e) => setRightEyeResult(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Normal / Clear grid lines">Normal / Clear grid lines</option>
              <option value="Metamorphopsia (Wavy lines)">Metamorphopsia (Wavy lines)</option>
              <option value="Central Scotoma (Blind spot)">Central Scotoma (Blind spot)</option>
              <option value="Paracentral Scotoma">Paracentral Scotoma</option>
              <option value="Micropsia / Macropsia">Micropsia / Macropsia</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Left Eye Observation</label>
          <div className="md:col-span-2">
            <select
              value={leftEyeResult}
              onChange={(e) => setLeftEyeResult(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Normal / Clear grid lines">Normal / Clear grid lines</option>
              <option value="Metamorphopsia (Wavy lines)">Metamorphopsia (Wavy lines)</option>
              <option value="Central Scotoma (Blind spot)">Central Scotoma (Blind spot)</option>
              <option value="Paracentral Scotoma">Paracentral Scotoma</option>
              <option value="Micropsia / Macropsia">Micropsia / Macropsia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none focus:ring-1 focus:ring-blue-200"
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
