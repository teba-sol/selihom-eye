import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { MousePointer2, Pencil, Eraser, Type, Circle, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { MultiSelect } from '../components/MultiSelect';
import { useEncounterStore } from '../store/useEncounterStore';
import { disposeFabricCanvas, isFabricCanvasLive, flushCanvasJson } from '../lib/fabricGuard';

// -- Multi-select tag options per structure ------------------------------------
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

// -- Anatomy SVG for one eye ---------------------------------------------------
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

// -- Drawing canvas for one eye ------------------------------------------------
function makeArrow(from: { x: number; y: number }, to: { x: number; y: number }, color: string) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const line = new fabric.Line([from.x, from.y, to.x, to.y], {
    stroke: color,
    strokeWidth: 2,
    selectable: false,
    evented: false,
  });
  const triangle = new fabric.Triangle({
    left: to.x,
    top: to.y,
    width: 12,
    height: 12,
    fill: color,
    originX: 'center',
    originY: 'center',
    angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90,
    selectable: false,
    evented: false,
  });
  return new fabric.Group([line, triangle], { selectable: true, evented: true });
}

function DrawingCanvas({ tool, color, brushSize, canvasRef, fabricRef, savedJson, onSave }: {
  tool: string; color: string; brushSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  savedJson?: string | null;
  onSave?: (json: string) => void;
}) {
  const savedJsonRef = useRef(savedJson);
  savedJsonRef.current = savedJson;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const previewRef = useRef<fabric.Object | null>(null);
  const pendingDisposeRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // A previous mount may still be finishing a deferred dispose (we defer
    // dispose() until loadFromJSON settles, so fabric keeps its `data-fabric`
    // mark on the element in the meantime). Forcing the stale dispose now is
    // safe — fabric's cleanupDOM runs synchronously — and clears the mark so
    // re-initialising the same element below cannot throw.
    const stale = pendingDisposeRef.current;
    pendingDisposeRef.current = null;
    if (stale) {
      try { stale.dispose().catch(() => {}); } catch { /* noop */ }
    }
    if (fabricRef.current) disposeFabricCanvas(fabricRef);
    const el = canvasRef.current;
    el.removeAttribute('data-fabric');
    el.classList.remove('lower-canvas', 'upper-canvas');

    const canvas = new fabric.Canvas(el, {
      width: 320, height: 280,
      backgroundColor: 'transparent',
    });
    fabricRef.current = canvas;

    let persistTimer: ReturnType<typeof setTimeout> | null = null;
    const schedulePersist = () => {
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        const json = flushCanvasJson(canvas);
        if (json) onSaveRef.current?.(json);
      }, 400);
    };
    canvas.on('after:render', schedulePersist);

    // Deferred JSON restore. loadFromJSON resolves asynchronously and, on
    // resolve, internally calls clear() on the canvas. If we dispose the
    // canvas before that promise settles, clear() runs on a destroyed canvas
    // (elements.lower.ctx is null) and throws. So we abort the load on
    // teardown and defer dispose() until the load has settled.
    const controller = new AbortController();
    let loadPromise: Promise<fabric.Canvas> | null = null;
    if (savedJsonRef.current) {
      loadPromise = canvas
        .loadFromJSON(savedJsonRef.current, undefined, { signal: controller.signal })
        .then((c) => {
          if (c === fabricRef.current) {
            c.renderAll();
            c.requestRenderAll();
          }
          return c;
        })
        .catch(() => canvas);
    }

    return () => {
      controller.abort();
      if (persistTimer) clearTimeout(persistTimer);
      const json = flushCanvasJson(canvas);
      if (json) onSaveRef.current?.(json);
      canvas.off('after:render', schedulePersist);
      fabricRef.current = null;
      pendingDisposeRef.current = canvas;
      const teardown = () => {
        if (pendingDisposeRef.current === canvas) pendingDisposeRef.current = null;
        try { canvas.dispose().catch(() => {}); } catch { /* noop */ }
      };
      if (loadPromise) loadPromise.finally(teardown);
      else teardown();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Strip preview + reset modes for non-drawing tools
    if (previewRef.current) { canvas.remove(previewRef.current); previewRef.current = null; }
    canvas.isDrawingMode = false;
    canvas.selection = tool === 'cursor';
    canvas.skipTargetFind = false;

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
      canvas.selection = false;
    }

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('mouse:dblclick');

    if (tool === 'cursor') {
      const onKey = (e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && canvas === fabricRef.current && canvas.getActiveObjects().length) {
          e.preventDefault();
          canvas.remove(...canvas.getActiveObjects());
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }

    if (tool === 'annotate') {
      const addText = (e: any) => {
        const opt = canvas.getScenePoint(e.e);
        const text = new fabric.IText('', { left: opt.x, top: opt.y, fill: color, fontSize: 14, fontFamily: 'Arial' });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.hiddenTextarea?.focus();
      };
      canvas.on('mouse:down', addText);
      return;
    }

    if (tool === 'outline-circle') {
      canvas.on('mouse:down', (e: any) => {
        shapeStartRef.current = canvas.getScenePoint(e.e);
      });
      canvas.on('mouse:move', (e: any) => {
        if (!shapeStartRef.current || !canvas || canvas !== fabricRef.current) return;
        const p = canvas.getScenePoint(e.e);
        if (!previewRef.current) {
          const circle = new fabric.Circle({
            left: shapeStartRef.current.x,
            top: shapeStartRef.current.y,
            radius: 0,
            stroke: color,
            strokeWidth: 2,
            fill: 'transparent',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          });
          canvas.add(circle);
          previewRef.current = circle;
        }
        const r = Math.hypot(p.x - shapeStartRef.current.x, p.y - shapeStartRef.current.y);
        (previewRef.current as fabric.Circle).set({ radius: r });
        canvas.requestRenderAll();
      });
      canvas.on('mouse:up', (e: any) => {
        if (!shapeStartRef.current || !previewRef.current) return;
        const p = canvas.getScenePoint(e.e);
        const r = Math.hypot(p.x - shapeStartRef.current.x, p.y - shapeStartRef.current.y);
        if (r > 2 && canvas === fabricRef.current) {
          canvas.remove(previewRef.current);
          const circle = new fabric.Circle({
            left: shapeStartRef.current.x,
            top: shapeStartRef.current.y,
            radius: r,
            stroke: color,
            strokeWidth: 2,
            fill: 'transparent',
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
          });
          canvas.add(circle);
        } else if (previewRef.current) {
          canvas.remove(previewRef.current);
        }
        previewRef.current = null;
        shapeStartRef.current = null;
      });
      return;
    }

    if (tool === 'arrow') {
      canvas.on('mouse:down', (e: any) => {
        shapeStartRef.current = canvas.getScenePoint(e.e);
      });
      canvas.on('mouse:move', (e: any) => {
        if (!shapeStartRef.current || !canvas || canvas !== fabricRef.current) return;
        const p = canvas.getScenePoint(e.e);
        if (!previewRef.current) {
          const line = new fabric.Line(
            [shapeStartRef.current.x, shapeStartRef.current.y, p.x, p.y],
            { stroke: color, strokeWidth: 2, selectable: false, evented: false },
          );
          canvas.add(line);
          previewRef.current = line;
        } else {
          (previewRef.current as fabric.Line).set({ x2: p.x, y2: p.y });
        }
        canvas.requestRenderAll();
      });
      canvas.on('mouse:up', (e: any) => {
        if (!shapeStartRef.current || !previewRef.current) return;
        const p = canvas.getScenePoint(e.e);
        if (canvas === fabricRef.current) canvas.remove(previewRef.current);
        const len = Math.hypot(p.x - shapeStartRef.current.x, p.y - shapeStartRef.current.y);
        if (len > 2 && canvas === fabricRef.current) {
          const arrow = makeArrow(shapeStartRef.current, p, color);
          canvas.add(arrow);
        }
        previewRef.current = null;
        shapeStartRef.current = null;
      });
      return;
    }

    if (tool === 'eraser') return;

    // Stamp tools — stamp repeatedly at the pointer
    const svg = STAMP_SHAPES[tool];
    if (svg) {
      const stampColor = TOOL_STAMP_COLORS[tool] ?? color;
      const place = (x: number, y: number) => {
        if (!canvas || canvas !== fabricRef.current) return;
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${svg(stampColor)}</svg>`)}`;
        fabric.Image.fromURL(dataUrl).then((img) => {
          if (canvas !== fabricRef.current) return;
          img.set({
            left: x - 12, top: y - 12,
            scaleX: 1, scaleY: 1,
            selectable: true, evented: true,
          });
          canvas.add(img);
          canvas.requestRenderAll();
        }).catch(() => {});
      };
      canvas.on('mouse:down', (e: any) => {
        const p = canvas.getScenePoint(e.e);
        place(p.x, p.y);
      });
      canvas.on('mouse:move', (e: any) => {
        if (!canvas || e.e.buttons === 0 || canvas !== fabricRef.current) return;
        const p = canvas.getScenePoint(e.e);
        place(p.x, p.y);
      });
      return;
    }
  }, [tool, color]);

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

