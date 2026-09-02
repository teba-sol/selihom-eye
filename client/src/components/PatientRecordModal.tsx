import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { X, FileText, Eye, Calendar, ChevronDown, ChevronRight, Printer, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Patient } from '../store/useAppStore';
import type { EncounterSnapshot } from '../store/useEncounterStore';
import { ExamDetails, Field, vaVal, vaHasData } from './ExamDetails';
import { formatDobEthiopian, formatAge } from '../lib/formatters';
import { usePatientRecordData, type ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { fmtDate, humanize, StatusBadge, SummaryChips, doctorName } from '../lib/examHistory';
import { api } from '../lib/api';

interface PatientRecordModalProps {
  patient: Patient;
  onClose: () => void;
  onOpenExam: () => void;
}

const DOCUMENT_TYPES = [
  'Previous eye examination',
  'Referral letter',
  'Previous prescription',
  'Surgical report',
  'Lab result',
  'Imaging / scan',
  'Other',
];

interface PaperDoc {
  id: string;
  patientId: string;
  encounterId: string | null;
  documentType: string;
  title: string;
  documentDate: string | null;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Prescription renderers (derived from existing encounter sectionData) ─────
function RxRows({ rx }: { rx?: Record<string, any> }) {
  const rows = Object.entries(rx || {}).filter(([, v]) => v && (v.sph || v.cyl || v.axis || v.prism || v.va));
  if (rows.length === 0) return null;
  const labelOf = (k: string) =>
    `${k.replace(/^(od|os)/, (m) => m.toUpperCase())}`
      .replace(/Dist/, 'Distance')
      .replace(/Near/, 'Near')
      .replace(/Inter/, 'Intermediate');
  return (
    <table className="w-full text-xs border-collapse mb-2">
      <thead><tr className="bg-[#1e3a5f] text-white">
        <th className="px-2 py-1 text-left">Eye</th>
        <th className="px-2 py-1 text-center">Sph</th>
        <th className="px-2 py-1 text-center">Cyl</th>
        <th className="px-2 py-1 text-center">Axis</th>
        <th className="px-2 py-1 text-center">Prism</th>
        <th className="px-2 py-1 text-center">Base</th>
        <th className="px-2 py-1 text-center">VA</th>
      </tr></thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-slate-100">
            <td className="px-2 py-1 font-bold text-slate-700">{labelOf(k)}</td>
            {['sph','cyl','axis','prism','base','va'].map((f) => (
              <td key={f} className="px-2 py-1 text-center">{v[f] || '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrescriptionDetails({ snap }: { snap: EncounterSnapshot }) {
  const fsp: any = snap.sectionData?.['final-spectacle-prescription'] ?? null;
  const fcl: any = snap.sectionData?.['final-contact-lens-specification'] ?? null;
  const sd: any = snap.sectionData?.['spectacle-dispensing'] ?? null;
  const meds = snap.patientMedications;
  const plan = snap.treatmentPathway;

  const hasAny =
    (fsp && (fsp.ipd || fsp.bvd || fsp.remarks || Object.values(fsp.rx || {}).some((v: any) => v?.sph))) ||
    (fcl && (fcl.clType || fcl.brand)) ||
    (sd && (sd.frameType || sd.lensType || sd.orderRef || sd.dispatchDate)) ||
    meds.length > 0 ||
    plan;

  if (!hasAny) return <p className="px-4 py-3 text-xs text-slate-400 italic">No prescription records for this visit.</p>;

  return (
    <div className="px-5 py-4 space-y-4 divide-y divide-slate-100">
      {fsp && (fsp.ipd || fsp.bvd || fsp.remarks || Object.values(fsp.rx || {}).some((v: any) => v?.sph)) && (
        <div>
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide mb-2">Final Spectacle Prescription</p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Field label="VA Type" value={fsp.vaType}/>
            <Field label="IPD" value={fsp.ipd ? `${fsp.ipd} mm` : null}/>
            <Field label="BVD" value={fsp.bvd ? `${fsp.bvd} mm` : null}/>
          </div>
          <RxRows rx={fsp.rx}/>
          {fsp.remarks && <p className="text-xs text-slate-500"><b>Remarks:</b> {fsp.remarks}</p>}
        </div>
      )}

      {fcl && (fcl.clType || fcl.brand) && (
        <div>
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide mb-2">Final Contact Lens Specification</p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Field label="Type" value={fcl.clType}/>
            <Field label="Brand" value={fcl.brand}/>
            <Field label="Modality" value={fcl.modality}/>
            <Field label="Material" value={fcl.material}/>
            <Field label="Solution" value={fcl.solution}/>
            <Field label="Schedule" value={fcl.wearingSchedule}/>
            <Field label="Review Date" value={fcl.reviewDate ? fmtDate(fcl.reviewDate) : null}/>
          </div>
          {(fcl.od && (fcl.od.bc || fcl.od.sph)) && (
            <table className="w-full text-xs border-collapse mb-2">
              <thead><tr className="bg-[#1e3a5f] text-white">
                <th className="px-2 py-1 text-left">Eye</th>
                <th className="px-2 py-1 text-center">BC</th>
                <th className="px-2 py-1 text-center">Dia</th>
                <th className="px-2 py-1 text-center">Sph</th>
                <th className="px-2 py-1 text-center">Cyl</th>
                <th className="px-2 py-1 text-center">Axis</th>
                <th className="px-2 py-1 text-center">Add</th>
                <th className="px-2 py-1 text-center">VA</th>
              </tr></thead>
              <tbody>
                {(['od','os'] as const).filter((e) => fcl[e]).map((e) => {
                  const s = fcl[e];
                  return (
                    <tr key={e} className="border-b border-slate-100">
                      <td className="px-2 py-1 font-bold text-slate-700">{e.toUpperCase()}</td>
                      {['bc','dia','sph','cyl','axis','add','va'].map((f) => (
                        <td key={f} className="px-2 py-1 text-center">{s[f] || '—'}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {fcl.sameForOs && <p className="text-[11px] text-slate-400 italic mb-1">OS mirrors OD.</p>}
          {fcl.remarks && <p className="text-xs text-slate-500"><b>Remarks:</b> {fcl.remarks}</p>}
        </div>
      )}

      {sd && (sd.frameType || sd.lensType || sd.orderRef || sd.dispatchDate || sd.price) && (
        <div>
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide mb-2">Spectacle Dispensing</p>
          <div className="grid grid-cols-3 gap-2">
            {sd.frameType && <Field label="Frame Type" value={sd.frameType}/>}
            {sd.frameBrand && <Field label="Frame Brand" value={sd.frameBrand}/>}
            {sd.frameRef && <Field label="Frame Ref" value={sd.frameRef}/>}
            {sd.lensType && <Field label="Lens Type" value={sd.lensType}/>}
            {sd.lensMaterial && <Field label="Lens Material" value={sd.lensMaterial}/>}
            {sd.lensBrand && <Field label="Lens Brand" value={sd.lensBrand}/>}
            {sd.coatings?.length > 0 && <Field label="Coatings" value={sd.coatings.join(', ')}/>}
            {sd.rightPd && <Field label="Right PD" value={sd.rightPd}/>}
            {sd.leftPd && <Field label="Left PD" value={sd.leftPd}/>}
            {sd.heightOd && <Field label="Height OD" value={sd.heightOd}/>}
            {sd.heightOs && <Field label="Height OS" value={sd.heightOs}/>}
            {sd.orderRef && <Field label="Order Ref" value={sd.orderRef}/>}
            {sd.labName && <Field label="Lab" value={sd.labName}/>}
            {sd.dispatchDate && <Field label="Dispatch Date" value={fmtDate(sd.dispatchDate)}/>}
            {sd.collectionMethod && <Field label="Collection" value={sd.collectionMethod}/>}
            {sd.price && <Field label="Price" value={sd.price}/>}
            {sd.advancePaid && <Field label="Advance Paid" value={sd.advancePaid}/>}
            {sd.remarks && <Field label="Remarks" value={sd.remarks} wide/>}
          </div>
        </div>
      )}

      {meds.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide mb-2">Medications ({meds.length})</p>
          <div className="space-y-1.5">
            {meds.map((m) => (
              <div key={m.id} className="text-xs bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex flex-wrap gap-2">
                <b className="text-slate-800">{m.drugName}</b>
                {m.dosage && <span className="text-slate-500">{m.dosage}</span>}
                <span className="text-slate-500">{m.frequency}</span>
                {m.route && <span className="text-slate-500">{m.route}</span>}
                {m.targetEye && <span className="text-slate-500">{m.targetEye}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {plan && (
        <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"><b>Treatment Pathway:</b> {plan}</div>
      )}
    </div>
  );
}

// ── Record row (DB-backed exam history) ──────────────────────────────────────
function RecordRow({ entry, snap, loading, getSnapshot, children }: {
  entry: ExamHistoryEntry;
  snap: EncounterSnapshot | null | undefined;
  loading: boolean;
  getSnapshot: (encounterId: string) => Promise<EncounterSnapshot | null>;
  children: (snap: EncounterSnapshot) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [localSnap, setLocalSnap] = useState<EncounterSnapshot | null | undefined>(snap);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (localSnap === undefined) {
      const s = await getSnapshot(entry.id);
      setLocalSnap(s);
    }
  };

  const shownSnap = localSnap !== undefined ? localSnap : snap;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button onClick={toggle}
        className="w-full flex items-start justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{fmtDate(entry.appointmentDate ?? entry.createdAt)}</span>
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 rounded-full px-2 py-0.5 uppercase tracking-wide">{entry.appointmentReason || 'Examination'}</span>
            <StatusBadge entry={entry}/>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {entry.doctor ? doctorName(entry.doctor.firstName, entry.doctor.lastName) : '—'}
          </p>
          <SummaryChips entry={entry}/>
        </div>
        <div className="ml-3 mt-0.5 flex items-center gap-2 shrink-0">
          {open ? <ChevronDown className="w-4 h-4 text-slate-400"/> : <ChevronRight className="w-4 h-4 text-slate-400"/>}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-white">
          {shownSnap
            ? children(shownSnap)
            : loading
              ? <div className="px-4 py-4 flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin"/> Loading examination…</div>
              : <p className="px-4 py-3 text-xs text-slate-400 italic">Could not load this examination.</p>}
        </div>
      )}
    </div>
  );
}

// ── Paper records tab (metadata-only registry) ───────────────────────────────
function PaperRecordsTab({ patientId }: { patientId: string }) {
  const [docs, setDocs] = useState<PaperDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PaperDoc[]>(`/patients/${patientId}/documents`);
      setDocs(data ?? []);
    } catch {
      // ignore — empty state shown
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/patients/${patientId}/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="p-5 flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin"/> Loading paper records…</div>;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 max-w-md">
          Paper records are a registry of physical or external documents — reports, referrals,
          previous prescriptions — brought by the patient. No files are stored.
        </p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5"/> Add paper record
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40"/>
          <p className="text-sm font-semibold text-slate-500">No paper records recorded</p>
          <p className="text-xs mt-1 max-w-xs mx-auto">Add an external report, referral, previous prescription, or other paper record.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">{doc.documentType}</span>
                  <span className="text-sm font-bold text-slate-800">{doc.title}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  <b>{fmtDate(doc.documentDate) || '-'}</b>
                  {doc.createdAt ? ` · Logged ${fmtDate(doc.createdAt)}` : ''}
                </p>
                {doc.notes && <p className="text-xs text-slate-500 mt-1 italic">"{doc.notes}"</p>}
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0 ml-3"
                title="Delete paper record">
                {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddPaperRecordModal
          patientId={patientId}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}

function AddPaperRecordModal({ patientId, onClose, onSaved }: {
  patientId: string; onClose: () => void; onSaved: () => void;
}) {
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [title, setTitle] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.post(`/patients/${patientId}/documents`, {
        documentType,
        title: title.trim(),
        documentDate: documentDate || null,
        notes: notes.trim() || null,
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save paper record.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Add paper record</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Document type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Previous glaucoma report"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Document date</label>
            <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Notes</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Patient presented physical copy…"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500"/>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-sm font-semibold rounded-md transition-colors">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin"/>} Save record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({ patient, onClose, onOpenExam }) => {
  const [tab, setTab] = useState<'info' | 'exams' | 'prescriptions' | 'papers'>('exams');
  const record = usePatientRecordData(patient.id);

  const getSnapshot = record.getSnapshot;

  // Most recent PRIOR finalized (locked) visit date, else "First Visit".
  const lastVisit = useMemo(() => {
    const finalized = record.history
      .filter((h) => h.isLocked)
      .map((h) => ({ raw: h.appointmentDate ?? h.createdAt, t: new Date(h.appointmentDate ?? h.createdAt).getTime() }))
      .filter((x) => !Number.isNaN(x.t));
    if (finalized.length === 0) return 'First Visit';
    const latest = finalized.reduce((a, b) => (b.t > a.t ? b : a));
    return fmtDate(latest.raw);
  }, [record.history]);

  const handlePrint = async () => {
    const tr = (label: string, value: string | null | undefined) =>
      value ? `<tr><td class="lbl">${label}</td><td class="val">${value}</td></tr>` : '';
    const secH = (title: string) => `<h3 class="sec-title">${title}</h3>`;
    const refTable = (label: string, r: any) => {
      if (!r || (!r.odSph && !r.osSph && !r.odVa && !r.osVa)) return '';
      return `
        <p class="sub-label">${label}</p>
        <table class="data-table">
          <thead><tr><th>Eye</th><th>Sph</th><th>Cyl</th><th>Axis</th><th>VA</th><th>Add</th></tr></thead>
          <tbody>
            <tr><td><b>OD</b></td><td>${r.odSph||'—'}</td><td>${r.odCyl||'—'}</td><td>${r.odAxis||'—'}</td><td>${r.odVa||'—'}</td><td>${r.odAdd||'—'}</td></tr>
            <tr><td><b>OS</b></td><td>${r.osSph||'—'}</td><td>${r.osCyl||'—'}</td><td>${r.osAxis||'—'}</td><td>${r.osVa||'—'}</td><td>${r.osAdd||'—'}</td></tr>
          </tbody>
        </table>
        ${r.pdBinocular ? `<p class="note">PD Binocular: ${r.pdBinocular} mm${r.bvdMm ? ` · BVD: ${r.bvdMm} mm` : ''}</p>` : ''}`;
    };

    const examSections: string[] = [];
    for (const entry of record.history) {
      const snap = await getSnapshot(entry.id);
      const dateStr = fmtDate(entry.appointmentDate ?? entry.createdAt);
      const statusBadge = entry.isLocked
        ? '<span class="badge badge-gray">Locked · Finalized</span>'
        : `<span class="badge badge-${entry.appointmentStatus==='COMPLETED'?'green':'purple'}">${humanize(entry.appointmentStatus)||'In progress'}</span>`;
      let body = '';

      if (!snap) {
        body = '<p class="empty">No clinical data recorded for this appointment.</p>';
      } else {
        const va = snap.visualAcuity;
        const ref = snap.refraction;
        const sl = snap.slitLamp;
        const tono = snap.tonometry;
        const spec = snap.spectaclesHistory;
        const cl = snap.contactLensHistory;
        const life = snap.lifestyleDemands;

        if (vaHasData(va)) {
          body += secH('Visual Acuity');
          body += `<table class="data-table">
            <thead><tr><th>Eye</th><th>Unaided</th><th>Aided</th><th>Pinhole</th></tr></thead>
            <tbody>
              <tr><td><b>OD (Right)</b></td><td>${vaVal(va,'od','dist','unaided')||'—'}</td><td>${vaVal(va,'od','dist','aided')||'—'}</td><td>${vaVal(va,'od','dist','pinhole')||'—'}</td></tr>
              <tr><td><b>OS (Left)</b></td><td>${vaVal(va,'os','dist','unaided')||'—'}</td><td>${vaVal(va,'os','dist','aided')||'—'}</td><td>${vaVal(va,'os','dist','pinhole')||'—'}</td></tr>
            </tbody></table>`;
        }
        if (ref && (ref.odSph||ref.osSph||ref.odVa||ref.osVa)) {
          body += secH('Refraction');
          body += refTable('Refraction Results', ref);
        }
        if (sl && (sl.lidsLashes||sl.conjunctiva||sl.cornea||sl.anteriorChamber||sl.irisLens)) {
          body += secH('Anterior Segment (Slit Lamp)');
          body += `<table class="info-table">
            ${tr('Lids & Lashes', sl.lidsLashes)}
            ${tr('Conjunctiva', sl.conjunctiva)}
            ${tr('Cornea', sl.cornea)}
            ${tr('Anterior Chamber', sl.anteriorChamber)}
            ${tr('Iris & Lens', sl.irisLens)}
          </table>`;
        }
        if (tono && (tono.odIop||tono.osIop)) {
          body += secH('Tonometry (IOP)');
          body += `<table class="data-table">
            <thead><tr><th>Eye</th><th>IOP</th><th>Method</th></tr></thead>
            <tbody>
              <tr><td><b>OD</b></td><td>${tono.odIop||'—'} mmHg</td><td rowspan="2">${tono.method}</td></tr>
              <tr><td><b>OS</b></td><td>${tono.osIop||'—'} mmHg</td></tr>
            </tbody></table>`;
        }
        if (snap.symptoms?.length) {
          body += secH(`Presenting Symptoms (${snap.symptoms.length})`);
          body += snap.symptoms.map((s) =>
            `<div class="row-item"><b>${s.name}</b> · ${s.eye} · ${s.durationValue} ${s.durationUnit} · ${s.frequency} · <span class="sev-${String(s.severity).toLowerCase()}">${s.severity}</span>${s.remarks ? ` · "${s.remarks}"` : ''}</div>`
          ).join('');
        }
        const activeOcular = Object.entries(snap.ocularHistory?.conditions||{}).filter(([,v]: any)=>v.active);
        if (activeOcular.length) {
          body += secH('Ocular History');
          body += `<table class="info-table">${activeOcular.map(([k,v]: any) =>
            tr(k.replace(/([A-Z])/g,' $1'), `${v.type} · ${v.eye}${v.date?` · ${v.date}`:''}${v.remarks?` · ${v.remarks}`:''}`)
          ).join('')}</table>`;
          if (snap.ocularHistory.generalRemarks) body += `<p class="note">${snap.ocularHistory.generalRemarks}</p>`;
        }
        const activeSystemic = Object.entries(snap.systemicHistory?.conditions||{}).filter(([,v]: any)=>(v as any).active);
        if (activeSystemic.length) {
          body += secH('Systemic History');
          body += `<table class="info-table">${activeSystemic.map(([k,v]: any) =>
            tr(k.replace(/([A-Z])/g,' $1'), `${v.type} · ${v.durationValue} ${v.durationUnit} · ${v.controlStatus}${v.remarks?` · ${v.remarks}`:''}`)
          ).join('')}</table>`;
          if (snap.systemicHistory.generalRemarks) body += `<p class="note">${snap.systemicHistory.generalRemarks}</p>`;
        }
        if (snap.patientMedications?.length) {
          body += secH(`Medications (${snap.patientMedications.length})`);
          body += snap.patientMedications.map((m) =>
            `<div class="row-item"><b>${m.drugName}</b>${m.dosage?` · ${m.dosage}`:''} · ${m.frequency}${m.route?` · ${m.route}`:''}${m.targetEye?` · ${m.targetEye}`:''} · ${m.compliance}</div>`
          ).join('');
        }
        if (snap.familyOcularHistory?.length || snap.familySystemicHistory?.length) {
          body += secH('Family History');
          if (snap.familyOcularHistory?.length) {
            body += '<p class="sub-label">Ocular</p>';
            body += snap.familyOcularHistory.map((f) =>
              `<div class="row-item"><b>${f.relation}</b> — ${f.condition}${f.notes?` · ${f.notes}`:''}</div>`
            ).join('');
          }
          if (snap.familySystemicHistory?.length) {
            body += '<p class="sub-label">Systemic</p>';
            body += snap.familySystemicHistory.map((f) =>
              `<div class="row-item"><b>${f.relation}</b> — ${f.condition}${f.notes?` · ${f.notes}`:''}</div>`
            ).join('');
          }
        }
        if (spec?.currentlyWears) {
          body += secH('Spectacles History');
          body += `<table class="info-table">
            ${tr('Type', spec.type)}
            ${tr('Age of Glasses', spec.ageOfCurrentGlasses)}
            ${tr('Material', spec.material)}
            ${tr('Coatings', spec.coating?.join(', '))}
            ${tr('Satisfaction', spec.satisfaction)}
            ${tr('Remarks', spec.remarks)}
          </table>`;
        }
        if (cl?.currentWearer) {
          body += secH('Contact Lens History');
          body += `<table class="info-table">
            ${tr('Modality', cl.modality)}
            ${tr('Wearing Hours/Day', `${cl.wearingHoursPerDay} hrs`)}
            ${tr('Solution Used', cl.solutionUsed)}
            ${tr('Cleaning Compliance', cl.complianceWithCleaning)}
            ${tr('Last Eye Check', cl.lastEyeCheckDate)}
            ${tr('Remarks', cl.remarks)}
          </table>`;
        }
        if (life && (life.occupation||life.screenTimeHoursPerDay||life.outdoorActivities)) {
          body += secH('Lifestyle & Demands');
          body += `<table class="info-table">
            ${tr('Occupation', life.occupation)}
            ${tr('Screen Time/Day', life.screenTimeHoursPerDay ? `${life.screenTimeHoursPerDay} hrs` : null)}
            ${tr('Outdoor Activities', life.outdoorActivities)}
            ${tr('Hobbies', life.hobbies)}
            ${tr('Workplace Lighting', life.lightingConditionWorkplace)}
            ${tr('Driving Requirements', life.drivingRequirements)}
          </table>`;
        }
        if (snap.diagnoses?.length || snap.counselingAdvice || snap.treatmentPathway) {
          body += secH('Assessment & Plan');
          if (snap.diagnoses?.length) {
            body += '<p class="sub-label">Diagnoses</p>';
            body += snap.diagnoses.map((d) =>
              `<div class="row-item"><b>${d.title}</b> <span class="eye-tag">(${d.eye})</span>${d.notes?` — ${d.notes}`:''}</div>`
            ).join('');
          }
          if (snap.counselingAdvice) body += `<div class="row-item"><b>Counseling:</b> ${snap.counselingAdvice}</div>`;
          if (snap.treatmentPathway) body += `<div class="row-item"><b>Treatment Pathway:</b> ${snap.treatmentPathway}</div>`;
        }
      }

      examSections.push(`
        <div class="visit-card">
          <div class="visit-header">
            <span class="visit-date">${dateStr}</span>
            <span class="visit-reason">${entry.appointmentReason || 'Examination'}</span>
            ${statusBadge}
          </div>
          <div class="visit-body">${body}</div>
        </div>`);
    }

    const today = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
    <title>Medical Record – ${patient.firstName} ${patient.lastName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',sans-serif;font-size:12px;color:#1e293b;padding:28px;background:#fff}
      h1{font-size:20px;font-weight:900;color:#0f2038;margin-bottom:2px}
      h2{font-size:15px;font-weight:800;color:#1e3a5f;margin:14px 0 4px}
      .clinic-tag{font-size:10px;color:#64748b;margin-bottom:12px}
      .patient-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:18px}
      .meta-field label{display:block;font-size:9px;font-weight:800;text-transform:uppercase;color:#94a3b8;letter-spacing:.05em;margin-bottom:2px}
      .meta-field span{font-weight:700;font-size:12px;color:#1e293b}
      .visit-card{border:1px solid #e2e8f0;border-radius:10px;margin-bottom:18px;overflow:hidden;page-break-inside:avoid}
      .visit-header{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f1f5f9;border-bottom:1px solid #e2e8f0}
      .visit-date{font-weight:800;font-size:12px;color:#1e3a5f}
      .visit-reason{font-size:11px;color:#64748b;flex:1}
      .visit-body{padding:10px 12px}
      .sec-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#2563eb;border-bottom:1px solid #dbeafe;padding-bottom:3px;margin:10px 0 6px}
      .sec-title:first-child{margin-top:0}
      .info-table{width:100%;border-collapse:collapse;margin-bottom:6px}
      .info-table .lbl{width:35%;padding:3px 6px;font-weight:700;color:#64748b;font-size:11px}
      .info-table .val{padding:3px 6px;color:#1e293b;font-size:11px}
      .data-table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}
      .data-table thead tr{background:#1e3a5f;color:#fff}
      .data-table th{padding:4px 6px;text-align:left;font-weight:700}
      .data-table td{padding:4px 6px;border-bottom:1px solid #f1f5f9}
      .row-item{padding:4px 6px;border-left:3px solid #2563eb;margin:3px 0;background:#f8fafc;font-size:11px;line-height:1.5}
      .sub-label{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin:6px 0 3px}
      .note{font-size:10px;color:#94a3b8;font-style:italic;margin-top:3px}
      .empty{font-size:11px;color:#94a3b8;font-style:italic;padding:6px 0}
      .badge{display:inline-block;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:800}
      .badge-green{background:#dcfce7;color:#166534}
      .badge-purple{background:#f3e8ff;color:#6b21a8}
      .badge-gray{background:#f1f5f9;color:#475569}
      .eye-tag{font-size:10px;color:#2563eb;font-weight:700}
      .sev-severe{color:#dc2626;font-weight:700}
      .sev-moderate{color:#d97706;font-weight:700}
      .sev-mild{color:#16a34a;font-weight:700}
      .footer{margin-top:28px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
      @media print{body{padding:16px}.visit-card{page-break-inside:avoid}}
    </style>
    </head><body>
      <h1>Patient Medical Record</h1>
      <p class="clinic-tag">SELIHOME Ophthalmic Medium Clinic — Confidential Clinical Document</p>

      <div class="patient-meta">
        <div class="meta-field"><label>MRN</label><span>${patient.mrn??`SEL-${patient.id}`}</span></div>
        <div class="meta-field"><label>Full Name</label><span>${patient.firstName} ${patient.lastName}</span></div>
        <div class="meta-field"><label>Grandfather</label><span>${patient.grandfatherName??'-'}</span></div>
        <div class="meta-field"><label>Gender</label><span>${patient.gender}</span></div>
        <div class="meta-field"><label>Date of Birth</label><span>${formatDobEthiopian(patient.dateOfBirth)}</span></div>
        <div class="meta-field"><label>Age</label><span>${formatAge(patient.dateOfBirth)}</span></div>
        <div class="meta-field"><label>Phone</label><span>${patient.phone}</span></div>
        <div class="meta-field"><label>Status</label><span>${patient.isNew?'New Patient':'Returning Patient'}</span></div>
        <div class="meta-field"><label>Address</label><span>${patient.address??'—'}</span></div>
      </div>

      <h2>Examination History — ${record.history.length} Visit${record.history.length!==1?'s':''}</h2>
      ${examSections.join('\n')}

      <div class="footer">
        <span>SELIHOME Ophthalmic Medium Clinic · Confidential Medical Record</span>
        <span>Printed: ${today}</span>
      </div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const tabs: Array<{ id: 'info'|'exams'|'prescriptions'|'papers'; label: string }> = [
    { id: 'info', label: 'Patient Info' },
    { id: 'exams', label: `Exam History (${record.history.length})` },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'papers', label: 'Paper Records' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{patient.firstName} {patient.lastName}</h2>
              <p className="text-xs text-slate-500">{patient.mrn??`SEL-${patient.id}`} · {formatAge(patient.dateOfBirth)} · {patient.gender}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
              <Printer className="w-3.5 h-3.5"/> Print
            </button>
            <button onClick={onOpenExam} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
              <Eye className="w-3.5 h-3.5"/> Open Exam
            </button>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${tab===t.id ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'info' && (
            <div className="p-5 grid grid-cols-2 gap-3">
              <Field label="MRN" value={patient.mrn??`SEL-${patient.id}`}/>
              <Field label="Full Name" value={`${patient.firstName} ${patient.lastName}`}/>
              <Field label="Grandfather" value={patient.grandfatherName ?? '-'}/>
              <Field label="Gender" value={patient.gender}/>
              <Field label="Date of Birth" value={formatDobEthiopian(patient.dateOfBirth)}/>
              <Field label="Age" value={formatAge(patient.dateOfBirth)}/>
              <Field label="Phone" value={patient.phone}/>
              <Field label="Address" value={patient.address??'—'} wide/>
              <Field label="Last Visit" value={lastVisit}/>
              <Field label="Status" value={patient.isNew ? 'New Patient' : 'Returning Patient'}/>
            </div>
          )}

          {tab === 'exams' && (
            <div className="p-5">
              {record.loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin"/> Loading examinations…</div>
              ) : record.history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40"/>
                  <p className="text-sm font-semibold text-slate-500">No previous examinations found.</p>
                  <p className="text-xs mt-1 mb-4">This patient has no recorded clinical encounters yet.</p>
                  <button onClick={onOpenExam}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md transition-colors">
                    <Plus className="w-3.5 h-3.5"/> Create examination
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-3">{record.history.length} examination{record.history.length!==1?'s':''} recorded.</p>
                  {record.history.map((entry) => (
                    <RecordRow
                      key={entry.id}
                      entry={entry}
                      snap={record.encounters[entry.id]}
                      loading={!!record.encounterLoading[entry.id]}
                      getSnapshot={getSnapshot}>
                      {(snap) => <ExamDetails snap={snap}/>}
                    </RecordRow>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'prescriptions' && (
            <div className="p-5">
              {record.loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin"/> Loading prescriptions…</div>
              ) : record.history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40"/>
                  <p className="text-sm">No prescription records yet.</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-3">Prescriptions and dispensing issued per visit.</p>
                  {record.history.map((entry) => (
                    <RecordRow
                      key={entry.id}
                      entry={entry}
                      snap={record.encounters[entry.id]}
                      loading={!!record.encounterLoading[entry.id]}
                      getSnapshot={getSnapshot}>
                      {(snap) => <PrescriptionDetails snap={snap}/>}
                    </RecordRow>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'papers' && (
            <PaperRecordsTab patientId={patient.id}/>
          )}
        </div>
      </div>
    </div>
  );
};