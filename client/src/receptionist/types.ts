export interface RegisteredPatient {
  id: string;
  meta: {
    facility: string;
    mrn: string;
    registrationDate: {
      ethiopian: string;
      gregorian: string;
    };
    referral: {
      referred: boolean;
      source: string | null;
    };
  };
  personalInfo: {
    firstName: string;
    fatherName: string;
    grandFatherName: string;
    sex: string;
  };
  dob: {
    ethiopian: string;
    gregorian: string;
  };
  age: string;
  address: {
    region: string;
    zone: string;
    woreda: string;
    kebele: string;
    ketena: string;
    houseNumber: string;
  };
  contact: {
    phone: string;
  };
  triageData?: NurseTriageRecord | null;
  status: 'Waiting for Nurse Triage' | 'Triage Completed - Sent to Doctor' | 'In Consultation' | 'Completed';
  createdAt: string;
}

export interface NurseTriageRecord {
  triageDateEth: string;
  triageDateEuro: string;
  triageTime: string;
  nurseName: string;
  urgencyLevel: 'emergency' | 'urgent' | 'routine';
  assignedDoctor: string;
  examinationRoom: string;

  // Vitals & Systemic
  vitals: {
    bloodPressureSys: string;
    bloodPressureDia: string;
    bpClassification: string;
    pulseRate: string;
    respiratoryRate: string;
    temperature: string;
    spo2: string;
    weightKg: string;
    heightCm: string;
    bmi: string;
  };

  // Diabetic Screening
  diabeticScreening: {
    isDiabetic: 'no' | 'type1' | 'type2' | 'gestational' | 'prediabetes' | 'unknown';
    bloodSugarType: 'RBS' | 'FBS';
    bloodSugarValue: string; // mg/dL
    hba1c: string;
    onMedicationOrInsulin: boolean;
    medicationDetails: string;
    diabetesDurationYears: string;
    diabeticRetinopathySuspected: boolean;
  };

  // Ocular Assessment
  ocularAssessment: {
    chiefComplaintTags: string[];
    chiefComplaintDetails: string;
    affectedEye: 'OD' | 'OS' | 'OU';
    durationOfSymptoms: string;
    painScale: number; // 0-10

    // Visual Acuity
    vaUnaidedOD: string;
    vaUnaidedOS: string;
    vaPinholeOD: string;
    vaPinholeOS: string;
    vaWithGlassesOD: string;
    vaWithGlassesOS: string;

    // Intraocular Pressure (IOP)
    iopOD: string;
    iopOS: string;
    iopMethod: string;

    // Gross Ocular Exam
    eyeDischarge: 'none' | 'watery' | 'mucoid' | 'purulent';
    pupilReaction: 'normal' | 'sluggish' | 'fixed_dilated' | 'rapd_suspected';
    corneaCondition: 'clear' | 'hazy' | 'foreign_body' | 'ulcer_suspected' | 'trauma';
  };

  // History & Meds
  historyAndMeds: {
    currentEyeDrops: string;
    systemicMedications: string;
    knownAllergies: string;
    pastOcularSurgeries: string;
    pastMedicalHistory: string[];
  };

  // Nursing Action
  nurseNotes: string;
  interventionsPerformed: string[];
  sentToDoctor: boolean;
  sentAt: string;
}
