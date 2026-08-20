import React, { useState } from 'react';

export const TearFilmEvaluationView: React.FC = () => {
  const [schirmer1, setSchirmer1] = useState({ od: '0', os: '0' });
  const [schirmer2, setSchirmer2] = useState({ od: '8', os: '9' });
  const [tbut, setTbut] = useState({ od: '6', os: '4' });
  const [nibut, setNibut] = useState({ od: '0', os: '0' });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(true);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Tear Film Evaluation</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Schirmer I */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Schirmer I</label>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Right Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={schirmer1.od}
                  onChange={(e) => setSchirmer1({ ...schirmer1, od: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white"
                />
                <span className="absolute right-3 text-xs text-slate-400">mm</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Left Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={schirmer1.os}
                  onChange={(e) => setSchirmer1({ ...schirmer1, os: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white"
                />
                <span className="absolute right-3 text-xs text-slate-400">mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schirmer II */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Schirmer II</label>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Right Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={schirmer2.od}
                  onChange={(e) => setSchirmer2({ ...schirmer2, od: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white font-semibold text-slate-800"
                />
                <span className="absolute right-3 text-xs text-slate-400">mm</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Left Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={schirmer2.os}
                  onChange={(e) => setSchirmer2({ ...schirmer2, os: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white font-semibold text-slate-800"
                />
                <span className="absolute right-3 text-xs text-slate-400">mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* TBUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">TBUT</label>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Right Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={tbut.od}
                  onChange={(e) => setTbut({ ...tbut, od: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white font-semibold text-slate-800"
                />
                <span className="absolute right-3 text-xs text-slate-400">sec</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Left Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={tbut.os}
                  onChange={(e) => setTbut({ ...tbut, os: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white font-semibold text-slate-800"
                />
                <span className="absolute right-3 text-xs text-slate-400">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* NIBUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">NIBUT</label>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Right Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={nibut.od}
                  onChange={(e) => setNibut({ ...nibut, od: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white"
                />
                <span className="absolute right-3 text-xs text-slate-400">sec</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Left Eye</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={nibut.os}
                  onChange={(e) => setNibut({ ...nibut, os: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 bg-white"
                />
                <span className="absolute right-3 text-xs text-slate-400">sec</span>
              </div>
            </div>
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
