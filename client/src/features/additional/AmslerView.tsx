import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

type AmslerData = {
  chartType: string;
  rightEyeResult: string;
  leftEyeResult: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_AMSLER: AmslerData = {
  chartType: 'Standard Grid 1 (White on Black)',
  rightEyeResult: 'Normal / Clear grid lines',
  leftEyeResult: 'Normal / Clear grid lines',
  remarks: '',
  showInDischarge: false,
};

export const AmslerView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_AMSLER, sectionData.amsler ?? {}) as AmslerData;
  const patch = (p: Partial<AmslerData>) => setSectionData('amsler', { ...f, ...p });
  const { chartType, rightEyeResult, leftEyeResult, remarks, showInDischarge } = f;

  const eyeOptions = (
    <> 
      <option value="Normal / Clear grid lines">Normal / Clear grid lines</option>
      <option value="Metamorphopsia (Wavy lines)">Metamorphopsia (Wavy lines)</option>
      <option value="Central Scotoma (Blind spot)">Central Scotoma (Blind spot)</option>
      <option value="Paracentral Scotoma">Paracentral Scotoma</option>
      <option value="Micropsia / Macropsia">Micropsia / Macropsia</option>
    </>
  );

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Amsler Grid</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Chart Type</label>
          <div className="md:col-span-2">
            <select
              value={chartType}
              onChange={(e) => patch({ chartType: e.target.value })}
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
              onChange={(e) => patch({ rightEyeResult: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {eyeOptions}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Left Eye Observation</label>
          <div className="md:col-span-2">
            <select
              value={leftEyeResult}
              onChange={(e) => patch({ leftEyeResult: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {eyeOptions}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none focus:ring-1 focus:ring-blue-200"
        />
      </div>

      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};