import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

type CellKey = 'unaided' | 'aided' | 'pinhole';
type EyeKey = 'od' | 'os' | 'ou';
type ScopeKey = 'dist' | 'near';

const DIST_VA_OPTIONS = ['-', '6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '2/60', '1/60', 'CF', 'PL', 'NPL'];
const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12', 'N14', 'N18', 'N24', 'N36', 'N48'];

interface SelectCellProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  className?: string;
}

function SelectCell({ value, onChange, options, disabled = false, className = '' }: SelectCellProps) {
  if (disabled) {
    return <td className={`p-0 border-b border-slate-200 bg-slate-100 ${className}`}></td>;
  }
  return (
    <td className={`p-0 border-b border-slate-200 transition-colors bg-transparent ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full py-4 text-center bg-transparent outline-none cursor-pointer text-slate-700 font-medium appearance-none"
        style={{ textAlignLast: 'center' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === '-' ? '✓ -' : opt}
          </option>
        ))}
      </select>
    </td>
  );
}

export const VisionAndVisualAcuityView: React.FC = () => {
  const va = useEncounterStore((s) => s.visualAcuity);
  const setCell = useEncounterStore((s) => s.setVisualAcuityCell);
  const setUnit = useEncounterStore((s) => s.setVisualAcuityUnit);
  const updateVa = useEncounterStore((s) => s.updateVisualAcuity);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const extra = (sectionData['vision-and-visual-acuity'] ?? { showInDischarge: false }) as {
    showInDischarge: boolean;
  };
  const updateExtra = (patch: Partial<typeof extra>) =>
    setSectionData('vision-and-visual-acuity', { ...extra, ...patch });

  const cell = (eye: EyeKey, scope: ScopeKey, key: CellKey) => va[eye][scope][key];
  const setVaC = (eye: EyeKey, scope: ScopeKey, key: CellKey) =>
    (v: string) => setCell(eye, scope, key, v);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2957a4]">Vision And Visual Acuity</h1>
        <select
          value={va.unit}
          onChange={(e) => setUnit(e.target.value)}
          className="border border-slate-300 rounded px-4 py-1.5 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
        >
          <option value="Snellan">Snellan</option>
          <option value="LogMAR">LogMAR</option>
          <option value="Decimal">Decimal</option>
        </select>
      </div>

      <div className="mb-8">
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr>
                <th colSpan={2} className="bg-white border-b border-r border-slate-200"></th>
                <th className="py-4 font-bold text-[#8ba0b8] bg-[#f0f4f8] border-b border-r border-slate-200 w-1/5 tracking-wider text-xs">
                  UNAIDED
                </th>
                <th className="py-4 font-bold text-[#8ba0b8] bg-[#f0f4f8] border-b border-r border-slate-200 w-1/5 tracking-wider text-xs">
                  AIDED
                </th>
                <th className="py-4 font-bold text-[#8ba0b8] bg-[#f0f4f8] border-b border-slate-200 w-1/5 tracking-wider text-xs">
                  PINHOLE
                </th>
              </tr>
            </thead>
            <tbody>
              {/* RIGHT EYE */}
              <tr className="bg-white">
                <td
                  rowSpan={2}
                  className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 w-1/5 align-middle text-left"
                >
                  RIGHT EYE (O.D)
                </td>
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  DISTANCE
                </td>
                <SelectCell value={cell('od', 'dist', 'unaided')} onChange={setVaC('od', 'dist', 'unaided')} options={DIST_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('od', 'dist', 'aided')} onChange={setVaC('od', 'dist', 'aided')} options={DIST_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('od', 'dist', 'pinhole')} onChange={setVaC('od', 'dist', 'pinhole')} options={DIST_VA_OPTIONS} />
              </tr>
              <tr className="bg-white">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell value={cell('od', 'near', 'unaided')} onChange={setVaC('od', 'near', 'unaided')} options={NEAR_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('od', 'near', 'aided')} onChange={setVaC('od', 'near', 'aided')} options={NEAR_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('od', 'near', 'pinhole')} onChange={setVaC('od', 'near', 'pinhole')} options={NEAR_VA_OPTIONS} />
              </tr>

              {/* LEFT EYE */}
              <tr className="bg-[#f2f7fb]">
                <td
                  rowSpan={2}
                  className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 w-1/5 align-middle text-left"
                >
                  LEFT EYE (O.S)
                </td>
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  DISTANCE
                </td>
                <SelectCell value={cell('os', 'dist', 'unaided')} onChange={setVaC('os', 'dist', 'unaided')} options={DIST_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('os', 'dist', 'aided')} onChange={setVaC('os', 'dist', 'aided')} options={DIST_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('os', 'dist', 'pinhole')} onChange={setVaC('os', 'dist', 'pinhole')} options={DIST_VA_OPTIONS} />
              </tr>
              <tr className="bg-[#f2f7fb]">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell value={cell('os', 'near', 'unaided')} onChange={setVaC('os', 'near', 'unaided')} options={NEAR_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('os', 'near', 'aided')} onChange={setVaC('os', 'near', 'aided')} options={NEAR_VA_OPTIONS} className="border-r" />
                <SelectCell value={cell('os', 'near', 'pinhole')} onChange={setVaC('os', 'near', 'pinhole')} options={NEAR_VA_OPTIONS} />
              </tr>

              {/* BOTH EYES */}
              <tr className="bg-[#f2f7fb]">
                <td
                  rowSpan={2}
                  className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 w-1/5 align-middle text-left"
                >
                  BOTH EYES
                </td>
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  DISTANCE
                </td>
                <SelectCell value={cell('ou', 'dist', 'unaided')} onChange={setVaC('ou', 'dist', 'unaided')} options={DIST_VA_OPTIONS} className="border-r bg-[#e8f0f8]" />
                <SelectCell value={cell('ou', 'dist', 'aided')} onChange={setVaC('ou', 'dist', 'aided')} options={DIST_VA_OPTIONS} className="border-r bg-[#e8f0f8]" />
                <SelectCell value="" onChange={() => {}} options={[]} disabled={true} />
              </tr>
              <tr className="bg-[#f2f7fb]">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell value={cell('ou', 'near', 'unaided')} onChange={setVaC('ou', 'near', 'unaided')} options={NEAR_VA_OPTIONS} className="border-r bg-[#e8f0f8]" />
                <SelectCell value={cell('ou', 'near', 'aided')} onChange={setVaC('ou', 'near', 'aided')} options={NEAR_VA_OPTIONS} className="border-r bg-[#e8f0f8]" />
                <SelectCell value="" onChange={() => {}} options={[]} disabled={true} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-[#4a5f73] block mb-2">Any remarks?</label>
        <textarea
          rows={3}
          value={va.remarks}
          onChange={(e) => updateVa({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2957a4] focus:ring-1 focus:ring-[#2957a4] resize-none"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={extra.showInDischarge}
            onChange={(e) => updateExtra({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};