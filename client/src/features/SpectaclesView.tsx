import React, { useState } from 'react';

export const SpectaclesView: React.FC = () => {
  const [none, setNone] = useState(false);
  const [singleDistance, setSingleDistance] = useState(false);
  const [singleIntermediate, setSingleIntermediate] = useState(false);
  const [singleNear, setSingleNear] = useState(false);
  const [pal, setPal] = useState(false);
  const [bifocal, setBifocal] = useState(false);
  const [unit, setUnit] = useState('Snellen');

  const [odDist, setOdDist] = useState({ sph: '-1.50', cyl: '-8.00', axis: '180', va: '6/12' });
  const [odNear, setOdNear] = useState({ add: '-', va: '-' });
  const [osDist, setOsDist] = useState({ sph: '-0.75', cyl: '-1.50', axis: '90', va: '6/6' });
  const [osNear, setOsNear] = useState({ add: '-', va: '-' });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const handleNoneChange = (checked: boolean) => {
    setNone(checked);
    if (checked) {
      setSingleDistance(false);
      setSingleIntermediate(false);
      setSingleNear(false);
      setPal(false);
      setBifocal(false);
    }
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
            checked={none}
            onChange={(e) => handleNoneChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>None</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={singleDistance}
            disabled={none}
            onChange={(e) => setSingleDistance(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Distance</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={singleIntermediate}
            disabled={none}
            onChange={(e) => setSingleIntermediate(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Intermediate</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={singleNear}
            disabled={none}
            onChange={(e) => setSingleNear(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Single Vision Near</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={pal}
            disabled={none}
            onChange={(e) => setPal(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Progressive Addition Lenses</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={bifocal}
            disabled={none}
            onChange={(e) => setBifocal(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Bifocal</span>
        </label>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Previous spectacle prescription</h2>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
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
                  <input
                    type="text"
                    value={odDist.sph}
                    onChange={(e) => setOdDist({ ...odDist, sph: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={odDist.cyl}
                    onChange={(e) => setOdDist({ ...odDist, cyl: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={odDist.axis}
                    onChange={(e) => setOdDist({ ...odDist, axis: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={odDist.va}
                    onChange={(e) => setOdDist({ ...odDist, va: e.target.value })}
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
                  <input
                    type="text"
                    value={odNear.add}
                    onChange={(e) => setOdNear({ ...odNear, add: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={odNear.va}
                    onChange={(e) => setOdNear({ ...odNear, va: e.target.value })}
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
                  <input
                    type="text"
                    value={osDist.sph}
                    onChange={(e) => setOsDist({ ...osDist, sph: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={osDist.cyl}
                    onChange={(e) => setOsDist({ ...osDist, cyl: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    value={osDist.axis}
                    onChange={(e) => setOsDist({ ...osDist, axis: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={osDist.va}
                    onChange={(e) => setOsDist({ ...osDist, va: e.target.value })}
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
                  <input
                    type="text"
                    value={osNear.add}
                    onChange={(e) => setOsNear({ ...osNear, add: e.target.value })}
                    className="w-full text-center py-1 border border-slate-200 rounded"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={osNear.va}
                    onChange={(e) => setOsNear({ ...osNear, va: e.target.value })}
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
