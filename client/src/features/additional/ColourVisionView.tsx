import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';

const TEST_TYPES = [
  'Ishihara (38 Plates)',
  'Ishihara (24 Plates)',
  'Farnsworth D-15',
  'City University Test',
  'HRR Pseudoisochromatic Plates',
];

type ColourVisionData = {
  testType: string;
  rightEyeScore: string;
  leftEyeScore: string;
  interpretation: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_COLOUR_VISION: ColourVisionData = {
  testType: 'Ishihara (38 Plates)',
  rightEyeScore: '17 / 17',
  leftEyeScore: '17 / 17',
  interpretation: 'Normal Trichromatic Vision OU',
  remarks: '',
  showInDischarge: false,
};

export const ColourVisionView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_COLOUR_VISION, sectionData['colour-vision'] ?? {}) as ColourVisionData;
  const patch = (p: Partial<ColourVisionData>) => setSectionData('colour-vision', { ...f, ...p });
  const { testType, rightEyeScore, leftEyeScore, interpretation, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Colour Vision</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Test Used</label>
          <div className="md:col-span-2">
            <select
              value={testType}
              onChange={(e) => patch({ testType: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {TEST_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Right Eye Score</label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={rightEyeScore}
              onChange={(e) => patch({ rightEyeScore: e.target.value })}
              placeholder="e.g. 17 / 17"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Left Eye Score</label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={leftEyeScore}
              onChange={(e) => patch({ leftEyeScore: e.target.value })}
              placeholder="e.g. 17 / 17"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Clinical Interpretation</label>
          <div className="md:col-span-2">
            <select
              value={interpretation}
              onChange={(e) => patch({ interpretation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="Normal Trichromatic Vision OU">Normal Trichromatic Vision OU</option>
              <option value="Protanopia / Red Deficiency">Protanopia / Red Deficiency</option>
              <option value="Deuteranopia / Green Deficiency">Deuteranopia / Green Deficiency</option>
              <option value="Tritanopia / Blue-Yellow Deficiency">Tritanopia / Blue-Yellow Deficiency</option>
              <option value="Total Colour Blindness / Achromatopsia">Total Colour Blindness</option>
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