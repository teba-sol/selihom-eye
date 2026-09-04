import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { MultiSelect } from '../components/MultiSelect';
import { useEncounterStore } from '../store/useEncounterStore';
import { MousePointer2, Pencil, Eraser, Type, Circle, ArrowUpRight, Upload } from 'lucide-react';

const MYDRIATIC_OPTIONS = [
  'None', 'Tropicamide 0.5%', 'Tropicamide 0.8%', 'Tropicamide 1%',
  'Phenylephrine 2.5%', 'Phenylephrine 5%', 'Phenylephrine 10%',
  'Tropicamide 0.8% + Phenylephrine 5%', 'Tropicamide 1% + Phenylephrine 5%',
  'Cyclopentolate 1%', 'Homatropine 2%', 'Atropine 1%',
];

const INSTRUMENT_OPTIONS = [
  'Direct Ophthalmoscope', '90D', '78D', 'Volk Superfield',
  'Volk Digital Widefield', 'Head Mounted IO', 'Binocular Indirect Ophthalmoscope (BIO 20D)',
];

const VITREOUS_OPTIONS = [
  'Clear / Within normal limits',
  'Synchisis scintillans', 'Vitreous Floaters',
  "Schaffer's sign / tobacco dust", 'Weiss ring floater',
  'Asteroid Hyalosis', 'Full Posterior Vitreous Detachment',
  'Partial Posterior Vitreous Detachment', 'Vitreous Hemorrhage',
  'Vitreous Membrane / Strands',
];

const ONH_OPTIONS = [
  'NRR Pink, Flat and Healthy', 'ISNT Rule Followed',
  'Within Normal Limits', 'Pale optic disc / Disc atrophy',
  'Suspicious glaucomatous cupping', 'Notching of neuroretinal rim',
  'Disc swelling / Papilledema', 'Optic disc drusen',
  'Coloboma', 'Tilted disc',
];

const VESSELS_OPTIONS = [
  'Healthy / WNL',
  'Proliferative Diabetic Retinopathy', 'Dot Haemorrhage',
  'Blot Haemorrhage', 'Flame Haemorrhage', 'Microaneurysm',
  'Hypertensive Retinopathy', 'Arteriovenous Nipping',
  'AV nicking / Crossing changes', 'Arteriolar attenuation',
  'Neovascularization of disc (NVD)', 'Neovascularization elsewhere (NVE)',
  'Hard exudates', 'Soft exudates / Cotton wool spots',
  'Silver / Copper wiring',
];

const AV_RATIO_OPTIONS = ['None', '1/4', '1/2', '2/3', '3/4'];

const MACULA_OPTIONS = [
  'Healthy and Flat', 'Foveal Reflex Visible', 'WNL',
  'Epiretinal Membrane', 'Pseudohole', 'Macular Pucker',
  'Macular Hole', 'Diabetic Macular Edema (DME)',
  'Dry AMD (Drusen)', 'Wet AMD / CNVM',
  'Central Serous Retinopathy (CSR)', 'Macular Scar',
  'Cystoid Macular Edema (CME)', 'Subretinal hemorrhage',
];

const PERIPHERAL_OPTIONS = [
  'Flat and Intact / WNL',
  'Lattice degeneration', 'Snailtrack degeneration',
  'Snowflake degeneration', 'White Without Pressure (WWOP)',
  'Microcystoid degeneration', 'Degenerative Retinoschisis',
  'Pars Plana Cyst', 'Retinal tear / Hole',
  'Rhegmatogenous Retinal Detachment',
  'Tractional Retinal Detachment',
  'Exudative Retinal Detachment',
  'Choroidal nevus', 'Ora serrata changes',
];

