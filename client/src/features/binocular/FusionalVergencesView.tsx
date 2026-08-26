import React, { useState } from 'react';

type VisionTab = 'Distance Vision' | 'Intermediate Vision' | 'Near Vision';
type VergenceType = 'BI' | 'BO';

interface VergenceData {
  blur: string;
  break: string;
  recovery: string;
}

interface TabData {
  bi: VergenceData;
  bo: VergenceData;
}

const EMPTY: VergenceData = { blur: '', break: '', recovery: '' };
const DEFAULT_TAB: TabData = { bi: { ...EMPTY }, bo: { ...EMPTY } };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function VergenceSection({ title, data, onChange }: { title: string; data: VergenceData; onChange: (d: Partial<VergenceData>) => void }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">{title}</h3>
      <div className="space-y-3 max-w-2xl">
        <Row label="Blur (Δ)">
          <input type="number" value={data.blur} onChange={e => onChange({ blur: e.target.value })} placeholder="e.g. 12"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Break (Δ)">
          <input type="number" value={data.break} onChange={e => onChange({ break: e.target.value })} placeholder="e.g. 18"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
        <Row label="Recovery (Δ)">
          <input type="number" value={data.recovery} onChange={e => onChange({ recovery: e.target.value })} placeholder="e.g. 14"
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
        </Row>
      </div>
    </div>
  );
}

export const FusionalVergencesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VisionTab>('Distance Vision');
  const [data, setData] = useState<Record<VisionTab, TabData>>({
    'Distance Vision': { ...DEFAULT_TAB, bi: { ...EMPTY }, bo: { ...EMPTY } },
    'Intermediate Vision': { ...DEFAULT_TAB, bi: { ...EMPTY }, bo: { ...EMPTY } },
    'Near Vision': { ...DEFAULT_TAB, bi: { ...EMPTY }, bo: { ...EMPTY } },
  });
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const upd = (type: 'bi' | 'bo', fields: Partial<VergenceData>) =>
    setData(p => ({ ...p, [activeTab]: { ...p[activeTab], [type]: { ...p[activeTab][type], ...fields } } }));

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-5">Fusional Vergences</h1>

      {/* Sub-tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-6">
        {(['Distance Vision', 'Intermediate Vision', 'Near Vision'] as VisionTab[]).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-blue-700 border-blue-700 font-semibold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      <VergenceSection title="Base-In (BI) — Divergence" data={data[activeTab].bi} onChange={f => upd('bi', f)} />
      <VergenceSection title="Base-Out (BO) — Convergence" data={data[activeTab].bo} onChange={f => upd('bo', f)} />

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
