import React, { useEffect, useState } from 'react';

const INSTRUMENT_OPTIONS = [
  'NCT/Pneumotonometer',
  'Pulsair Tonometer',
  'Goldmann Applanation Tonometer',
  'Perkins Applanation Tonometer',
  'Tonocare NCT',
  'Tono-Pen',
  'ORA (Ocular Response Analyzer)',
  'iCare Rebound Tonometer',
  'Dynamic Contour Tonometer (DCT)',
];

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-center gap-4 py-1">
      <div>
        <span className="text-sm font-bold text-slate-800 block">{label}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function nowTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-GB'); // HH:MM:SS
}

export const TonometryView: React.FC = () => {
  const [instrument, setInstrument] = useState('');
  const [rightEye, setRightEye] = useState('');
  const [leftEye, setLeftEye] = useState('');
  const [timeOfMeasurement, setTimeOfMeasurement] = useState(nowTime);
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  // Auto-update time every second until user edits it
  const [timeEdited, setTimeEdited] = useState(false);
  useEffect(() => {
    if (timeEdited) return;
    const id = setInterval(() => setTimeOfMeasurement(nowTime()), 1000);
    return () => clearInterval(id);
  }, [timeEdited]);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">Tonometry</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Instrument">
          <select value={instrument} onChange={e => setInstrument(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option value=""></option>
            {INSTRUMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Row>

        <Row label="Right Eye" sub="(mmHg)">
          <input
            type="number"
            value={rightEye}
            onChange={e => setRightEye(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm text-center border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
        </Row>

        <Row label="Left Eye" sub="(mmHg)">
          <input
            type="number"
            value={leftEye}
            onChange={e => setLeftEye(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 text-sm text-center border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
        </Row>

        <Row label="Time of measurement">
          <input
            type="text"
            value={timeOfMeasurement}
            onChange={e => { setTimeEdited(true); setTimeOfMeasurement(e.target.value); }}
            className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-700 font-mono focus:outline-none focus:border-blue-600"
          />
        </Row>
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
