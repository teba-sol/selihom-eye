import React, { useState } from 'react';

// Dot pattern configurations matching the screenshot
const PATTERNS = [
  {
    key: 'normal',
    label: 'Normal response',
    dots: [
      { cx: 50, cy: 22, r: 10, fill: '#16a34a' },
      { cx: 28, cy: 50, r: 10, fill: '#dc2626' },
      { cx: 72, cy: 50, r: 10, fill: '#dc2626' },
      { cx: 50, cy: 78, r: 10, fill: '#16a34a' },
      { cx: 50, cy: 50, r: 10, fill: '#78350f' }, // center white/brown
    ],
  },
  {
    key: 'left-suppress',
    label: 'Left eye suppression',
    dots: [
      { cx: 50, cy: 28, r: 12, fill: '#dc2626' },
      { cx: 50, cy: 72, r: 12, fill: '#dc2626' },
    ],
  },
  {
    key: 'right-suppress',
    label: 'Right eye suppression',
    dots: [
      { cx: 30, cy: 28, r: 11, fill: '#16a34a' },
      { cx: 65, cy: 28, r: 11, fill: '#16a34a' },
      { cx: 30, cy: 65, r: 11, fill: '#16a34a' },
    ],
  },
  {
    key: 'exo',
    label: 'Exo diplopia',
    dots: [
      { cx: 25, cy: 28, r: 9, fill: '#dc2626' },
      { cx: 60, cy: 28, r: 9, fill: '#16a34a' },
      { cx: 25, cy: 62, r: 9, fill: '#dc2626' },
      { cx: 60, cy: 62, r: 9, fill: '#16a34a' },
    ],
  },
  {
    key: 'eso',
    label: 'Eso diplopia',
    dots: [
      { cx: 35, cy: 30, r: 9, fill: '#dc2626' },
      { cx: 65, cy: 30, r: 9, fill: '#16a34a' },
      { cx: 25, cy: 60, r: 9, fill: '#dc2626' },
      { cx: 65, cy: 60, r: 9, fill: '#16a34a' },
    ],
  },
  {
    key: 'right-hyper',
    label: 'Right hyper',
    dots: [
      { cx: 50, cy: 20, r: 10, fill: '#dc2626' },
      { cx: 25, cy: 52, r: 10, fill: '#16a34a' },
      { cx: 60, cy: 52, r: 10, fill: '#dc2626' },
      { cx: 50, cy: 75, r: 10, fill: '#16a34a' },
    ],
  },
  {
    key: 'left-hyper',
    label: 'Left hyper',
    dots: [
      { cx: 50, cy: 20, r: 10, fill: '#16a34a' },
      { cx: 25, cy: 52, r: 10, fill: '#dc2626' },
      { cx: 60, cy: 52, r: 10, fill: '#16a34a' },
      { cx: 50, cy: 75, r: 10, fill: '#dc2626' },
    ],
  },
];

function DotPatternCard({ pattern, selected, onSelect }: {
  pattern: typeof PATTERNS[0]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        {pattern.dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
        ))}
      </svg>
      <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{pattern.label}</span>
    </button>
  );
}

export const Worth4DotView: React.FC = () => {
  const [selected, setSelected] = useState<string>('normal');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-4">Worth 4 Dot Test</h1>

      <p className="text-sm mb-6">
        <span className="text-red-600 font-semibold">Red lens</span>
        <span className="text-slate-500"> over Right eye / </span>
        <span className="text-green-600 font-semibold">Green lens</span>
        <span className="text-slate-500"> over Left eye</span>
      </p>

      {/* Pattern cards */}
      <div className="flex flex-wrap gap-3 mb-8">
        {PATTERNS.map(p => (
          <DotPatternCard
            key={p.key}
            pattern={p}
            selected={selected === p.key}
            onSelect={() => setSelected(p.key)}
          />
        ))}
      </div>

      <div className="mb-6 max-w-2xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex justify-end max-w-2xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"
          />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};
