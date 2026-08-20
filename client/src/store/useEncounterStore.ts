import { create } from 'zustand';

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

  // Actions
  setActiveTab: (tab: string) => void;
  setConsent: (val: boolean) => void;
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

export const useEncounterStore = create<EncounterState>((set) => ({
  activeTab: 'ocular-history',
  patient: {
    id: 'p-1',
    mrn: 'SEL-2026-0001',
    name: 'Barrack Obama',
    age: 53,
    gender: 'Male',
    appointmentTime: 'Mon, 03 Jul 2026, 11:30',
    reasonForVisit: 'Follow Up Appointment',
  },
  consentObtained: true,

  ocularHistory: {
    noHistoryReported: false,
    generalRemarks: 'Patient reported childhood history treated in rural clinic.',
    conditions: {
      surgery: { active: false, eye: 'Right Eye', date: '', type: 'Cataract', remarks: '', showInDischarge: true },
      trauma: { active: false, eye: 'Right Eye', date: '', type: 'Blunt Trauma', remarks: '', showInDischarge: true },
      infection: { active: true, eye: 'Both Eyes', date: '', type: 'Corneal', remarks: 'Childhood corneal infection, unsure of exact date', showInDischarge: true },
      glaucoma: { active: false, eye: 'Both Eyes', date: '', type: 'POAG', remarks: '', showInDischarge: false },
      retinalDetachment: { active: false, eye: 'Right Eye', date: '', type: 'Rhegmatogenous', remarks: '', showInDischarge: false },
      amblyopia: { active: false, eye: 'Left Eye', date: '', type: 'Refractive', remarks: '', showInDischarge: false },
    },
  },
  symptoms: [],

  systemicHistory: {
    noHistoryReported: false,
    generalRemarks: '',
    conditions: {
      diabetes: { active: false, durationValue: 1, durationUnit: 'years', type: 'Type 2 (NIDDM)', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      hypertension: { active: false, durationValue: 1, durationUnit: 'years', type: 'Essential / Primary', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      thyroid: { active: false, durationValue: 1, durationUnit: 'years', type: 'Hypothyroidism (Hashimoto)', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      autoimmune: { active: false, durationValue: 1, durationUnit: 'years', type: 'Rheumatoid Arthritis', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      cardiovascular: { active: false, durationValue: 1, durationUnit: 'years', type: 'Coronary Artery Disease', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      respiratoryAsthma: { active: false, durationValue: 1, durationUnit: 'years', type: 'Bronchial Asthma', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      cholesterol: { active: false, durationValue: 1, durationUnit: 'years', type: 'Mixed Hyperlipidemia', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
      allergies: { active: false, durationValue: 1, durationUnit: 'years', type: 'Penicillin / Beta-lactams', controlStatus: 'Well Controlled', remarks: '', showInDischarge: true },
    },
  },
  patientMedications: [],
  familyOcularHistory: [],
  familySystemicHistory: [],
  spectaclesHistory: {
    currentlyWears: false,
    type: 'Single Vision (Distance)',
    ageOfCurrentGlasses: '',
    material: 'CR-39 (Plastic)',
    coating: [],
    satisfaction: 'Satisfied',
    remarks: '',
  },
  contactLensHistory: {
    currentWearer: false,
    modality: 'Daily Disposable',
    solutionUsed: '',
    wearingHoursPerDay: 8,
    complianceWithCleaning: 'Good',
    lastEyeCheckDate: '',
    remarks: '',
  },
  lifestyleDemands: {
    occupation: '',
    screenTimeHoursPerDay: 8,
    outdoorActivities: '',
    hobbies: '',
    lightingConditionWorkplace: 'Good',
    drivingRequirements: 'Daytime Only',
  },

  visualAcuity: {
    unaidedOd: '6/24',
    unaidedOs: '6/12',
    aidedOd: '6/24',
    aidedOs: '6/9',
    pinholeOd: '6/12',
    pinholeOs: '6/6',
  },

  refraction: {
    odSph: '-1.50',
    odCyl: '-12.00',
    odAxis: '180',
    odVa: '6/12',
    odAdd: '+1.75',
    osSph: '-0.75',
    osCyl: '-1.50',
    osAxis: '90',
    osVa: '6/6',
    osAdd: '+1.75',
    pdBinocular: '64',
    bvdMm: '12',
  },

  slitLamp: {
    lidsLashes: 'Normal',
    conjunctiva: 'Clear',
    cornea: 'Corneal Scarring / Opacity',
    anteriorChamber: 'Quiet & Deep',
    irisLens: 'Normal / Clear',
  },
  odCanvasVectors: '',
  osCanvasVectors: '',

  tonometry: {
    odIop: '14',
    osIop: '15',
    method: 'NCT',
  },

  diagnoses: [
    { title: 'High Irregular Astigmatism secondary to Corneal Scar', eye: 'OD', notes: 'Advised RGP contact lens trial' },
    { title: 'Dry Eye Syndrome', eye: 'OU', notes: 'Preservative-free lubricants' },
  ],
  counselingAdvice: 'Explained why spectacles cannot correct irregular corneal cylinder; recommended corneal surgeon evaluation for graft/RGP lenses.',
  treatmentPathway: 'OPTICAL',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setConsent: (val) => set({ consentObtained: val }),
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
