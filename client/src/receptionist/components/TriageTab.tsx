import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  Syringe,
  Eye,
  AlertTriangle,
  Save,
  Send,
  CheckCircle2,
  User,
  Clock,
  Printer,
  ChevronRight,
  Search,
  FileText,
  ShieldCheck,
  Stethoscope,
  Building2,
  Thermometer,
  Zap,
  Info,
  RefreshCw,
  Plus
} from 'lucide-react';
import type { RegisteredPatient, NurseTriageRecord } from '../types.ts';

interface TriageTabProps {
  patients: RegisteredPatient[];
  selectedPatientId?: string | null;
  onSelectPatient: (id: string) => void;
  onSaveTriage: (patientId: string, triageData: NurseTriageRecord) => void;
  onNavigateToRegistration: () => void;
}

const COMMON_SYMPTOMS = [
  'Gradual Blurry Vision',
  'Sudden Vision Loss',
  'Red Eye / Congestion',
  'Ocular Pain / Ache',
  'Foreign Body Sensation',
  'Watery Eyes / Tearing',
  'Itching / Allergic Discharge',
  'Purulent Eye Discharge (Pus)',
  'Eye Trauma / Injury',
  'Chemical / Alkali Splash',
  'Floaters / Flashes of Light',
  'Photophobia (Light Sensitivity)',
  'Double Vision (Diplopia)',
  'Eyelid Swelling / Mass',
  'Headache / Asthenopia'
];

const VA_OPTIONS = [
  '6/6',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
  '3/60',
  '1/60',
  'Counting Fingers (CF)',
  'Hand Motion (HM)',
  'Light Perception (LP)',
  'No Light Perception (NLP)'
];

const NURSING_INTERVENTIONS = [
  'Visual Acuity Assessed (OD/OS)',
  'Random Blood Glucose (RBS) Tested',
  'Blood Pressure & Vitals Monitored',
  'Eye Saline Irrigation Performed',
  'Intraocular Pressure (IOP) Screened',
  'Corneal Fluorescein Stain Prepared',
  'Emergency Eye Shield / Pad Applied',
  'Pre-Doctor Counseling Given'
];

