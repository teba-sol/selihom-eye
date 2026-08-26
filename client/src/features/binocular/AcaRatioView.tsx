import React, { useState } from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const AcaRatioView: React.FC = () => {
  const [method, setMethod] = useState('');
  const [ipd, setIpd] = useState('');
  const [distPhoria, setDistPhoria] = useState('');
  const [nearPhoria, setNearPhoria] = useState('');
  const [acaCalculated, setAcaCalculated] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  // Auto-calculate ACA using gradient method: ACA = IPD + (nearPhoria - distPhoria) / accommodative demand
  // Simplified: ACA = (nearPhoria - distPhoria) / 3 (for 33cm working distance = 3D accommodation)
  const handleCalc = () => {
    const dp = parseFloat(distPhoria) || 0;
    const np = parseFloat(nearPhoria) || 0;
    const ipdVal = parseFloat(ipd) || 64;
    const aca = ipdVal / 10 + (np - dp) / 3;
    const formatted = aca.toFixed(1);
    setAcaCalculated(formatted);
    if (aca < 3) setInterpretation('Low AC/A ratio — may indicate convergence insufficiency');
    else if (aca > 7) setInterpretation('High AC/A ratio — may indicate convergence excess');
    else setInterpretation('Normal AC/A ratio (3–7 Δ/D)');
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-7">AC/A Ratio</h1>

      <div className="space-y-4 max-w-2xl mb-8">
        <Row label="Method">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
            <option value="">Select...</option>
            <option>Gradient Method (±1.00D Lens)</option>
            <option>Gradient Method (±2.00D Lens)</option>
            <option>Calculated (Heterophoria Method)</option>
          </select>
        </Row>

        <Row label="IPD (mm)">
          <input type="number" value={ipd} onChange={e => setIpd(e.target.value)} placeholder="e.g. 64"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>

        <Row label="Distance Phoria (Δ)">
          <input type="number" step="0.5" value={distPhoria} onChange={e => setDistPhoria(e.target.value)} placeholder="e.g. 2 (eso+, exo-)"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>

        <Row label="Near Phoria (Δ)">
          <input type="number" step="0.5" value={nearPhoria} onChange={e => setNearPhoria(e.target.value)} placeholder="e.g. 6"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>

        <div className="grid grid-cols-[200px_1fr] items-center gap-4 py-1">
          <span className="text-sm font-semibold text-slate-800">AC/A Result (Δ/D)</span>
          <div className="flex items-center gap-3">
            <input type="number" step="0.1" value={acaCalculated} onChange={e => setAcaCalculated(e.target.value)} placeholder="—"
              className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-extrabold text-blue-700 focus:outline-none focus:border-blue-600" />
            <button type="button" onClick={handleCalc}
              className="px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Auto-calculate
            </button>
          </div>
        </div>

        {interpretation && (
          <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${
            interpretation.includes('Low') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            interpretation.includes('High') ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {interpretation}
          </div>
        )}
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
