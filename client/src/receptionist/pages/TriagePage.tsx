import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Printer,
  Eye,
  Activity,
  Droplet,
  UserCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Patient, Appointment } from '../lib/types';
import { useToast } from '../store/toast';
import { useAuth } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Input, Field, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { formatDate } from '../lib/format';
import { PatientPicker } from '../components/PatientPicker';

interface TriageData {
  urgency: 'routine' | 'urgent' | 'emergency';
  chiefComplaint: string;
  symptomDuration: string;
  painScale: number; // 0-10
  
  // Vitals
  systolicBp: string;
  diastolicBp: string;
  pulseRate: string;
  respiratoryRate: string;
  temperature: string;
  spo2: string;
  
  // Diabetic & Systemic
  isDiabetic: boolean;
  bloodSugarType: 'RBS' | 'FBS';
  bloodSugarValue: string;
  hba1c: string;
  onInsulin: boolean;
  hypertensive: boolean;
  systemicAllergies: string;
  currentSystemicMeds: string;
  
  // Ocular Assessment
  vaOdUnaided: string;
  vaOsUnaided: string;
  vaOdPinhole: string;
  vaOsPinhole: string;
  vaOdGlasses: string;
  vaOsGlasses: string;
  iopOd: string;
  iopOs: string;
  pupilsReaction: string;
  currentEyeDrops: string;
  priorEyeSurgery: string;
  familyGlaucomaHistory: boolean;
  
  // Nurse Notes
  nurseNotes: string;
}

const DEFAULT_TRIAGE: TriageData = {
  urgency: 'routine',
  chiefComplaint: '',
  symptomDuration: '',
  painScale: 0,
  systolicBp: '',
  diastolicBp: '',
  pulseRate: '',
  respiratoryRate: '',
  temperature: '',
  spo2: '',
  isDiabetic: false,
  bloodSugarType: 'RBS',
  bloodSugarValue: '',
  hba1c: '',
  onInsulin: false,
  hypertensive: false,
  systemicAllergies: '',
  currentSystemicMeds: '',
  vaOdUnaided: '6/6',
  vaOsUnaided: '6/6',
  vaOdPinhole: 'N/A',
  vaOsPinhole: 'N/A',
  vaOdGlasses: '',
  vaOsGlasses: '',
  iopOd: '14',
  iopOs: '14',
  pupilsReaction: 'PERRLA (Equal, Round, Reactive)',
  currentEyeDrops: '',
  priorEyeSurgery: '',
  familyGlaucomaHistory: false,
  nurseNotes: '',
};

const VA_OPTIONS = [
  '6/4',
  '6/5',
  '6/6',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
  'CF 3m',
  'CF 1m',
  'HM (Hand Motions)',
  'LP (Light Perception)',
  'NLP (No Light Perception)',
];

