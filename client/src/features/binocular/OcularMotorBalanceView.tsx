import React, { useState } from 'react';

type VisionTab = 'Distance Vision' | 'Intermediate Vision' | 'Near Vision';

interface TabData {
  testType: 'Cover test' | 'Maddox Rod / Maddox wing';
  deviation: string;
  eye: string;
  prismDiopter: string;
  baseDirection: string;
  recovery: string;
}

const DEFAULT: TabData = {
  testType: 'Cover test',
  deviation: '',
  eye: '',
  prismDiopter: '0',
  baseDirection: '',
  recovery: '',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-1">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Select({ value, onChange, options, placeholder = 'Select...' }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export const OcularMotorBalanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VisionTab>('Distance Vision');
  const [data, setData] = useState<Record<VisionTab, TabData>>({
    'Distance Vision': { ...DEFAULT },
    'Intermediate Vision': { ...DEFAULT },
    'Near Vision': { ...DEFAULT },
  });
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const cur = data[activeTab];
  const upd = (fields: Partial<TabData>) =>
    setData(p => ({ ...p, [activeTab]: { ...p[activeTab], ...fields } }));

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-5">Ocular Motor Balance</h1>

      {/* Sub-tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-6">
        {(['Distance Vision', 'Intermediate Vision', 'Near Vision'] as VisionTab[]).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-blue-700 border-blue-700 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-w-2xl mb-8">
        {/* Testing distance */}
        <Row label="Testing distance">
          <div className="flex items-center gap-6 text-sm text-slate-700">
            {(['Cover test', 'Maddox Rod / Maddox wing'] as const).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`testType-${activeTab}`}
                  checked={cur.testType === opt}
                  onChange={() => upd({ testType: opt })}
                  className="w-4 h-4 text-blue-600 focus:ring-0 accent-blue-600"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </Row>

        {/* Deviation */}
        <Row label="Deviation">
          <Select
            value={cur.deviation}
            onChange={v => upd({ deviation: v })}
            options={['Orthophoria', 'Exophoria', 'Esophoria', 'Hyperphoria', 'Hypophoria', 'Exotropia', 'Esotropia', 'Hypertropia', 'Hypotropia']}
          />
        </Row>

        {/* Eye */}
        <Row label="Eye">
          <Select
            value={cur.eye}
            onChange={v => upd({ eye: v })}
            options={['-', 'Left eye', 'Right eye', 'Both eyes', 'Alternating']}
          />
        </Row>

        {/* Prism Diopter */}
        <Row label="Prism Diopter">
          <input
            type="number"
            value={cur.prismDiopter}
            onChange={e => upd({ prismDiopter: e.target.value })}
            className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
          />
        </Row>

        {/* Base Direction */}
        <Row label="Base Direction">
          <Select
            value={cur.baseDirection}
            onChange={v => upd({ baseDirection: v })}
            options={['-', 'In', 'Out', 'Down', 'Up']}
          />
        </Row>

        {/* Recovery */}
        <Row label="Recovery">
          <Select
            value={cur.recovery}
            onChange={v => upd({ recovery: v })}
            options={['-', 'Slow', 'Medium', 'Fast']}
          />
        </Row>
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
          />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
