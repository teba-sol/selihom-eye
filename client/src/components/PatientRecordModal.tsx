import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Eye, Calendar, Printer, Plus, Loader2, ChevronDown, ChevronRight,
  Stethoscope, Glasses, Pill, Activity, AlertTriangle, CalendarDays,
} from 'lucide-react';
import type { Patient } from '../store/useAppStore';
import type { EncounterSnapshot } from '../store/useEncounterStore';
import { Field } from './ExamDetails';
import { formatDobEthiopian, formatAge, formatEthiopianDate } from '../lib/formatters';
import { usePatientRecordData, type ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { fmtDate, humanize, StatusBadge, SummaryChips, doctorName, parseAddendums, statusLabel } from '../lib/examHistory';
import {
  bestDistVa, resolveSurgeries, getMedications, getActiveAllergies, opticalSummary, visitHasData,
} from '../lib/patientRecordSummary';

interface PatientRecordModalProps {
  patient: Patient;
  onClose: () => void;
  onOpenExam: () => void;
}

const FACILITY = 'SELIHOME Ophthalmic Medium Clinic';

// Diagnosis shape as returned by the encounter API (diagnoses[]).
interface Diagnosis {
  title: string;
  eye?: string;
  notes?: string;
}

// Tonal class used for the status badge in the printed report.
const STATUS_BADGE_TONE: Record<string, 'green' | 'purple' | 'gray'> = {
  COMPLETED: 'green',
  LOCKED: 'gray',
};

// ── Visit card: everything that happened belongs to this visit ──────────────
function VisitCard({ entry, snap, onViewExam }: {
  entry: ExamHistoryEntry;
  snap: EncounterSnapshot | null | undefined;
  onViewExam: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const meds = getMedications(snap ?? null);
  const surgeries = resolveSurgeries(snap ?? null);
  const optical = opticalSummary(snap ?? null);
  const allergies = getActiveAllergies(snap ?? null);
  const addendums = parseAddendums(snap?.addendumNotes ?? entry.addendumNotes);
  const diagnoses: Diagnosis[] = (snap?.diagnoses && snap.diagnoses.length > 0)
    ? snap.diagnoses
    : (Array.isArray(entry.diagnoses) ? entry.diagnoses : []);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 bg-white">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{formatEthiopianDate(entry.appointmentDate ?? entry.createdAt)}</span>
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

      {/* Always-visible activity belonging to the visit */}
      <div className="px-4 pb-3 border-t border-slate-100">
        {diagnoses.length > 0 && (
          <div className="flex items-start gap-2 text-xs mt-2">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0"/>
            <div className="flex flex-wrap gap-1.5">
              {diagnoses.map((d, i) => (
                <span key={i} className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                  <b>{d.title}</b>{d.eye && d.eye !== 'OU' ? ` (${d.eye})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {optical && (
          <div className="flex items-start gap-2 text-xs mt-2">
            <Glasses className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0"/>
            <span className="text-slate-700">{optical}</span>
          </div>
        )}

        {meds.length > 0 && (
          <div className="flex items-start gap-2 text-xs mt-2">
            <Pill className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0"/>
            <div className="flex flex-wrap gap-1.5">
              {meds.map((m, i) => (
                <span key={i} className="text-[10px] bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5 text-slate-700">
                  <b>{m.drugName}</b>
                  {m.frequency ? ` · ${m.frequency}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {surgeries.length > 0 && (
          <div className="flex items-start gap-2 text-xs mt-2">
            <Activity className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0"/>
            <div className="flex flex-wrap gap-1.5">
              {surgeries.map((s, i) => (
                <span key={i} className="text-[10px] bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 text-slate-700">
                  <b>{s.otherName || s.type}</b>
                  {s.eye ? ` · ${s.eye}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {allergies.length > 0 && (
          <div className="flex items-start gap-2 text-xs mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0"/>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a, i) => (
                <span key={i} className="text-[10px] bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 font-semibold text-amber-800">{a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-end gap-2">
          <button onClick={() => onViewExam(entry.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline">
            <Eye className="w-3.5 h-3.5"/> View examination
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 space-y-2">
          {(addendums.length > 0) && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Corrections / addendums ({addendums.length})</p>
              {addendums.map((a, i) => (
                <div key={i} className="text-xs text-slate-600 mb-1">
                  {a.author && <b>{doctorName(a.author, '')}: </b>}
                  {a.text}
                  {a.at && <span className="text-slate-400"> — {fmtDate(a.at)}</span>}
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 italic">
            Open the examination for the full clinical details of this visit.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Print helpers (pure, typed) ─────────────────────────────────────────────
// Builds the clinical body HTML for a single visit's printed section.
function buildVisitPrintBody(entry: ExamHistoryEntry, snap: EncounterSnapshot | null): string {
  const secH = (title: string) => `<h3 class="sec-title">${title}</h3>`;
  let body = '';

  if (snap) {
    const dx = (snap.diagnoses?.length ? snap.diagnoses : entry.diagnoses ?? []).map((d: Diagnosis) => d?.title).filter(Boolean).join(', ');
    const tono = snap.tonometry ?? entry.tonometry ?? {};
    if (dx) body += secH('Diagnosis') + `<div class="row-item"><b>${dx}</b></div>`;
    if (entry.visualAcuity || snap.visualAcuity) {
      const od = bestDistVa(snap, 'od');
      const os = bestDistVa(snap, 'os');
      if (od || os) body += secH('Visual Acuity') + `<p class="row-item"><b>OD ${od || '—'}</b> · <b>OS ${os || '—'}</b></p>`;
    }
    if (tono.odIop || tono.osIop) {
      body += secH('Tonometry (IOP)') + `<p class="row-item">OD: <b>${tono.odIop || '—'} mmHg</b> · OS: <b>${tono.osIop || '—'} mmHg</b></p>`;
    }
    const rx = opticalSummary(snap);
    if (rx) body += secH('Optical Prescription') + `<p class="row-item">${rx}</p>`;
    const meds = getMedications(snap);
    if (meds.length) {
      body += secH(`Medications (${meds.length})`);
      body += meds.map((m) => `<div class="row-item"><b>${m.drugName}</b>${m.frequency ? ` · ${m.frequency}` : ''}${m.targetEye ? ` · ${m.targetEye}` : ''}</div>`).join('');
    }
    const surgeries = resolveSurgeries(snap);
    if (surgeries.length) {
      body += secH(`Surgeries (${surgeries.length})`);
      body += surgeries.map((s) => `<div class="row-item"><b>${s.otherName || s.type}</b>${s.eye ? ` · ${s.eye}` : ''}${s.remarks ? ` — ${s.remarks}` : ''}</div>`).join('');
    }
    if (entry.addendumNotes || snap.addendumNotes) {
      const adds = parseAddendums(snap.addendumNotes ?? entry.addendumNotes);
      if (adds.length) body += secH('Corrections / Addendums') + adds.map((a) => `<p class="note">• ${a.text}</p>`).join('');
    }
  }

  return body || '<p class="empty">No clinical data recorded for this appointment.</p>';
}

// Assembles the full printable HTML document for a patient record.
function buildPrintHtml(patient: Patient, visits: { entry: ExamHistoryEntry }[], examSections: string[]): string {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
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
      .info-table{width:100%;border-collapse:collapse;margin-bottom:6px}
      .info-table .lbl{width:35%;padding:3px 6px;font-weight:700;color:#64748b;font-size:11px}
      .info-table .val{padding:3px 6px;color:#1e293b;font-size:11px}
      .row-item{padding:4px 6px;border-left:3px solid #2563eb;margin:3px 0;background:#f8fafc;font-size:11px;line-height:1.5}
      .note{font-size:10px;color:#94a3b8;font-style:italic;margin-top:3px}
      .empty{font-size:11px;color:#94a3b8;font-style:italic;padding:6px 0}
      .badge{display:inline-block;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:800}
      .badge-green{background:#dcfce7;color:#166534}
      .badge-purple{background:#f3e8ff;color:#6b21a8}
      .badge-gray{background:#f1f5f9;color:#475569}
      .footer{margin-top:28px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
      @media print{body{padding:16px}.visit-card{page-break-inside:avoid}}
    </style>
    </head><body>
      <h1>Patient Medical Record</h1>
      <p class="clinic-tag">${FACILITY} — Confidential Clinical Document</p>

      <div class="patient-meta">
        <div class="meta-field"><label>MRN</label><span>${patient.mrn ?? `SEL-${patient.id}`}</span></div>
        <div class="meta-field"><label>Full Name</label><span>${patient.firstName} ${patient.lastName}</span></div>
        <div class="meta-field"><label>Grandfather</label><span>${patient.grandfatherName ?? '-'}</span></div>
        <div class="meta-field"><label>Gender</label><span>${patient.gender}</span></div>
        <div class="meta-field"><label>Date of Birth</label><span>${formatDobEthiopian(patient.dateOfBirth)}</span></div>
        <div class="meta-field"><label>Age</label><span>${formatAge(patient.dateOfBirth)}</span></div>
        <div class="meta-field"><label>Phone</label><span>${patient.phone}</span></div>
        <div class="meta-field"><label>Status</label><span>${patient.isNew ? 'New Patient' : 'Returning Patient'}</span></div>
        <div class="meta-field"><label>Address</label><span>${patient.address ?? '—'}</span></div>
      </div>

      <h2>Examination History — ${visits.length} Visit${visits.length !== 1 ? 's' : ''}</h2>
      ${examSections.join('\n')}

      <div class="footer">
        <span>${FACILITY} · Confidential Medical Record</span>
        <span>Printed: ${today}</span>
      </div>
    </body></html>`;
}

// ── Main Modal: longitudinal patient record grouped by visit ────────────────
export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({ patient, onClose, onOpenExam }) => {
  const navigate = useNavigate();
  const record = usePatientRecordData(patient.id);
  const getSnapshot = record.getSnapshot;

  useEffect(() => {
    if (!record.loading) record.preloadSnapshots();
  }, [record.loading, record.preloadSnapshots]);

  const openExam = useCallback((id: string) => {
    onClose();
    navigate(`/exam/${id}`);
  }, [navigate, onClose]);

  // An exam is "in progress" while it is open (not locked / not completed).
  // The backend guarantees at most one active exam per patient.
  const inProgress = useMemo(
    () =>
      record.history
        .filter((entry) => !entry.isLocked && entry.appointmentStatus !== 'COMPLETED')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [record.history],
  );
  const inProgressIds = useMemo(() => new Set(inProgress.map((e) => e.id)), [inProgress]);

  // Completed / data-bearing visits that are no longer in progress.
  const visits = useMemo(
    () =>
      record.history
        .filter((entry) => !inProgressIds.has(entry.id) && visitHasData(entry, record.encounters[entry.id]))
        .map((entry) => ({ entry, snap: record.encounters[entry.id] })),
    [record.history, record.encounters, inProgressIds],
  );

  const completedCount = visits.filter((v) => v.entry.isLocked || v.entry.appointmentStatus === 'COMPLETED').length;
  const lastVisit = visits.length > 0
    ? formatEthiopianDate(visits[0].entry.appointmentDate ?? visits[0].entry.createdAt)
    : 'First Visit';

  // Next appointment: first future non-cancelled/completed by date.
  const nextAppointment = useMemo(() => {
    const today = new Date();
    const apts = (record.appointments ?? [])
      .filter((a) => a.scheduledDate && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
      .map((a) => ({ ...a, t: new Date(a.scheduledDate + (a.startTime ? `T${a.startTime}:00` : 'T00:00:00')).getTime() }))
      .filter((a) => !Number.isNaN(a.t) && a.t >= today.getTime() - 86400000)
      .sort((a, b) => a.t - b.t);
    return apts[0] ?? null;
  }, [record.appointments]);

  const previousAppointments = useMemo(() => {
    const today = new Date().getTime();
    return (record.appointments ?? [])
      .map((a) => ({ ...a, t: new Date(a.scheduledDate).getTime() }))
      .filter((a) => !Number.isNaN(a.t) && a.t < today)
      .sort((a, b) => b.t - a.t)
      .slice(0, 3);
  }, [record.appointments]);

  // Clinical overview — latest non-empty value across visits.
  const overview = useMemo(() => {
    let latestDiagnosis: string[] = [];
    let vaOd = '', vaOs = '';
    let iopOd = '', iopOs = '';
    let rx: string | null = null;
    let notes: string[] = [];
    const allergies = new Set<string>();

    for (const { entry, snap } of visits) {
      const d = (snap?.diagnoses && snap.diagnoses.length > 0 ? snap.diagnoses : entry.diagnoses ?? []) as Diagnosis[];
      if (d.length > 0 && latestDiagnosis.length === 0) latestDiagnosis = d.map((x) => x.title);
      if (!vaOd) vaOd = bestDistVa(snap ?? ({ visualAcuity: entry.visualAcuity } as any), 'od') || '';
      if (!vaOs) vaOs = bestDistVa(snap ?? ({ visualAcuity: entry.visualAcuity } as any), 'os') || '';
      const tono = snap?.tonometry ?? entry.tonometry ?? {};
      if (!iopOd && tono.odIop) iopOd = String(tono.odIop);
      if (!iopOs && tono.osIop) iopOs = String(tono.osIop);
      if (!rx) rx = opticalSummary(snap ?? null);
      if (snap?.treatmentPathway && notes.length === 0) notes.push(`Treatment pathway: ${snap.treatmentPathway}`);
      const add = parseAddendums(snap?.addendumNotes ?? entry.addendumNotes);
      if (add.length > 0 && notes.length === 0) notes.push(add.map((a) => a.text).join(' · '));
      getActiveAllergies(snap ?? null).forEach((a) => allergies.add(a));
    }
    return {
      latestDiagnosis,
      vaOd,
      vaOs,
      iopOd,
      iopOs,
      rx,
      notes,
      allergies: [...allergies],
    };
  }, [visits]);

  const handlePrint = async () => {
    const examSections: string[] = [];
    for (const { entry } of visits) {
      const snap = await getSnapshot(entry.id);
      const dateStr = formatEthiopianDate(entry.appointmentDate ?? entry.createdAt);
      const tone: 'green' | 'purple' | 'gray' = entry.isLocked
        ? 'gray'
        : (STATUS_BADGE_TONE[entry.appointmentStatus ?? ''] ?? 'purple');
      const statusBadge = entry.isLocked
        ? '<span class="badge badge-gray">Locked · Finalized</span>'
        : `<span class="badge badge-${tone}">${statusLabel(entry)}</span>`;
      const body = buildVisitPrintBody(entry, snap);

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

    const html = buildPrintHtml(patient, visits, examSections);

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

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
              <h2 className="text-base font-bold text-slate-800">Patient Record</h2>
              <p className="text-xs text-slate-500">
                {patient.firstName} {patient.lastName} · {patient.mrn ?? `SEL-${patient.id}`} · {formatAge(patient.dateOfBirth)} · {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
              <Printer className="w-3.5 h-3.5"/> Print
            </button>
            <button onClick={onOpenExam} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
              <Eye className="w-3.5 h-3.5"/> New examination
            </button>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {record.loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin"/> Loading patient record…</div>
          ) : (
            <div className="p-5 space-y-6">
              {/* 1. Patient identity */}
              <section>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Patient identity</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="MRN" value={patient.mrn ?? `SEL-${patient.id}`}/>
                  <Field label="Full Name" value={`${patient.firstName} ${patient.lastName}`}/>
                  <Field label="Father's / Grandfather" value={patient.grandfatherName ?? '-'}/>
                  <Field label="Sex" value={patient.gender}/>
                  <Field label="Date of Birth" value={formatDobEthiopian(patient.dateOfBirth)}/>
                  <Field label="Age" value={formatAge(patient.dateOfBirth)}/>
                  <Field label="Phone" value={patient.phone}/>
                  <Field label="Registered" value={patient.createdAt ? formatEthiopianDate(patient.createdAt) : '-'}/>
                  <Field label="Address" value={patient.address ?? '—'} wide/>
                  <Field label="Facility" value={FACILITY} wide/>
                </div>
              </section>

              {/* 2. Patient status */}
              <section>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Patient Status" value={patient.isNew ? 'New Patient' : 'Returning Patient'}/>
                  <Field label="Total Completed Examinations" value={String(completedCount)}/>
                  <Field label="Last Visit" value={lastVisit}/>
                  <Field label="Next Appointment" value={nextAppointment ? formatEthiopianDate(nextAppointment.scheduledDate) : '—'}/>
                </div>
              </section>

              {/* 3. Clinical overview */}
              <section>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Clinical overview</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Latest Diagnosis" value={overview.latestDiagnosis.length ? overview.latestDiagnosis.join(', ') : '—'} wide/>
                  <Field label="Latest VA" value={overview.vaOd || overview.vaOs ? `OD ${overview.vaOd || '—'} · OS ${overview.vaOs || '—'}` : '—'}/>
                  <Field label="Latest IOP" value={overview.iopOd || overview.iopOs ? `OD ${overview.iopOd || '—'} · OS ${overview.iopOs || '—'} mmHg` : '—'}/>
                  <Field label="Current / Final Rx" value={overview.rx ?? '—'} wide/>
                  {overview.notes.length > 0 && <Field label="Important Notes" value={overview.notes.join(' · ')} wide/>}
                  {overview.allergies.length > 0 && (
                    <Field label="Allergies" value={overview.allergies.join(' · ')} wide/>
                  )}
                </div>
              </section>

              {/* 4. Visit history */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Visit history <span className="text-slate-400">({visits.length})</span>
                  </p>
                </div>

                {inProgress.length > 0 && (
                  <div className="mb-3 flex items-center justify-between border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5"/> Exam in progress
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {formatEthiopianDate(inProgress[0].appointmentDate ?? inProgress[0].createdAt)} ·{' '}
                        {inProgress[0].appointmentReason || 'Examination'}
                      </p>
                    </div>
                    <button
                      onClick={() => openExam(inProgress[0].id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5"/> Continue examination
                    </button>
                  </div>
                )}

                {visits.length === 0 && inProgress.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40"/>
                    <p className="text-sm font-semibold text-slate-500">No examinations recorded yet.</p>
                    <p className="text-xs mt-1 mb-3">Start an examination to begin the patient's record.</p>
                    <button onClick={onOpenExam}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md transition-colors">
                      <Plus className="w-3.5 h-3.5"/> Create examination
                    </button>
                  </div>
                ) : (
                  visits.map(({ entry }) => (
                    <VisitCard
                      key={entry.id}
                      entry={entry}
                      snap={record.encounters[entry.id]}
                      onViewExam={openExam}
                    />
                  ))
                )}
              </section>

              {/* 5. Appointments */}
              {(nextAppointment || previousAppointments.length > 0) && (
                <section>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    <CalendarDays className="w-3.5 h-3.5 inline mr-1"/> Appointments
                  </p>
                  <div className="space-y-2">
                    {nextAppointment && (
                      <div className="border border-emerald-200 bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-800">{formatEthiopianDate(nextAppointment.scheduledDate)}</p>
                          <p className="text-xs text-emerald-700">{nextAppointment.reason || 'Routine Eye Examination'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-wide">Next</span>
                      </div>
                    )}
                    {previousAppointments.map((a) => (
                      <div key={a.id} className="border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{formatEthiopianDate(a.scheduledDate)}</p>
                          <p className="text-xs text-slate-500">{a.reason || 'Routine Eye Examination'}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">{humanize(a.status) || 'Recorded'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};