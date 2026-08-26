import React, { useState } from 'react';

const OPTIONS = [
  'PERRLA and No RAPD',
  'PERRLA',
  'RAPD (Relative Afferent Pupillary Defect)',
  'Physiological Anisocoria',
  'Efferent Pupillary Defect',
  'Third Cranial Nerve Palsy',
  "Adie's Tonic Pupil",
  'Argyll Robertson Pupil',
  "Horner's Syndrome",
  'Light-Near Dissociation',
];

export const PupilView: React.FC = () => {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const toggle = (opt: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Pupil Evaluation</h1>

      <div className="space-y-3 mb-8 max-w-lg">
        {OPTIONS.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked.has(opt)}
              onChange={() => toggle(opt)}
              className="w-4 h-4 rounded border-slate-400 text-blue-600 accent-blue-600 focus:ring-0"
            />
            <span className="text-sm font-medium text-slate-800">{opt}</span>
          </label>
        ))}
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
