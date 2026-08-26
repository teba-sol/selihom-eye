import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { RotateCcw } from 'lucide-react';

const CLINICAL_COLORS = [
  { label: 'Scar Tissue', hex: '#000000', name: 'Black' },
  { label: 'Fluorescein Staining', hex: '#16A34A', name: 'Green' },
  {label: 'Inflammation / Infiltrate', hex: '#EA580C', name: 'Orange' },
  { label: 'Blood / Congestion', hex: '#DC2626', name: 'Red' },
];

export const AnteriorDrawingView: React.FC = () => {
  const [selectedEye, setSelectedEye] = useState<'Right Eye' | 'Left Eye'>('Right Eye');
  const [activeColor, setActiveColor] = useState<string>('#000000');
  const [remarks, setRemarks] = useState('Central scar noted on right cornea.');
  const [showInDischarge, setShowInDischarge] = useState(true);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

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
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

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
    }
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-[#2563eb]">Drawing (Anterior Segment)</h1>

        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5">
          {(['Right Eye', 'Left Eye'] as const).map((eye) => (
            <button
              key={eye}
              type="button"
              onClick={() => setSelectedEye(eye)}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                selectedEye === eye
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {eye}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative h-[320px] w-[320px] rounded-full border-4 border-slate-300 bg-white shadow-inner overflow-hidden mb-5">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#0F766E" strokeWidth="1" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#0F766E" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#0F766E" strokeWidth="0.8" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#0F766E" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#0F766E" strokeWidth="0.5" />
          </svg>
          <canvas ref={canvasElRef} />
        </div>

        <div className="flex items-center gap-2 mb-6">
          {CLINICAL_COLORS.map((col) => (
            <button
              key={col.name}
              type="button"
              onClick={() => changeColor(col.hex)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                activeColor === col.hex
                  ? 'border-slate-800 bg-slate-100 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.hex }} />
              <span>{col.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
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
