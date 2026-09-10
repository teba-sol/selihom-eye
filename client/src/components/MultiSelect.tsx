import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select...', disabled = false }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && setOpen(v => !v)}
        className={`min-h-[38px] w-full px-2 py-1.5 border rounded-md bg-white flex flex-wrap gap-1 items-center transition-colors ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' :
          open ? 'border-blue-500 ring-1 ring-blue-200 cursor-pointer' : 'border-slate-300 hover:border-slate-400 cursor-pointer'
        }`}
      >
        {value.length === 0
          ? <span className="text-slate-400 text-sm">{placeholder}</span>
          : value.map(v => (
              <span key={v} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium text-slate-700 max-w-[200px]">
                <span className="truncate">{v}</span>
                {!disabled && (
                  <button type="button" onMouseDown={e => { e.stopPropagation(); toggle(v); }}
                    className="text-slate-400 hover:text-red-500 shrink-0 leading-none">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
        }
        <ChevronDown className="w-4 h-4 text-slate-400 ml-auto shrink-0" />
      </div>

      {open && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-56 overflow-y-auto">
          <div className="sticky top-0 bg-white px-2 pt-2 pb-1 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              onClick={e => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400"
            />
          </div>
          {filtered.length === 0
            ? <div className="px-3 py-2 text-xs text-slate-400 italic">No matches</div>
            : filtered.map(opt => (
                <div key={opt} onMouseDown={e => { e.preventDefault(); toggle(opt); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${value.includes(opt) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                  {opt}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
