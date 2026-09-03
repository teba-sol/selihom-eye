import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

function fmtSigned(n: number): string {
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

export const StepperInput: React.FC<StepperInputProps> = ({
  value,
  onChange,
  step = 0.25,
  min,
  max,
  placeholder = '0.00',
  className = '',
  ariaLabel,
}) => {
  const current = parseFloat(value) || 0;

  const clamp = (n: number): number => {
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };

  const set = (n: number) => onChange(fmtSigned(clamp(n)));

  const btnBase =
    'w-8 shrink-0 self-stretch flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={`inline-flex items-stretch border border-slate-300 rounded overflow-hidden bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease'}
        onClick={() => set(current - step)}
        disabled={min !== undefined && current - step < min}
        className={btnBase}
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          const n = parseFloat(value);
          if (!Number.isNaN(n)) set(n);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            set(current + step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            set(current - step);
          }
        }}
        placeholder={placeholder}
        className="w-full min-w-0 px-2 py-2 text-center text-sm font-bold text-slate-800 outline-none"
      />
      <button
        type="button"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase'}
        onClick={() => set(current + step)}
        disabled={max !== undefined && current + step > max}
        className={btnBase}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
};
