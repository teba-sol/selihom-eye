import { create } from 'zustand';
import { getDefaultClinicalState } from '../lib/encounterDefaults';
import { apiEncounterToSnapshot } from '../lib/encounterMappers';

export interface SymptomItem {
  id: string;
  name: string;
  eye: string;
  durationValue?: number;
  durationUnit?: string;
  since?: string;
  frequency?: string;
  severity?: string;
  remarks?: string;
}

export interface RefractionGridValues {
  odSph: string;
  odCyl: string;
  odAxis: string;
  odVa: string;
  odAdd: string;
  osSph: string;
  osCyl: string;
  osAxis: string;
  osVa: string;
  osAdd: string;
  pdBinocular: string;
  bvdMm: string;
}

export interface OcularConditionDetail {
  active: boolean;
  eye: 'Left Eye' | 'Right Eye' | 'Both Eyes';
  date: string;
  type?: string;
  remarks: string;
  showInDischarge: boolean;
}

export interface OcularHistoryState {
  noHistoryReported: boolean;
  generalRemarks: string;
  conditions: {
    surgery: OcularConditionDetail;
    trauma: OcularConditionDetail;
    infection: OcularConditionDetail;
    glaucoma: OcularConditionDetail;
    retinalDetachment: OcularConditionDetail;
    amblyopia: OcularConditionDetail;
  };
}

export interface SystemicConditionDetail {
  active: boolean;
  dateOfDiagnosis?: string;
  durationValue?: number;
  durationUnit?: string;
  type?: string;
  controlStatus?: 'Well Controlled' | 'Moderately Controlled' | 'Poorly Controlled' | 'Uncontrolled';
  remarks?: string;
  showInDischarge?: boolean;
}

export interface MedicationEntry {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  route: 'Ophthalmic Drops' | 'Ophthalmic Ointment' | 'Oral' | 'Subcutaneous' | 'Inhalation';
  targetEye?: 'Left Eye' | 'Right Eye' | 'Both Eyes' | 'Systemic';
  compliance: 'Compliant' | 'Non-Compliant' | 'Intermittent';
  showInDischarge: boolean;
}

export interface FamilyHistoryItem {
  id: string;
  relation: 'Father' | 'Mother' | 'Sibling' | 'Parent' | 'Grandparent' | 'Maternal Grandparent' | 'Paternal Grandparent';
  condition: string;
  notes: string;
  showInDischarge: boolean;
}

export interface SpectaclesState {
  currentlyWears: boolean;
  type: 'Single Vision (Distance)' | 'Single Vision (Intermediate)' | 'Single Vision (Near)' | 'Bifocal' | 'Progressive (PAL)' | 'None';
  ageOfCurrentGlasses: string;
  material: 'CR-39 (Plastic)' | 'Polycarbonate' | 'High Index' | 'Glass';
  coating: string[];
  satisfaction: 'Satisfied' | 'Blurry Distance' | 'Blurry Near' | 'Eyestrain / Headaches';
  remarks: string;
}

export interface ContactLensState {
  currentWearer: boolean;
  modality: 'Daily Disposable' | 'Monthly Replacement' | 'Extended Wear' | 'RGP / Hard' | 'Scleral';
  solutionUsed: string;
  wearingHoursPerDay: number;
  complianceWithCleaning: 'Good' | 'Moderate' | 'Poor';
  lastEyeCheckDate: string;
  remarks: string;
}

export interface LifestyleState {
  occupation: string;
  screenTimeHoursPerDay: number;
  outdoorActivities: string;
  hobbies: string;
  lightingConditionWorkplace: 'Good' | 'Dim' | 'Glare Present';
  drivingRequirements: 'Daytime Only' | 'Night Driving Frequent' | 'Commercial Driver' | 'None';
}

export interface EyeData {
  unaided: string;
  aided: string;
  pinhole: string;
}

export interface VisionEyeData {
  dist: EyeData;
  near: EyeData;
}

export interface VisualAcuityState {
  unit: string;
  od: VisionEyeData;
  os: VisionEyeData;
  ou: VisionEyeData;
  remarks: string;
}

interface EncounterState {
  activeTab: string;
  appointmentId: string | null;
  encounterId: string | null;
  isLocked: boolean;
  lockedAt: string | null;
  addendumNotes: string | null;
  patient: {
    id: string;
    mrn: string;
    name: string;
    age: number;
    gender: string;
    appointmentTime: string;
    reasonForVisit: string;
  };
  consentObtained: boolean;
  encounterSnapshots: Record<string, EncounterSnapshot>;

