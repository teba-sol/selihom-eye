import React, { useState } from 'react';

type EyeData = {
  unaided: string;
  aided: string;
  pinhole: string;
};

type VisionState = {
  dist: EyeData;
  near: EyeData;
};

export const VisionAndVisualAcuityView: React.FC = () => {
  const [unit, setUnit] = useState('Snellan');

  const [od, setOd] = useState<VisionState>({
    dist: { unaided: '-', aided: '6/24', pinhole: '6/12' },
    near: { unaided: '-', aided: 'N12', pinhole: '-' }
  });
  const [os, setOs] = useState<VisionState>({
    dist: { unaided: '-', aided: '-', pinhole: '-' },
    near: { unaided: '-', aided: '-', pinhole: '-' }
  });
  const [ou, setOu] = useState<VisionState>({
    dist: { unaided: '-', aided: '-', pinhole: '-' },
    near: { unaided: '-', aided: '-', pinhole: '-' }
  });

  const [remarks, setRemarks] = useState('');

  const DIST_VA_OPTIONS = ['-', '6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '2/60', '1/60', 'CF', 'PL', 'NPL'];
  const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12', 'N14', 'N18', 'N24', 'N36', 'N48'];

  const SelectCell = ({
    value,
    onChange,
    options,
    disabled = false,
    className = '',
  }: {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    disabled?: boolean;
    className?: string;
  }) => {
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
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2957a4]">Vision And Visual Acuity</h1>
        <select
          value={unit}
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
                <SelectCell
                  value={od.dist.unaided}
                  onChange={(v) => setOd({ ...od, dist: { ...od.dist, unaided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={od.dist.aided}
                  onChange={(v) => setOd({ ...od, dist: { ...od.dist, aided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={od.dist.pinhole}
                  onChange={(v) => setOd({ ...od, dist: { ...od.dist, pinhole: v } })}
                  options={DIST_VA_OPTIONS}
                />
              </tr>
              <tr className="bg-white">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell
                  value={od.near.unaided}
                  onChange={(v) => setOd({ ...od, near: { ...od.near, unaided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={od.near.aided}
                  onChange={(v) => setOd({ ...od, near: { ...od.near, aided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={od.near.pinhole}
                  onChange={(v) => setOd({ ...od, near: { ...od.near, pinhole: v } })}
                  options={NEAR_VA_OPTIONS}
                />
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
                <SelectCell
                  value={os.dist.unaided}
                  onChange={(v) => setOs({ ...os, dist: { ...os.dist, unaided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={os.dist.aided}
                  onChange={(v) => setOs({ ...os, dist: { ...os.dist, aided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={os.dist.pinhole}
                  onChange={(v) => setOs({ ...os, dist: { ...os.dist, pinhole: v } })}
                  options={DIST_VA_OPTIONS}
                />
              </tr>
              <tr className="bg-[#f2f7fb]">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell
                  value={os.near.unaided}
                  onChange={(v) => setOs({ ...os, near: { ...os.near, unaided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={os.near.aided}
                  onChange={(v) => setOs({ ...os, near: { ...os.near, aided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r"
                />
                <SelectCell
                  value={os.near.pinhole}
                  onChange={(v) => setOs({ ...os, near: { ...os.near, pinhole: v } })}
                  options={NEAR_VA_OPTIONS}
                />
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
                <SelectCell
                  value={ou.dist.unaided}
                  onChange={(v) => setOu({ ...ou, dist: { ...ou.dist, unaided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r bg-[#e8f0f8]"
                />
                <SelectCell
                  value={ou.dist.aided}
                  onChange={(v) => setOu({ ...ou, dist: { ...ou.dist, aided: v } })}
                  options={DIST_VA_OPTIONS}
                  className="border-r bg-[#e8f0f8]"
                />
                <SelectCell value="" onChange={() => {}} options={[]} disabled={true} />
              </tr>
              <tr className="bg-[#f2f7fb]">
                <td className="py-4 px-6 font-bold text-[#8ba0b8] border-b border-r border-slate-200 text-left">
                  NEAR
                </td>
                <SelectCell
                  value={ou.near.unaided}
                  onChange={(v) => setOu({ ...ou, near: { ...ou.near, unaided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r bg-[#e8f0f8]"
                />
                <SelectCell
                  value={ou.near.aided}
                  onChange={(v) => setOu({ ...ou, near: { ...ou.near, aided: v } })}
                  options={NEAR_VA_OPTIONS}
                  className="border-r bg-[#e8f0f8]"
                />
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
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2957a4] focus:ring-1 focus:ring-[#2957a4] resize-none"
        />
      </div>
    </div>
  );
};
