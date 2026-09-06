import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { SpectaclesState } from '../store/useEncounterStore';
import { StepperInput } from '../components/StepperInput';

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

  const DIST_VA_OPTIONS = ['-', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60'];
  const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12'];

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
{/* Previous spectacle prescription - Modern Redesign */}
{/* Previous spectacle prescription - Modern Redesign */}
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
      className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
    >
      <option value="Snellen">Snellen</option>
      <option value="LogMAR">LogMAR</option>
      <option value="Decimal">Decimal</option>
    </select>
  </div>

  <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-blue-50/60 border-b-2 border-slate-200">
            <th className="py-3.5 px-4 text-left font-bold text-slate-600 w-28"></th>
            <th className="py-3.5 px-4 text-left font-bold text-slate-600 w-28"></th>
            <th className="py-3.5 px-3 text-center font-bold text-slate-600 min-w-[110px]">Sphere</th>
            <th className="py-3.5 px-3 text-center font-bold text-slate-600 min-w-[110px]">Cyl</th>
            <th className="py-3.5 px-3 text-center font-bold text-slate-600 min-w-[80px]">Axis</th>
            <th className="py-3.5 px-3 text-center font-bold text-slate-600 min-w-[90px]">VA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {/* Right Eye - Distance */}
          <tr className="hover:bg-blue-50/30 transition-colors group">
            <td rowSpan={2} className="py-3.5 px-4 font-bold text-slate-700 border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white align-middle text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                Right Eye
              </span>
            </td>
            <td className="py-3 px-4 font-semibold text-slate-500 border-r border-slate-200 text-xs uppercase tracking-wider">
              Distance
            </td>
            <td className="py-2 px-3 text-center">
              <StepperInput
                value={f.odDist.sph}
                onChange={(v) => setFlag({ odDist: { ...f.odDist, sph: v } })}
                step={0.25}
                className="w-28"
                ariaLabel="Right Eye Sphere"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <StepperInput
                value={f.odDist.cyl}
                onChange={(v) => setFlag({ odDist: { ...f.odDist, cyl: v } })}
                step={0.25}
                className="w-28"
                ariaLabel="Right Eye Cylinder"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <input
                type="text"
                value={f.odDist.axis}
                onChange={(e) => setFlag({ odDist: { ...f.odDist, axis: e.target.value } })}
                className="w-full max-w-[70px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
                placeholder="-"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <select
                value={f.odDist.va}
                onChange={(e) => setFlag({ odDist: { ...f.odDist, va: e.target.value } })}
                className="w-full max-w-[80px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
              >
                {DIST_VA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </td>
          </tr>
          {/* Right Eye - Near addition */}
          <tr className="hover:bg-blue-50/30 transition-colors group">
            <td className="py-3 px-4 font-semibold text-slate-500 border-r border-slate-200 text-xs uppercase tracking-wider">
              Near addition
            </td>
            <td colSpan={3} className="py-2 px-3 text-center">
              <StepperInput
                value={f.odNear.add}
                onChange={(v) => setFlag({ odNear: { ...f.odNear, add: v } })}
                step={0.25}
                className="w-36"
                ariaLabel="Right Eye Near Addition"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <select
                value={f.odNear.va}
                onChange={(e) => setFlag({ odNear: { ...f.odNear, va: e.target.value } })}
                className="w-full max-w-[80px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
              >
                {NEAR_VA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </td>
          </tr>

          {/* Left Eye - Distance */}
          <tr className="hover:bg-blue-50/30 transition-colors group">
            <td rowSpan={2} className="py-3.5 px-4 font-bold text-slate-700 border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white align-middle text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></span>
                Left Eye
              </span>
            </td>
            <td className="py-3 px-4 font-semibold text-slate-500 border-r border-slate-200 text-xs uppercase tracking-wider">
              Distance
            </td>
            <td className="py-2 px-3 text-center">
              <StepperInput
                value={f.osDist.sph}
                onChange={(v) => setFlag({ osDist: { ...f.osDist, sph: v } })}
                step={0.25}
                className="w-28"
                ariaLabel="Left Eye Sphere"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <StepperInput
                value={f.osDist.cyl}
                onChange={(v) => setFlag({ osDist: { ...f.osDist, cyl: v } })}
                step={0.25}
                className="w-28"
                ariaLabel="Left Eye Cylinder"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <input
                type="text"
                value={f.osDist.axis}
                onChange={(e) => setFlag({ osDist: { ...f.osDist, axis: e.target.value } })}
                className="w-full max-w-[70px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
                placeholder="-"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <select
                value={f.osDist.va}
                onChange={(e) => setFlag({ osDist: { ...f.osDist, va: e.target.value } })}
                className="w-full max-w-[80px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
              >
                {DIST_VA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </td>
          </tr>
          {/* Left Eye - Near addition */}
          <tr className="hover:bg-blue-50/30 transition-colors group">
            <td className="py-3 px-4 font-semibold text-slate-500 border-r border-slate-200 text-xs uppercase tracking-wider">
              Near addition
            </td>
            <td colSpan={3} className="py-2 px-3 text-center">
              <StepperInput
                value={f.osNear.add}
                onChange={(v) => setFlag({ osNear: { ...f.osNear, add: v } })}
                step={0.25}
                className="w-36"
                ariaLabel="Left Eye Near Addition"
              />
            </td>
            <td className="py-2 px-3 text-center">
              <select
                value={f.osNear.va}
                onChange={(e) => setFlag({ osNear: { ...f.osNear, va: e.target.value } })}
                className="w-full max-w-[80px] mx-auto text-center py-1.5 px-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white hover:border-blue-300"
              >
                {NEAR_VA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </td>
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