import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Stethoscope, Activity, FileText, AlertCircle, Printer } from 'lucide-react';
import { api } from '../lib/api';
import { downloadSurgeryDetailPdf } from '../lib/generatePdf';
import { SURGERY_STATUSES, SURGERY_STATUS_LABELS } from '../lib/surgery';
import { TableSkeleton } from '../components/LoadingSkeleton';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED';
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
    unifiedDetails?: Record<string, unknown> | null;
  } | null;
  createdAt: string;
  encounterDate: string;
  patientName: string;
  mrn: string;
  doctorName: string;
}

const STATUS_COLORS: Record<SurgeryListItem['status'], string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const STATUS_ICONS: Record<SurgeryListItem['status'], string> = {
  PLANNED: '📋',
  COMPLETED: '✅',
  CANCELLED: '❌',
};

function StatusBadge({ status }: { status: SurgeryListItem['status'] }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[status]}`}>
      {STATUS_ICONS[status]} {SURGERY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function displayType(s: SurgeryListItem): string {
  if (s.type === 'Other (Enter Manually)') return s.otherName?.trim() || 'Other';
  return s.type || '—';
}

function strVal(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return '';
}

function getUnifiedDetails(s: SurgeryListItem): Record<string, unknown> | null {
  // Check if details exists and has unifiedDetails
  if (s.details?.unifiedDetails) {
    return s.details.unifiedDetails as Record<string, unknown>;
  }
  
  // If details is null or undefined, return null
  if (!s.details) {
    return null;
  }
  
  // If unifiedDetails is not found, check if the details object itself contains the data
  // (some backends might store the data directly in details)
  const details = s.details as Record<string, unknown>;
  if (details.diagnosis || details.preOpVaOd || details.preOpVaOs) {
    return details;
  }
  
  return null;
}

function getClinicalData(s: SurgeryListItem) {
  // First try to get unifiedDetails
  let details = getUnifiedDetails(s);
  
  // If no details found, try to use the main surgery fields
  let iolPower = '';
  let preOpVa = '';
  let postOpVa = '';
  let diagnosis = '';
  let surgeon = s.surgeon || '';
  let dateOfSurgery = s.dateOfSurgery || '';
  let eyeToBeOperated = s.eye || '';
  let iopOd = '';
  let iopOs = '';
  
  if (details) {
    // Try to get data from unifiedDetails
    diagnosis = strVal((details as any)?.diagnosis || '');
    surgeon = strVal((details as any)?.surgeon || surgeon);
    dateOfSurgery = strVal((details as any)?.dateOfSurgery || dateOfSurgery);
    eyeToBeOperated = strVal((details as any)?.eyeToBeOperated || eyeToBeOperated);
    
    // Get VA based on eye - try both formats
    const sfx = s.eye === 'OS' ? 'Os' : 'Od';
    preOpVa = strVal((details as any)?.[`preOpVa${sfx}`] || '');
    if (!preOpVa) {
      // Try alternate format without suffix
      preOpVa = strVal((details as any)?.preOpVa || '');
    }
    
    postOpVa = strVal((details as any)?.[`postOpDay1Va${sfx}`] || '');
    if (!postOpVa) {
      postOpVa = strVal((details as any)?.postOpVa || '');
    }
    
    // Get IOP
    iopOd = strVal((details as any)?.preOpIopOd || '');
    iopOs = strVal((details as any)?.preOpIopOs || '');
    
    // Get IOL from biometry
    const biometryOd = (details as any)?.biometryOd || {};
    const biometryOs = (details as any)?.biometryOs || {};
    iolPower = strVal(biometryOd?.iol || biometryOs?.iol || '');
    
    if (!iolPower) {
      iolPower = strVal((details as any)?.iolPcOd || (details as any)?.iolPcOs || '');
    }
  }
  
  // If still no diagnosis, try to get it from the main object
  if (!diagnosis && s.details) {
    diagnosis = strVal((s.details as any)?.diagnosis || '');
  }
  
  // Debug log to see what we're getting
  console.log('Clinical data for surgery:', {
    id: s.id,
    type: s.type,
    diagnosis,
    preOpVa,
    postOpVa,
    iolPower,
    surgeon,
    dateOfSurgery,
    eyeToBeOperated,
    details: s.details,
  });
  
  return {
    iolPower,
    preOpVa,
    postOpVa,
    diagnosis,
    surgeon,
    dateOfSurgery,
    eyeToBeOperated,
    iopOd,
    iopOs,
  };
}

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
  const entries = Object.entries(obj);
  const scalar = entries.filter(([, v]) => !isObjectValue(v)) as [string, unknown][];
  const objectEntries = entries.filter(([, v]) => isObjectValue(v)) as [string, Record<string, unknown>][];

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
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
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<SurgeryListItem | null>(null);

  const fetchSurgeries = async () => {
    try {
      setLoading(true);
      const data = await api.get<SurgeryListItem[]>('/clinical/surgeries');
      console.log('Fetched surgeries:', data);
      
      // Log each surgery's details to debug
      data?.forEach(s => {
        console.log(`Surgery ${s.id}:`, {
          type: s.type,
          eye: s.eye,
          surgeon: s.surgeon,
          dateOfSurgery: s.dateOfSurgery,
          details: s.details,
          unifiedDetails: s.details?.unifiedDetails,
        });
      });
      
      setSurgeries(data ?? []);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
      setSurgeries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurgeries();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return surgeries.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (q && !`${s.patientName} ${s.mrn} ${s.type} ${s.surgeon} ${getClinicalData(s).diagnosis}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [surgeries, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const viewingClinical = viewing ? getClinicalData(viewing) : null;
  const viewingDetails = viewing ? getUnifiedDetails(viewing) : null;

  const handleDownload = () => {
    if (!viewing || !viewingClinical) return;
    downloadSurgeryDetailPdf({
      patientName: viewing.patientName,
      mrn: viewing.mrn,
      doctorName: viewing.doctorName,
      encounterDate: viewing.encounterDate,
      type: viewing.type,
      status: viewing.status,
      eye: viewingClinical.eyeToBeOperated || viewing.eye || '',
      diagnosis: viewingClinical.diagnosis,
      preOpVa: viewingClinical.preOpVa,
      postOpVa: viewingClinical.postOpVa,
      iolPower: viewingClinical.iolPower,
      iopOd: viewingClinical.iopOd,
      iopOs: viewingClinical.iopOs,
      dateOfSurgery: viewingClinical.dateOfSurgery || viewing.dateOfSurgery || '',
      surgeon: viewingClinical.surgeon || viewing.surgeon || '',
      remarks: viewing.remarks || '',
      details: viewingDetails,
    });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-white min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200/50">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Surgeries</h1>
          <p className="text-sm text-slate-500">View and manage all surgical records</p>
        </div>
        <div className="ml-auto text-sm text-slate-400">
          <span className="font-semibold text-slate-600">{filtered.length}</span> surgeries found
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by patient name, MRN, or surgery type..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
        >
          <option value="">All statuses</option>
          {SURGERY_STATUSES.map((st) => (
            <option key={st} value={st}>{SURGERY_STATUS_LABELS[st]}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('');
            setPage(1);
          }}
          className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={10} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No surgeries found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b-2 border-slate-200">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">MRN</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Eye</th>
                  <th className="px-4 py-3.5">IOL Power</th>
                  <th className="px-4 py-3.5">Pre-op VA</th>
                  <th className="px-4 py-3.5">Post-op VA</th>
                  <th className="px-4 py-3.5">Diagnosis</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((s) => {
                  const cl = getClinicalData(s);
                  const displayEye = cl.eyeToBeOperated || s.eye || '—';
                  
                  return (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3 font-semibold text-slate-800">{s.patientName || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.mrn || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{displayType(s)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          displayEye === 'OD' ? 'bg-blue-100 text-blue-700' : 
                          displayEye === 'OS' ? 'bg-indigo-100 text-indigo-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {displayEye}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{cl.iolPower || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{cl.preOpVa || '—'}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{cl.postOpVa || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{cl.diagnosis || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setViewing(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all group-hover:shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-medium">{filtered.length} surgeries</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} / Page</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                ‹
              </button>
              <span className="px-3 text-sm text-slate-600">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View detail modal */}
      {viewing && viewingClinical && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Surgery Details</h2>
                <p className="text-sm text-slate-500">{viewing.patientName} · MRN: {viewing.mrn}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setViewing(null)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="text-xl text-slate-400 hover:text-slate-600">×</span>
              </button>
            </div>
            
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Type</span>
                  <span className="text-sm font-bold text-slate-800">{displayType(viewing)}</span>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Eye</span>
                  <span className="text-sm font-bold text-slate-800">{viewingClinical.eyeToBeOperated || viewing.eye || '—'}</span>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Surgeon</span>
                  <span className="text-sm font-bold text-slate-800">{viewingClinical.surgeon || viewing.surgeon || '—'}</span>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Status</span>
                  <StatusBadge status={viewing.status} />
                </div>
              </div>

              {/* Diagnosis */}
              {viewingClinical.diagnosis && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Diagnosis
                  </p>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-sm text-slate-800">{viewingClinical.diagnosis}</p>
                  </div>
                </div>
              )}

              {/* Key measurements */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Key Measurements
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <KeyMeasure label="IOL Power" value={viewingClinical.iolPower} />
                  <KeyMeasure label="Pre-op VA" value={viewingClinical.preOpVa} />
                  <KeyMeasure label="Post-op VA" value={viewingClinical.postOpVa} />
                  <KeyMeasure label="Date" value={viewingClinical.dateOfSurgery || viewing.dateOfSurgery || '—'} />
                </div>
                {(viewingClinical.iopOd || viewingClinical.iopOs) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <KeyMeasure label="IOP OD" value={viewingClinical.iopOd} />
                    <KeyMeasure label="IOP OS" value={viewingClinical.iopOs} />
                  </div>
                )}
              </div>

              {/* Full details */}
              {viewingDetails && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> All Details
                  </p>
                  <DetailBlock title="Surgery Details" obj={viewingDetails} />
                </div>
              )}

              {/* Remarks */}
              {viewing.remarks && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks</p>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <p className="text-sm text-slate-700">{viewing.remarks}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all"
              >
                <Printer className="w-4 h-4" /> Download / Print
              </button>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 transition-all hover:shadow-blue-300"
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