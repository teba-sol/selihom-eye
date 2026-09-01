import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  gregorianToJDN,
  jdnToEthiopic,
  ethiopicToJDN,
  jdnToGregorian,
  formatEthiopianDate,
} from '../lib/formatters';

const ETH_MONTHS = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
];

function isEthiopianLeap(year: number) {
  return year % 4 === 3;
}

function daysInEthiopianMonth(year: number, month: number) {
  if (month === 13) return isEthiopianLeap(year) ? 6 : 5;
  return 30;
}

// Gregorian ISO date (YYYY-MM-DD) -> Ethiopian {y,m,d}
function isoToEthiopian(iso: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return jdnToEthiopic(gregorianToJDN(y, m, d));
}

// Ethiopian weekday offset for the 1st of the month (Sunday=0)
function ethiopianMonthStartWeekday(year: number, month: number) {
  const jdn = ethiopicToJDN(year, month, 1);
  return (jdn + 1) % 7; // 1992-01-01(Meskerem 1) was a Sunday
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EthiopianDatePickerProps {
  value: string; // Gregorian YYYY-MM-DD
  onChange: (gregorianIso: string) => void;
}

export const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = isoToEthiopian(value) ?? isoToEthiopian(new Date().toISOString().slice(0, 10))!;
  const [viewY, setViewY] = useState(current.year);
  const [viewM, setViewM] = useState(current.month);

  const todayEth = useMemo(() => {
    const d = new Date();
    return jdnToEthiopic(gregorianToJDN(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }, []);

  const grid = useMemo(() => {
    const dim = daysInEthiopianMonth(viewY, viewM);
    const startWeekday = ethiopianMonthStartWeekday(viewY, viewM);
    const cells: Array<{ day: number; gregIso: string | null } | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= dim; day++) {
      const greg = jdnToGregorian(ethiopicToJDN(viewY, viewM, day));
      const iso = `${greg.year}-${String(greg.month).padStart(2, '0')}-${String(greg.day).padStart(2, '0')}`;
      if (greg.month >= 1 && greg.month <= 12 && greg.day >= 1 && greg.day <= 31) {
        cells.push({ day, gregIso: iso });
      } else {
        cells.push({ day, gregIso: null });
      }
    }
    return cells;
  }, [viewY, viewM]);

  const prevMonth = () => {
    if (viewM === 1) { setViewM(13); setViewY(viewY - 1); }
    else { setViewM((m) => m - 1); }
  };
  const nextMonth = () => {
    if (viewM === 13) { setViewM(1); setViewY(viewY + 1); }
    else { setViewM((m) => m + 1); }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border border-slate-300 rounded bg-white text-left hover:bg-slate-50"
      >
        <span className="text-slate-800">{value ? formatEthiopianDate(value) : 'Select date'}</span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 w-72">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold text-slate-800">
                {ETH_MONTHS[viewM - 1]} {viewY}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-[10px] font-bold text-slate-400">{wd}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, i) => {
                if (!cell || !cell.gregIso) return <div key={i} />;
                const isSel = value === cell.gregIso;
                const isToday = todayEth.year === viewY && todayEth.month === viewM && todayEth.day === cell.day;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { onChange(cell.gregIso!); setOpen(false); }}
                    className={`w-8 h-8 rounded text-xs flex items-center justify-center transition-colors ${
                      isSel
                        ? 'bg-[#2563eb] text-white font-bold'
                        : isToday
                          ? 'bg-blue-50 text-[#2563eb] font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
