import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperCellProps {
  value: string;
  onChange: (value: string) => void;
  step?: number;
  decimals?: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
  className?: string;
}

// Compact in-cell stepper for refractive values (sphere/cylinder/axis/add).
// Unlike the shared StepperInput it does NOT force a leading "+" sign, so it
// is safe for axis/cylinder-style values. It still keeps the raw typed text
// while typing and only normalizes on step/blur.
export const StepperCell: React.FC<StepperCellProps> = ({
  value,
  onChange,
  step = 0.25,
  decimals = 2,
  min,
  max,
  ariaLabel,
  className = '',
}) => {
  const current = () => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };

  const format = (n: number) => n.toFixed(decimals);

  const clamp = (n: number): number => {
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };

  const set = (n: number) => onChange(format(clamp(n)));

  return (
    <div
      className={`inline-flex items-stretch border border-slate-300 rounded overflow-hidden bg-white focus-within:border-[#2957a4] focus-within:ring-1 focus-within:ring-[#2957a4] ${className}`}
    >
      <button
        type="button"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease'}
        onClick={() => set(current() - step)}
        disabled={min !== undefined && current() - step < min}
        className="w-7 shrink-0 self-stretch flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          const n = parseFloat(value);
          if (Number.isFinite(n)) onChange(format(clamp(n)));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            set(current() + step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            set(current() - step);
          }
        }}
        placeholder="-"
        className="w-full min-w-0 px-1 py-1.5 text-center text-sm font-semibold text-slate-800 outline-none"
      />
      <button
        type="button"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase'}
        onClick={() => set(current() + step)}
        disabled={max !== undefined && current() + step > max}
        className="w-7 shrink-0 self-stretch flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
};
