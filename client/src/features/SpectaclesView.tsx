import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { SpectaclesState } from '../store/useEncounterStore';
import { StepperCell } from '../components/StepperCell';

const DEFAULT_SPECTACLES = {
  none: false,
  singleDistance: false,
  singleIntermediate: false,
  singleNear: false,
  pal: false,
  bifocal: false,
  unit: 'Snellen',
  odDist: { sph: '-', cyl: '-', axis: '-', va: '-' },
  odNear: { add: '-', va: '-' },
  osDist: { sph: '-', cyl: '-', axis: '-', va: '-' },
  osNear: { add: '-', va: '-' },
  remarks: '',
  showInDischarge: false,
};

const DIST_VA_OPTIONS = ['-', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60'];
const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12'];

const InputCell = ({
  value,
  onChange,
  className = '',
  step = 0.25,
  decimals = 2,
  min,
  max,
  ariaLabel,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  step?: number;
  decimals?: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) => (
  <td className={`p-0 border-b border-slate-200 transition-colors bg-white ${className}`}>
    <div className="flex items-center justify-center px-2 py-0.5 h-full">
      <StepperCell
        value={value}
        onChange={onChange}
        step={step}
        decimals={decimals}
        min={min}
        max={max}
        ariaLabel={ariaLabel}
        className="w-full"
      />
    </div>
  </td>
);

const SelectCell = ({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  className?: string;
}) => (
  <td className={`p-0 border-b border-slate-200 transition-colors bg-white ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full py-4 pl-4 pr-2 text-center bg-transparent outline-none focus:ring-2 focus:ring-inset focus:ring-[#2957a4] text-slate-700 font-medium cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === '-' ? '✓ -' : opt}
        </option>
      ))}
    </select>
  </td>
);

export const SpectaclesView: React.FC = () => {
  const spectaclesHistory = useEncounterStore((s) => s.spectaclesHistory);
  const setSpectaclesHistory = useEncounterStore((s) => s.setSpectaclesHistory);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const f = Object.assign({}, DEFAULT_SPECTACLES, sectionData['spectacles'] ?? {});

  const syncSpecs = (next: typeof DEFAULT_SPECTACLES) => {
    const type: SpectaclesState['type'] = next.singleDistance
      ? 'Single Vision (Distance)'
      : next.singleIntermediate
        ? 'Single Vision (Intermediate)'
        : next.singleNear
          ? 'Single Vision (Near)'
          : next.bifocal
            ? 'Bifocal'
            : next.pal
              ? 'Progressive (PAL)'
              : 'None';
    setSpectaclesHistory({
      ...spectaclesHistory,
      currentlyWears: !next.none,
      type,
      remarks: next.remarks,
    });
  };

  const setFlag = (patch: Partial<typeof DEFAULT_SPECTACLES>) => {
    const next = { ...f, ...patch };
    setSectionData('spectacles', next);
    syncSpecs(next);
  };

  const handleNoneChange = (checked: boolean) => {
    setFlag({
      none: checked,
      singleDistance: checked ? false : f.singleDistance,
      singleIntermediate: checked ? false : f.singleIntermediate,
      singleNear: checked ? false : f.singleNear,
      pal: checked ? false : f.pal,
      bifocal: checked ? false : f.bifocal,
    });
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Spectacles</h1>

      <div className="space-y-3 mb-8">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.none}
            onChange={(e) => handleNoneChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>None</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.singleDistance}
            disabled={f.none}
            onChange={(e) => setFlag({ singleDistance: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Distance</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.singleIntermediate}
            disabled={f.none}
            onChange={(e) => setFlag({ singleIntermediate: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Intermediate</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.singleNear}
            disabled={f.none}
            onChange={(e) => setFlag({ singleNear: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Near</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.pal}
            disabled={f.none}
            onChange={(e) => setFlag({ pal: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Progressive Addition Lenses</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={f.bifocal}
            disabled={f.none}
            onChange={(e) => setFlag({ bifocal: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Bifocal</span>
        </label>
      </div>
{/* Previous spectacle prescription */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Previous spectacle prescription
          </h2>
          <select
            value={f.unit}
            onChange={(e) => setFlag({ unit: e.target.value })}
            className="border border-slate-300 rounded px-4 py-1.5 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#2957a4] shadow-sm"
          >
            <option value="Snellen">Snellen</option>
            <option value="LogMAR">LogMAR</option>
            <option value="Decimal">Decimal</option>
          </select>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-center bg-white">
              <thead>
                <tr>
                  <th colSpan={2} className="bg-white border-b border-r border-slate-200"></th>
                  <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/6">Sphere</th>
                  <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/6">Cyl</th>
                  <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/6">Axis</th>
                  <th className="py-4 font-bold text-slate-800 border-b border-slate-200 w-1/6">VA</th>
                </tr>
              </thead>
              <tbody>
                {/* Right Eye - Distance */}
                <tr>
                  <td rowSpan={2} className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 w-[15%] text-left align-middle">
                    Right Eye<br />(O.D)
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Distance
                  </td>
                  <InputCell
                    value={f.odDist.sph}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, sph: v } })}
                    className="border-r"
                    ariaLabel="Right Eye Sphere"
                  />
                  <InputCell
                    value={f.odDist.cyl}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, cyl: v } })}
                    className="border-r"
                    ariaLabel="Right Eye Cylinder"
                  />
                  <InputCell
                    value={f.odDist.axis}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, axis: v } })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Right Eye Axis"
                  />
                  <SelectCell
                    value={f.odDist.va}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, va: v } })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
                {/* Right Eye - Near addition */}
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Near addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={f.odNear.add}
                    onChange={(v) => setFlag({ odNear: { ...f.odNear, add: v } })}
                    className="border-r"
                    ariaLabel="Right Eye Near Addition"
                  />
                  <SelectCell
                    value={f.odNear.va}
                    onChange={(v) => setFlag({ odNear: { ...f.odNear, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>

                {/* Left Eye - Distance */}
                <tr>
                  <td rowSpan={2} className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 w-[15%] text-left align-middle">
                    Left Eye<br />(O.S)
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Distance
                  </td>
                  <InputCell
                    value={f.osDist.sph}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, sph: v } })}
                    className="border-r"
                    ariaLabel="Left Eye Sphere"
                  />
                  <InputCell
                    value={f.osDist.cyl}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, cyl: v } })}
                    className="border-r"
                    ariaLabel="Left Eye Cylinder"
                  />
                  <InputCell
                    value={f.osDist.axis}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, axis: v } })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Left Eye Axis"
                  />
                  <SelectCell
                    value={f.osDist.va}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, va: v } })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
                {/* Left Eye - Near addition */}
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Near addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={f.osNear.add}
                    onChange={(v) => setFlag({ osNear: { ...f.osNear, add: v } })}
                    className="border-r"
                    ariaLabel="Left Eye Near Addition"
                  />
                  <SelectCell
                    value={f.osNear.va}
                    onChange={(v) => setFlag({ osNear: { ...f.osNear, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={f.remarks}
          onChange={(e) => setFlag({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={f.showInDischarge}
            onChange={(e) => setFlag({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};