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
  ocularHistory: {
    noHistoryReported: boolean;
    infection: {
      active: boolean;
      eye: 'Left Eye' | 'Right Eye' | 'Both Eyes';
      date: string;
      type: string;
      remarks: string;
    };
    surgery: { active: boolean; eye: string; date: string; procedure: string };
    trauma: { active: boolean; eye: string; date: string; remarks: string };
    glaucoma: { active: boolean; eye: string; remarks: string };
  };
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
  updateOcularInfection: (data: Partial<EncounterState['ocularHistory']['infection']>) => void;
  toggleOcularCondition: (key: 'infection' | 'surgery' | 'trauma' | 'glaucoma') => void;
  updateRefraction: (data: Partial<RefractionGridValues>) => void;
  updateVisualAcuity: (data: Partial<EncounterState['visualAcuity']>) => void;
  setCanvasVectors: (eye: 'OD' | 'OS', vectors: string) => void;
  updateSlitLamp: (data: Partial<EncounterState['slitLamp']>) => void;
  updateTonometry: (data: Partial<EncounterState['tonometry']>) => void;
  addOrToggleSymptom: (name: string) => void;
  updateSymptom: (id: string, data: Partial<SymptomItem>) => void;
  setVisualAcuityField: (field: keyof EncounterState['visualAcuity'], value: string) => void;
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
    infection: {
      active: true,
      eye: 'Both Eyes',
      date: '',
      type: 'Corneal',
      remarks: 'Childhood corneal infection, unsure of exact date',
    },
    surgery: { active: false, eye: 'Right Eye', date: '', procedure: '' },
    trauma: { active: false, eye: 'Right Eye', date: '', remarks: '' },
    glaucoma: { active: false, eye: 'Both Eyes', remarks: '' },
  },
  symptoms: [],

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
  updateOcularInfection: (data) =>
    set((state) => ({
      ocularHistory: {
        ...state.ocularHistory,
        infection: { ...state.ocularHistory.infection, ...data },
      },
    })),
  toggleOcularCondition: (key) =>
    set((state) => ({
      ocularHistory: {
        ...state.ocularHistory,
        [key]: {
          ...state.ocularHistory[key],
          active: !state.ocularHistory[key].active,
        },
      },
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
}));
