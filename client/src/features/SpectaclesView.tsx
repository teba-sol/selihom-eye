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
  odDist: { sph: '-1.50', cyl: '-8.00', axis: '180', va: '6/12' },
  odNear: { add: '-', va: '-' },
  osDist: { sph: '-0.75', cyl: '-1.50', axis: '90', va: '6/6' },
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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Previous spectacle prescription</h2>
          <select
            value={f.unit}
            onChange={(e) => setFlag({ unit: e.target.value })}
            className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Snellen">Snellen</option>
            <option value="LogMAR">LogMAR</option>
            <option value="Decimal">Decimal</option>
          </select>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-2.5 px-3 text-left font-bold text-slate-700 w-32"></th>
                <th className="py-2.5 px-3 text-left font-bold text-slate-700 w-36"></th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Sphere</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Cyl</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Axis</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">VA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td rowSpan={2} className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50 align-middle">
                  Right Eye
                </td>
                <td className="py-2 px-3 font-semibold text-slate-600 border-r border-slate-200">
                  Distance
                </td>
                <td className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.odDist.sph}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, sph: v } })}
                    step={0.25}
                    className="w-20"
                    ariaLabel="Right Eye Sphere"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.odDist.cyl}
                    onChange={(v) => setFlag({ odDist: { ...f.odDist, cyl: v } })}
                    step={0.25}
                    className="w-20"
                    ariaLabel="Right Eye Cylinder"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={f.odDist.axis}
                    onChange={(e) => setFlag({ odDist: { ...f.odDist, axis: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={f.odDist.va}
                    onChange={(e) => setFlag({ odDist: { ...f.odDist, va: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-600 border-r border-slate-200">
                  Near addition
                </td>
                <td colSpan={3} className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.odNear.add}
                    onChange={(v) => setFlag({ odNear: { ...f.odNear, add: v } })}
                    step={0.25}
                    className="w-32"
                    ariaLabel="Right Eye Near Addition"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={f.odNear.va}
                    onChange={(e) => setFlag({ odNear: { ...f.odNear, va: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {NEAR_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td rowSpan={2} className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50 align-middle">
                  Left Eye
                </td>
                <td className="py-2 px-3 font-semibold text-slate-600 border-r border-slate-200">
                  Distance
                </td>
                <td className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.osDist.sph}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, sph: v } })}
                    step={0.25}
                    className="w-20"
                    ariaLabel="Left Eye Sphere"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.osDist.cyl}
                    onChange={(v) => setFlag({ osDist: { ...f.osDist, cyl: v } })}
                    step={0.25}
                    className="w-20"
                    ariaLabel="Left Eye Cylinder"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={f.osDist.axis}
                    onChange={(e) => setFlag({ osDist: { ...f.osDist, axis: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={f.osDist.va}
                    onChange={(e) => setFlag({ osDist: { ...f.osDist, va: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-600 border-r border-slate-200">
                  Near addition
                </td>
                <td colSpan={3} className="py-1.5 px-2 text-center">
                  <StepperInput
                    value={f.osNear.add}
                    onChange={(v) => setFlag({ osNear: { ...f.osNear, add: v } })}
                    step={0.25}
                    className="w-32"
                    ariaLabel="Left Eye Near Addition"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={f.osNear.va}
                    onChange={(e) => setFlag({ osNear: { ...f.osNear, va: e.target.value } })}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
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