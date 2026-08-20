import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

const DISTANCE_VA_OPTIONS = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM', 'PL/NPL'];
const NEAR_VA_OPTIONS = ['N5', 'N6', 'N8', 'N10', 'N12', 'N18', 'N24', 'N36'];

export const VisualAcuityView: React.FC = () => {
  const { visualAcuity, setVisualAcuityField } = useEncounterStore();

  return (
    <div className="p-8 max-w-4xl bg-white rounded-xl shadow-xs border border-slate-200">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1E3A8A]">Vision And Visual Acuity</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record distance and near visual acuity strictly isolated per eye (OD / OS).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Right Eye (OD) Column */}
        <div className="border border-teal-200 bg-teal-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-teal-200">
            <span className="text-sm font-bold text-teal-900 tracking-wide">RIGHT EYE (OD)</span>
            <span className="text-[11px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded">OD</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Unaided Distance VA (UCVA)
              </label>
              <select
                value={visualAcuity.unaidedOd}
                onChange={(e) => setVisualAcuityField('unaidedOd', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Aided VA (Current Spectacles)
              </label>
              <select
                value={visualAcuity.aidedOd}
                onChange={(e) => setVisualAcuityField('aidedOd', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Pinhole VA (PH)
              </label>
              <select
                value={visualAcuity.pinholeOd}
                onChange={(e) => setVisualAcuityField('pinholeOd', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Left Eye (OS) Column */}
        <div className="border border-indigo-200 bg-indigo-50/20 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-200">
            <span className="text-sm font-bold text-indigo-900 tracking-wide">LEFT EYE (OS)</span>
            <span className="text-[11px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">OS</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Unaided Distance VA (UCVA)
              </label>
              <select
                value={visualAcuity.unaidedOs}
                onChange={(e) => setVisualAcuityField('unaidedOs', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Aided VA (Current Spectacles)
              </label>
              <select
                value={visualAcuity.aidedOs}
                onChange={(e) => setVisualAcuityField('aidedOs', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Pinhole VA (PH)
              </label>
              <select
                value={visualAcuity.pinholeOs}
                onChange={(e) => setVisualAcuityField('pinholeOs', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {DISTANCE_VA_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