export const TriageTab: React.FC<TriageTabProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onSaveTriage,
  onNavigateToRegistration
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePatient, setActivePatient] = useState<RegisteredPatient | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form State
  const [urgencyLevel, setUrgencyLevel] = useState<'emergency' | 'urgent' | 'routine'>('routine');
  const [nurseName, setNurseName] = useState('Sister Selamawit (Nurse & Receptionist)');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Eyasu (Ophthalmic Specialist - Clinic Doctor)');
  const [examinationRoom, setExaminationRoom] = useState('Consultation Room');

  // Vitals
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [pulse, setPulse] = useState('74');
  const [respiration, setRespiration] = useState('18');
  const [temp, setTemp] = useState('36.6');
  const [spo2, setSpo2] = useState('98');
  const [weight, setWeight] = useState('68');
  const [height, setHeight] = useState('170');

  // Diabetic Screening
  const [isDiabetic, setIsDiabetic] = useState<'no' | 'type1' | 'type2' | 'gestational' | 'prediabetes' | 'unknown'>('no');
  const [bloodSugarType, setBloodSugarType] = useState<'RBS' | 'FBS'>('RBS');
  const [bloodSugarValue, setBloodSugarValue] = useState('110');
  const [hba1c, setHba1c] = useState('');
  const [onMedicationOrInsulin, setOnMedicationOrInsulin] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState('');
  const [diabetesDurationYears, setDiabetesDurationYears] = useState('');
  const [diabeticRetinopathySuspected, setDiabeticRetinopathySuspected] = useState(false);

  // Ocular Assessment
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Gradual Blurry Vision']);
  const [symptomDetails, setSymptomDetails] = useState('');
  const [affectedEye, setAffectedEye] = useState<'OD' | 'OS' | 'OU'>('OU');
  const [durationOfSymptoms, setDurationOfSymptoms] = useState('2 weeks');
  const [painScale, setPainScale] = useState(1);

  // Visual Acuity
  const [vaOD, setVaOD] = useState('6/12');
  const [vaOS, setVaOS] = useState('6/9');
  const [vaPhOD, setVaPhOD] = useState('6/6');
  const [vaPhOS, setVaPhOS] = useState('6/6');
  const [vaGlassOD, setVaGlassOD] = useState('');
  const [vaGlassOS, setVaGlassOS] = useState('');

  // IOP
  const [iopOD, setIopOD] = useState('16');
  const [iopOS, setIopOS] = useState('15');
  const [iopMethod, setIopMethod] = useState('Non-Contact Tonometry (Air Puff)');

  // Gross exam
  const [eyeDischarge, setEyeDischarge] = useState<'none' | 'watery' | 'mucoid' | 'purulent'>('none');
  const [pupilReaction, setPupilReaction] = useState<'normal' | 'sluggish' | 'fixed_dilated' | 'rapd_suspected'>('normal');
  const [corneaCondition, setCorneaCondition] = useState<'clear' | 'hazy' | 'foreign_body' | 'ulcer_suspected' | 'trauma'>('clear');

  // Meds & History
  const [currentEyeDrops, setCurrentEyeDrops] = useState('None');
  const [systemicMeds, setSystemicMeds] = useState('None');
  const [allergies, setAllergies] = useState('NKDA (No Known Drug Allergies)');
  const [pastSurgeries, setPastSurgeries] = useState('None');

  // Interventions
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([
    'Visual Acuity Assessed (OD/OS)',
    'Blood Pressure & Vitals Monitored'
  ]);
  const [nurseNotes, setNurseNotes] = useState('');

  // Filter patients: only list searched patients when searched with search bar
  const isSearching = searchQuery.trim().length > 0;
  const filteredPatients = isSearching
    ? patients.filter(p => {
        const query = searchQuery.toLowerCase().trim();
        const name = `${p.personalInfo.firstName} ${p.personalInfo.fatherName} ${p.personalInfo.grandFatherName || ''}`.toLowerCase();
        const mrn = p.meta.mrn.toLowerCase();
        const phone = (p.contact?.phone || '').toLowerCase();
        return name.includes(query) || mrn.includes(query) || phone.includes(query);
      })
    : [];

  // Sync active patient
  useEffect(() => {
    if (selectedPatientId) {
      const found = patients.find(p => p.id === selectedPatientId);
      if (found) {
        setActivePatient(found);
        loadPatientTriage(found);
      }
    } else if (patients.length > 0 && !activePatient) {
      setActivePatient(patients[0]);
      loadPatientTriage(patients[0]);
    }
  }, [selectedPatientId, patients]);

  function loadPatientTriage(patient: RegisteredPatient) {
    if (patient.triageData) {
      const t = patient.triageData;
      setUrgencyLevel(t.urgencyLevel || 'routine');
      setNurseName(t.nurseName || 'Sister Selamawit (Staff Nurse)');
      setAssignedDoctor(t.assignedDoctor || 'Dr. Ophthalmologist - Room 1 (OPD)');
      setExaminationRoom(t.examinationRoom || 'OPD Room 1');
      if (t.vitals) {
        setBpSys(t.vitals.bloodPressureSys || '120');
        setBpDia(t.vitals.bloodPressureDia || '80');
        setPulse(t.vitals.pulseRate || '74');
        setRespiration(t.vitals.respiratoryRate || '18');
        setTemp(t.vitals.temperature || '36.6');
        setSpo2(t.vitals.spo2 || '98');
        setWeight(t.vitals.weightKg || '68');
        setHeight(t.vitals.heightCm || '170');
      }
      if (t.diabeticScreening) {
        setIsDiabetic(t.diabeticScreening.isDiabetic || 'no');
        setBloodSugarType(t.diabeticScreening.bloodSugarType || 'RBS');
        setBloodSugarValue(t.diabeticScreening.bloodSugarValue || '110');
        setHba1c(t.diabeticScreening.hba1c || '');
        setOnMedicationOrInsulin(t.diabeticScreening.onMedicationOrInsulin || false);
        setMedicationDetails(t.diabeticScreening.medicationDetails || '');
        setDiabetesDurationYears(t.diabeticScreening.diabetesDurationYears || '');
        setDiabeticRetinopathySuspected(t.diabeticScreening.diabeticRetinopathySuspected || false);
      }
      if (t.ocularAssessment) {
        setSelectedSymptoms(t.ocularAssessment.chiefComplaintTags || []);
        setSymptomDetails(t.ocularAssessment.chiefComplaintDetails || '');
        setAffectedEye(t.ocularAssessment.affectedEye || 'OU');
        setDurationOfSymptoms(t.ocularAssessment.durationOfSymptoms || '2 weeks');
        setPainScale(t.ocularAssessment.painScale ?? 1);
        setVaOD(t.ocularAssessment.vaUnaidedOD || '6/12');
        setVaOS(t.ocularAssessment.vaUnaidedOS || '6/9');
        setVaPhOD(t.ocularAssessment.vaPinholeOD || '6/6');
        setVaPhOS(t.ocularAssessment.vaPinholeOS || '6/6');
        setVaGlassOD(t.ocularAssessment.vaWithGlassesOD || '');
        setVaGlassOS(t.ocularAssessment.vaWithGlassesOS || '');
        setIopOD(t.ocularAssessment.iopOD || '16');
        setIopOS(t.ocularAssessment.iopOS || '15');
        setIopMethod(t.ocularAssessment.iopMethod || 'Non-Contact Tonometry');
        setEyeDischarge(t.ocularAssessment.eyeDischarge || 'none');
        setPupilReaction(t.ocularAssessment.pupilReaction || 'normal');
        setCorneaCondition(t.ocularAssessment.corneaCondition || 'clear');
      }
      if (t.historyAndMeds) {
        setCurrentEyeDrops(t.historyAndMeds.currentEyeDrops || 'None');
        setSystemicMeds(t.historyAndMeds.systemicMedications || 'None');
        setAllergies(t.historyAndMeds.knownAllergies || 'NKDA');
        setPastSurgeries(t.historyAndMeds.pastOcularSurgeries || 'None');
      }
      setSelectedInterventions(t.interventionsPerformed || []);
      setNurseNotes(t.nurseNotes || '');
    } else {
      // Reset defaults for fresh triage
      setUrgencyLevel('routine');
      setSelectedSymptoms(['Gradual Blurry Vision']);
      setSymptomDetails('');
      setAffectedEye('OU');
      setPainScale(1);
      setNurseNotes('');
    }
  }

  // Calculate BMI
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  const bmiVal = (w > 0 && h > 0) ? (w / (h * h)).toFixed(1) : '23.5';

  // Blood pressure classification
  const sys = parseInt(bpSys, 10);
  const dia = parseInt(bpDia, 10);
  let bpCategory = 'Normal';
  let bpBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (sys >= 180 || dia >= 120) {
    bpCategory = 'Hypertensive Crisis (Urgent Eye & Systemic Risk)';
    bpBadgeColor = 'bg-rose-600 text-white border-rose-700 animate-pulse';
  } else if (sys >= 140 || dia >= 90) {
    bpCategory = 'Hypertension Stage 2';
    bpBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    bpCategory = 'Hypertension Stage 1';
    bpBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (sys >= 120 && sys <= 129 && dia < 80) {
    bpCategory = 'Elevated Blood Pressure';
    bpBadgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  // Blood sugar classification
  const bs = parseInt(bloodSugarValue, 10);
  let bsCategory = 'Normal Glucose';
  let bsBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (!isNaN(bs) && bs > 0) {
    if (bloodSugarType === 'RBS') {
      if (bs >= 200) {
        bsCategory = 'Hyperglycemia / Diabetic Range (High Risk for Retinopathy)';
        bsBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      } else if (bs >= 140) {
        bsCategory = 'Elevated / Impaired Glucose Tolerance';
        bsBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      }
    } else {
      if (bs >= 126) {
        bsCategory = 'Fasting Hyperglycemia / Diabetic Range';
        bsBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      } else if (bs >= 100) {
        bsCategory = 'Impaired Fasting Glucose';
        bsBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      }
    }
  }

  // Handle Save Triage
  const handleSave = () => {
    if (!activePatient) return;
    setIsSaving(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateEuro = now.toLocaleDateString('en-GB');

    const triageRecord: NurseTriageRecord = {
      triageDateEth: activePatient.meta.registrationDate.ethiopian,
      triageDateEuro: dateEuro,
      triageTime: timeStr,
      nurseName,
      urgencyLevel,
      assignedDoctor,
      examinationRoom,
      vitals: {
        bloodPressureSys: bpSys,
        bloodPressureDia: bpDia,
        bpClassification: bpCategory,
        pulseRate: pulse,
        respiratoryRate: respiration,
        temperature: temp,
        spo2,
        weightKg: weight,
        heightCm: height,
        bmi: bmiVal
      },
      diabeticScreening: {
        isDiabetic,
        bloodSugarType,
        bloodSugarValue,
        hba1c,
        onMedicationOrInsulin,
        medicationDetails,
        diabetesDurationYears,
        diabeticRetinopathySuspected
      },
      ocularAssessment: {
        chiefComplaintTags: selectedSymptoms,
        chiefComplaintDetails: symptomDetails,
        affectedEye,
        durationOfSymptoms,
        painScale,
        vaUnaidedOD: vaOD,
        vaUnaidedOS: vaOS,
        vaPinholeOD: vaPhOD,
        vaPinholeOS: vaPhOS,
        vaWithGlassesOD: vaGlassOD,
        vaWithGlassesOS: vaGlassOS,
        iopOD,
        iopOS,
        iopMethod,
        eyeDischarge,
        pupilReaction,
        corneaCondition
      },
      historyAndMeds: {
        currentEyeDrops,
        systemicMedications: systemicMeds,
        knownAllergies: allergies,
        pastOcularSurgeries: pastSurgeries,
        pastMedicalHistory: []
      },
      nurseNotes,
      interventionsPerformed: selectedInterventions,
      sentToDoctor: true,
      sentAt: `${dateEuro} at ${timeStr}`
    };

    setTimeout(() => {
      onSaveTriage(activePatient.id, triageRecord);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    }, 800);
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleIntervention = (item: string) => {
    setSelectedInterventions(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-400/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
              Ophthalmic Nurse Triage & Clinical Handover
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Patient Triage (የትሪያጅ እና የነርስ ምርመራ)
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
              Screen vital signs, diabetic risks, visual acuity (VA), intraocular pressure, and ocular complaints to prioritize patient care and transmit records to the consulting doctor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-blue-950/70 border border-blue-700/60 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <User className="w-4 h-4 text-blue-300" />
              <div>
                <div className="text-[10px] text-blue-300 font-semibold uppercase">Nurse & Receptionist</div>
                <div className="font-bold text-white">Sister Selamawit</div>
              </div>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-700/60 px-3.5 py-2 rounded-xl flex items-center gap-2 text-emerald-200">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-emerald-300 font-semibold uppercase">Consulting Doctor</div>
                <div className="font-bold text-white">Dr. Eyasu (Ophthalmic Specialist)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 shadow-lg flex items-start justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">
                Triage Saved & Sent to Doctor!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                Patient <b>{activePatient?.personalInfo.firstName} {activePatient?.personalInfo.fatherName}</b> (MRN: {activePatient?.meta.mrn}) has been updated with full vital signs, blood glucose screening, and visual acuity. Record sent to <b>{assignedDoctor}</b>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrintModal(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> View Doctor Slip
          </button>
        </div>
      )}

      {/* Main Grid: Patient Selector & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Patient Queue & Active Profile (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Patient Queue Search & List */}
          <div className="clinic-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />
                <h3 className="font-extrabold text-sm text-[#102a43] uppercase tracking-wide">
                  Waiting Queue {isSearching ? `(${filteredPatients.length} found)` : ''}
                </h3>
              </div>
              <button
                onClick={onNavigateToRegistration}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> New Patient
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by MRN, Name, Phone..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {!isSearching ? (
                <div className="text-center py-9 px-3 text-slate-400 text-xs">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <div className="font-semibold text-slate-700 mb-0.5">Search Patient Queue</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                    Type MRN, patient name, or phone number in the search bar above to find and select a patient.
                  </p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 px-3 text-slate-400 text-xs">
                  <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <div className="font-semibold text-slate-700 mb-0.5">No matching patients</div>
                  <p className="text-[11px] text-slate-400">
                    No records found for "{searchQuery}". Check MRN or name.
                  </p>
                </div>
              ) : (
                filteredPatients.map(p => {
                  const isSelected = activePatient?.id === p.id;
                  const isTriaged = !!p.triageData;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePatient(p);
                        onSelectPatient(p.id);
                        loadPatientTriage(p);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">
                            {p.personalInfo.firstName} {p.personalInfo.fatherName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                            {p.age}y / {p.personalInfo.sex}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-blue-700">
                          MRN: {p.meta.mrn}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Reg: {p.meta.registrationDate.ethiopian || p.meta.registrationDate.gregorian}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {isTriaged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Triaged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            Pending
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Patient Details Badge */}
          {activePatient ? (
            <div className="clinic-card p-5 bg-gradient-to-br from-white to-blue-50/40 border-blue-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white grid place-items-center font-bold text-xs">
                    {activePatient.personalInfo.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#102a43]">
                      {activePatient.personalInfo.firstName} {activePatient.personalInfo.fatherName} {activePatient.personalInfo.grandFatherName}
                    </h4>
                    <p className="text-[11px] font-bold text-blue-700">MRN: {activePatient.meta.mrn}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Age / Sex</span>
                  <span className="font-bold text-slate-800">{activePatient.age} Years · {activePatient.personalInfo.sex === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone Number</span>
                  <span className="font-bold text-slate-800">{activePatient.contact.phone || 'N/A'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Address (አድራሻ)</span>
                  <span className="font-medium text-slate-800">
                    {activePatient.address.region}, {activePatient.address.zone}, {activePatient.address.woreda}
                    {activePatient.address.kebele ? `, Kebele ${activePatient.address.kebele}` : ''}
                  </span>
                </div>
                {activePatient.meta.referral?.referred && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 col-span-2 text-amber-900">
                    <span className="text-[10px] uppercase font-extrabold block text-amber-800">Referred Patient</span>
                    <span className="font-semibold text-xs">From: {activePatient.meta.referral.source}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="clinic-card p-6 text-center text-slate-500 text-xs">
              <Info className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              Please select or register a patient to initiate nurse triage.
            </div>
          )}
        </div>

        {/* Right Column: Comprehensive Nurse Triage Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activePatient ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-5"
            >
              {/* SECTION 1: Triage Priority & Assignment */}
              <section className="clinic-card p-5 sm:p-6 border-l-4 border-l-blue-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      <Zap className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#102a43]">
                        1. Triage Priority Level (የትሪያጅ ቅድሚያ ደረጃ)
                      </h3>
                      <p className="text-xs text-slate-500">Determine clinical urgency and route to doctor</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgencyLevel('emergency')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        urgencyLevel === 'emergency'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      🔴 Code 1: Emergency (አጣዳፊ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgencyLevel('urgent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        urgencyLevel === 'urgent'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      🟡 Code 2: Urgent
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgencyLevel('routine')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        urgencyLevel === 'routine'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      🟢 Code 3: Routine
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="clinic-label">CONSULTING CLINIC DOCTOR</label>
                    <select
                      value={assignedDoctor}
                      onChange={(e) => setAssignedDoctor(e.target.value)}
                      className="clinic-select cursor-pointer font-bold text-slate-800"
                    >
                      <option value="Dr. Eyasu (Ophthalmic Specialist - Clinic Doctor)">Dr. Eyasu (Ophthalmic Specialist - Clinic Doctor)</option>
                    </select>
                  </div>
                  <div>
                    <label className="clinic-label">NURSE & RECEPTIONIST IN CHARGE</label>
                    <input
                      type="text"
                      value={nurseName}
                      onChange={(e) => setNurseName(e.target.value)}
                      className="clinic-input font-bold"
                      placeholder="e.g. Sister Selamawit (Nurse & Receptionist)"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: Vital Signs & Systemic Health */}
              <section className="clinic-card p-5 sm:p-6">
                <div className="clinic-section-head mb-4">
                  <div className="clinic-section-icon"><HeartPulse className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#102a43]">
                      2. Vital Signs & Systemic Screening (የሰውነት መለያ እና ደም ግፊት)
                    </h3>
                    <p className="text-xs text-slate-500">Blood pressure, heart rate, oxygenation, and BMI calculation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Blood pressure highlight row */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <label className="clinic-label mb-0 text-slate-900 font-extrabold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-600" />
                        BLOOD PRESSURE (BP) · የደም ግፊት (mmHg)
                      </label>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bpBadgeColor}`}>
                        {bpCategory}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Systolic (ሲስቶሊክ)</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={bpSys}
                            onChange={(e) => setBpSys(e.target.value)}
                            className="clinic-input font-bold text-center text-base"
                            placeholder="120"
                          />
                          <span className="text-xs text-slate-400 font-bold">/</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Diastolic (ዲያስቶሊክ)</span>
                        <input
                          type="number"
                          value={bpDia}
                          onChange={(e) => setBpDia(e.target.value)}
                          className="clinic-input font-bold text-center text-base"
                          placeholder="80"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Pulse Rate (bpm)</span>
                        <input
                          type="number"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          className="clinic-input font-bold text-center"
                          placeholder="72"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">SpO2 (%)</span>
                        <input
                          type="number"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                          className="clinic-input font-bold text-center"
                          placeholder="98"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Temp, Resp, Weight, Height, BMI */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="clinic-label">TEMP (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        className="clinic-input text-center font-bold"
                        placeholder="36.5"
                      />
                    </div>
                    <div>
                      <label className="clinic-label">RESP. RATE (/min)</label>
                      <input
                        type="number"
                        value={respiration}
                        onChange={(e) => setRespiration(e.target.value)}
                        className="clinic-input text-center font-bold"
                        placeholder="18"
                      />
                    </div>
                    <div>
                      <label className="clinic-label">WEIGHT (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="clinic-input text-center font-bold"
                        placeholder="65"
                      />
                    </div>
                    <div>
                      <label className="clinic-label">HEIGHT (cm)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="clinic-input text-center font-bold"
                        placeholder="170"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="clinic-label">CALCULATED BMI</label>
                      <div className="clinic-input bg-blue-50 text-blue-900 font-extrabold text-center flex items-center justify-center">
                        {bmiVal} kg/m²
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Diabetic Issue Screening (ስኳር ምርመራ) */}
              <section className="clinic-card p-5 sm:p-6 border-l-4 border-l-purple-600">
                <div className="clinic-section-head mb-4">
                  <div className="clinic-section-icon purple"><Syringe className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#102a43]">
                      3. Diabetic Issue & Blood Sugar Screening (የስኳር በሽታ ምርመራ)
                    </h3>
                    <p className="text-xs text-slate-500">Essential for Diabetic Retinopathy screening and surgical pre-clearance</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="clinic-label">DIABETES STATUS (የስኳር ታሪክ)</label>
                      <select
                        value={isDiabetic}
                        onChange={(e) => setIsDiabetic(e.target.value as any)}
                        className="clinic-select font-semibold cursor-pointer"
                      >
                        <option value="no">Non-Diabetic (የለበትም)</option>
                        <option value="type2">Known Type 2 Diabetes</option>
                        <option value="type1">Known Type 1 Diabetes</option>
                        <option value="gestational">Gestational Diabetes</option>
                        <option value="prediabetes">Pre-Diabetes</option>
                        <option value="unknown">Unknown / Not Tested</option>
                      </select>
                    </div>

                    <div>
                      <label className="clinic-label">GLUCOSE TEST TYPE</label>
                      <select
                        value={bloodSugarType}
                        onChange={(e) => setBloodSugarType(e.target.value as any)}
                        className="clinic-select cursor-pointer"
                      >
                        <option value="RBS">RBS - Random Blood Sugar (mg/dL)</option>
                        <option value="FBS">FBS - Fasting Blood Sugar (mg/dL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="clinic-label">BLOOD GLUCOSE VALUE (mg/dL)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={bloodSugarValue}
                          onChange={(e) => setBloodSugarValue(e.target.value)}
                          className="clinic-input font-bold pr-16"
                          placeholder="e.g. 110"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          mg/dL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Glucose evaluation indicator */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${bsBadgeColor}`}>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{bsCategory} (Result: {bloodSugarValue} mg/dL {bloodSugarType})</span>
                    </div>
                    {isDiabetic !== 'no' && (
                      <span className="font-extrabold uppercase text-[10px]">
                        Diabetic Patient Flagged
                      </span>
                    )}
                  </div>

                  {/* Extended Diabetes inputs when diabetic */}
                  {isDiabetic !== 'no' && (
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in">
                      <div>
                        <label className="clinic-label">DIABETES DURATION (YEARS)</label>
                        <input
                          type="text"
                          value={diabetesDurationYears}
                          onChange={(e) => setDiabetesDurationYears(e.target.value)}
                          placeholder="e.g. 5 years"
                          className="clinic-input"
                        />
                      </div>
                      <div>
                        <label className="clinic-label">LAST HbA1c (%)</label>
                        <input
                          type="text"
                          value={hba1c}
                          onChange={(e) => setHba1c(e.target.value)}
                          placeholder="e.g. 7.2%"
                          className="clinic-input"
                        />
                      </div>
                      <div>
                        <label className="clinic-label">DIABETES MEDICATIONS</label>
                        <input
                          type="text"
                          value={medicationDetails}
                          onChange={(e) => setMedicationDetails(e.target.value)}
                          placeholder="e.g. Metformin, Insulin, Glibenclamide"
                          className="clinic-input"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="inline-flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={diabeticRetinopathySuspected}
                            onChange={(e) => setDiabeticRetinopathySuspected(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span className="font-bold text-slate-800">
                            Flag for Dilated Fundus Exam / Diabetic Retinopathy Screening (የስኳር የዓይን መረብ ምርመራ)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4: Ophthalmic Assessment & Visual Acuity */}
              <section className="clinic-card p-5 sm:p-6">
                <div className="clinic-section-head mb-4">
                  <div className="clinic-section-icon"><Eye className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#102a43]">
                      4. Ophthalmic Nurse Assessment & Visual Acuity (የእይታ ጥራት እና ቅሬታ)
                    </h3>
                    <p className="text-xs text-slate-500">Chief complaint, affected eye, Snellen Visual Acuity (VA), and Tonometry</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Common symptoms quick tags */}
                  <div>
                    <label className="clinic-label mb-1.5">
                      CHIEF COMPLAINT SYMPTOMS (የህመም ምልክቶች - Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_SYMPTOMS.map((sym) => {
                        const active = selectedSymptoms.includes(sym);
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => toggleSymptom(sym)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              active
                                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {active ? '✓ ' : '+ '} {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Affected eye, duration, pain scale */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="clinic-label">AFFECTED EYE (የተጎዳው ዓይን)</label>
                      <select
                        value={affectedEye}
                        onChange={(e) => setAffectedEye(e.target.value as any)}
                        className="clinic-select font-bold cursor-pointer"
                      >
                        <option value="OD">Right Eye Only (OD - ቀኝ ዓይን)</option>
                        <option value="OS">Left Eye Only (OS - ግራ ዓይን)</option>
                        <option value="OU">Both Eyes (OU - ሁለቱም ዓይኖች)</option>
                      </select>
                    </div>

                    <div>
                      <label className="clinic-label">DURATION OF SYMPTOMS</label>
                      <input
                        type="text"
                        value={durationOfSymptoms}
                        onChange={(e) => setDurationOfSymptoms(e.target.value)}
                        placeholder="e.g. 3 days / 2 months"
                        className="clinic-input"
                      />
                    </div>

                    <div>
                      <label className="clinic-label">PAIN SCORE (0 = No Pain, 10 = Severe)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={painScale}
                          onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <span className="w-8 text-center font-extrabold text-sm text-blue-700">
                          {painScale}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Acuity Grid */}
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-extrabold text-xs text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-blue-700" />
                        Visual Acuity (VA) Measurement · የእይታ ጥራት ልኬት
                      </span>
                      <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                        Snellen Chart
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* OD - Right Eye */}
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 space-y-2.5">
                        <div className="font-extrabold text-xs text-blue-900 border-b pb-1.5 flex justify-between">
                          <span>RIGHT EYE (OD - Oculus Dexter)</span>
                          <span className="text-blue-600">ቀኝ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Unaided VA</label>
                            <select
                              value={vaOD}
                              onChange={(e) => setVaOD(e.target.value)}
                              className="clinic-select text-xs font-bold py-1.5 min-h-[38px]"
                            >
                              {VA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Pin Hole (PH)</label>
                            <select
                              value={vaPhOD}
                              onChange={(e) => setVaPhOD(e.target.value)}
                              className="clinic-select text-xs font-bold py-1.5 min-h-[38px]"
                            >
                              <option value="NI">NI (No Improvement)</option>
                              {VA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* OS - Left Eye */}
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 space-y-2.5">
                        <div className="font-extrabold text-xs text-blue-900 border-b pb-1.5 flex justify-between">
                          <span>LEFT EYE (OS - Oculus Sinister)</span>
                          <span className="text-blue-600">ግራ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Unaided VA</label>
                            <select
                              value={vaOS}
                              onChange={(e) => setVaOS(e.target.value)}
                              className="clinic-select text-xs font-bold py-1.5 min-h-[38px]"
                            >
                              {VA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Pin Hole (PH)</label>
                            <select
                              value={vaPhOS}
                              onChange={(e) => setVaPhOS(e.target.value)}
                              className="clinic-select text-xs font-bold py-1.5 min-h-[38px]"
                            >
                              <option value="NI">NI (No Improvement)</option>
                              {VA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Intraocular Pressure (IOP) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="clinic-label">IOP RIGHT EYE (OD mmHg)</label>
                      <input
                        type="number"
                        value={iopOD}
                        onChange={(e) => setIopOD(e.target.value)}
                        placeholder="16"
                        className="clinic-input font-bold text-center"
                      />
                      <span className="text-[10px] text-slate-500 block pt-1">Normal: 10 - 21 mmHg</span>
                    </div>

                    <div>
                      <label className="clinic-label">IOP LEFT EYE (OS mmHg)</label>
                      <input
                        type="number"
                        value={iopOS}
                        onChange={(e) => setIopOS(e.target.value)}
                        placeholder="15"
                        className="clinic-input font-bold text-center"
                      />
                      <span className="text-[10px] text-slate-500 block pt-1">Normal: 10 - 21 mmHg</span>
                    </div>

                    <div>
                      <label className="clinic-label">TONOMETRY METHOD</label>
                      <select
                        value={iopMethod}
                        onChange={(e) => setIopMethod(e.target.value)}
                        className="clinic-select text-xs cursor-pointer"
                      >
                        <option value="Non-Contact Tonometry (Air Puff)">Non-Contact Tonometry (Air Puff)</option>
                        <option value="Tono-Pen">Tono-Pen / Handheld</option>
                        <option value="Goldmann Applanation">Goldmann Applanation</option>
                        <option value="Digital Palpation">Digital Palpation (Estimate)</option>
                      </select>
                    </div>
                  </div>

                  {/* Gross Ocular Inspection Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="clinic-label">EYE DISCHARGE (ፈሳሽ)</label>
                      <select
                        value={eyeDischarge}
                        onChange={(e) => setEyeDischarge(e.target.value as any)}
                        className="clinic-select cursor-pointer"
                      >
                        <option value="none">None / Normal</option>
                        <option value="watery">Watery / Clear</option>
                        <option value="mucoid">Mucoid / Stringy</option>
                        <option value="purulent">Purulent (Pus / Infection)</option>
                      </select>
                    </div>

                    <div>
                      <label className="clinic-label">PUPIL LIGHT REFLEX</label>
                      <select
                        value={pupilReaction}
                        onChange={(e) => setPupilReaction(e.target.value as any)}
                        className="clinic-select cursor-pointer"
                      >
                        <option value="normal">Normal / Brisk (PERRLA)</option>
                        <option value="sluggish">Sluggish</option>
                        <option value="fixed_dilated">Fixed & Dilated</option>
                        <option value="rapd_suspected">RAPD Suspected</option>
                      </select>
                    </div>

                    <div>
                      <label className="clinic-label">CORNEAL CLARITY</label>
                      <select
                        value={corneaCondition}
                        onChange={(e) => setCorneaCondition(e.target.value as any)}
                        className="clinic-select cursor-pointer"
                      >
                        <option value="clear">Clear & Lustrous</option>
                        <option value="hazy">Hazy / Edema</option>
                        <option value="foreign_body">Visible Foreign Body</option>
                        <option value="ulcer_suspected">Ulcer / Infiltrate Suspected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: Medications, Allergies & Nursing Action */}
              <section className="clinic-card p-5 sm:p-6">
                <div className="clinic-section-head mb-4">
                  <div className="clinic-section-icon orange"><ShieldCheck className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#102a43]">
                      5. History, Medications & Nursing Action (የነርስ ማስታወሻ)
                    </h3>
                    <p className="text-xs text-slate-500">Current eye drops, drug allergies, and nursing interventions</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="clinic-label">CURRENT EYE DROPS / TOPICAL MEDS</label>
                      <input
                        type="text"
                        value={currentEyeDrops}
                        onChange={(e) => setCurrentEyeDrops(e.target.value)}
                        placeholder="e.g. Timolol 0.5%, Cipro drops, Traditional"
                        className="clinic-input"
                      />
                    </div>
                    <div>
                      <label className="clinic-label">SYSTEMIC MEDICATIONS</label>
                      <input
                        type="text"
                        value={systemicMeds}
                        onChange={(e) => setSystemicMeds(e.target.value)}
                        placeholder="e.g. Amlodipine, Metformin, Aspirin"
                        className="clinic-input"
                      />
                    </div>
                    <div>
                      <label className="clinic-label">KNOWN ALLERGIES (የመድሃኒት አለርጂ)</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="e.g. Sulfa, Dilating drops, Penicillin, NKDA"
                        className="clinic-input"
                      />
                    </div>
                  </div>

                  {/* Interventions Checkbox List */}
                  <div>
                    <label className="clinic-label mb-1.5">
                      NURSING INTERVENTIONS PERFORMED (የተከናወኑ የነርስ እርምጃዎች)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {NURSING_INTERVENTIONS.map((item) => {
                        const checked = selectedInterventions.includes(item);
                        return (
                          <label
                            key={item}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition-all ${
                              checked ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleIntervention(item)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nurse Clinical Notes */}
                  <div>
                    <label className="clinic-label">NURSE'S CLINICAL OBSERVATION & REMARKS</label>
                    <textarea
                      rows={3}
                      value={nurseNotes}
                      onChange={(e) => setNurseNotes(e.target.value)}
                      placeholder="Add specific notes, e.g.: Patient presents with painful right eye after farming work. Visual acuity taken; RBS checked (134 mg/dL); Patient advised to wait outside Room 1 for Slit-lamp biomicroscopy."
                      className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 text-slate-900 text-xs font-medium focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 clinic-submit flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving Triage & Transmitting to Doctor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Save Triage & Send to Doctor Queue (መረጃውን መዝግብ እና ለዶክተሩ ላክ)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="clinic-button clinic-button-secondary px-5"
                >
                  <Printer className="w-4 h-4" /> Print / View Slip
                </button>
              </div>
            </form>
          ) : (
            <div className="clinic-card p-12 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select a patient from the waiting queue on the left or register a new patient in the Patient Registration tab.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Printable / Viewable Doctor Handover Modal */}
      {showPrintModal && activePatient && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Eye className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                    Selihome Ophthalmic Medium Clinic
                  </h3>
                  <p className="text-xs text-slate-500">Patient Registration & Ophthalmic Nurse Triage Chart</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Slip Content */}
            <div className="space-y-4 text-xs text-slate-800">
              {/* Demographics row */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Patient Name</span>
                  <span className="font-extrabold text-slate-900">{activePatient.personalInfo.firstName} {activePatient.personalInfo.fatherName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">MRN</span>
                  <span className="font-extrabold text-blue-700">{activePatient.meta.mrn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Age / Sex</span>
                  <span className="font-bold">{activePatient.age} Yrs · {activePatient.personalInfo.sex}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Reg Date</span>
                  <span className="font-bold">{activePatient.meta.registrationDate.ethiopian || activePatient.meta.registrationDate.gregorian}</span>
                </div>
              </div>

              {/* Triage Summary */}
              <div className="border rounded-xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-900 uppercase">Nurse Triage Assessment</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    urgencyLevel === 'emergency' ? 'bg-rose-600 text-white' : urgencyLevel === 'urgent' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    Priority: {urgencyLevel.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><b>BP:</b> {bpSys}/{bpDia} mmHg ({bpCategory})</div>
                  <div><b>Pulse:</b> {pulse} bpm</div>
                  <div><b>RBS / FBS:</b> {bloodSugarValue} mg/dL ({isDiabetic !== 'no' ? 'Diabetic' : 'Non-Diabetic'})</div>
                  <div><b>Temp / SpO2:</b> {temp}°C / {spo2}%</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t">
                  <div><b>VA Right (OD):</b> {vaOD} (PH: {vaPhOD}) · IOP: {iopOD} mmHg</div>
                  <div><b>VA Left (OS):</b> {vaOS} (PH: {vaPhOS}) · IOP: {iopOS} mmHg</div>
                </div>

                <div className="text-[11px] pt-1 border-t">
                  <b>Chief Symptoms:</b> {selectedSymptoms.join(', ') || 'N/A'} ({affectedEye})
                </div>

                {nurseNotes && (
                  <div className="text-[11px] pt-1 border-t text-slate-700">
                    <b>Nurse Notes:</b> {nurseNotes}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Triage Officer: {nurseName}</span>
                <span>Routed to: {assignedDoctor}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => window.print()}
                className="clinic-button clinic-button-primary px-5"
              >
                <Printer className="w-4 h-4" /> Print Medical Record
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="clinic-button clinic-button-secondary px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