  // 1. History and Symptoms
  ocularHistory: OcularHistoryState;
  symptoms: SymptomItem[];

  // 2. Visual Acuity
  visualAcuity: VisualAcuityState;

  // 3. Refraction
  refraction: RefractionGridValues;

  // 4. Anterior Segment & Canvas
  slitLamp: {
    lidsLashes: string;
    conjunctiva: string;
    cornea: string;
    anteriorChamber: string;
    irisLens: string;
  };
  odCanvasVectors: string;
  osCanvasVectors: string;

  // 3b. Systemic History
  systemicHistory: {
    noHistoryReported: boolean;
    generalRemarks: string;
    conditions: Record<string, SystemicConditionDetail>;
  };
  patientMedications: MedicationEntry[];
  familyOcularHistory: FamilyHistoryItem[];
  familySystemicHistory: FamilyHistoryItem[];
  spectaclesHistory: SpectaclesState;
  contactLensHistory: ContactLensState;
  lifestyleDemands: LifestyleState;

  // 5. Diagnostics
  tonometry: {
    odIop: string;
    osIop: string;
    method: 'NCT' | 'GAT' | 'ICARE';
  };

  // 6. Assessment & Plan
  diagnoses: Array<{ title: string; eye: 'OD' | 'OS' | 'OU'; notes: string }>;
  counselingAdvice: string;
  treatmentPathway: string;

  // Module section data (keyed by ASIRA section/tab id) for exam views that
  // manage their own local state. Autosaved wholesale and restored on load.
  sectionData: Record<string, any>;

  // Actions
  setActiveTab: (tab: string) => void;
  setConsent: (val: boolean) => void;
  setPatient: (patient: EncounterState['patient']) => void;
  setSectionData: (section: string, data: any) => void;
  startExam: (params: {
    encounterId: string;
    appointmentId?: string | null;
    patient: EncounterState['patient'];
    consentObtained: boolean;
    reasonForVisit: string;
  }) => void;
  loadEncounterFromDb: (data: any) => void;
  saveEncounter: () => Promise<void>;
  markExamFinalized: (encounterId: string) => void;
  updateOcularCondition: (key: keyof OcularHistoryState['conditions'], data: Partial<OcularConditionDetail>) => void;
  setOcularGeneralRemarks: (remarks: string) => void;
  setNoOcularHistory: (val: boolean) => void;
  updateRefraction: (data: Partial<RefractionGridValues>) => void;
  updateVisualAcuity: (data: Partial<EncounterState['visualAcuity']>) => void;
  setVisualAcuityCell: (
    eye: 'od' | 'os' | 'ou',
    scope: 'dist' | 'near',
    key: 'unaided' | 'aided' | 'pinhole',
    value: string,
  ) => void;
  setVisualAcuityUnit: (unit: string) => void;
  setCanvasVectors: (eye: 'OD' | 'OS', vectors: string) => void;
  updateSlitLamp: (data: Partial<EncounterState['slitLamp']>) => void;
  updateTonometry: (data: Partial<EncounterState['tonometry']>) => void;
  addOrToggleSymptom: (name: string) => void;
  updateSymptom: (id: string, data: Partial<SymptomItem>) => void;
  setSymptoms: (items: SymptomItem[]) => void;
  setSystemicConditions: (conditions: Record<string, SystemicConditionDetail>) => void;
  setPatientMedications: (items: MedicationEntry[]) => void;
  setFamilyOcularHistory: (items: FamilyHistoryItem[]) => void;
  setFamilySystemicHistory: (items: FamilyHistoryItem[]) => void;
  setSpectaclesHistory: (data: SpectaclesState) => void;
  setContactLensHistory: (data: ContactLensState) => void;
  updateSystemicCondition: (key: string, data: Partial<SystemicConditionDetail>) => void;
  setSystemicGeneralRemarks: (remarks: string) => void;
  setNoSystemicHistory: (val: boolean) => void;
  addPatientMedication: (med: MedicationEntry) => void;
  removePatientMedication: (id: string) => void;
  addFamilyHistoryItem: (type: 'ocular' | 'systemic', item: FamilyHistoryItem) => void;
  removeFamilyHistoryItem: (type: 'ocular' | 'systemic', id: string) => void;
  updateSpectacles: (data: Partial<SpectaclesState>) => void;
  updateContactLens: (data: Partial<ContactLensState>) => void;
  updateLifestyle: (data: Partial<LifestyleState>) => void;
}