// ── Fundus Drawing Canvas ─────────────────────────────────────────────────────
const FUNDUS_TOOLS = [
  { id: 'cursor', label: 'Cursor', icon: <MousePointer2 className="w-5 h-5"/> },
  { id: 'pen', label: 'Pen', icon: <Pencil className="w-5 h-5"/> },
  { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5"/> },
  { id: 'annotate', label: 'Annotate', icon: <Type className="w-5 h-5"/> },
  { id: 'circle', label: 'Outline Circle', icon: <Circle className="w-5 h-5"/> },
  { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-5 h-5 text-amber-500"/> },
];

const FUNDUS_COLORS = [
  { hex: '#1e293b', label: 'Black' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#16a34a', label: 'Green' },
  { hex: '#f97316', label: 'Orange' },
];

// SVG fundus diagram: outer circle (retina) + small disc circle (left) + fovea dot (right)
function FundusEyeSVG() {
  return (
    <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Outer retina boundary */}
      <circle cx="150" cy="150" r="140" fill="none" stroke="#94a3b8" strokeWidth="2"/>
      {/* Optic disc */}
      <circle cx="90" cy="150" r="22" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
      <circle cx="90" cy="150" r="10" fill="none" stroke="#94a3b8" strokeWidth="1"/>
      {/* Fovea */}
      <circle cx="200" cy="150" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="200" cy="150" r="3" fill="#94a3b8"/>
      {/* Main vessels from disc */}
      <path d="M 112 140 Q 150 135 200 130" stroke="#cbd5e1" strokeWidth="1.5" fill="none"/>
      <path d="M 112 160 Q 150 165 200 170" stroke="#cbd5e1" strokeWidth="1.5" fill="none"/>
      <path d="M 105 130 Q 130 110 155 115" stroke="#cbd5e1" strokeWidth="1" fill="none"/>
      <path d="M 105 170 Q 130 190 155 185" stroke="#cbd5e1" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function FundusCanvas({ canvasRef, fabricRef, tool, color }: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  tool: string;
  color: string;
}) {
  useEffect(() => {
    if (!canvasRef.current) return;
    if (fabricRef.current) fabricRef.current.dispose();
    const canvas = new fabric.Canvas(canvasRef.current, { width: 300, height: 300, backgroundColor: 'transparent' });
    fabricRef.current = canvas;
    return () => { canvas.dispose(); };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (tool === 'pen') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = color;
      brush.width = 2;
      canvas.freeDrawingBrush = brush;
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = 'white';
      brush.width = 14;
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = tool === 'cursor';
    }
  }, [tool, color]);

  return <canvas ref={canvasRef as React.RefObject<HTMLCanvasElement>} className="absolute inset-0"/>;
}

function PosteriorDiagram() {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#dc2626');
  const odRef = useRef<HTMLCanvasElement>(null);
  const osRef = useRef<HTMLCanvasElement>(null);
  const odFab = useRef<fabric.Canvas | null>(null);
  const osFab = useRef<fabric.Canvas | null>(null);

  const clearAll = () => {
    [odFab, osFab].forEach(r => { if (r.current) { r.current.clear(); r.current.renderAll(); } });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="border border-slate-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-end">
        {FUNDUS_TOOLS.map(t => (
          <button key={t.id} type="button" onClick={() => setTool(t.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 min-w-[58px] transition-all ${tool === t.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            {t.icon}
            <span className="text-[9px] font-medium text-slate-600 text-center">{t.label}</span>
          </button>
        ))}
        {/* Color swatches when pen active */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1.5 ml-2">
            {FUNDUS_COLORS.map(c => (
              <button key={c.hex} type="button" onClick={() => setColor(c.hex)}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c.hex ? 'border-blue-600 scale-125' : 'border-slate-300'}`}
                style={{ backgroundColor: c.hex }}/>
            ))}
          </div>
        )}
        <button type="button" onClick={clearAll}
          className="ml-auto px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
          Clear All
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Upload className="w-3.5 h-3.5"/> Upload image
        </button>
      </div>

      {/* Diagrams */}
      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-10">
          {[
            { label: 'RIGHT', ref: odRef, fab: odFab },
            { label: 'LEFT', ref: osRef, fab: osFab },
          ].map(eye => (
            <div key={eye.label} className="flex flex-col items-center gap-3">
              <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">{eye.label}</span>
              <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden bg-white border-2 border-slate-200 shadow-sm">
                <FundusEyeSVG />
                <FundusCanvas canvasRef={eye.ref} fabricRef={eye.fab} tool={tool} color={color}/>
              </div>
              <p className="text-[10px] text-slate-400">Disc (left circle) · Fovea (right dashed)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface StructureState {
  od: string[];
  os: string[];
  same: boolean;
}

function StructureRow({ label, options, state, onOd, onOs, onSame, extra }: {
  label: string;
  options: string[];
  state: StructureState;
  onOd: (v: string[]) => void;
  onOs: (v: string[]) => void;
  onSame: (v: boolean) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_1fr] gap-4 items-start py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-semibold text-slate-800 pt-2">{label}</span>
      <div className="space-y-1.5">
        <MultiSelect options={options} value={state.od} onChange={onOd} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={state.same} onChange={e => onSame(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0" />
          <span className="text-xs text-slate-500">Same for left eye</span>
        </label>
        {extra}
      </div>
      <div>
        <MultiSelect options={options} value={state.same ? state.od : state.os}
          onChange={v => !state.same && onOs(v)} disabled={state.same} />
      </div>
    </div>
  );
}

type StructureKey = 'vitreous' | 'onh' | 'vessels' | 'macula' | 'peripheral';

type PosteriorSegmentData = {
  activeTab: 'Form' | 'Diagram';
  mydriaticDrug: string[];
  instrument: string;
  structures: Record<StructureKey, StructureState>;
  cdr: { od: string; os: string };
  av: { od: string; os: string };
  remarks: string;
  showInDischarge: boolean;
};

const SEGMENT_STRUCTURES: StructureKey[] = ['vitreous', 'onh', 'vessels', 'macula', 'peripheral'];

const DEFAULT_POSTERIOR_SEGMENT: PosteriorSegmentData = {
  activeTab: 'Form',
  mydriaticDrug: [],
  instrument: '',
  structures: {
    vitreous: { od: [], os: [], same: false },
    onh: { od: [], os: [], same: false },
    vessels: { od: [], os: [], same: false },
    macula: { od: [], os: [], same: false },
    peripheral: { od: [], os: [], same: false },
  },
  cdr: { od: '0', os: '0' },
  av: { od: 'None', os: 'None' },
  remarks: '',
  showInDischarge: false,
};

export const PosteriorSegmentEvaluationView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const raw = Object.assign({}, DEFAULT_POSTERIOR_SEGMENT, sectionData['posterior-segment'] ?? {}) as PosteriorSegmentData;
  const structures = Object.fromEntries(
    SEGMENT_STRUCTURES.map((s) => {
      const b = raw.structures?.[s] ?? {};
      return [s, { od: b.od ?? [], os: b.os ?? [], same: b.same ?? false }];
    }),
  ) as Record<StructureKey, StructureState>;
  const f: PosteriorSegmentData = {
    ...raw,
    structures,
    cdr: { od: raw.cdr?.od ?? '0', os: raw.cdr?.os ?? '0' },
    av: { od: raw.av?.od ?? 'None', os: raw.av?.os ?? 'None' },
  };
  const patch = (p: Partial<PosteriorSegmentData>) => setSectionData('posterior-segment', { ...f, ...p });
  const { activeTab, mydriaticDrug, instrument, cdr, av, remarks, showInDischarge } = f;

  const setStructure = (key: StructureKey, updater: (s: StructureState) => StructureState) =>
    patch({ structures: { ...structures, [key]: updater(structures[key]) } });
  const setStructOd = (key: StructureKey, od: string[]) => setStructure(key, s => ({ ...s, od, os: s.same ? od : s.os }));
  const setStructOs = (key: StructureKey, os: string[]) => setStructure(key, s => ({ ...s, os }));
  const setStructSame = (key: StructureKey, same: boolean) => setStructure(key, s => ({ ...s, same, os: same ? s.od : s.os }));

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-2">Posterior Segment Evaluation</h1>

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'Diagram'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => patch({ activeTab: tab })}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-blue-700 border-blue-700 font-semibold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Diagram' && (
        <PosteriorDiagram />
      )}

      {activeTab === 'Form' && (
        <div>
          {/* Mydriatic Drug */}
          <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-4">
            <span className="text-sm font-bold text-slate-800 pt-2">Mydriatic Drug</span>
            <MultiSelect options={MYDRIATIC_OPTIONS} value={mydriaticDrug} onChange={v => patch({ mydriaticDrug: v })} placeholder="Select mydriatic drug..." />
          </div>

          {/* Instrument */}
          <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-6">
            <span className="text-sm font-bold text-slate-800 pt-2">Instrument</span>
            <select value={instrument} onChange={e => patch({ instrument: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
              <option value=""></option>
              {INSTRUMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[180px_1fr_1fr] gap-4 mb-1 px-1">
            <span className="text-sm font-bold text-slate-800">Ocular Structure</span>
            <span className="text-sm font-bold text-slate-800">Right Eye Observation</span>
            <span className="text-sm font-bold text-slate-800">Left Eye Observation</span>
          </div>

          {/* Rows */}
          <div>
            {/* Vitreous */}
            <StructureRow label="Vitreous" options={VITREOUS_OPTIONS}
              state={structures.vitreous} onOd={v => setStructOd('vitreous', v)} onOs={v => setStructOs('vitreous', v)} onSame={v => setStructSame('vitreous', v)} />

            {/* Optic Nerve Head with Cup Disc Ratio */}
            <div className="grid grid-cols-[180px_1fr_1fr] gap-4 items-start py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800 pt-2">Optic Nerve Head</span>
              <div className="space-y-1.5">
                <MultiSelect options={ONH_OPTIONS} value={structures.onh.od} onChange={v => setStructOd('onh', v)} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={structures.onh.same} onChange={e => setStructSame('onh', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 focus:ring-0" />
                  <span className="text-xs text-slate-500">Same for left eye</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-700">Cup Disc Ratio</span>
                  <input type="number" step="0.1" min="0" max="1" value={cdr.od} onChange={e => patch({ cdr: { ...cdr, od: e.target.value } })}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-slate-300 rounded-md font-semibold focus:outline-none focus:border-blue-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <MultiSelect options={ONH_OPTIONS} value={structures.onh.same ? structures.onh.od : structures.onh.os}
                  onChange={v => !structures.onh.same && setStructOs('onh', v)} disabled={structures.onh.same} />
                <div className="flex items-center gap-2 mt-7">
                  <span className="text-sm font-semibold text-slate-700">Cup Disc Ratio</span>
                  <input type="number" step="0.1" min="0" max="1" value={structures.onh.same ? cdr.od : cdr.os}
                    onChange={e => patch({ cdr: { ...cdr, os: e.target.value } })} disabled={structures.onh.same}
                    className="w-20 px-2 py-1.5 text-sm text-center border border-slate-300 rounded-md font-semibold focus:outline-none focus:border-blue-600 disabled:opacity-60" />
                </div>
              </div>
            </div>

            {/* Retinal Blood Vessels with Artery/Vein Ratio */}
            <div className="grid grid-cols-[180px_1fr_1fr] gap-4 items-start py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800 pt-2">Retinal Blood Vessels</span>
              <div className="space-y-1.5">
                <MultiSelect options={VESSELS_OPTIONS} value={structures.vessels.od} onChange={v => setStructOd('vessels', v)} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={structures.vessels.same} onChange={e => setStructSame('vessels', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 focus:ring-0" />
                  <span className="text-xs text-slate-500">Same for left eye</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-700">Artery / Vein Ratio</span>
                  <select value={av.od} onChange={e => { const v = e.target.value; patch({ av: { ...av, od: v, ...(structures.vessels.same ? { os: v } : {}) } }); }}
                    className="px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600">
                    {AV_RATIO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <MultiSelect options={VESSELS_OPTIONS} value={structures.vessels.same ? structures.vessels.od : structures.vessels.os}
                  onChange={v => !structures.vessels.same && setStructOs('vessels', v)} disabled={structures.vessels.same} />
                <div className="flex items-center gap-2 mt-8">
                  <span className="text-sm font-semibold text-slate-700">Artery / Vein Ratio</span>
                  <select value={structures.vessels.same ? av.od : av.os} onChange={e => patch({ av: { ...av, os: e.target.value } })} disabled={structures.vessels.same}
                    className="px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 disabled:opacity-60">
                    {AV_RATIO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Macula/Fovea */}
            <StructureRow label="Macula/Fovea" options={MACULA_OPTIONS}
              state={structures.macula} onOd={v => setStructOd('macula', v)} onOs={v => setStructOs('macula', v)} onSame={v => setStructSame('macula', v)} />

            {/* Peripheral Retina */}
            <StructureRow label="Peripheral Retina" options={PERIPHERAL_OPTIONS}
              state={structures.peripheral} onOd={v => setStructOd('peripheral', v)} onOs={v => setStructOs('peripheral', v)} onSame={v => setStructSame('peripheral', v)} />
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
            <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
              placeholder="Add any remarks..."
              className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none" />
          </div>

          <div className="flex justify-end mt-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
              Show in Discharge Summary
            </label>
          </div>
        </div>
      )}
    </div>
  );
};