import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { StepperCell } from '../components/StepperCell';

type DistanceData = { sph: string; cyl: string; axis: string; va: string };
type NearInterData = { add: string; va: string };
type SubjectiveEye = { dist: DistanceData; near: NearInterData; inter: NearInterData };
type ObjectiveEye = { sph: string; cyl: string; axis: string; va: string };

type SubjectiveRefractionData = {
  tab: 'objective' | 'subjective';
  unit: string;
  subjOd: SubjectiveEye;
  subjOs: SubjectiveEye;
  objOd: ObjectiveEye;
  objOs: ObjectiveEye;
  remarks: string;
  showInDischarge: boolean;
};

const DIST_VA_OPTIONS = ['-', '6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '2/60', '1/60', 'CF', 'PL', 'NPL'];
const NEAR_VA_OPTIONS = ['-', 'N5', 'N6', 'N8', 'N10', 'N12', 'N14', 'N18', 'N24', 'N36', 'N48'];

const emptySubjEye = (): SubjectiveEye => ({
  dist: { sph: '', cyl: '', axis: '', va: '-' },
  near: { add: '', va: '-' },
  inter: { add: '', va: '-' },
});
const emptyObjEye = (): ObjectiveEye => ({ sph: '', cyl: '', axis: '', va: '-' });

const DEFAULT_OBJ_SUB: SubjectiveRefractionData = {
  tab: 'subjective',
  unit: 'Snellan',
  subjOd: emptySubjEye(),
  subjOs: emptySubjEye(),
  objOd: emptyObjEye(),
  objOs: emptyObjEye(),
  remarks: '',
  showInDischarge: false,
};

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

export const SubjectiveRefractionView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_OBJ_SUB, sectionData['objective-subjective'] ?? {}) as SubjectiveRefractionData;

  const patch = (p: Partial<SubjectiveRefractionData>) => setSectionData('objective-subjective', { ...f, ...p });
  const setTab = (tab: 'objective' | 'subjective') => patch({ tab });
  const setUnit = (unit: string) => patch({ unit });
  const setRemarks = (remarks: string) => patch({ remarks });
  const setShowInDischarge = (showInDischarge: boolean) => patch({ showInDischarge });
  const setSubjEye = (eyeKey: 'subjOd' | 'subjOs', p: Partial<SubjectiveEye>) =>
    patch({ [eyeKey]: { ...f[eyeKey], ...p } } as Partial<SubjectiveRefractionData>);
  const setObjEye = (eyeKey: 'objOd' | 'objOs', p: Partial<ObjectiveEye>) =>
    patch({ [eyeKey]: { ...f[eyeKey], ...p } } as Partial<SubjectiveRefractionData>);

  const { tab, unit, subjOd, subjOs, objOd, objOs, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#2957a4]">Objective Subjective</h1>
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

      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          className={`pb-2 font-medium text-[15px] transition-colors ${
            tab === 'objective'
              ? 'text-[#2957a4] border-b-2 border-[#2957a4]'
              : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'
          }`}
          onClick={() => setTab('objective')}
        >
          Objective
        </button>
        <button
          className={`pb-2 font-medium text-[15px] transition-colors ${
            tab === 'subjective'
              ? 'text-[#2957a4] border-b-2 border-[#2957a4]'
              : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'
          }`}
          onClick={() => setTab('subjective')}
        >
          Subjective
        </button>
      </div>

      <div className="mb-8">
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {tab === 'subjective' ? (
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
                {/* RIGHT EYE */}
                <tr>
                  <td
                    rowSpan={3}
                    className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 w-[15%] text-left align-middle"
                  >
                    Right Eye<br />(O.D)
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Distance
                  </td>
                  <InputCell
                    value={subjOd.dist.sph}
                    onChange={(v) => setSubjEye('subjOd', { dist: { ...subjOd.dist, sph: v } })}
                    className="border-r"
                  />
                  <InputCell
                    value={subjOd.dist.cyl}
                    onChange={(v) => setSubjEye('subjOd', { dist: { ...subjOd.dist, cyl: v } })}
                    className="border-r"
                  />
                  <InputCell
                    value={subjOd.dist.axis}
                    onChange={(v) => setSubjEye('subjOd', { dist: { ...subjOd.dist, axis: v } })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Right Eye Axis"
                  />
                  <SelectCell
                    value={subjOd.dist.va}
                    onChange={(v) => setSubjEye('subjOd', { dist: { ...subjOd.dist, va: v } })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Near addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={subjOd.near.add}
                    onChange={(v) => setSubjEye('subjOd', { near: { ...subjOd.near, add: v } })}
                    className="border-r"
                  />
                  <SelectCell
                    value={subjOd.near.va}
                    onChange={(v) => setSubjEye('subjOd', { near: { ...subjOd.near, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Intermediate addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={subjOd.inter.add}
                    onChange={(v) => setSubjEye('subjOd', { inter: { ...subjOd.inter, add: v } })}
                    className="border-r"
                  />
                  <SelectCell
                    value={subjOd.inter.va}
                    onChange={(v) => setSubjEye('subjOd', { inter: { ...subjOd.inter, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>

                {/* LEFT EYE */}
                <tr>
                  <td
                    rowSpan={3}
                    className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 w-[15%] text-left align-middle"
                  >
                    Left Eye<br />(O.S)
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Distance
                  </td>
                  <InputCell
                    value={subjOs.dist.sph}
                    onChange={(v) => setSubjEye('subjOs', { dist: { ...subjOs.dist, sph: v } })}
                    className="border-r"
                  />
                  <InputCell
                    value={subjOs.dist.cyl}
                    onChange={(v) => setSubjEye('subjOs', { dist: { ...subjOs.dist, cyl: v } })}
                    className="border-r"
                  />
                  <InputCell
                    value={subjOs.dist.axis}
                    onChange={(v) => setSubjEye('subjOs', { dist: { ...subjOs.dist, axis: v } })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Left Eye Axis"
                  />
                  <SelectCell
                    value={subjOs.dist.va}
                    onChange={(v) => setSubjEye('subjOs', { dist: { ...subjOs.dist, va: v } })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Near addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={subjOs.near.add}
                    onChange={(v) => setSubjEye('subjOs', { near: { ...subjOs.near, add: v } })}
                    className="border-r"
                  />
                  <SelectCell
                    value={subjOs.near.va}
                    onChange={(v) => setSubjEye('subjOs', { near: { ...subjOs.near, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left whitespace-nowrap">
                    Intermediate addition
                  </td>
                  <td colSpan={2} className="p-0 border-b border-slate-200 bg-white"></td>
                  <InputCell
                    value={subjOs.inter.add}
                    onChange={(v) => setSubjEye('subjOs', { inter: { ...subjOs.inter, add: v } })}
                    className="border-r"
                  />
                  <SelectCell
                    value={subjOs.inter.va}
                    onChange={(v) => setSubjEye('subjOs', { inter: { ...subjOs.inter, va: v } })}
                    options={NEAR_VA_OPTIONS}
                  />
                </tr>
              </tbody>
            </table>
          ) : (
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
                    value={objOd.sph}
                    onChange={(v) => setObjEye('objOd', { sph: v })}
                    className="border-r"
                  />
                  <InputCell
                    value={objOd.cyl}
                    onChange={(v) => setObjEye('objOd', { cyl: v })}
                    className="border-r"
                  />
                  <InputCell
                    value={objOd.axis}
                    onChange={(v) => setObjEye('objOd', { axis: v })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Right Eye Axis"
                  />
                  <SelectCell
                    value={objOd.va}
                    onChange={(v) => setObjEye('objOd', { va: v })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800 border-b border-r border-slate-200 text-left">
                    Left Eye (O.S)
                  </td>
                  <InputCell
                    value={objOs.sph}
                    onChange={(v) => setObjEye('objOs', { sph: v })}
                    className="border-r"
                  />
                  <InputCell
                    value={objOs.cyl}
                    onChange={(v) => setObjEye('objOs', { cyl: v })}
                    className="border-r"
                  />
                  <InputCell
                    value={objOs.axis}
                    onChange={(v) => setObjEye('objOs', { axis: v })}
                    className="border-r"
                    step={1}
                    decimals={0}
                    min={1}
                    max={180}
                    ariaLabel="Left Eye Axis"
                  />
                  <SelectCell
                    value={objOs.va}
                    onChange={(v) => setObjEye('objOs', { va: v })}
                    options={DIST_VA_OPTIONS}
                  />
                </tr>
              </tbody>
            </table>
          )}
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