export interface EncounterSnapshot {
  appointmentId: string | null;
  encounterId: string | null;
  isLocked: boolean;
  lockedAt: string | null;
  addendumNotes: string | null;
  patient: EncounterState['patient'];
  consentObtained: boolean;
  activeTab: string;
  ocularHistory: OcularHistoryState;
  symptoms: SymptomItem[];
  visualAcuity: EncounterState['visualAcuity'];
  refraction: RefractionGridValues;
  slitLamp: EncounterState['slitLamp'];
  odCanvasVectors: string;
  osCanvasVectors: string;
  systemicHistory: EncounterState['systemicHistory'];
  patientMedications: MedicationEntry[];
  familyOcularHistory: FamilyHistoryItem[];
  familySystemicHistory: FamilyHistoryItem[];
  spectaclesHistory: SpectaclesState;
  contactLensHistory: ContactLensState;
  lifestyleDemands: LifestyleState;
  tonometry: EncounterState['tonometry'];
  diagnoses: EncounterState['diagnoses'];
  counselingAdvice: string;
  treatmentPathway: string;
  sectionData: Record<string, any>;
}

// Read-only guard: when the exam is locked (finalized), every `set` is a
// no-op unless it is a meta transition (navigating exams / restoring DB
// data) or touches lock state itself. UX layer only — the API enforces the
// real immutability.
const META_KEYS = new Set([
  'isLocked', 'lockedAt', 'encounterId', 'appointmentId', 'activeTab',
  'patient', 'consentObtained', 'encounterSnapshots',
]);

