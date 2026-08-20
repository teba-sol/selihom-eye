import React, { useState } from 'react';

export const VisionAndVisualAcuityView: React.FC = () => {
  const [unit, setUnit] = useState('Snellen');

  const [odUnaidedDist, setOdUnaidedDist] = useState('-');
  const [odAidedDist, setOdAidedDist] = useState('6/24');
  const [odPinhole, setOdPinhole] = useState('6/12');
  const [odNear, setOdNear] = useState('N12');

  const [osUnaidedDist, setOsUnaidedDist] = useState('-');
  const [osAidedDist, setOsAidedDist] = useState('6/9');
  const [osPinhole, setOsPinhole] = useState('-');
  const [osNear, setOsNear] = useState('N6');

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const DIST_VA_OPTIONS = ['-', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM', 'PL/NPL'];
  const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12', 'N18', 'N24', 'N36'];

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Vision And Visual Acuity</h1>

      <div className="mb-6">
        <div className="flex items-center justify-end mb-3">
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
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Unaided distance VA</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Aided distance VA</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Pinhole</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Near VA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                  Right Eye
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={odUnaidedDist}
                    onChange={(e) => setOdUnaidedDist(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={odAidedDist}
                    onChange={(e) => setOdAidedDist(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={odPinhole}
                    onChange={(e) => setOdPinhole(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={odNear}
                    onChange={(e) => setOdNear(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {NEAR_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                  Left Eye
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={osUnaidedDist}
                    onChange={(e) => setOsUnaidedDist(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={osAidedDist}
                    onChange={(e) => setOsAidedDist(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={osPinhole}
                    onChange={(e) => setOsPinhole(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-center">
                  <select
                    value={osNear}
                    onChange={(e) => setOsNear(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
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
