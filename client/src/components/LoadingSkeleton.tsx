import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 8,
  cols = 6,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-4 px-4 py-3.5 bg-slate-50 border-b-2 border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-slate-200 rounded-full animate-pulse"
            style={{ width: `${80 - (i % 3) * 10}%` }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={`flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 ${
            r % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
          }`}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 bg-slate-200/80 rounded-full animate-pulse"
              style={{ width: `${45 + ((r * 3 + c * 7) % 45)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const PageLoader: React.FC<{ label?: string }> = ({ label }) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 animate-pulse" />
      <div className="space-y-2 w-48">
        <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/4" />
      </div>
      {label && <p className="text-xs text-slate-400">{label}</p>}
    </div>
  </div>
);