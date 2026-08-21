import React, { useState } from 'react';

type ObjectiveEye = { sph: string; cyl: string; axis: string; va: string };

const DIST_VA_OPTIONS = ['-', '6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '2/60', '1/60', 'CF', 'PL', 'NPL'];

const InputCell = ({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => (
  <td className={`p-0 border-b border-slate-200 transition-colors bg-white ${className}`}>
    <input
      type="number"
      step="0.25"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="-"
      className="w-full h-full py-4 px-2 text-center bg-transparent outline-none focus:ring-2 focus:ring-inset focus:ring-[#2957a4] text-slate-700 font-medium"
    />
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

export const CycloplegicView: React.FC = () => {
  const [unit, setUnit] = useState('Snellan');

  const [cycloOd, setCycloOd] = useState<ObjectiveEye>({ sph: '', cyl: '', axis: '', va: '-' });
  const [cycloOs, setCycloOs] = useState<ObjectiveEye>({ sph: '', cyl: '', axis: '', va: '-' });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);



  return (
    <div className="p-8 max-w-5xl bg-white min-h-full font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#2957a4]">Cycloplegic Refraction</h1>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="border border-slate-300 rounded px-4 py-1.5 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-[#2957a4] shadow-sm"
        >
          <option value="Snellan">Snellan</option>
          <option value="LogMAR">LogMAR</option>
          <option value="Decimal">Decimal</option>
        </select>
      </div>

      <div className="mb-8">
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-sm text-center bg-white">
            <thead>
              <tr>
                <th className="bg-white border-b border-r border-slate-200 w-[20%]"></th>
                <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/5">Sphere</th>
                <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/5">Cyl</th>
                <th className="py-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/5">Axis</th>
                <th className="py-4 font-bold text-slate-800 border-b border-slate-200 w-1/5">VA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left">
                  Right Eye (O.D)
                </td>
                <InputCell
                  value={cycloOd.sph}
                  onChange={(v) => setCycloOd({ ...cycloOd, sph: v })}
                  className="border-r"
                />
                <InputCell
                  value={cycloOd.cyl}
                  onChange={(v) => setCycloOd({ ...cycloOd, cyl: v })}
                  className="border-r"
                />
                <InputCell
                  value={cycloOd.axis}
                  onChange={(v) => setCycloOd({ ...cycloOd, axis: v })}
                  className="border-r"
                />
                <SelectCell
                  value={cycloOd.va}
                  onChange={(v) => setCycloOd({ ...cycloOd, va: v })}
                  options={DIST_VA_OPTIONS}
                />
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left">
                  Left Eye (O.S)
                </td>
                <InputCell
                  value={cycloOs.sph}
                  onChange={(v) => setCycloOs({ ...cycloOs, sph: v })}
                  className="border-r"
                />
                <InputCell
                  value={cycloOs.cyl}
                  onChange={(v) => setCycloOs({ ...cycloOs, cyl: v })}
                  className="border-r"
                />
                <InputCell
                  value={cycloOs.axis}
                  onChange={(v) => setCycloOs({ ...cycloOs, axis: v })}
                  className="border-r"
                />
                <SelectCell
                  value={cycloOs.va}
                  onChange={(v) => setCycloOs({ ...cycloOs, va: v })}
                  options={DIST_VA_OPTIONS}
                />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 mt-8">
        <label className="text-sm font-semibold text-[#4a5f73] block mb-2">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2957a4] focus:ring-1 focus:ring-[#2957a4] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-[#2957a4] border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
