import type { EncounterSnapshot } from '../store/useEncounterStore';
import type { ExamHistoryEntry } from '../hooks/usePatientRecordData';
import { bestDistVa, resolveSurgeries, getMedications } from './patientRecordSummary';
import { vaHasData } from '../components/ExamDetails';

export type AlertLevel = 'critical' | 'review';

export interface DashboardAlert {
  level: AlertLevel;
  message: string;
  encounterId: string;
}

export interface DashboardSnapshot {
  encounterId: string;
  date: string;
  vaOd: string;
  vaOs: string;
  iopOd: string;
  iopOs: string;
  refraction: string;
  highIop: boolean;
}

export interface ActiveProblem {
  encounterId: string;
  title: string;
  eye: string;
  notes?: string;
  date: string;
}

export interface DashboardSurgery {
  encounterId: string;
  type: string;
  otherName: string;
  eye: string;
  surgeon: string;
  dateOfSurgery: string;
  status: string;
  date: string;
}

export interface DashboardMedication {
  drugName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  targetEye?: string;
  date: string;
}

export interface ClinicalDashboard {
  hasData: boolean;
  lastExamDate: string | null;
  alerts: DashboardAlert[];
  snapshot: DashboardSnapshot | null;
  activeProblems: ActiveProblem[];
  surgeries: DashboardSurgery[];
  medications: DashboardMedication[];
  treatmentPlan: { text: string; date: string } | null;
}

function entryDate(entry: ExamHistoryEntry): string {
  return entry.appointmentDate ?? entry.createdAt ?? '';
}

