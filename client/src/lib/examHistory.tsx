import type { ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { vaVal, vaHasData } from '../components/ExamDetails';
import { formatEthiopianDate } from './formatters';

export function fmtDate(value: unknown): string {
  if (!value) return '';
  const str = String(value);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(`${str}T00:00:00`)
    : new Date(str);
  if (isNaN(d.getTime())) return str;
  return formatEthiopianDate(d);
}

export function humanize(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export interface AddendumEntry {
  author: string | null;
  at: string | null;
  text: string;
}

const ADDENDUM_BLOCK_RE = /^\[Addendum recorded(?: by (.+?))? on ([^\]]+)\]:[\s]*([\s\S]*)$/;

export function parseAddendums(raw: string | null | undefined): AddendumEntry[] {
  if (!raw) return [];
  return raw
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const m = block.match(ADDENDUM_BLOCK_RE);
      if (!m) return { author: null, at: null, text: block };
      return { author: m[1]?.trim() || null, at: m[2]?.trim() || null, text: m[3]?.trim() || '' };
    })
    .filter((e) => e.text);
}

export function doctorName(first: string | null | undefined, last: string | null | undefined): string {
  if (!first && !last) return '';
  const alreadyPrefixed = /^dr[.]?\s/i.test(first || '');
  return `${alreadyPrefixed ? '' : 'Dr. '}${first ?? ''} ${last ?? ''}`.trim();
}

export function StatusBadge({ entry }: { entry: ExamHistoryEntry }) {
  if (entry.isLocked) {
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Locked · Finalized</span>;
  }
  const status = entry.appointmentStatus ? humanize(entry.appointmentStatus) : 'Recorded';
  const color = entry.appointmentStatus === 'COMPLETED'
    ? 'bg-emerald-100 text-emerald-700'
    : entry.appointmentStatus === 'IN_EXAM'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-slate-100 text-slate-600';
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{status}</span>;
}

export function SummaryChips({ entry }: { entry: ExamHistoryEntry }) {
  const va = entry.visualAcuity;
  const tono = entry.tonometry;
  const dx = Array.isArray(entry.diagnoses) ? entry.diagnoses.map((d: any) => d?.title).filter(Boolean) : [];
  const hasVa = vaHasData(va);
  const vaBest = (eye: 'od' | 'os' | 'ou'): string =>
    vaVal(va, eye, 'dist', 'unaided') || vaVal(va, eye, 'dist', 'aided');
  const vaOd = hasVa ? vaBest('od') : '';
  const vaOs = hasVa ? vaBest('os') : '';
  const vaOu = hasVa && !vaOd && !vaOs ? vaBest('ou') : '';
  const items: Array<[string, string]> = [];
  if (vaOd) items.push(['VA OD', vaOd]);
  if (vaOs) items.push(['VA OS', vaOs]);
  if (vaOu) items.push(['VA OU', vaOu]);
  if (tono?.odIop) items.push(['IOP OD', `${tono.odIop} mmHg`]);
  if (tono?.osIop) items.push(['IOP OS', `${tono.osIop} mmHg`]);
  if (dx.length) items.push(['Diagnosis', dx.join(', ')]);
  if (items.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map(([label, value]) => (
        <span key={label} className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
          <b className="text-slate-400">{label}:</b> {value}
        </span>
      ))}
    </div>
  );
}