// -- Toolbar -------------------------------------------------------------------
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

// SVG stamp shapes used both for toolbar icons and stamping onto the canvas.
const STAMP_SHAPES: Record<string, (c: string) => string> = {
  congestion: (c) => `<path d="M3 12 Q7 6 12 12 Q17 18 21 12" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 16 Q7 10 12 16 Q17 22 21 16" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  neovascularization: (c) => `<path d="M4 20 Q8 12 12 14 Q16 16 20 8" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12 14 Q14 10 16 12" stroke="${c}" stroke-width="1.5" fill="none"/>`,
  stromal: (c) => `<line x1="4" y1="8" x2="20" y2="8" stroke="${c}" stroke-width="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke="${c}" stroke-width="1.5"/><line x1="4" y1="16" x2="20" y2="16" stroke="${c}" stroke-width="1.5"/>`,
  ghost: (c) => `<line x1="4" y1="8" x2="20" y2="8" stroke="${c}" stroke-width="1" stroke-dasharray="2 2"/><line x1="4" y1="12" x2="20" y2="12" stroke="${c}" stroke-width="1" stroke-dasharray="2 2"/><line x1="4" y1="16" x2="20" y2="16" stroke="${c}" stroke-width="1" stroke-dasharray="2 2"/>`,
  punctate: (c) => [5, 10, 15, 8, 13, 18, 5, 10, 15].map((x, i) => `<circle cx="${x}" cy="${5 + i * 2}" r="1.2" fill="${c}"/>`).join(''),
  staining: (c) => `<ellipse cx="12" cy="12" rx="7" ry="5" fill="${c}" opacity="0.7"/>`,
  filaments: (c) => `<path d="M4 18 Q8 10 12 14 Q16 18 20 10" stroke="${c}" stroke-width="1.5" fill="none"/><path d="M6 16 Q10 8 14 12" stroke="${c}" stroke-width="1.5" fill="none"/>`,
  epithelial: (c) => `<rect x="4" y="8" width="4" height="4" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="10" y="8" width="4" height="4" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="16" y="8" width="4" height="4" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="7" y="13" width="4" height="4" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="13" y="13" width="4" height="4" fill="none" stroke="${c}" stroke-width="1.2"/>`,
  inflammatory: (c) => [6, 10, 14, 18, 8, 12, 16].map((x, i) => `<circle cx="${x}" cy="${6 + i * 2}" r="1.5" fill="${c}"/>`).join(''),
  pigment: (c) => [6, 11, 16, 8, 13, 18].map((x, i) => `<circle cx="${x}" cy="${7 + i * 2.5}" r="1.8" fill="${c}"/>`).join(''),
  hyphaema: (c) => `<rect x="4" y="16" width="16" height="4" fill="${c}" rx="1"/>`,
  hypopyon: (c) => `<rect x="4" y="17" width="16" height="3" fill="${c}" rx="1"/>`,
};

