import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Stethoscope, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { SURGERY_STATUSES, SURGERY_STATUS_LABELS } from '../lib/surgery';

export interface SurgeryListItem {
  id: string;
  encounterId: string;
  patientId: string;
  index: number;
  type: string;
  otherName: string;
  eye: string;
  dateOfSurgery: string;
  surgeon: string;
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RE-SCHEDULED';
  remarks: string | null;
  showInDischarge: boolean;
  details: {
    type?: string;
    otherName?: string;
    status?: string;
    plannedOn?: string;
    completedOn?: string;
    outcome?: string;
    cancelledReason?: string;
    cataractDetails?: Record<string, unknown> | null;
    genericDetails?: Record<string, unknown> | null;
  } | null;
  createdAt: string;
  encounterDate: string;
  patientName: string;
  mrn: string;
  doctorName: string;
}

const STATUS_COLORS: Record<SurgeryListItem['status'], string> = {
  PLANNED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  'RE-SCHEDULED': 'bg-blue-100 text-blue-700',
};

function StatusBadge({ status }: { status: SurgeryListItem['status'] }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[status]}`}>
      {SURGERY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function displayType(s: SurgeryListItem): string {
  if (s.type === 'Other (Enter Manually)') return s.otherName?.trim() || 'Other';
  return s.type || '—';
}

function clinicalSuffix(eye: string): 'Od' | 'Os' {
  return eye === 'OS' ? 'Os' : 'Od';
}

function strVal(v: unknown): string {
  return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
}

function clinicalOf(s: SurgeryListItem) {
  const cat = s.details?.cataractDetails as Record<string, unknown> | undefined;
  const gen = s.details?.genericDetails as Record<string, unknown> | undefined;
  const sfx = clinicalSuffix(s.eye || '');
  const biometry = (cat?.[`biometry${sfx === 'Os' ? 'Os' : 'Od'}`] ?? {}) as Record<string, unknown>;
  return {
    iolPower: strVal(biometry?.iol),
    k1: strVal(biometry?.k1),
    k2: strVal(biometry?.k2),
    axl: strVal(biometry?.axl),
    preOpVa: strVal(cat?.[`preOpVa${sfx}`] ?? gen?.[`preOpVa${sfx}`]),
    postOpVa: strVal(cat?.[`postOpDay1Va${sfx}`] ?? gen?.[`postOpDay1Va${sfx}`]),
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value || '—'}</span>
    </div>
  );
}

const CUSTOM_KEYS = new Set([
  'customPreOpLabels',
  'customPostOpLabels',
  'customIntraOpLabels',
  'customSurgicalFieldLabels',
]);

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/Va(Od|Os)/g, 'VA $1')
    .replace(/Iop(Od|Os)/g, 'IOP $1')
    .replace(/Iol(Ac|No|Pc)(Od|Os)/g, 'IOL $1 $2')
    .replace(/(Od|Os)/g, '$1')
    .trim();
}

function isObjectValue(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function FieldRow({ label, value }: { label: string; value: unknown }) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  if (!text.trim()) return null;
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 truncate">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right break-words max-w-[70%]">{text}</span>
    </div>
  );
}

// Turns unknown-valued entries into FieldRow elements, flattening object values
// (e.g. { od, os } or { k1, k2, axl, iol }) into a single readable row.
function objectRows(entries: [string, unknown][]): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const [k, v] of entries) {
    if (isObjectValue(v)) {
      const scalar = Object.entries(v).filter(
        ([, x]) => (typeof x === 'string' || typeof x === 'number') && String(x).trim()
      );
      if (scalar.length === 0) continue;
      out.push(
        <FieldRow key={k} label={prettifyKey(k)} value={scalar.map(([kk, vv]) => `${kk}: ${String(vv)}`).join(',  ')} />
      );
    } else if ((typeof v === 'string' || typeof v === 'number') && String(v).trim()) {
      out.push(<FieldRow key={k} label={prettifyKey(k)} value={v} />);
    }
  }
  return out;
}

function ObjectBlock({ title, obj }: { title: string; obj: Record<string, unknown> }) {
  const entries = Object.entries(obj).filter(([k]) => !CUSTOM_KEYS.has(k));
  const scalar = entries.filter(([, v]) => !isObjectValue(v)) as [string, unknown][];
  const objectEntries = entries.filter(([, v]) => isObjectValue(v)) as [string, Record<string, unknown>][];

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
      <p className="text-xs font-bold text-slate-500 uppercase mb-2">{title}</p>
      {objectEntries.map(([k, v]) => {
        const rows = objectRows(Object.entries(v));
        if (rows.length === 0) return null;
        return (
          <div key={k} className="mt-2">
            <p className="text-[11px] font-bold text-slate-600">{prettifyKey(k)}</p>
            <div className="mt-1 rounded bg-white border border-slate-200 px-3 py-1">
              {rows}
            </div>
          </div>
        );
      })}
      {objectRows(scalar)}
    </div>
  );
}

function DetailBlock({ title, obj }: { title: string; obj?: Record<string, unknown> | null }) {
  if (!obj || Object.keys(obj).length === 0) return null;
  return <ObjectBlock title={title} obj={obj} />;
}

function KeyMeasure({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="block text-base font-bold text-slate-800">{value || '—'}</span>
    </div>
  );
}

export const SurgeriesPage: React.FC = () => {
  const [surgeries, setSurgeries] = useState<SurgeryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [surgeonFilter, setSurgeonFilter] = useState('');
  const [viewing, setViewing] = useState<SurgeryListItem | null>(null);

  const fetchSurgeries = async () => {
    try {
      setLoading(true);
      const data = await api.get<SurgeryListItem[]>('/clinical/surgeries');
      setSurgeries(data ?? []);
    } catch {
      setSurgeries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeries();
  }, []);

  const surgeons = useMemo(() => {
    const set = new Set<string>();
    surgeries.forEach((s) => { if (s.surgeon?.trim()) set.add(s.surgeon.trim()); });
    return Array.from(set).sort();
  }, [surgeries]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return surgeries.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (surgeonFilter && s.surgeon !== surgeonFilter) return false;
      if (q && !`${s.patientName} ${s.mrn}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [surgeries, searchQuery, statusFilter, surgeonFilter]);

  const viewingClinical = viewing ? clinicalOf(viewing) : null;

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-9 h-9 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </span>
        <h1 className="text-2xl font-semibold text-[#2563eb]">Surgeries</h1>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name or MRN..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="">All statuses</option>
          {SURGERY_STATUSES.map((st) => (
            <option key={st} value={st}>{SURGERY_STATUS_LABELS[st]}</option>
          ))}
        </select>
        <select
          value={surgeonFilter}
          onChange={(e) => setSurgeonFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="">All surgeons</option>
          {surgeons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading surgeries...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">No surgeries found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-bold text-slate-500 uppercase">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Eye</th>
                <th className="px-4 py-3">IOL Power</th>
                <th className="px-4 py-3">Pre-op VA</th>
                <th className="px-4 py-3">Post-op VA</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Surgeon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const cl = clinicalOf(s);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.patientName || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{s.mrn || '—'}</td>
                    <td className="px-4 py-3">{displayType(s)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.eye || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{cl.iolPower || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{cl.preOpVa || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{cl.postOpVa || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.dateOfSurgery || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.surgeon || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setViewing(s)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* View detail modal */}
      {viewing && viewingClinical && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 overflow-y-auto" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#1E3A8A]">Surgery Details</h2>
              <button type="button" onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Row label="Patient" value={`${viewing.patientName} (${viewing.mrn})`} />
                <Row label="Doctor" value={viewing.doctorName} />
                <Row label="Type" value={displayType(viewing)} />
                <Row label="Eye" value={viewing.eye} />
                <Row label="Date of Surgery" value={viewing.dateOfSurgery} />
                <Row label="Surgeon" value={viewing.surgeon} />
                <Row label="Status" value={SURGERY_STATUS_LABELS[viewing.status] ?? viewing.status} />
                <Row label="Remarks" value={viewing.remarks ?? ''} />
                {viewing.status === 'CANCELLED' && viewing.details?.cancelledReason ? (
                  <Row label="Cancellation Reason" value={viewing.details.cancelledReason} />
                ) : null}
              </div>

              {/* Key measurements summary */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Key Measurements</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <KeyMeasure label="IOL Power" value={viewingClinical.iolPower} />
                  <KeyMeasure label="K1" value={viewingClinical.k1} />
                  <KeyMeasure label="K2" value={viewingClinical.k2} />
                  <KeyMeasure label="AXL" value={viewingClinical.axl} />
                  <KeyMeasure label="Pre-op VA" value={viewingClinical.preOpVa} />
                  <KeyMeasure label="Post-op VA" value={viewingClinical.postOpVa} />
                </div>
              </div>

              <div className="space-y-3">
                {viewing.details?.cataractDetails && (
                  <DetailBlock title="Cataract Details" obj={viewing.details.cataractDetails} />
                )}
                {viewing.details?.genericDetails && (
                  <DetailBlock title="Surgery Details" obj={viewing.details.genericDetails} />
                )}
                {viewing.details && (
                  <DetailBlock
                    title="General"
                    obj={(() => {
                      const { cataractDetails, genericDetails, ...rest } = viewing.details;
                      return rest;
                    })()}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-[#1e3a5f] text-white hover:bg-[#2a4a78]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
