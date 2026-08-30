import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

function EyeRow({ label, unit, od, os, onOd, onOs }: {
  label: string; unit: string;
  od: string; os: string;
  onOd: (v: string) => void; onOs: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr_1fr] items-end gap-4 py-2">
      <span className="text-sm font-bold text-slate-800 pb-1">{label}</span>
      <div>
        <span className="text-xs font-semibold text-slate-500 block mb-1">Right Eye</span>
        <div className="flex items-center gap-2">
          <input type="number" value={od} onChange={e => onOd(e.target.value)} placeholder="0"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
          <span className="text-xs text-slate-500 font-medium shrink-0 w-8">{unit}</span>
        </div>
      </div>
      <div>
        <span className="text-xs font-semibold text-slate-500 block mb-1">Left Eye</span>
        <div className="flex items-center gap-2">
          <input type="number" value={os} onChange={e => onOs(e.target.value)} placeholder="0"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
          <span className="text-xs text-slate-500 font-medium shrink-0 w-8">{unit}</span>
        </div>
      </div>
    </div>
  );
}

type TearFilmData = {
  schirmer1: { od: string; os: string };
  schirmer2: { od: string; os: string };
  tbut: { od: string; os: string };
  nibut: { od: string; os: string };
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_TEAR_FILM: TearFilmData = {
  schirmer1: { od: '0', os: '0' },
  schirmer2: { od: '8', os: '9' },
  tbut: { od: '6', os: '4' },
  nibut: { od: '0', os: '0' },
  remarks: '',
  showInDischarge: true,
};

export const TearFilmEvaluationView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_TEAR_FILM, sectionData['tear-film'] ?? {}) as TearFilmData;
  const patch = (p: Partial<TearFilmData>) => setSectionData('tear-film', { ...f, ...p });
  const { schirmer1, schirmer2, tbut, nibut, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-8">Tear Film Evaluation</h1>

      <div className="space-y-2 max-w-3xl mb-8 divide-y divide-slate-100">
        <EyeRow label="Schirmer I"  unit="mm"  od={schirmer1.od} os={schirmer1.os} onOd={v => patch({ schirmer1: { ...schirmer1, od: v } })} onOs={v => patch({ schirmer1: { ...schirmer1, os: v } })} />
        <EyeRow label="Schirmer II" unit="mm"  od={schirmer2.od} os={schirmer2.os} onOd={v => patch({ schirmer2: { ...schirmer2, od: v } })} onOs={v => patch({ schirmer2: { ...schirmer2, os: v } })} />
        <EyeRow label="TBUT"        unit="sec" od={tbut.od}      os={tbut.os}      onOd={v => patch({ tbut: { ...tbut, od: v } })}      onOs={v => patch({ tbut: { ...tbut, os: v } })} />
        <EyeRow label="NIBUT"       unit="sec" od={nibut.od}     os={nibut.os}     onOd={v => patch({ nibut: { ...nibut, od: v } })}     onOs={v => patch({ nibut: { ...nibut, os: v } })} />
      </div>

      <div className="mb-6 max-w-3xl">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
      </div>

      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
          Show in Discharge Summary
        </label>
      </div>
    </div>
  );
};