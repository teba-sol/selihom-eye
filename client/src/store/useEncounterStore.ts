import { create } from 'zustand';
import { getDefaultClinicalState } from '../lib/encounterDefaults';

export interface SymptomItem {
  id: string;
  name: string;
  eye: 'Left Eye' | 'Right Eye' | 'Both Eyes';
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  frequency: 'Constant' | 'Intermittent' | 'Morning' | 'Evening' | 'Near work';
  severity: 'Mild' | 'Moderate' | 'Severe';
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
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  type?: string;
  controlStatus: 'Well Controlled' | 'Moderately Controlled' | 'Poorly Controlled' | 'Uncontrolled';
  remarks: string;
  showInDischarge: boolean;
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
  relation: 'Father' | 'Mother' | 'Sibling' | 'Maternal Grandparent' | 'Paternal Grandparent';
  condition: string;
  notes: string;
  showInDischarge: boolean;
}

export interface SpectaclesState {
  currentlyWears: boolean;
  type: 'Single Vision (Distance)' | 'Single Vision (Near)' | 'Bifocal' | 'Progressive (PAL)' | 'None';
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

interface EncounterState {
  activeTab: string;
  appointmentId: string | null;
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

  // 1. History and Symptoms
  ocularHistory: OcularHistoryState;
  symptoms: SymptomItem[];

  // 2. Visual Acuity
  visualAcuity: {
    unaidedOd: string;
    unaidedOs: string;
    aidedOd: string;
    aidedOs: string;
    pinholeOd: string;
    pinholeOs: string;
  };

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
    conditions: {
      diabetes: SystemicConditionDetail;
      hypertension: SystemicConditionDetail;
      thyroid: SystemicConditionDetail;
      autoimmune: SystemicConditionDetail;
      cardiovascular: SystemicConditionDetail;
      respiratoryAsthma: SystemicConditionDetail;
      cholesterol: SystemicConditionDetail;
      allergies: SystemicConditionDetail;
    };
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

  encounterSnapshots: Record<string, EncounterSnapshot>;

  // Actions
  setActiveTab: (tab: string) => void;
  setConsent: (val: boolean) => void;
  setPatient: (patient: EncounterState['patient']) => void;
  loadFromAppointment: (params: {
    appointmentId: string;
    patient: EncounterState['patient'];
    consentObtained: boolean;
    reasonForVisit: string;
  }) => void;
  updateOcularCondition: (key: keyof OcularHistoryState['conditions'], data: Partial<OcularConditionDetail>) => void;
  setOcularGeneralRemarks: (remarks: string) => void;
  setNoOcularHistory: (val: boolean) => void;
  updateRefraction: (data: Partial<RefractionGridValues>) => void;
  updateVisualAcuity: (data: Partial<EncounterState['visualAcuity']>) => void;
  setCanvasVectors: (eye: 'OD' | 'OS', vectors: string) => void;
  updateSlitLamp: (data: Partial<EncounterState['slitLamp']>) => void;
  updateTonometry: (data: Partial<EncounterState['tonometry']>) => void;
  addOrToggleSymptom: (name: string) => void;
  updateSymptom: (id: string, data: Partial<SymptomItem>) => void;
  setVisualAcuityField: (field: keyof EncounterState['visualAcuity'], value: string) => void;
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

export type EncounterSnapshot = Omit<
  EncounterState,
  | 'encounterSnapshots'
  | 'setActiveTab'
  | 'setConsent'
  | 'setPatient'
  | 'loadFromAppointment'
  | 'updateOcularCondition'
  | 'setOcularGeneralRemarks'
  | 'setNoOcularHistory'
  | 'updateRefraction'
  | 'updateVisualAcuity'
  | 'setCanvasVectors'
  | 'updateSlitLamp'
  | 'updateTonometry'
  | 'addOrToggleSymptom'
  | 'updateSymptom'
  | 'setVisualAcuityField'
  | 'updateSystemicCondition'
  | 'setSystemicGeneralRemarks'
  | 'setNoSystemicHistory'
  | 'addPatientMedication'
  | 'removePatientMedication'
  | 'addFamilyHistoryItem'
  | 'removeFamilyHistoryItem'
  | 'updateSpectacles'
  | 'updateContactLens'
  | 'updateLifestyle'
>;

function snapshotFromState(state: EncounterState): EncounterSnapshot {
  const {
    encounterSnapshots: _s,
    setActiveTab: _a,
    setConsent: _c,
    setPatient: _p,
    loadFromAppointment: _l,
    updateOcularCondition: _o,
    setOcularGeneralRemarks: _og,
    setNoOcularHistory: _no,
    updateRefraction: _r,
    updateVisualAcuity: _v,
    setCanvasVectors: _cv,
    updateSlitLamp: _sl,
    updateTonometry: _t,
    addOrToggleSymptom: _as,
    updateSymptom: _us,
    setVisualAcuityField: _vf,
    updateSystemicCondition: _sc,
    setSystemicGeneralRemarks: _sg,
    setNoSystemicHistory: _ns,
    addPatientMedication: _am,
    removePatientMedication: _rm,
    addFamilyHistoryItem: _af,
    removeFamilyHistoryItem: _rf,
    updateSpectacles: _sp,
    updateContactLens: _cl,
    updateLifestyle: _lf,
    ...snapshot
  } = state;
  return snapshot;
}

export const useEncounterStore = create<EncounterState>((set) => ({
  activeTab: 'reason-for-visit',
  appointmentId: null,
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

  loadFromAppointment: ({ appointmentId, patient, consentObtained, reasonForVisit }) =>
    set((state) => {
      const snapshots = { ...state.encounterSnapshots };

      if (state.appointmentId && state.appointmentId !== appointmentId) {
        snapshots[state.appointmentId] = snapshotFromState(state);
      }

      const cached = snapshots[appointmentId];
      if (cached) {
        return {
          ...cached,
          appointmentId,
          patient: { ...patient, reasonForVisit },
          consentObtained,
          encounterSnapshots: snapshots,
        };
      }

      return {
        ...getDefaultClinicalState(),
        appointmentId,
        patient: { ...patient, reasonForVisit },
        consentObtained,
        activeTab: 'reason-for-visit',
        encounterSnapshots: snapshots,
      };
    }),

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
  setCanvasVectors: (eye, vectors) =>
    set((state) => ({
      [eye === 'OD' ? 'odCanvasVectors' : 'osCanvasVectors']: vectors,
    })),
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
  setVisualAcuityField: (field, value) =>
    set((state) => ({
      visualAcuity: { ...state.visualAcuity, [field]: value },
    })),
  updateSystemicCondition: (key, data) =>
    set((state) => ({
      systemicHistory: {
        ...state.systemicHistory,
        conditions: {
          ...state.systemicHistory.conditions,
          [key]: { ...(state.systemicHistory.conditions as any)[key], ...data },
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
}));
