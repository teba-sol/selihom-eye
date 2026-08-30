import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

const SHAW_OPTIONS = [
  'Grade 4 (Wide open - Ciliary Body band visible)',
  'Grade 3 (Scleral Spur visible)',
  'Grade 2 (Trabecular Meshwork visible)',
  'Grade 1 (Schwalbe Line only)',
  'Grade 0 (Closed angle)',
];

type GonioscopyData = {
  lensType: string;
  angleOd: string;
  angleOs: string;
  pas: string;
  pigmentation: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_GONIOSCOPY: GonioscopyData = {
  lensType: 'Goldmann 3-Mirror',
  angleOd: 'Grade 4 (Wide open - Ciliary Body band visible)',
  angleOs: 'Grade 4 (Wide open - Ciliary Body band visible)',
  pas: 'No Peripheral Anterior Synechiae (PAS)',
  pigmentation: 'Grade 1+ Light',
  remarks: '',
  showInDischarge: false,
};

export const GonioscopyView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_GONIOSCOPY, sectionData.gonioscopy ?? {}) as GonioscopyData;
  const patch = (p: Partial<GonioscopyData>) => setSectionData('gonioscopy', { ...f, ...p });
  const { lensType, angleOd, angleOs, pas, pigmentation, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Gonioscopy</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Goniolens Used</label>
          <div className="md:col-span-2">
            <select
              value={lensType}
              onChange={(e) => patch({ lensType: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Goldmann 3-Mirror">Goldmann 3-Mirror</option>
              <option value="Sussman / 4-Mirror (Indentation)">Sussman / 4-Mirror (Indentation)</option>
              <option value="Posner 4-Mirror">Posner 4-Mirror</option>
              <option value="Zeiss Goniolens">Zeiss Goniolens</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Right Eye Angle (Shaffer)</label>
          <div className="md:col-span-2">
            <select
              value={angleOd}
              onChange={(e) => patch({ angleOd: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {SHAW_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Left Eye Angle (Shaffer)</label>
          <div className="md:col-span-2">
            <select
              value={angleOs}
              onChange={(e) => patch({ angleOs: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {SHAW_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">PAS / Synechiae</label>
          <div className="md:col-span-2">
            <select
              value={pas}
              onChange={(e) => patch({ pas: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="No Peripheral Anterior Synechiae (PAS)">No Peripheral Anterior Synechiae (PAS)</option>
              <option value="PAS Present Inferiorly">PAS Present Inferiorly</option>
              <option value="PAS Present Superiorly">PAS Present Superiorly</option>
              <option value="Extensive 360&#176; PAS">Extensive 360&#176; PAS</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">TM Pigmentation</label>
          <div className="md:col-span-2">
            <select
              value={pigmentation}
              onChange={(e) => patch({ pigmentation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Grade 0 None">Grade 0 None</option>
              <option value="Grade 1+ Light">Grade 1+ Light</option>
              <option value="Grade 2+ Moderate">Grade 2+ Moderate</option>
              <option value="Grade 3+ Dense">Grade 3+ Dense (Pigmentary Glaucoma/PEX)</option>
              <option value="Grade 4+ Heavy">Grade 4+ Heavy</option>
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