const StampIcon = ({ id }: { id: string }) => {
  const c = TOOL_STAMP_COLORS[id] ?? '#64748b';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${STAMP_SHAPES[id]?.(c) ?? '<rect x="3" y="3" width="18" height="18" rx="4" fill="#e2e8f0"/>'}</svg>`;
  return <span className="w-6 h-6" dangerouslySetInnerHTML={{ __html: svg }} />;
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

// -- Main Component ------------------------------------------------------------
type StructureObs = { od: string[]; os: string[]; sameForOS: boolean };

type AnteriorSegmentData = {
  activeSubTab: 'Form' | 'Diagram';
  instrument: 'Torch Light' | 'Slit Lamp';
  multiObs: Record<string, StructureObs>;
  diagram: { od: string; os: string };
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
  diagram: { od: '', os: '' },
  remarks: '',
  showInDischarge: true,
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
  const [subTab, setSubTab] = useState<'Form' | 'Diagram'>(f.activeSubTab ?? 'Form');
  const { instrument, remarks, showInDischarge } = f;

  const savedDiagram = { od: f.diagram?.od ?? '', os: f.diagram?.os ?? '' };
  const saveDiagram = (eye: 'od' | 'os') => (json: string) => {
    if (json !== (eye === 'od' ? savedDiagram.od : savedDiagram.os)) {
      patch({ diagram: { ...savedDiagram, [eye]: json } });
    }
  };

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
    [odFabricRef, osFabricRef].forEach((ref) => {
      if (ref.current && isFabricCanvasLive(ref.current)) {
        ref.current.clear();
        ref.current.renderAll();
      }
    });
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
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Form', 'Diagram'] as const).map(t => (
          <button key={t} type="button" onClick={() => setSubTab(t)}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${subTab === t ? 'text-blue-700 border-blue-700 font-semibold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* -- FORM TAB -- */}
      {subTab === 'Form' && (
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

      {/* -- DIAGRAM TAB -- */}
      {subTab === 'Diagram' && (
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
                  canvasRef={odCanvasRef} fabricRef={odFabricRef}
                  savedJson={savedDiagram.od} onSave={saveDiagram('od')} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">LEFT</span>
                <DrawingCanvas tool={activeTool} color={activeColor} brushSize={3}
                  canvasRef={osCanvasRef} fabricRef={osFabricRef}
                  savedJson={savedDiagram.os} onSave={saveDiagram('os')} />
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
