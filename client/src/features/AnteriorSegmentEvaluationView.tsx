import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Upload, MousePointer2, Pencil, Eraser, Type, Circle, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { MultiSelect } from '../components/MultiSelect';
import { useEncounterStore } from '../store/useEncounterStore';

// ── Multi-select tag options per structure ────────────────────────────────────
const STRUCTURE_OPTIONS: Record<string, string[]> = {
  'Lids/Lashes': [
    'Clean and healthy / Within normal limits',
    'Chronic anterior Blepharitis','Chronic posterior Blepharitis',
    'Demodex Blepharitis','Meibomian Gland Dysfunction (MGD)',
    'Trichiasis / Distichiasis','Chalazion / Stye',
    'Ptosis','Entropion','Ectropion','Lagophthalmos',
  ],
  'Orbit and Lacrimal System': [
    'Normal / Within normal limits',
    'Punctal stenosis','Dacryocystitis','Nasolacrimal duct obstruction (NLDO)',
    'Dry eye / Reduced tear meniscus','Epiphora','Proptosis / Exophthalmos',
  ],
  'Conjunctiva': [
    'Clean and healthy / Within normal limits',
    'Hyperemia / Injection','Ciliary flush / Circumcorneal congestion',
    'Papillae','Follicles','Subconjunctival hemorrhage',
    'Pinguecula','Pterygium','Allergic conjunctivitis','Chemosis',
  ],
  'Cornea': [
    'Clear / Within normal limits',
    'Keratoconjunctivitis Sicca','Corneal staining with fluorescein',
    'Corneal Opacity','Corneal Oedema','Corneal ulcer',
    'Bacterial Corneal ulcer','Fungal Corneal ulcer',
    'Viral Corneal ulcer (dendritic ulcer)','Traumatic Corneal ulcer',
    'Superficial Punctate Keratitis (SPK)','Keratoconus',
    'Stromal infiltrate','Arcus senilis','Band keratopathy',
  ],
  'Iris': [
    'Normal pattern / Within normal limits',
    'Iris atrophy','Posterior synechiae','Anterior synechiae',
    'Neovascularization (Rubeosis iridis)','Coloboma','Heterochromia',
  ],
  'Anterior Chamber': [
    'Healthy and Quiet / Within normal limits',
    'Van Herrick Grade 4','Van Herrick Grade 3','Van Herrick Grade 2','Van Herrick Grade 1',
    'Shallow anterior chamber','Cells & Flare (1+)','Cells & Flare (2+)','Cells & Flare (3+)',
    'Hypopyon','Hyphema','Fibrin',
  ],
  'Sclera': [
    'Normal / Within normal limits',
    'Episcleritis','Scleritis','Scleral thinning',
    'Scleral icterus','Staphyloma',
  ],
};

const STRUCTURES = Object.keys(STRUCTURE_OPTIONS);

// ── Anatomy SVG for one eye ───────────────────────────────────────────────────
function EyeAnatomy() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ overflow: 'visible' }}>
      {/* Upper eyelid arc */}
      <path d="M20 80 Q100 20 180 80" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Eye outline */}
      <path d="M20 100 Q60 60 100 60 Q140 60 180 100 Q140 140 100 140 Q60 140 20 100Z" fill="white" stroke="#334155" strokeWidth="2.5"/>
      {/* Cornea circle */}
      <circle cx="100" cy="100" r="28" fill="white" stroke="#334155" strokeWidth="2.5"/>
      {/* Pupil */}
      <circle cx="100" cy="100" r="10" fill="#1e293b"/>
      {/* Lower eyelid arc */}
      <path d="M20 120 Q100 180 180 120" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Drawing canvas for one eye ────────────────────────────────────────────────