export const useEncounterStore = create<EncounterState>((rawSet, get) => {
  const set: typeof rawSet = (partial, replace?) => {
    const locked = get().isLocked;
    if (!locked) {
      rawSet(partial, replace as any);
      return;
    }
    const patch = typeof partial === 'function' ? (partial as any)(get()) : partial;
    const keys = Object.keys(patch ?? {});
    if (keys.length === 0) {
      rawSet(partial, replace as any);
      return;
    }
    const isRestore = keys.includes('isLocked') || keys.includes('appointmentId');
    const allowedKeys = keys.filter((k) => META_KEYS.has(k) || isRestore);
    if (allowedKeys.length === 0) return;
    const filtered: Record<string, unknown> = {};
    for (const k of allowedKeys) filtered[k] = (patch as Record<string, unknown>)[k];
    rawSet(filtered as any, replace as any);
  };

  return {
  activeTab: 'reason-for-visit',
  appointmentId: null,
  encounterId: null,
  isLocked: false,
  lockedAt: null,
  addendumNotes: null,
  patient: {
    id: '',
    mrn: '',
    name: '',
    age: 0,
    gender: '',
    appointmentTime: '',
    reasonForVisit: '',
  },
  consentObtained: false,
  encounterSnapshots: {},
  ...getDefaultClinicalState(),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setConsent: (val) => set({ consentObtained: val }),
  setPatient: (patient) => set({ patient }),

  setSectionData: (section, data) =>
    set((state) => ({ sectionData: { ...state.sectionData, [section]: data } })),

  startExam: ({ encounterId, appointmentId, patient, consentObtained, reasonForVisit }) =>
    set((state) => {
      const snapshots = { ...state.encounterSnapshots };
      if (state.encounterId && state.encounterId !== encounterId) {
        const { appointmentId: prevApt, encounterId: prevId, encounterSnapshots: _snaps, ...rest } = state;
        const { setActiveTab, setConsent, setPatient, setSectionData, startExam, loadEncounterFromDb,
          saveEncounter, markExamFinalized, updateOcularCondition, setOcularGeneralRemarks, setNoOcularHistory,
          updateRefraction, updateVisualAcuity, setVisualAcuityCell, setVisualAcuityUnit,
          setCanvasVectors, updateSlitLamp, updateTonometry,
          addOrToggleSymptom, updateSymptom, setSymptoms, setSystemicConditions, setPatientMedications,
          setFamilyOcularHistory, setFamilySystemicHistory, setSpectaclesHistory, setContactLensHistory,
          updateSystemicCondition,
          setSystemicGeneralRemarks, setNoSystemicHistory, addPatientMedication, removePatientMedication,
          addFamilyHistoryItem, removeFamilyHistoryItem, updateSpectacles, updateContactLens,
          updateLifestyle, ...dataOnly } = rest;
        snapshots[prevId as string] = { encounterId: prevId, appointmentId: prevApt, ...dataOnly };
      }
      return {
        ...getDefaultClinicalState(),
        appointmentId: appointmentId ?? null,
        encounterId,
        isLocked: false,
        lockedAt: null,
        addendumNotes: null,
        patient: { ...patient, reasonForVisit },
        consentObtained,
        activeTab: 'reason-for-visit',
        encounterSnapshots: snapshots,
      };
    }),

  loadEncounterFromDb: (data: any) =>
    set((state) => {
      if (!data) return state;
      return apiEncounterToSnapshot(data, state as unknown as EncounterSnapshot);
    }),

  saveEncounter: async () => {
    const state = useEncounterStore.getState();
    if (state.isLocked) return;
    if (!state.encounterId || !state.patient.id) return;
    const { api } = await import('../lib/api');

    let refractions: any[] = [];
    const r = state.refraction;
    const hasRefraction = [r.odSph, r.odCyl, r.odAxis, r.odAdd, r.osSph, r.osCyl, r.osAxis, r.osAdd]
      .some((v) => (v ?? '').trim() !== '');
    if (hasRefraction) {
      const n = (v: string): number | undefined => {
        const parsed = Number.parseFloat(v);
        return Number.isFinite(parsed) ? parsed : undefined;
      };
      const od = { sph: n(r.odSph), cyl: n(r.odCyl), axis: n(r.odAxis), va: r.odVa.trim() || undefined, add: n(r.odAdd) };
      const os = { sph: n(r.osSph), cyl: n(r.osCyl), axis: n(r.osAxis), va: r.osVa.trim() || undefined, add: n(r.osAdd) };
      refractions = [{
        type: 'MAIN',
        od: Object.fromEntries(Object.entries(od).filter(([, v]) => v !== undefined)),
        os: Object.fromEntries(Object.entries(os).filter(([, v]) => v !== undefined)),
        pdBinocular: n(r.pdBinocular.trim() === '' ? '' : r.pdBinocular),
        bvdMm: n(r.bvdMm.trim() === '' ? '' : r.bvdMm),
      }];
    }

    let canvas: any;
    if (state.odCanvasVectors || state.osCanvasVectors) {
      const parseVec = (raw: string): any => {
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
      };
      canvas = {
        segmentType: 'CORNEA_ANTERIOR',
        odVectorData: parseVec(state.odCanvasVectors),
        osVectorData: parseVec(state.osCanvasVectors),
      };
    }

    const payload: Record<string, any> = {
      encounterId: state.encounterId,
      appointmentId: state.appointmentId,
      patientId: state.patient.id,
      reasonForVisit: {
        selectedReason: state.patient.reasonForVisit || '',
        remarks: (state.sectionData['reason-for-visit'] as any)?.remarks ?? '',
        showInDischarge: (state.sectionData['reason-for-visit'] as any)?.showInDischarge ?? false,
      },
      symptomaticHistory: { symptoms: state.symptoms, remarks: (state.sectionData['symptomatic-history'] as any)?.remarks ?? '', showInDischarge: (state.sectionData['symptomatic-history'] as any)?.showInDischarge ?? false },
      ocularHistory: state.ocularHistory,
      systemicHistory: state.systemicHistory,
      medicationHistory: state.patientMedications,
      familyOcularHistory: state.familyOcularHistory,
      familySystemicHistory: state.familySystemicHistory,
      spectaclesHistory: state.spectaclesHistory,
      contactLensHistory: state.contactLensHistory,
      lifestyleDemands: state.lifestyleDemands,
      visualAcuity: state.visualAcuity,
      slitLampFindings: state.slitLamp,
      tonometry: state.tonometry,
      diagnoses: state.diagnoses,
      treatmentPlanPathway: state.treatmentPathway,
      counselingAdviceGiven: state.counselingAdvice,
    };
    if (refractions.length > 0) payload.refractions = refractions;
    if (canvas) payload.canvas = canvas;
    if (Object.keys(state.sectionData).length > 0) payload.sectionData = state.sectionData;

    await api.post('/clinical/encounter', payload);

    if (state.appointmentId && state.consentObtained !== undefined) {
      await api.patch(`/appointments/${state.appointmentId}/consent`, { consentObtained: state.consentObtained }).catch(() => {});
    }
  },

  markExamFinalized: (encounterId) =>
    set({ encounterId, isLocked: true, lockedAt: new Date().toISOString() }),

  updateOcularCondition: (key, data) =>
    set((state) => ({
      ocularHistory: {
        ...state.ocularHistory,
        conditions: {
          ...state.ocularHistory.conditions,
          [key]: { ...state.ocularHistory.conditions[key], ...data },
        },
      },
    })),
  setOcularGeneralRemarks: (generalRemarks) =>
    set((state) => ({
      ocularHistory: { ...state.ocularHistory, generalRemarks },
    })),
  setNoOcularHistory: (noHistoryReported) =>
    set((state) => ({
      ocularHistory: { ...state.ocularHistory, noHistoryReported },
    })),
  updateRefraction: (data) =>
    set((state) => ({ refraction: { ...state.refraction, ...data } })),
  updateVisualAcuity: (data) =>
    set((state) => ({ visualAcuity: { ...state.visualAcuity, ...data } })),
  setVisualAcuityCell: (eye, scope, key, value) =>
    set((state) => ({
      visualAcuity: {
        ...state.visualAcuity,
        [eye]: {
          ...state.visualAcuity[eye],
          [scope]: { ...state.visualAcuity[eye][scope], [key]: value },
        },
      },
    })),
  setVisualAcuityUnit: (unit) =>
    set((state) => ({ visualAcuity: { ...state.visualAcuity, unit } })),
  setCanvasVectors: (eye, vectors) =>
    set({
      [eye === 'OD' ? 'odCanvasVectors' : 'osCanvasVectors']: vectors,
    }),
  updateSlitLamp: (data) =>
    set((state) => ({ slitLamp: { ...state.slitLamp, ...data } })),
  updateTonometry: (data) =>
    set((state) => ({ tonometry: { ...state.tonometry, ...data } })),
  addOrToggleSymptom: (name) =>
    set((state) => {
      const exists = state.symptoms.find((s) => s.name === name);
      if (exists) {
        return { symptoms: state.symptoms.filter((s) => s.name !== name) };
      }
      const newSymptom: SymptomItem = {
        id: crypto.randomUUID(),
        name,
        eye: 'Both Eyes',
        durationValue: 1,
        durationUnit: 'months',
        frequency: 'Constant',
        severity: 'Moderate',
        remarks: '',
      };
      return { symptoms: [...state.symptoms, newSymptom] };
    }),
  updateSymptom: (id, data) =>
    set((state) => ({
      symptoms: state.symptoms.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  setSymptoms: (symptoms) => set({ symptoms }),
  setSystemicConditions: (conditions) =>
    set((state) => ({ systemicHistory: { ...state.systemicHistory, conditions } })),
  setPatientMedications: (patientMedications) => set({ patientMedications }),
  setFamilyOcularHistory: (familyOcularHistory) => set({ familyOcularHistory }),
  setFamilySystemicHistory: (familySystemicHistory) => set({ familySystemicHistory }),
  setSpectaclesHistory: (spectaclesHistory) => set({ spectaclesHistory }),
  setContactLensHistory: (contactLensHistory) => set({ contactLensHistory }),
  updateSystemicCondition: (key, data) =>
    set((state) => ({
      systemicHistory: {
        ...state.systemicHistory,
        conditions: {
          ...state.systemicHistory.conditions,
          [key]: { ...state.systemicHistory.conditions[key], ...data },
        },
      },
    })),
  setSystemicGeneralRemarks: (generalRemarks) =>
    set((state) => ({
      systemicHistory: { ...state.systemicHistory, generalRemarks },
    })),
  setNoSystemicHistory: (noHistoryReported) =>
    set((state) => ({
      systemicHistory: { ...state.systemicHistory, noHistoryReported },
    })),
  addPatientMedication: (med) =>
    set((state) => ({
      patientMedications: [...state.patientMedications, med],
    })),
  removePatientMedication: (id) =>
    set((state) => ({
      patientMedications: state.patientMedications.filter((m) => m.id !== id),
    })),
  addFamilyHistoryItem: (type, item) =>
    set((state) => ({
      ...(type === 'ocular'
        ? { familyOcularHistory: [...state.familyOcularHistory, item] }
        : { familySystemicHistory: [...state.familySystemicHistory, item] }),
    })),
  removeFamilyHistoryItem: (type, id) =>
    set((state) => ({
      ...(type === 'ocular'
        ? { familyOcularHistory: state.familyOcularHistory.filter((i) => i.id !== id) }
        : { familySystemicHistory: state.familySystemicHistory.filter((i) => i.id !== id) }),
    })),
  updateSpectacles: (data) =>
    set((state) => ({ spectaclesHistory: { ...state.spectaclesHistory, ...data } })),
  updateContactLens: (data) =>
    set((state) => ({ contactLensHistory: { ...state.contactLensHistory, ...data } })),
  updateLifestyle: (data) =>
    set((state) => ({ lifestyleDemands: { ...state.lifestyleDemands, ...data } })),
  };
});
