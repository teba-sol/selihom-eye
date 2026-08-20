import React, { useState } from 'react';

const INSTRUMENT_OPTIONS = [
  'Tonocare NCT',
  'Goldmann Applanation Tonometer (GAT)',
  'iCare Tonometer',
  'Perkins Tonometer',
  'Non-Contact Tonometer (NCT)',
];

export const TonometryView: React.FC = () => {
  const [instrument, setInstrument] = useState('Tonocare NCT');
  const [rightEye, setRightEye] = useState('13');
  const [leftEye, setLeftEye] = useState('14');
  const [timeOfMeasurement, setTimeOfMeasurement] = useState('12:28:28');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Tonometry</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Instrument */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Instrument</label>
          <div className="md:col-span-2">
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {INSTRUMENT_OPTIONS.map((inst) => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Eye (mmHg) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Right Eye</label>
            <span className="text-[11px] text-slate-500 font-semibold">(mmHg)</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              value={rightEye}
              onChange={(e) => setRightEye(e.target.value)}
              className="w-full px-3 py-2 text-xs text-center border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Left Eye (mmHg) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Left Eye</label>
            <span className="text-[11px] text-slate-500 font-semibold">(mmHg)</span>
          </div>
          <div className="md:col-span-2">
            <input
              type="number"
              value={leftEye}
              onChange={(e) => setLeftEye(e.target.value)}
              className="w-full px-3 py-2 text-xs text-center border border-blue-500 ring-1 ring-blue-500 rounded-md font-medium text-slate-900 bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Time of measurement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Time of measurement</label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={timeOfMeasurement}
              onChange={(e) => setTimeOfMeasurement(e.target.value)}
              className="w-36 px-3 py-2 text-xs border border-slate-200 rounded-md font-medium text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-3xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-3xl">
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
