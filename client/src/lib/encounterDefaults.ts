export function getDefaultClinicalState() {
  return {
    ocularHistory: {
      noHistoryReported: false,
      generalRemarks: '',
      conditions: {
        surgery: { active: false, eye: 'Right Eye' as const, date: '', type: 'Cataract', remarks: '', showInDischarge: true },
        trauma: { active: false, eye: 'Right Eye' as const, date: '', type: 'Blunt Trauma', remarks: '', showInDischarge: true },
        infection: { active: false, eye: 'Both Eyes' as const, date: '', type: 'Corneal', remarks: '', showInDischarge: true },
        glaucoma: { active: false, eye: 'Both Eyes' as const, date: '', type: 'POAG', remarks: '', showInDischarge: false },
        retinalDetachment: { active: false, eye: 'Right Eye' as const, date: '', type: 'Rhegmatogenous', remarks: '', showInDischarge: false },
        amblyopia: { active: false, eye: 'Left Eye' as const, date: '', type: 'Refractive', remarks: '', showInDischarge: false },
      },
    },
    symptoms: [],
    systemicHistory: {
      noHistoryReported: false,
      generalRemarks: '',
      conditions: {
        diabetes: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Type 2 (NIDDM)', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        hypertension: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Essential / Primary', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        thyroid: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Hypothyroidism (Hashimoto)', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        autoimmune: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Rheumatoid Arthritis', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        cardiovascular: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Coronary Artery Disease', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        respiratoryAsthma: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Bronchial Asthma', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        cholesterol: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Mixed Hyperlipidemia', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
        allergies: { active: false, durationValue: 1, durationUnit: 'years' as const, type: 'Penicillin / Beta-lactams', controlStatus: 'Well Controlled' as const, remarks: '', showInDischarge: true },
      },
    },
    patientMedications: [],
    familyOcularHistory: [],
    familySystemicHistory: [],
    spectaclesHistory: {
      currentlyWears: false,
      type: 'Single Vision (Distance)' as const,
      ageOfCurrentGlasses: '',
      material: 'CR-39 (Plastic)' as const,
      coating: [],
      satisfaction: 'Satisfied' as const,
      remarks: '',
    },
    contactLensHistory: {
      currentWearer: false,
      modality: 'Daily Disposable' as const,
      solutionUsed: '',
      wearingHoursPerDay: 8,
      complianceWithCleaning: 'Good' as const,
      lastEyeCheckDate: '',
      remarks: '',
    },
    lifestyleDemands: {
      occupation: '',
      screenTimeHoursPerDay: 8,
      outdoorActivities: '',
      hobbies: '',
      lightingConditionWorkplace: 'Good' as const,
      drivingRequirements: 'Daytime Only' as const,
    },
    visualAcuity: {
      unit: 'Snellan',
      od: {
        dist: { unaided: '', aided: '', pinhole: '' },
        near: { unaided: '', aided: '', pinhole: '' },
      },
      os: {
        dist: { unaided: '', aided: '', pinhole: '' },
        near: { unaided: '', aided: '', pinhole: '' },
      },
      ou: {
        dist: { unaided: '', aided: '', pinhole: '' },
        near: { unaided: '', aided: '', pinhole: '' },
      },
      remarks: '',
    },
    refraction: {
      odSph: '',
      odCyl: '',
      odAxis: '',
      odVa: '',
      odAdd: '',
      osSph: '',
      osCyl: '',
      osAxis: '',
      osVa: '',
      osAdd: '',
      pdBinocular: '',
      bvdMm: '',
    },
    slitLamp: {
      lidsLashes: '',
      conjunctiva: '',
      cornea: '',
      anteriorChamber: '',
      irisLens: '',
    },
    odCanvasVectors: '',
    osCanvasVectors: '',
    tonometry: {
      odIop: '',
      osIop: '',
      method: 'NCT' as const,
    },
    diagnoses: [],
    counselingAdvice: '',
    treatmentPathway: '',
    sectionData: {},
  };
}

import { formatEthiopianDate } from '../lib/formatters';

export function buildAppointmentTime(date: string, startTime: string): string {
  const d = new Date(date + 'T00:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const ethDate = formatEthiopianDate(d);
  return `${weekday}, ${ethDate}, ${startTime}`;
}
