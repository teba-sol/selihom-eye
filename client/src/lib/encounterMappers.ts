import { getDefaultClinicalState } from './encounterDefaults';
import type { EncounterSnapshot } from '../store/useEncounterStore';

// Builds a full EncounterSnapshot (defaults + optional overrides) that
// can be used as the fallback base for DB→snapshot mapping without
// touching the live store.
export function buildSnapshotBase(
  patient: EncounterSnapshot['patient'],
  extra?: Partial<EncounterSnapshot>,
): EncounterSnapshot {
  return {
    appointmentId: null,
    encounterId: null,
    isLocked: false,
    lockedAt: null,
    addendumNotes: null,
    patient,
    consentObtained: false,
    activeTab: 'reason-for-visit',
    ...getDefaultClinicalState(),
    ...extra,
  };
}

function strReason(r: any, fallback: string): string {
  if (!r) return fallback;
  if (typeof r === 'string') return r;
  return r.selectedReason ?? '';
}

function toGrid(rx: any): any {
  if (!rx) return null;
  if (Array.isArray(rx)) {
    return rx.find((r) => !r.type || r.type.toUpperCase() === 'MAIN') ?? rx[0];
  }
  return rx;
}

// Pure DB→snapshot mapping. Consumes the payload returned by
// GET /clinical/encounter/:encounterId (encounter + refractions +
// canvas) and produces a partial EncounterSnapshot patch, seeded from
// `base` for any missing fields. Never mutates the store.
export function apiEncounterToSnapshot(
  data: any,
  base: EncounterSnapshot,
): Partial<EncounterSnapshot> {
  const grid = toGrid(data.refractions);
  const patch: Partial<EncounterSnapshot> = {};

  if (data.id) patch.encounterId = data.id;
  if (data.isLocked !== undefined) patch.isLocked = !!data.isLocked;
  if (data.lockedAt != null) patch.lockedAt = data.lockedAt;
  if (data.addendumNotes != null) patch.addendumNotes = data.addendumNotes;

  patch.patient = {
    ...base.patient,
    reasonForVisit: strReason(data.reasonForVisit, base.patient.reasonForVisit),
  };

  if (data.chiefComplaints && Array.isArray(data.chiefComplaints)) {
    patch.symptoms = data.chiefComplaints;
  }
  if (data.symptomaticHistory && Array.isArray(data.symptomaticHistory.symptoms)) {
    patch.symptoms = data.symptomaticHistory.symptoms;
  }
  if (data.ocularHistory) patch.ocularHistory = { ...base.ocularHistory, ...data.ocularHistory };
  if (data.systemicHistory) patch.systemicHistory = { ...base.systemicHistory, ...data.systemicHistory };
  if (data.medicationHistory) {
    patch.patientMedications = Array.isArray(data.medicationHistory)
      ? data.medicationHistory
      : data.medicationHistory.medications ?? data.medicationHistory;
  }
  if (data.familyOcularHistory) {
    patch.familyOcularHistory = Array.isArray(data.familyOcularHistory) ? data.familyOcularHistory : [];
  }
  if (data.familySystemicHistory) {
    patch.familySystemicHistory = Array.isArray(data.familySystemicHistory) ? data.familySystemicHistory : [];
  }
  if (data.spectaclesHistory) patch.spectaclesHistory = { ...base.spectaclesHistory, ...data.spectaclesHistory };
  if (data.contactLensHistory) patch.contactLensHistory = { ...base.contactLensHistory, ...data.contactLensHistory };
  if (data.lifestyleDemands) patch.lifestyleDemands = { ...base.lifestyleDemands, ...data.lifestyleDemands };

  if (data.visualAcuity) {
    const raw = data.visualAcuity;
    if (raw && raw.unit === undefined && raw.unaidedOd !== undefined) {
      const eye = (u: string, a: string, p: string) => ({
        dist: { unaided: u ?? '', aided: a ?? '', pinhole: p ?? '' },
        near: { unaided: '', aided: '', pinhole: '' },
      });
      patch.visualAcuity = {
        unit: base.visualAcuity.unit,
        od: eye(raw.unaidedOd, raw.aidedOd, raw.pinholeOd),
        os: eye(raw.unaidedOs, raw.aidedOs, raw.pinholeOs),
        ou: {
          dist: { unaided: '', aided: '', pinhole: '' },
          near: { unaided: '', aided: '', pinhole: '' },
        },
        remarks: raw.remarks ?? '',
      };
    } else {
      const mergeEye = (key: 'od' | 'os' | 'ou') => {
        const r = raw[key] ?? {};
        const scope = (sk: 'dist' | 'near') => ({
          unaided: r[sk]?.unaided ?? base.visualAcuity[key][sk].unaided,
          aided: r[sk]?.aided ?? base.visualAcuity[key][sk].aided,
          pinhole: r[sk]?.pinhole ?? base.visualAcuity[key][sk].pinhole,
        });
        return { dist: scope('dist'), near: scope('near') };
      };
      patch.visualAcuity = {
        unit: raw.unit ?? base.visualAcuity.unit,
        remarks: raw.remarks ?? base.visualAcuity.remarks,
        od: mergeEye('od'),
        os: mergeEye('os'),
        ou: mergeEye('ou'),
      };
    }
  }

  if (grid) {
    patch.refraction = {
      odSph: grid.odSph != null ? String(grid.odSph) : '',
      odCyl: grid.odCyl != null ? String(grid.odCyl) : '',
      odAxis: grid.odAxis != null ? String(grid.odAxis) : '',
      odVa: grid.odVa ?? '',
      odAdd: grid.odAdd != null ? String(grid.odAdd) : '',
      osSph: grid.osSph != null ? String(grid.osSph) : '',
      osCyl: grid.osCyl != null ? String(grid.osCyl) : '',
      osAxis: grid.osAxis != null ? String(grid.osAxis) : '',
      osVa: grid.osVa ?? '',
      osAdd: grid.osAdd != null ? String(grid.osAdd) : '',
      pdBinocular: grid.pdBinocular != null ? String(grid.pdBinocular) : '',
      bvdMm: grid.bvdMm != null ? String(grid.bvdMm) : '',
    };
  }

  if (data.slitLampFindings) patch.slitLamp = { ...base.slitLamp, ...data.slitLampFindings };
  if (data.tonometry) patch.tonometry = { ...base.tonometry, ...data.tonometry };
  if (data.diagnoses) patch.diagnoses = data.diagnoses;
  if (data.counselingAdviceGiven) patch.counselingAdvice = data.counselingAdviceGiven;
  if (data.treatmentPlanPathway) patch.treatmentPathway = data.treatmentPlanPathway;
  if (data.sectionData) patch.sectionData = { ...base.sectionData, ...data.sectionData };
  if (data.canvas) {
    const toStr = (v: any): string => {
      if (!v) return '';
      return typeof v === 'string' ? v : JSON.stringify(v);
    };
    if (data.canvas.odVectorData) patch.odCanvasVectors = toStr(data.canvas.odVectorData);
    if (data.canvas.osVectorData) patch.osCanvasVectors = toStr(data.canvas.osVectorData);
  }

  return patch;
}