function DrawingCanvas({ tool, color, brushSize, canvasRef, fabricRef }: {
  tool: string; color: string; brushSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
}) {
  useEffect(() => {
    if (!canvasRef.current) return;
    if (fabricRef.current) fabricRef.current.dispose();

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 320, height: 280,
      backgroundColor: 'transparent',
    });
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
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
      canvas.selection = false;
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = 'white';
      brush.width = 16;
      canvas.freeDrawingBrush = brush;
    } else if (tool === 'cursor') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
    }
  }, [tool, color, brushSize]);

  return (
    <div className="relative" style={{ width: 320, height: 280 }}>
      {/* Eye anatomy SVG underneath */}
      <div className="absolute inset-0 pointer-events-none">
        <EyeAnatomy />
      </div>
      {/* Fabric drawing canvas on top */}
      <canvas ref={canvasRef as React.RefObject<HTMLCanvasElement>} className="absolute inset-0" />
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
type ToolDef = { id: string; label: string; icon: React.ReactNode; color?: string };

const TOOL_STAMP_COLORS: Record<string, string> = {
  congestion: '#dc2626',
  neovascularization: '#b45309',
  stromal: '#94a3b8',
  ghost: '#e2e8f0',
  punctate: '#64748b',
  staining: '#16a34a',
  filaments: '#78350f',
  epithelial: '#a855f7',
  inflammatory: '#f97316',
  pigment: '#854d0e',
  hyphaema: '#dc2626',
  hypopyon: '#fbbf24',
};

// SVG stamp icons as simple ReactNodes
const StampIcon = ({ id }: { id: string }) => {
  const c = TOOL_STAMP_COLORS[id] ?? '#64748b';
  if (id === 'congestion') return <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M3 12 Q7 6 12 12 Q17 18 21 12" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M3 16 Q7 10 12 16 Q17 22 21 16" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/></svg>;
  if (id === 'neovascularization') return <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M4 20 Q8 12 12 14 Q16 16 20 8" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M12 14 Q14 10 16 12" stroke={c} strokeWidth="1.5" fill="none"/></svg>;
  if (id === 'stromal') return <svg viewBox="0 0 24 24" className="w-6 h-6"><line x1="4" y1="8" x2="20" y2="8" stroke={c} strokeWidth="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke={c} strokeWidth="1.5"/><line x1="4" y1="16" x2="20" y2="16" stroke={c} strokeWidth="1.5"/></svg>;
  if (id === 'ghost') return <svg viewBox="0 0 24 24" className="w-6 h-6"><line x1="4" y1="8" x2="20" y2="8" stroke={c} strokeWidth="1" strokeDasharray="2 2"/><line x1="4" y1="12" x2="20" y2="12" stroke={c} strokeWidth="1" strokeDasharray="2 2"/><line x1="4" y1="16" x2="20" y2="16" stroke={c} strokeWidth="1" strokeDasharray="2 2"/></svg>;
  if (id === 'punctate') return <svg viewBox="0 0 24 24" className="w-6 h-6">{[5,10,15,8,13,18,5,10,15].map((x,i)=><circle key={i} cx={x} cy={5+i*2} r="1.2" fill={c}/>)}</svg>;
  if (id === 'staining') return <svg viewBox="0 0 24 24" className="w-6 h-6"><ellipse cx="12" cy="12" rx="7" ry="5" fill={c} opacity="0.7"/></svg>;
  if (id === 'filaments') return <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M4 18 Q8 10 12 14 Q16 18 20 10" stroke={c} strokeWidth="1.5" fill="none"/><path d="M6 16 Q10 8 14 12" stroke={c} strokeWidth="1.5" fill="none"/></svg>;
  if (id === 'epithelial') return <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="4" y="8" width="4" height="4" fill="none" stroke={c} strokeWidth="1.2"/><rect x="10" y="8" width="4" height="4" fill="none" stroke={c} strokeWidth="1.2"/><rect x="16" y="8" width="4" height="4" fill="none" stroke={c} strokeWidth="1.2"/><rect x="7" y="13" width="4" height="4" fill="none" stroke={c} strokeWidth="1.2"/><rect x="13" y="13" width="4" height="4" fill="none" stroke={c} strokeWidth="1.2"/></svg>;
  if (id === 'inflammatory') return <svg viewBox="0 0 24 24" className="w-6 h-6">{[6,10,14,18,8,12,16].map((x,i)=><circle key={i} cx={x} cy={6+i*2} r="1.5" fill={c}/>)}</svg>;
  if (id === 'pigment') return <svg viewBox="0 0 24 24" className="w-6 h-6">{[6,11,16,8,13,18].map((x,i)=><circle key={i} cx={x} cy={7+i*2.5} r="1.8" fill={c}/>)}</svg>;
  if (id === 'hyphaema') return <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="4" y="16" width="16" height="4" fill={c} rx="1"/></svg>;
  if (id === 'hypopyon') return <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="4" y="17" width="16" height="3" fill={c} rx="1"/></svg>;
  return <div className="w-6 h-6 bg-slate-200 rounded" />;
};

const PRIMARY_TOOLS: ToolDef[] = [
  { id: 'cursor', label: 'Cursor', icon: <MousePointer2 className="w-5 h-5"/> },
  { id: 'pen', label: 'Pen', icon: <Pencil className="w-5 h-5"/> },
  { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5"/> },
  { id: 'annotate', label: 'Annotate', icon: <Type className="w-5 h-5"/> },
  { id: 'outline-circle', label: 'Outline Circle', icon: <Circle className="w-5 h-5"/> },
  { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-5 h-5 text-amber-500"/> },
  { id: 'congestion', label: 'Congestion', icon: <StampIcon id="congestion"/> },
  { id: 'neovascularization', label: 'Neovasculari-zation', icon: <StampIcon id="neovascularization"/> },
  { id: 'stromal', label: 'Stromal vessels', icon: <StampIcon id="stromal"/> },
  { id: 'ghost', label: 'Ghost vessels', icon: <StampIcon id="ghost"/> },
];

const MORE_TOOLS: ToolDef[] = [
  { id: 'punctate', label: 'Punctate Keratopathy', icon: <StampIcon id="punctate"/> },
  { id: 'staining', label: 'Corneal Staining', icon: <StampIcon id="staining"/> },
  { id: 'filaments', label: 'Filaments', icon: <StampIcon id="filaments"/> },
  { id: 'epithelial', label: 'Epithelial Oedema', icon: <StampIcon id="epithelial"/> },
  { id: 'inflammatory', label: 'Inflammatory Cells', icon: <StampIcon id="inflammatory"/> },
  { id: 'pigment', label: 'Pigment', icon: <StampIcon id="pigment"/> },
  { id: 'hyphaema', label: 'Hyphaema', icon: <StampIcon id="hyphaema"/> },
  { id: 'hypopyon', label: 'Hypopyon', icon: <StampIcon id="hypopyon"/> },
];

function ToolButton({ tool, active, onClick }: { tool: ToolDef; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all min-w-[58px] ${active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      {tool.icon}
      <span className="text-[9px] font-medium text-slate-600 text-center leading-tight">{tool.label}</span>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type StructureObs = { od: string[]; os: string[]; sameForOS: boolean };

type AnteriorSegmentData = {
  activeSubTab: 'Form' | 'Diagram';
  instrument: 'Torch Light' | 'Slit Lamp';
  multiObs: Record<string, StructureObs>;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_MULTI_OBS = (): Record<string, StructureObs> => {
  const init: Record<string, StructureObs> = {};
  STRUCTURES.forEach(s => { init[s] = { od: [], os: [], sameForOS: false }; });
  return init;
};

const DEFAULT_ANTERIOR_SEGMENT: AnteriorSegmentData = {
  activeSubTab: 'Form',
  instrument: 'Slit Lamp',
  multiObs: DEFAULT_MULTI_OBS(),
  remarks: '',
  showInDischarge: false,
};

export const AnteriorSegmentEvaluationView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const raw = Object.assign({}, DEFAULT_ANTERIOR_SEGMENT, sectionData['anterior-segment-eval'] ?? {}) as AnteriorSegmentData;
  const multiObs: Record<string, StructureObs> = Object.fromEntries(
    STRUCTURES.map((s) => {
      const b = raw.multiObs?.[s] ?? {};
      return [s, { od: b.od ?? [], os: b.os ?? [], sameForOS: b.sameForOS ?? false }];
    }),
  );
  const f: AnteriorSegmentData = { ...raw, multiObs };
  const patch = (p: Partial<AnteriorSegmentData>) => setSectionData('anterior-segment-eval', { ...f, ...p });
  const { activeSubTab, instrument, remarks, showInDischarge } = f;

  // Diagram UI state (transient)
  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#000000');
  const [showMore, setShowMore] = useState(false);
  const odCanvasRef = useRef<HTMLCanvasElement>(null);
  const osCanvasRef = useRef<HTMLCanvasElement>(null);
  const odFabricRef = useRef<fabric.Canvas | null>(null);
  const osFabricRef = useRef<fabric.Canvas | null>(null);

  const updateOd = (struct: string, v: string[]) => {
    const cur = multiObs[struct];
    const next = { ...cur, od: v };
    if (cur.sameForOS) next.os = v;
    patch({ multiObs: { ...multiObs, [struct]: next } });
  };
  const updateOs = (struct: string, v: string[]) => {
    patch({ multiObs: { ...multiObs, [struct]: { ...multiObs[struct], os: v } } });
  };
  const toggleSame = (struct: string) => {
    const cur = multiObs[struct];
    const newSame = !cur.sameForOS;
    patch({ multiObs: { ...multiObs, [struct]: { ...cur, sameForOS: newSame, os: newSame ? cur.od : cur.os } } });
  };

  const handleClearAll = () => {
    [odFabricRef, osFabricRef].forEach(ref => { if (ref.current) { ref.current.clear(); ref.current.renderAll(); } });
  };

  const COLORS = [
    { hex: '#000000', label: 'Pen' },
    { hex: '#dc2626', label: 'Red' },
    { hex: '#16a34a', label: 'Green' },
    { hex: '#f97316', label: 'Orange' },
  ];

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#2563eb]">Anterior Segment Evaluation</h1>
        {activeSubTab === 'Diagram' && (
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Upload className="w-3.5 h-3.5"/> Upload image
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'Diagram'] as const).map(t => (
          <button key={t} type="button" onClick={() => patch({ activeSubTab: t })}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeSubTab === t ? 'text-blue-700 border-blue-700 font-semibold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── FORM TAB ── */}
      {activeSubTab === 'Form' && (
        <div>
          {/* Instrument */}
          <div className="flex items-center gap-6 mb-6 text-sm text-slate-700">
            <span className="font-bold text-slate-900">Instrument</span>
            {(['Torch Light', 'Slit Lamp'] as const).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="instrument" checked={instrument === opt} onChange={() => patch({ instrument: opt })}
                  className="w-4 h-4 text-blue-600 accent-blue-600 focus:ring-0"/>
                <span>{opt}</span>
              </label>
            ))}
          </div>

          {/* Header */}
          <div className="grid grid-cols-[180px_1fr_1fr] gap-4 mb-2 px-1">
            <span className="text-sm font-bold text-slate-800">Ocular Structure</span>
            <span className="text-sm font-bold text-slate-800">Right Eye Observation</span>
            <span className="text-sm font-bold text-slate-800">Left Eye Observation</span>
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {STRUCTURES.map(struct => {
              const obs = multiObs[struct];
              return (
                <div key={struct} className="grid grid-cols-[180px_1fr_1fr] gap-4 items-start py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-semibold text-slate-800 pt-2">{struct}</span>
                  <div>
                    <MultiSelect options={STRUCTURE_OPTIONS[struct]} value={obs.od} onChange={v => updateOd(struct, v)}/>
                    <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                      <input type="checkbox" checked={obs.sameForOS} onChange={() => toggleSame(struct)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0"/>
                      <span className="text-xs text-slate-500">Same for left eye</span>
                    </label>
                  </div>
                  <div>
                    {obs.sameForOS
                      ? <MultiSelect options={STRUCTURE_OPTIONS[struct]} value={obs.od} onChange={() => {}}/>
                      : <MultiSelect options={STRUCTURE_OPTIONS[struct]} value={obs.os} onChange={v => updateOs(struct, v)}/>
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remarks */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
            <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
              placeholder="Add any remarks..."
              className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"/>
          </div>

          <div className="flex justify-end mt-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"/>
              Show in Discharge Summary
            </label>
          </div>
        </div>
      )}

      {/* ── DIAGRAM TAB ── */}
      {activeSubTab === 'Diagram' && (
        <div>
          {/* Toolbar */}
          <div className="border border-slate-200 rounded-xl p-3 mb-4">
            <div className="flex flex-wrap gap-2 items-end">
              {PRIMARY_TOOLS.map(tool => (
                <ToolButton key={tool.id} tool={tool} active={activeTool === tool.id}
                  onClick={() => { setActiveTool(tool.id); setShowMore(false); if (TOOL_STAMP_COLORS[tool.id]) setActiveColor(TOOL_STAMP_COLORS[tool.id]); else if (tool.id === 'pen') setActiveColor('#000000'); }}/>
              ))}
              <button type="button" onClick={() => setShowMore(v => !v)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 min-w-[58px] ${showMore ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <MoreHorizontal className="w-5 h-5"/>
                <span className="text-[9px] font-medium text-slate-600">{showMore ? 'Less' : 'More'}</span>
              </button>
            </div>

            {/* More tools expanded */}
            {showMore && (
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                {MORE_TOOLS.map(tool => (
                  <ToolButton key={tool.id} tool={tool} active={activeTool === tool.id}
                    onClick={() => { setActiveTool(tool.id); setActiveColor(TOOL_STAMP_COLORS[tool.id] ?? '#000000'); }}/>
                ))}
              </div>
            )}
          </div>

          {/* Pen color picker (shown when pen is active) */}
          {activeTool === 'pen' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-slate-600">Color:</span>
              {COLORS.map(c => (
                <button key={c.hex} type="button" onClick={() => setActiveColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${activeColor === c.hex ? 'border-blue-600 scale-125' : 'border-slate-300'}`}
                  style={{ backgroundColor: c.hex }}/>
              ))}
              <button type="button" onClick={handleClearAll}
                className="ml-2 px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">
                Clear All
              </button>
            </div>
          )}

          {/* Both eye canvases side by side */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">RIGHT</span>
                <DrawingCanvas tool={activeTool} color={activeColor} brushSize={3}
                  canvasRef={odCanvasRef} fabricRef={odFabricRef} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">LEFT</span>
                <DrawingCanvas tool={activeTool} color={activeColor} brushSize={3}
                  canvasRef={osCanvasRef} fabricRef={osFabricRef} />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-5">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
            <textarea rows={3} value={remarks} onChange={e => patch({ remarks: e.target.value })}
              placeholder="Add any remarks..."
              className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 resize-none"/>
          </div>

          <div className="flex justify-end mt-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0"/>
              Show in Discharge Summary
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
