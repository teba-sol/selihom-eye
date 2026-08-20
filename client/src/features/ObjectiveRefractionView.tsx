import React, { useState } from 'react';

export const ObjectiveRefractionView: React.FC = () => {
  const [unit, setUnit] = useState('Snellen');

  const [odSph, setOdSph] = useState('');
  const [odCyl, setOdCyl] = useState('');
  const [odAxis, setOdAxis] = useState('');
  const [odVa, setOdVa] = useState('-');

  const [osSph, setOsSph] = useState('');
  const [osCyl, setOsCyl] = useState('');
  const [osAxis, setOsAxis] = useState('');
  const [osVa, setOsVa] = useState('-');

  const [remarks, setRemarks] = useState('Difficult reflex in right eye due to central corneal scarring.');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const DIST_VA_OPTIONS = ['-', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM'];

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Objective / Retinoscopy</h1>

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
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Sphere</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Cyl</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">Axis</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-700">VA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                  Right Eye
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={odSph}
                    onChange={(e) => setOdSph(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={odCyl}
                    onChange={(e) => setOdCyl(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={odAxis}
                    onChange={(e) => setOdAxis(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={odVa}
                    onChange={(e) => setOdVa(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/50">
                  Left Eye
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={osSph}
                    onChange={(e) => setOsSph(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={osCyl}
                    onChange={(e) => setOsCyl(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <input
                    type="text"
                    placeholder="-"
                    value={osAxis}
                    onChange={(e) => setOsAxis(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded font-bold"
                  />
                </td>
                <td className="py-1.5 px-2 text-center">
                  <select
                    value={osVa}
                    onChange={(e) => setOsVa(e.target.value)}
                    className="w-full text-center py-1 border border-slate-200 rounded bg-white font-bold"
                  >
                    {DIST_VA_OPTIONS.map((opt) => (
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
