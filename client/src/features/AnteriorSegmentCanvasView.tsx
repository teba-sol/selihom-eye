import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEncounterStore } from '../store/useEncounterStore';
import { Eraser, RotateCcw, Brush, Eye } from 'lucide-react';

const CLINICAL_COLORS = [
  { label: 'Scar Tissue / Opacity', hex: '#000000', code: 'BLACK' },
  { label: 'Fluorescein Staining', hex: '#16A34A', code: 'GREEN' },
  { label: 'Active Infiltrate / Flare', hex: '#EA580C', code: 'ORANGE' },
  { label: 'Neovascularization / Blood', hex: '#DC2626', code: 'RED' },
];

export const AnteriorSegmentCanvasView: React.FC = () => {
  const { slitLamp, updateSlitLamp, odCanvasVectors, osCanvasVectors, setCanvasVectors } = useEncounterStore();
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');
  const [activeColor, setActiveColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(3);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    // Destroy existing canvas on remount
    if (fabricRef.current) {
      fabricRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasElRef.current, {
      isDrawingMode: true,
      width: 320,
      height: 320,
      backgroundColor: 'transparent',
    });

    fabricRef.current = canvas;

    const brush = new fabric.PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    // Load initial vectors for selected eye
    const initialData = selectedEye === 'OD' ? odCanvasVectors : osCanvasVectors;
    if (initialData) {
      try {
        canvas.loadFromJSON(JSON.parse(initialData)).then(() => canvas.renderAll());
      } catch (e) {
        console.error('Failed to parse vector JSON', e);
      }
    }

    // Auto-save paths into Zustand on draw
    const saveState = () => {
      const json = JSON.stringify(canvas.toJSON());
      setCanvasVectors(selectedEye, json);
    };

    canvas.on('path:created', saveState);

    return () => {
      canvas.dispose();
    };
  }, [selectedEye]);

  const changeColor = (hex: string) => {
    setActiveColor(hex);
    if (fabricRef.current?.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.color = hex;
    }
  };

  const handleClear = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.renderAll();
      setCanvasVectors(selectedEye, '');
    }
  };

  return (
    <div className="p-8 max-w-5xl bg-white rounded-xl shadow-xs border border-slate-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2563eb]">Anterior Segment & Slit Lamp Canvas</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Annotate corneal scars, staining, and infiltrates using validated clinical color codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Slit Lamp Structural Findings */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Slit Lamp Structural Evaluation
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Lids & Lashes</label>
            <select
              value={slitLamp.lidsLashes}
              onChange={(e) => updateSlitLamp({ lidsLashes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-hidden focus:border-teal-600"
            >
              <option value="Normal">Normal & Clear</option>
              <option value="Blepharitis">Blepharitis (Anterior/Posterior)</option>
              <option value="MGD">Meibomian Gland Dysfunction (MGD)</option>
              <option value="Trichiasis">Trichiasis</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Conjunctiva</label>
            <select
              value={slitLamp.conjunctiva}
              onChange={(e) => updateSlitLamp({ conjunctiva: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-hidden focus:border-teal-600"
            >
              <option value="Clear">Normal / White & Quiet</option>
              <option value="Hyperemia">Hyperemia / Conjunctival Injection</option>
              <option value="Ciliary Flush">Ciliary Flush / Congestion</option>
              <option value="Follicles">Follicular Reaction</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Cornea</label>
            <select
              value={slitLamp.cornea}
              onChange={(e) => updateSlitLamp({ cornea: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-hidden focus:border-teal-600"
            >
              <option value="Clear">Clear & Compact</option>
              <option value="Corneal Scarring / Opacity">Corneal Scarring / Opacity</option>
              <option value="Epithelial Defect">Epithelial Defect (Fluorescein +)</option>
              <option value="Stromal Infiltrate">Stromal Infiltrate</option>
              <option value="Corneal Edema">Corneal Edema</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Anterior Chamber</label>
            <select
              value={slitLamp.anteriorChamber}
              onChange={(e) => updateSlitLamp({ anteriorChamber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-hidden focus:border-teal-600"
            >
              <option value="Quiet & Deep">Quiet & Deep (No cells/flare)</option>
              <option value="Shallow">Shallow</option>
              <option value="Cells & Flare 1+">Cells & Flare (1+)</option>
              <option value="Cells & Flare 3+">Cells & Flare (3+ / Hypopyon)</option>
            </select>
          </div>
        </div>

        {/* Right Side: Interactive Anatomical Eye Canvas */}
        <div className="lg:col-span-7 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center">
          {/* Eye Toggle */}
          <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 mb-4 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedEye('OD')}
              className={`px-5 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                selectedEye === 'OD'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              OD (Right Eye) Canvas
            </button>
            <button
              type="button"
              onClick={() => setSelectedEye('OS')}
              className={`px-5 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                selectedEye === 'OS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              OS (Left Eye) Canvas
            </button>
          </div>

          {/* Canvas Viewport with Cornea Slit Overlay */}
          <div className="relative h-[320px] w-[320px] rounded-full border-4 border-slate-300 bg-white shadow-inner overflow-hidden mb-4">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke="#0F766E" strokeWidth="1" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="#0F766E" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#0F766E" strokeWidth="0.8" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#0F766E" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#0F766E" strokeWidth="0.5" />
            </svg>
            <canvas ref={canvasElRef} />
          </div>

          {/* Color Palette Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mb-3">
            {CLINICAL_COLORS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeColor(item.hex)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-bold transition-all ${
                  activeColor === item.hex
                    ? 'border-slate-900 bg-white shadow-xs'
                    : 'border-slate-200 bg-white/60 hover:bg-white text-slate-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Canvas Actions */}
          <div className="w-full flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-[11px] font-semibold text-slate-400">
              Auto-saves to clinical record
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