export function TriagePage() {
  const { patientId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientAppointment, setPatientAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triage, setTriage] = useState<TriageData>(DEFAULT_TRIAGE);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load today's appointments/queue
  const loadQueue = async () => {
    setLoading(true);
    try {
      const list = await api.get<Appointment[]>('/appointments');
      setAppointments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // When patientId changes or patient selected
  useEffect(() => {
    if (patientId) {
      api.get<Patient>(`/patients/${patientId}`)
        .then((p) => {
          setSelectedPatient(p);
          setTriage((prev) => ({
            ...prev,
            isDiabetic: Boolean(p.isDiabetic),
            familyGlaucomaHistory: Boolean(p.familyGlaucomaHistory),
            priorEyeSurgery: p.priorEyeSurgery || '',
          }));
        })
        .catch(() => toast('Patient not found', 'error'));
    }
  }, [patientId]);

  // Find linked appointment for selected patient
  useEffect(() => {
    if (selectedPatient) {
      const appt = appointments.find((a) => a.patientId === selectedPatient.id);
      setPatientAppointment(appt ?? null);
    } else {
      setPatientAppointment(null);
    }
  }, [selectedPatient, appointments]);

  const setField = <K extends keyof TriageData>(key: K, value: TriageData[K]) => {
    setTriage((prev) => ({ ...prev, [key]: value }));
  };

  // Automated Blood Pressure Classification
  const getBpStatus = () => {
    const sys = Number(triage.systolicBp);
    const dia = Number(triage.diastolicBp);
    if (!sys || !dia) return null;
    if (sys > 180 || dia > 120) {
      return { label: 'Hypertensive Crisis (Urgent Care Needed)', color: 'bg-danger text-white border-danger' };
    }
    if (sys >= 140 || dia >= 90) {
      return { label: 'Stage 2 Hypertension', color: 'bg-danger/15 text-danger border-danger/30' };
    }
    if (sys >= 130 || dia >= 80) {
      return { label: 'Stage 1 Hypertension', color: 'bg-warning/15 text-warning border-warning/30' };
    }
    if (sys >= 120 && dia < 80) {
      return { label: 'Elevated BP', color: 'bg-warning/10 text-amber-500 border-amber-300' };
    }
    return { label: 'Normal Blood Pressure', color: 'bg-success/15 text-success border-success/30' };
  };

  // High IOP Warning
  const isHighIop = (Number(triage.iopOd) > 21) || (Number(triage.iopOs) > 21);

  const saveTriage = async () => {
    if (!selectedPatient) {
      toast('Please select a patient first', 'warning');
      return;
    }

    setSaving(true);
    try {
      // 1. Update patient clinical flags
      await api.patch(`/patients/${selectedPatient.id}`, {
        isDiabetic: triage.isDiabetic,
        familyGlaucomaHistory: triage.familyGlaucomaHistory,
        priorEyeSurgery: triage.priorEyeSurgery.trim() || undefined,
      });

      // 2. Format triage summary for handover
      const bpSummary = triage.systolicBp && triage.diastolicBp ? `${triage.systolicBp}/${triage.diastolicBp} mmHg` : 'Not recorded';
      const bsSummary = triage.bloodSugarValue ? `${triage.bloodSugarType}: ${triage.bloodSugarValue} mg/dL` : 'Not tested';
      const vaSummary = `VA OD: ${triage.vaOdUnaided} (PH: ${triage.vaOdPinhole}) | OS: ${triage.vaOsUnaided} (PH: ${triage.vaOsPinhole})`;
      const iopSummary = `IOP OD: ${triage.iopOd} mmHg | OS: ${triage.iopOs} mmHg`;
      
      const triageNote = `[NURSE TRIAGE - ${triage.urgency.toUpperCase()}]\n` +
        `Chief Complaint: ${triage.chiefComplaint || 'Routine Eye Check'}\n` +
        `Duration: ${triage.symptomDuration || 'N/A'} | Pain: ${triage.painScale}/10\n` +
        `Vitals: BP: ${bpSummary} | Pulse: ${triage.pulseRate || '-'} bpm | SpO2: ${triage.spo2 || '-'}% | Temp: ${triage.temperature || '-'}°C\n` +
        `Diabetic: ${triage.isDiabetic ? `YES (${bsSummary})` : 'NO'} | On Insulin: ${triage.onInsulin ? 'Yes' : 'No'}\n` +
        `Ophthalmic: ${vaSummary} | ${iopSummary}\n` +
        `Pupils: ${triage.pupilsReaction}\n` +
        (triage.currentEyeDrops ? `Eye Drops: ${triage.currentEyeDrops}\n` : '') +
        (triage.systemicAllergies ? `Allergies: ${triage.systemicAllergies}\n` : '') +
        `Nurse Assessment: ${triage.nurseNotes || 'Completed standard triage screening'}`;

      // 3. If there is an active appointment for today, update its status to checked_in with the triage note
      if (patientAppointment) {
        await api.patch(`/appointments/${patientAppointment.id}/status`, {
          status: 'checked_in',
        });
      } else {
        // Create an appointment / queue ticket if none exists for today
        await api.post('/appointments', {
          patientId: selectedPatient.id,
          type: 'walkin',
          reason: `Triage: ${triage.chiefComplaint || 'Consultation'}`,
          notes: triageNote,
        });
      }

      toast(`Triage saved & patient dispatched to Doctor Queue!`, 'success');
      loadQueue();
      setShowPrintModal(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save triage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const bpStatus = getBpStatus();

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <HeartPulse size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-navy">Ophthalmic Nurse Triage Suite</h1>
              <p className="text-xs text-slate-500">
                Receptionist & Staff Nurse clinical assessment, vital signs, diabetic screening, and doctor handover.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadQueue} loading={loading}>
            <RefreshCw size={14} className="mr-1.5" /> Refresh Queue
          </Button>
          {selectedPatient ? (
            <Button variant="outline" size="sm" onClick={() => setShowPrintModal(true)}>
              <Printer size={14} className="mr-1.5" /> Print Triage Sheet
            </Button>
          ) : null}
        </div>
      </div>

      {/* Patient Selector / Queue Strip */}
      <Card className="mb-6 border-line bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Select Patient for Triage
          </span>
          <span className="text-xs text-slate-500">
            {appointments.length} patient(s) in today's clinic schedule
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PatientPicker
              selectedPatient={selectedPatient}
              onSelect={(p) => {
                setSelectedPatient(p);
                if (p) {
                  setTriage((prev) => ({
                    ...prev,
                    isDiabetic: Boolean(p.isDiabetic),
                    familyGlaucomaHistory: Boolean(p.familyGlaucomaHistory),
                    priorEyeSurgery: p.priorEyeSurgery || '',
                  }));
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => navigate('/patients')}
            >
              + Register New Patient
            </Button>
          </div>
        </div>

        {/* Selected Patient Banner */}
        {selectedPatient ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal/20 bg-teal/[0.06] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-bold text-white">
                {selectedPatient.firstName[0]}{selectedPatient.fatherName[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-navy">
                  {selectedPatient.firstName} {selectedPatient.fatherName} {selectedPatient.grandfatherName || ''}
                  <span className="ml-2 font-mono text-xs font-normal text-teal">MRN: #{selectedPatient.mrn}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {selectedPatient.sex === 'female' ? 'Female' : 'Male'} · {selectedPatient.age != null ? `${selectedPatient.age} yrs` : 'Age N/A'} · Phone: {selectedPatient.phone} · Location: {selectedPatient.woredaOrSubcity || selectedPatient.zone || 'Addis Ababa'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {patientAppointment ? (
                <Badge variant="teal" className="text-xs">
                  Queue #{patientAppointment.queueNo} ({patientAppointment.status})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Walk-in (Will be assigned next queue #)
                </Badge>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {/* Main Triage Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Clinical Assessment Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Urgency & Chief Complaint */}
          <Card className="border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <AlertTriangle size={17} className="text-warning" />
                Triage Urgency & Chief Complaint
              </div>
              <span className="text-xs text-slate-400">Step 2</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setField('urgency', 'routine')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      triage.urgency === 'routine'
                        ? 'border-success bg-success/10 font-bold text-success ring-2 ring-success/30'
                        : 'border-line hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 size={16} className="mb-1 text-success" />
                    <span className="text-xs">🟢 Routine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setField('urgency', 'urgent')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      triage.urgency === 'urgent'
                        ? 'border-warning bg-warning/15 font-bold text-warning ring-2 ring-warning/30'
                        : 'border-line hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Clock size={16} className="mb-1 text-warning" />
                    <span className="text-xs">🟠 Urgent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setField('urgency', 'emergency')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                      triage.urgency === 'emergency'
                        ? 'border-danger bg-danger/15 font-bold text-danger ring-2 ring-danger/30'
                        : 'border-line hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Flame size={16} className="mb-1 text-danger" />
                    <span className="text-xs">🔴 Emergency</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <Field label="Chief Eye Complaint" required>
                  <Input
                    placeholder="e.g. Severe right eye pain, redness, blurry vision for 3 days"
                    value={triage.chiefComplaint}
                    onChange={(e) => setField('chiefComplaint', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="Duration">
                  <Input
                    placeholder="e.g. 2 days / 1 month"
                    value={triage.symptomDuration}
                    onChange={(e) => setField('symptomDuration', e.target.value)}
                  />
                </Field>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Eye Pain Scale: {triage.painScale} / 10</span>
                  <span className="text-xs text-slate-400">
                    {triage.painScale === 0 ? 'No Pain' : triage.painScale <= 3 ? 'Mild' : triage.painScale <= 6 ? 'Moderate' : 'Severe'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={triage.painScale}
                  onChange={(e) => setField('painScale', Number(e.target.value))}
                  className="mt-1.5 h-2 w-full cursor-pointer accent-teal"
                />
              </div>
            </div>
          </Card>

          {/* Section: Vital Signs & Blood Pressure */}
          <Card className="border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Activity size={17} className="text-teal" />
                Vital Signs & Hemodynamic Assessment
              </div>
              <span className="text-xs text-slate-400">Nurse Protocol</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <div>
                <Field label="BP Systolic (mmHg)">
                  <Input
                    type="number"
                    placeholder="120"
                    value={triage.systolicBp}
                    onChange={(e) => setField('systolicBp', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="BP Diastolic (mmHg)">
                  <Input
                    type="number"
                    placeholder="80"
                    value={triage.diastolicBp}
                    onChange={(e) => setField('diastolicBp', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="Pulse (bpm)">
                  <Input
                    type="number"
                    placeholder="72"
                    value={triage.pulseRate}
                    onChange={(e) => setField('pulseRate', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="SpO2 (%)">
                  <Input
                    type="number"
                    placeholder="98"
                    value={triage.spo2}
                    onChange={(e) => setField('spo2', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="Temp (°C)">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={triage.temperature}
                    onChange={(e) => setField('temperature', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="Resp. Rate (/min)">
                  <Input
                    type="number"
                    placeholder="16"
                    value={triage.respiratoryRate}
                    onChange={(e) => setField('respiratoryRate', e.target.value)}
                  />
                </Field>
              </div>

              {bpStatus ? (
                <div className="col-span-2 flex items-center">
                  <div className={`w-full rounded-xl border p-2 text-center text-xs font-semibold ${bpStatus.color}`}>
                    {bpStatus.label}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Section: Diabetic Screening & Systemic Health */}
          <Card className="border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Droplet size={17} className="text-danger" />
                Diabetic Retinopathy Screening & Systemic Medical History
              </div>
              {triage.isDiabetic ? (
                <Badge variant="danger" className="text-xs">
                  Diabetic Patient · Fundus Exam High Priority
                </Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Field label="Diabetic Status">
                  <Select
                    value={String(triage.isDiabetic)}
                    onChange={(e) => setField('isDiabetic', e.target.value === 'true')}
                  >
                    <option value="false">Non-Diabetic</option>
                    <option value="true">Known Diabetic (Type 1 / 2)</option>
                  </Select>
                </Field>
              </div>

              <div>
                <Field label="Blood Sugar Test">
                  <div className="flex gap-1.5">
                    <select
                      className="rounded-xl border border-line bg-panel px-2.5 text-xs text-ink"
                      value={triage.bloodSugarType}
                      onChange={(e) => setField('bloodSugarType', e.target.value as 'RBS' | 'FBS')}
                    >
                      <option value="RBS">RBS</option>
                      <option value="FBS">FBS</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="e.g. 140 mg/dL"
                      value={triage.bloodSugarValue}
                      onChange={(e) => setField('bloodSugarValue', e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              <div>
                <Field label="HbA1c (%)">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.8"
                    value={triage.hba1c}
                    onChange={(e) => setField('hba1c', e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <Field label="On Insulin?">
                  <Select
                    value={String(triage.onInsulin)}
                    onChange={(e) => setField('onInsulin', e.target.value === 'true')}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes (Insulin Dependent)</option>
                  </Select>
                </Field>
              </div>

              <div>
                <Field label="Family Glaucoma?">
                  <Select
                    value={String(triage.familyGlaucomaHistory)}
                    onChange={(e) => setField('familyGlaucomaHistory', e.target.value === 'true')}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes (First degree relative)</option>
                  </Select>
                </Field>
              </div>

              <div>
                <Field label="Prior Eye Surgery">
                  <Input
                    placeholder="e.g. OD Cataract 2021"
                    value={triage.priorEyeSurgery}
                    onChange={(e) => setField('priorEyeSurgery', e.target.value)}
                  />
                </Field>
              </div>

              <div className="sm:col-span-3">
                <Field label="Systemic Allergies / Adverse Drug Reactions">
                  <Input
                    placeholder="e.g. Penicillin, Sulfa drugs, Iodine, NKDA (No Known Drug Allergies)"
                    value={triage.systemicAllergies}
                    onChange={(e) => setField('systemicAllergies', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* Section: Visual Acuity & Ocular Nursing Assessment */}
          <Card className="border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy">
                <Eye size={17} className="text-teal" />
                Ophthalmic Nursing Screening (Visual Acuity & Tonometry)
              </div>
              <span className="text-xs text-slate-400">Snellen 6-meter chart</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* OD (Right Eye) */}
              <div className="rounded-xl border border-line bg-slate-500/[0.04] p-3.5">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-teal">
                  OD — Right Eye (Oculus Dexter)
                </div>
                <div className="space-y-3">
                  <Field label="Unaided Visual Acuity (VA)">
                    <Select
                      value={triage.vaOdUnaided}
                      onChange={(e) => setField('vaOdUnaided', e.target.value)}
                    >
                      {VA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Pinhole (PH)">
                    <Select
                      value={triage.vaOdPinhole}
                      onChange={(e) => setField('vaOdPinhole', e.target.value)}
                    >
                      <option value="N/A">N/A (6/6 or not tested)</option>
                      <option value="Improved">Improved (Refractive error suspected)</option>
                      <option value="No Change">No Change (Pathology / Media opacity)</option>
                    </Select>
                  </Field>

                  <Field label="Screening IOP (mmHg)">
                    <Input
                      type="number"
                      placeholder="14"
                      value={triage.iopOd}
                      onChange={(e) => setField('iopOd', e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* OS (Left Eye) */}
              <div className="rounded-xl border border-line bg-slate-500/[0.04] p-3.5">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-500">
                  OS — Left Eye (Oculus Sinister)
                </div>
                <div className="space-y-3">
                  <Field label="Unaided Visual Acuity (VA)">
                    <Select
                      value={triage.vaOsUnaided}
                      onChange={(e) => setField('vaOsUnaided', e.target.value)}
                    >
                      {VA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Pinhole (PH)">
                    <Select
                      value={triage.vaOsPinhole}
                      onChange={(e) => setField('vaOsPinhole', e.target.value)}
                    >
                      <option value="N/A">N/A (6/6 or not tested)</option>
                      <option value="Improved">Improved (Refractive error suspected)</option>
                      <option value="No Change">No Change (Pathology / Media opacity)</option>
                    </Select>
                  </Field>

                  <Field label="Screening IOP (mmHg)">
                    <Input
                      type="number"
                      placeholder="14"
                      value={triage.iopOs}
                      onChange={(e) => setField('iopOs', e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {isHighIop ? (
                <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/30 p-2.5 text-xs font-semibold text-danger flex items-center gap-2">
                  <AlertTriangle size={15} />
                  Warning: Elevated Intraocular Pressure detected (&gt;21 mmHg). Inform Doctor immediately.
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <Field label="Current Ophthalmic Eye Drops / Medication">
                  <Input
                    placeholder="e.g. Timolol 0.5% OD BID, Latanoprost OS QHS, Tears Naturale PRN"
                    value={triage.currentEyeDrops}
                    onChange={(e) => setField('currentEyeDrops', e.target.value)}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Nurse Clinical Handover Notes & Remarks">
                  <Input
                    placeholder="e.g. Patient complains of sudden vision drop; pupils slightly sluggish OD; escort into Doctor room."
                    value={triage.nurseNotes}
                    onChange={(e) => setField('nurseNotes', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Summary & Action Panel */}
        <div className="space-y-6">
          <Card className="sticky top-4 border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm font-bold text-navy">Triage Handover Summary</span>
              <Badge
                variant={
                  triage.urgency === 'emergency'
                    ? 'danger'
                    : triage.urgency === 'urgent'
                    ? 'warning'
                    : 'teal'
                }
              >
                {triage.urgency.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-navy">
                  {selectedPatient
                    ? `${selectedPatient.firstName} ${selectedPatient.fatherName}`
                    : 'None Selected'}
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">MRN:</span>
                <span className="font-mono font-bold text-teal">
                  #{selectedPatient?.mrn || '—'}
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">Blood Pressure:</span>
                <span className="font-semibold text-navy">
                  {triage.systolicBp && triage.diastolicBp
                    ? `${triage.systolicBp}/${triage.diastolicBp} mmHg`
                    : 'Not taken'}
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">Visual Acuity:</span>
                <span className="font-semibold text-navy">
                  OD: {triage.vaOdUnaided} | OS: {triage.vaOsUnaided}
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">IOP Tonometry:</span>
                <span className="font-semibold text-navy">
                  OD: {triage.iopOd || '-'} | OS: {triage.iopOs || '-'} mmHg
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">Diabetic Flag:</span>
                <span className="font-semibold text-navy">
                  {triage.isDiabetic ? 'YES (Risk)' : 'No'}
                </span>
              </div>

              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-slate-500">Nurse on Duty:</span>
                <span className="font-semibold text-navy">
                  {user?.name || 'Sister Selamawit'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <Button
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={saveTriage}
                loading={saving}
                disabled={!selectedPatient}
              >
                <UserCheck size={16} className="mr-2" />
                Save & Send to Doctor Queue
              </Button>

              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setShowPrintModal(true)}
                disabled={!selectedPatient}
              >
                <Printer size={14} className="mr-1.5" />
                Preview Printable Handover Sheet
              </Button>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-slate-500/[0.04] p-3 text-[11px] text-slate-500">
              <Info size={13} className="inline mr-1 text-teal" />
              Saving triage records these clinical observations and moves the patient to the Doctor's active consultation queue.
            </div>
          </Card>
        </div>
      </div>

      {/* Printable Sheet Modal */}
      {showPrintModal && selectedPatient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-sm">
          <div className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">Nurse Triage Handover Sheet</h3>
                <p className="text-xs text-slate-500">Selihome Ophthalmic Medium Clinic · Addis Ababa, Ethiopia</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPrintModal(false)}>
                ✕
              </Button>
            </div>

            <div className="my-5 rounded-xl border border-line bg-white p-6 text-slate-800 shadow-sm print:border-none">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-teal pb-3">
                <div>
                  <div className="text-lg font-black tracking-tight text-teal">SELIHOME OPHTHALMIC CLINIC</div>
                  <div className="text-xs text-slate-500">Patient Triage & Nursing Assessment Record</div>
                </div>
                <div className="text-right text-xs">
                  <div>Date: {formatDate(new Date().toISOString())}</div>
                  <div className="font-mono font-bold text-teal">MRN: #{selectedPatient.mrn}</div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-b border-slate-200 pb-3 text-xs">
                <div>
                  <span className="text-slate-500">Name: </span>
                  <span className="font-bold">{selectedPatient.firstName} {selectedPatient.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Age/Sex: </span>
                  <span>{selectedPatient.age || '—'} yrs / {selectedPatient.sex}</span>
                </div>
                <div>
                  <span className="text-slate-500">Urgency: </span>
                  <span className="font-bold uppercase text-teal">{triage.urgency}</span>
                </div>
              </div>

              {/* Vitals */}
              <div className="mt-3 text-xs">
                <div className="font-bold text-slate-900">Vital Signs & Clinical Measurements</div>
                <div className="mt-1.5 grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2.5">
                  <div>BP: <strong>{triage.systolicBp || '-'}/{triage.diastolicBp || '-'} mmHg</strong></div>
                  <div>Pulse: <strong>{triage.pulseRate || '-'} bpm</strong></div>
                  <div>SpO2: <strong>{triage.spo2 || '-'}%</strong></div>
                  <div>Temp: <strong>{triage.temperature || '-'}°C</strong></div>
                  <div>Sugar: <strong>{triage.bloodSugarValue ? `${triage.bloodSugarValue} mg/dL (${triage.bloodSugarType})` : 'N/A'}</strong></div>
                  <div>Diabetic: <strong>{triage.isDiabetic ? 'YES' : 'NO'}</strong></div>
                  <div>IOP OD: <strong>{triage.iopOd || '-'} mmHg</strong></div>
                  <div>IOP OS: <strong>{triage.iopOs || '-'} mmHg</strong></div>
                </div>
              </div>

              {/* Ophthalmic findings */}
              <div className="mt-3 text-xs">
                <div className="font-bold text-slate-900">Visual Acuity Screening</div>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <div className="rounded border p-2">
                    <div className="font-semibold text-teal">Right Eye (OD)</div>
                    <div>VA Unaided: {triage.vaOdUnaided}</div>
                    <div>Pinhole: {triage.vaOdPinhole}</div>
                  </div>
                  <div className="rounded border p-2">
                    <div className="font-semibold text-teal">Left Eye (OS)</div>
                    <div>VA Unaided: {triage.vaOsUnaided}</div>
                    <div>Pinhole: {triage.vaOsPinhole}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-3 border-t border-slate-200 pt-2 text-xs">
                <div className="text-slate-500">Chief Complaint: <span className="font-semibold text-slate-800">{triage.chiefComplaint || 'None'}</span></div>
                <div className="text-slate-500">Nurse Notes: <span className="font-semibold text-slate-800">{triage.nurseNotes || 'Completed'}</span></div>
              </div>

              {/* Signoff */}
              <div className="mt-6 flex justify-between text-xs text-slate-500">
                <div>Nurse Signature: __________________</div>
                <div>Attending Doctor: Dr. Selihome</div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowPrintModal(false)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={15} className="mr-1.5" /> Print Sheet
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
