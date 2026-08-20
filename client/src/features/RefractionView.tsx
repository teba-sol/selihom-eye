import React, { useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { ArrowLeftRight, RotateCcw, Check } from 'lucide-react';

const VA_OPTIONS = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM'];

export const RefractionView: React.FC = () => {
  const { refraction, updateRefraction } = useEncounterStore();
  const [rxType, setRxType] = useState<'subjective' | 'objective' | 'previous'>('subjective');

  // Mathematical Optical Transposition:
  // New Sph = Sph + Cyl | New Cyl = -Cyl | New Axis = (Axis + 90) % 180
  const handleTranspose = (eye: 'od' | 'os') => {
    const sphKey = eye === 'od' ? 'odSph' : 'osSph';
    const cylKey = eye === 'od' ? 'odCyl' : 'osCyl';
    const axisKey = eye === 'od' ? 'odAxis' : 'osAxis';

    const currentSph = parseFloat(refraction[sphKey]) || 0;
    const currentCyl = parseFloat(refraction[cylKey]) || 0;
    const currentAxis = parseInt(refraction[axisKey], 10) || 0;

    if (currentCyl === 0) return;

    const newSph = (currentSph + currentCyl).toFixed(2);
    const newCyl = (-currentCyl).toFixed(2);
    let newAxis = currentAxis + 90;
    if (newAxis > 180) newAxis -= 180;
    if (newAxis === 0) newAxis = 180;

    updateRefraction({
      [sphKey]: newSph.startsWith('+') || parseFloat(newSph) < 0 ? newSph : `+${newSph}`,
      [cylKey]: newCyl.startsWith('+') || parseFloat(newCyl) < 0 ? newCyl : `+${newCyl}`,
      [axisKey]: newAxis.toString(),
    });
  };

  return (
    <div className="p-8 max-w-5xl bg-white rounded-xl shadow-xs border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A8A]">Refraction & Optical Prescription</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Document objective retinoscopy and subjective trial lens values per eye.
          </p>
        </div>

        {/* Refraction Mode Tabs */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(['subjective', 'objective', 'previous'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setRxType(mode)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                rxType === mode
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'subjective' ? 'Subjective Rx' : mode === 'objective' ? 'Autorefractor / Retinoscopy' : 'Previous Spectacles'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Refraction Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Eye</th>
              <th className="py-3 px-3">Sphere (SPH)</th>
              <th className="py-3 px-3">Cylinder (CYL)</th>
              <th className="py-3 px-3">Axis (°)</th>
              <th className="py-3 px-3">BCVA (Dist)</th>
              <th className="py-3 px-3">Near Add</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {/* OD ROW */}
            <tr className="hover:bg-teal-50/30 transition-colors">
              <td className="py-3 px-4 font-bold text-teal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                  OD
                </span>
                Right Eye
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="0.00"
                  value={refraction.odSph}
                  onChange={(e) => updateRefraction({ odSph: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="0.00"
                  value={refraction.odCyl}
                  onChange={(e) => updateRefraction({ odCyl: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="180"
                  value={refraction.odAxis}
                  onChange={(e) => updateRefraction({ odAxis: e.target.value })}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                />
              </td>
              <td className="py-2 px-3">
                <select
                  value={refraction.odVa}
                  onChange={(e) => updateRefraction({ odVa: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded font-bold text-slate-800 bg-white focus:outline-hidden focus:border-teal-600"
                >
                  {VA_OPTIONS.map((va) => (
                    <option key={va} value={va}>{va}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="+2.00"
                  value={refraction.odAdd}
                  onChange={(e) => updateRefraction({ odAdd: e.target.value })}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                />
              </td>
              <td className="py-2 px-4 text-center">
                <button
                  type="button"
                  onClick={() => handleTranspose('od')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors"
                  title="Transpose Cylinder (+/-)"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Transpose
                </button>
              </td>
            </tr>

            {/* OS ROW */}
            <tr className="hover:bg-indigo-50/30 transition-colors">
              <td className="py-3 px-4 font-bold text-indigo-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px]">
                  OS
                </span>
                Left Eye
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="0.00"
                  value={refraction.osSph}
                  onChange={(e) => updateRefraction({ osSph: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="0.00"
                  value={refraction.osCyl}
                  onChange={(e) => updateRefraction({ osCyl: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="180"
                  value={refraction.osAxis}
                  onChange={(e) => updateRefraction({ osAxis: e.target.value })}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                />
              </td>
              <td className="py-2 px-3">
                <select
                  value={refraction.osVa}
                  onChange={(e) => updateRefraction({ osVa: e.target.value })}
                  className="w-24 px-2 py-1.5 border border-slate-300 rounded font-bold text-slate-800 bg-white focus:outline-hidden focus:border-indigo-600"
                >
                  {VA_OPTIONS.map((va) => (
                    <option key={va} value={va}>{va}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="+2.00"
                  value={refraction.osAdd}
                  onChange={(e) => updateRefraction({ osAdd: e.target.value })}
                  className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                />
              </td>
              <td className="py-2 px-4 text-center">
                <button
                  type="button"
                  onClick={() => handleTranspose('os')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                  title="Transpose Cylinder (+/-)"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Transpose
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Auxiliary Optical Constants */}
      <div className="grid grid-cols-2 gap-4 max-w-md bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Pupillary Distance (PD mm)
          </label>
          <input
            type="number"
            placeholder="64"
            value={refraction.pdBinocular}
            onChange={(e) => updateRefraction({ pdBinocular: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded bg-white focus:outline-hidden focus:border-teal-600"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Back Vertex Distance (BVD mm)
          </label>
          <input
            type="number"
            placeholder="12"
            value={refraction.bvdMm}
            onChange={(e) => updateRefraction({ bvdMm: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded bg-white focus:outline-hidden focus:border-teal-600"
          />
        </div>
      </div>
    </div>
  );
};