function iso2ts(v: string | null | undefined): number {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function numIop(v: any): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

/** Best-corrected distance VA quality: flag values worse than moderate. */
function isPoorVa(snap: EncounterSnapshot): boolean {
  if (!vaHasData(snap.visualAcuity)) return false;
  const bad = (v: string) => {
    if (!v) return false;
    // Snellen fraction — treat < 6/18 (i.e. worse than 6/18) as "review".
    const m = /^(\d+)\s*\/\s*(\d+)$/.exec(v.trim());
    if (m) {
      const top = Number(m[1]);
      const bottom = Number(m[2]);
      if (!bottom) return false;
      return top / bottom > 1 / 3; // ratio > 0.333 ≈ worse than 6/18
    }
    // Decimal / MAR / LogMAR-ish strings: flag those with explicit poor cues.
    const low = ['cf', 'hm', 'pl', 'lp', 'nlp'];
    if (low.some((k) => v.toLowerCase().includes(k))) return true;
    return false;
  };
  return bad(bestDistVa(snap, 'od')) || bad(bestDistVa(snap, 'os')) || bad(bestDistVa(snap, 'ou'));
}

function poorSystemicControl(snap: EncounterSnapshot): string | null {
  const conds: any = snap.systemicHistory?.conditions ?? {};
  for (const v of Object.values(conds) as any[]) {
    const status = v?.controlStatus ?? '';
    if (/poor|uncontrolled/i.test(status) && v?.active) {
      return v.type || v.controlStatus;
    }
  }
  return null;
}

function refractionLabel(snap: EncounterSnapshot): string {
  const r = snap.refraction;
  if (!r) return '';
  const fmt = (s: string, c: string, a: string): string => {
    const parts: string[] = [];
    if (s) parts.push(`Sph ${s}`);
    if (c) parts.push(`Cyl ${c}`);
    if (a) parts.push(`Axis ${a}`);
    return parts.join(' ');
  };
  const od = fmt(r.odSph, r.odCyl, r.odAxis);
  const os = fmt(r.osSph, r.osCyl, r.osAxis);
  if (!od && !os) return '';
  return [od ? `OD: ${od}` : '', os ? `OS: ${os}` : ''].filter(Boolean).join(' · ');
}

export function buildClinicalDashboard(
  history: ExamHistoryEntry[],
  encounters: Record<string, EncounterSnapshot>,
): ClinicalDashboard {
  // Chronological (oldest → newest) so we can keep latest values per logical item.
  const ordered = [...history].sort((a, b) => iso2ts(entryDate(a)) - iso2ts(entryDate(b)));

  const alerts: DashboardAlert[] = [];
  const activeProblems: ActiveProblem[] = [];
  const problemSeen = new Set<string>();
  const surgeries: DashboardSurgery[] = [];
  const surgerySeen = new Set<string>();
  const medicationSeen = new Set<string>();
  const medications: DashboardMedication[] = [];
  let snapshot: DashboardSnapshot | null = null;
  let lastExamDate: string | null = null;
  let treatmentPlan: ClinicalDashboard['treatmentPlan'] = null;

  for (const entry of ordered) {
    const snap = encounters[entry.id];
    const date = entryDate(entry);
    if (date && iso2ts(date) > iso2ts(lastExamDate)) lastExamDate = date;

    // ---- Treatment plan (latest non-empty) ----
    const planText = entry.treatmentPlanPathway ?? snap?.treatmentPathway ?? '';
    if (planText) treatmentPlan = { text: planText, date };

    // ---- Alerts that can be derived from the lightweight history row ----
    if (entry.tonometry) {
      const od = numIop(entry.tonometry.odIop);
      const os = numIop(entry.tonometry.osIop);
      if (od > 21 || os > 21) {
        alerts.push({
          level: 'critical',
          message: `Raised IOP — OD ${od} mmHg / OS ${os} mmHg (>21 mmHg)`,
          encounterId: entry.id,
        });
      } else if (od > 18 || os > 18) {
        alerts.push({
          level: 'review',
          message: `Borderline IOP — OD ${od} / OS ${os} mmHg`,
          encounterId: entry.id,
        });
      }
    }
    const dx = Array.isArray(entry.diagnoses) ? entry.diagnoses : [];
    if (dx.length > 0) {
      for (const d of dx) {
        const title = d?.title ?? '';
        if (!title) continue;
        const eye = d?.eye ?? '';
        const key = `${title}|${eye}`;
        if (!problemSeen.has(key)) {
          problemSeen.add(key);
          activeProblems.push({
            encounterId: entry.id,
            title,
            eye: eye || '—',
            notes: d?.notes ?? '',
            date,
          });
        }
      }
    }

    // ---- Full-snapshot-derived data (only when the preloaded snapshot is present) ----
    if (!snap) continue;

    // Clinical snapshot from the most recent encounter that actually has data.
    const hasData =
      vaHasData(snap.visualAcuity) ||
      !!snap.tonometry?.odIop ||
      !!snap.tonometry?.osIop ||
      !!refractionLabel(snap) ||
      (snap.diagnoses?.length ?? 0) > 0;
    if (hasData) {
      snapshot = {
        encounterId: entry.id,
        date,
        vaOd: bestDistVa(snap, 'od'),
        vaOs: bestDistVa(snap, 'os'),
        iopOd: snap.tonometry?.odIop ? `${numIop(snap.tonometry.odIop)}` : '',
        iopOs: snap.tonometry?.osIop ? `${numIop(snap.tonometry.osIop)}` : '',
        refraction: refractionLabel(snap),
        highIop: numIop(snap.tonometry?.odIop) > 21 || numIop(snap.tonometry?.osIop) > 21,
      };
    }

    // RAPD = critical.
    const bv: any = snap.sectionData?.['binocular-vision-assessment'];
    if (bv?.rapdStatus && /(positive|present)/i.test(String(bv.rapdStatus)) && !/(negative|no rapd)/i.test(String(bv.rapdStatus))) {
      alerts.push({ level: 'critical', message: 'RAPD present (Afferent Pupillary Defect)', encounterId: entry.id });
    }

    // Poor VA = review.
    if (isPoorVa(snap)) {
      alerts.push({ level: 'review', message: 'Reduced visual acuity (worse than 6/18)', encounterId: entry.id });
    }

    // Poorly-controlled systemic condition = review.
    const poorSystemic = poorSystemicControl(snap);
    if (poorSystemic) {
      alerts.push({ level: 'review', message: `Poorly controlled systemic condition: ${poorSystemic}`, encounterId: entry.id });
    }

    // Non-compliant medication = review.
    for (const m of snap.patientMedications ?? []) {
      if (/non|intermittent/i.test(m.compliance ?? '')) {
        alerts.push({
          level: 'review',
          message: `Medication compliance concern — ${m.drugName} (${m.compliance})`,
          encounterId: entry.id,
        });
      }
    }

    // Active ocular history conditions (not from diagnoses).
    const ocular: any = snap.ocularHistory?.conditions ?? {};
    for (const [name, cond] of Object.entries(ocular) as any[]) {
      if (cond?.active) {
        const key = `${name}|${cond?.eye ?? ''}`;
        if (!problemSeen.has(key)) {
          problemSeen.add(key);
          activeProblems.push({
            encounterId: entry.id,
            title: `${name[0].toUpperCase()}${name.slice(1)}`,
            eye: cond.eye ?? '—',
            notes: cond.remarks ?? '',
            date,
          });
        }
      }
    }

    // Surgeries.
    const sxs = resolveSurgeries(snap);
    for (const s of sxs) {
      const type = s.otherName || s.type || '';
      if (!type) continue;
      const eye = s.eye ?? '';
      const ud = s.unifiedDetails ?? {};
      const sKey = `${type}|${eye}`;
      if (!surgerySeen.has(sKey)) {
        surgerySeen.add(sKey);
        surgeries.push({
          encounterId: entry.id,
          type: s.type || '',
          otherName: s.otherName || '',
          eye: eye || '',
          surgeon: ud?.surgeon ?? '',
          dateOfSurgery: ud?.dateOfSurgery ?? '',
          status: ud?.status ?? (ud?.rootStatus ?? 'PLANNED'),
          date,
        });
      }
    }

    // Medications (dedupe by drug+dosage; most recent retained since we iterate chronologically).
    for (const m of getMedications(snap)) {
      const key = `${m.drugName}|${m.dosage ?? ''}|${m.route ?? ''}`;
      if (!medicationSeen.has(key)) {
        medicationSeen.add(key);
        medications.push({ ...m, date });
      } else {
        // Update date to newest occurrence.
        const existing = medications.find((e) => `${e.drugName}|${e.dosage ?? ''}|${e.route ?? ''}` === key);
        if (existing) existing.date = date;
      }
    }
  }

  // Keep only distinct alerts (a given clinical finding at a given level).
  const seenAlerts = new Set<string>();
  const deduped = alerts.filter((a) => {
    const k = `${a.level}|${a.message}`;
    if (seenAlerts.has(k)) return false;
    seenAlerts.add(k);
    return true;
  });
  // Prefer critical over review when the same message exists at both levels.
  const byMessage = new Map<string, DashboardAlert>();
  for (const a of deduped) {
    const existing = byMessage.get(a.message);
    if (!existing || (a.level === 'critical' && existing.level === 'review')) byMessage.set(a.message, a);
  }
  const finalAlerts = [...byMessage.values()].sort((a, b) =>
    a.level === b.level ? 0 : a.level === 'critical' ? -1 : 1,
  );

  // Medications most recent first.
  medications.sort((a, b) => iso2ts(b.date) - iso2ts(a.date));

  return {
    hasData: finalAlerts.length > 0 || !!snapshot || activeProblems.length > 0 || surgeries.length > 0 || medications.length > 0 || !!treatmentPlan,
    lastExamDate,
    alerts: finalAlerts,
    snapshot,
    activeProblems,
    surgeries,
    medications,
    treatmentPlan,
  };
}