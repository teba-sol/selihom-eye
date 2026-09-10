import React, { useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { PlusCircle, Receipt, CheckCircle, Pill, Glasses } from 'lucide-react';
import { SurgeryModal } from './SurgeryModal';
import { surgeryTypeLabel, freshUnifiedDetails, type SurgeryEntry } from '../lib/surgery';
import { BillingModal, type BillingLineItem } from './BillingModal';
import { SimplePricingModal, type PricingLineItem } from './SimplePricingModal';
import { generateId } from '../utils/uuid';

const REFERRAL_OPTIONS = [
  'None',
  'Referral to Ophthalmologist',
  'Speciality Contact Lens Fitting',
  'Glaucoma Evaluation',
  'Diabetic Eye Examination',
  'Vitreo-Retinal Evaluation',
  'Neuro-Ophthalmology Evaluation',
  'Cataract Evaluation',
  'Orthoptic Evaluation',
  'Refractive Surgery Evaluation',
  'Referral to Low Vision Clinic',
  'Referral to Vision Therapy Clinic',
  'Referral to Dry Eye Clinic',
  'Referral to Paediatric Clinic',
  'Referral to Myopia Clinic',
  'Referral to General Physician',
  'Referral to Neurologist',
  'Referral to Diabetologist',
  'Referral to Cardiologist',
];

const URGENCY_OPTIONS = [
  'Select...',
  'Routine (1 - 3 months)',
  'Soon (2 - 4 weeks)',
  'Urgent (Within 1 week)',
  'Emergency (Within 24 hours)',
];

const SPECTACLE_RECOMMENDATIONS = [
  'Select...',
  'Single Vision Distance',
  'Single Vision Near',
  'Progressive Addition Lenses (PALs)',
  'Bifocals (D-Segment / Kryptok)',
  'Occupational / Office Lenses',
  'Anti-Reflective Coating (ARC) + Blue Block',
  'Photochromic Lenses',
  'Not Recommended / Trial Frame Only',
];

const FOLLOW_UP_PERIODS = [
  'Select...',
  '1 week',
  '2 weeks',
  '1 month',
  '3 months',
  '6 months',
  '1 year',
  'SOS (As and when required)',
];

const FREQ_OPTIONS = [
  'None',
  'OD (Once a day)',
  'BD (Twice a day)',
  'TDS (3 times a day)',
  'QID (4 times a day)',
  'Q6H (Every 6 hours)',
  'HS (At bedtime)',
  'PRN (As needed)',
];

type MedEntry = { id: string; name: string; freq: string; timesPerDay: string; };

type BillingData = {
  items: BillingLineItem[];
  total: number;
  confirmedAt: string;
};

type PricingData = {
  items: PricingLineItem[];
  total: number;
  confirmedAt: string;
};

type ActionAndAdviceData = {
  surgeryType: string;
  surgeryOther: string;
  surgeryRemarks: string;
  surgeries?: SurgeryEntry[];
  referral: string;
  urgency: string;
  medicationName: string;
  medicationFreq: string;
  medications?: MedEntry[];
  spectacleRecommendation: string;
  followUpPeriod: string;
  remarks: string;
  showInDischarge: boolean;
  billing?: BillingData | null;
  medicationPricing?: PricingData | null;
  prescriptionPricing?: PricingData | null;
};

const DEFAULT_ACTION_AND_ADVICE: ActionAndAdviceData = {
  surgeryType: '',
  surgeryOther: '',
  surgeryRemarks: '',
  surgeries: [],
  referral: 'None',
  urgency: 'Soon (2 - 4 weeks)',
  medicationName: '',
  medicationFreq: 'None',
  medications: [],
  spectacleRecommendation: 'Select...',
  followUpPeriod: 'Select...',
  remarks: '',
  showInDischarge: true,
  billing: null,
  medicationPricing: null,
  prescriptionPricing: null,
};

// Back-compat: very old exams stored a single surgery in flat fields (surgeryType/surgeryOther/...).
// If the new `surgeries` array is missing, derive one entry from those fields.
function legacyToSurgeries(f: ActionAndAdviceData): SurgeryEntry[] {
  if (Array.isArray(f.surgeries) && f.surgeries.length > 0) return f.surgeries;
  const type = f.surgeryType ?? '';
  if (!type) return [];
  return [
    {
      id: generateId(),
      type,
      otherName: f.surgeryOther ?? '',
      remarks: f.surgeryRemarks ?? '',
      status: 'PLANNED',
      plannedOn: '',
      completedOn: '',
      outcome: '',
      cancelledReason: '',
      unifiedDetails: freshUnifiedDetails(),
    },
  ];
}

// Mirror surgeries back to the flat display fields, preserving the full array + unifiedDetails.
function mirrorLegacy(list: SurgeryEntry[]): Partial<ActionAndAdviceData> {
  const first = list[0];
  return {
    surgeryType: first?.type ?? '',
    surgeryOther: first?.otherName ?? '',
    surgeryRemarks: first?.remarks ?? '',
    surgeries: list,
  };
}

export const ActionAndAdviceView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_ACTION_AND_ADVICE, sectionData['action-and-advice'] ?? {}) as ActionAndAdviceData;

  const patch = (p: Partial<ActionAndAdviceData>) => {
    setSectionData('action-and-advice', { ...f, ...p });
  };

  const surgeries = legacyToSurgeries(f);

  const onSurgeriesChange = (list: SurgeryEntry[]) => {
    const current = (useEncounterStore.getState().sectionData['action-and-advice'] ?? {}) as ActionAndAdviceData;
    const merged = { ...DEFAULT_ACTION_AND_ADVICE, ...current, ...mirrorLegacy(list) };
    setSectionData('action-and-advice', merged);
  };

  const saveEncounter = useEncounterStore((s) => s.saveEncounter);
  const patientMedications = useEncounterStore((s) => s.patientMedications);

  const [surgeryOpen, setSurgeryOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [medPricingOpen, setMedPricingOpen] = useState(false);
  const [rxPricingOpen, setRxPricingOpen] = useState(false);

  const billing = f.billing ?? null;
  const medicationPricing = f.medicationPricing ?? null;
  const prescriptionPricing = f.prescriptionPricing ?? null;

  // Save helper — writes to store then immediately pushes to backend
  const saveField = (field: Partial<ActionAndAdviceData>) => {
    const current = (useEncounterStore.getState().sectionData['action-and-advice'] ?? {}) as ActionAndAdviceData;
    setSectionData('action-and-advice', { ...DEFAULT_ACTION_AND_ADVICE, ...current, ...field });
    setTimeout(() => saveEncounter({ toast: false }), 0);
  };

  const handleBillingConfirm = (items: BillingLineItem[], total: number) => {
    saveField({ billing: { items, total, confirmedAt: new Date().toISOString() } });
  };

  // Build medication line items — uses the new multi-medication list, falls back to legacy single field
  const buildMedicationItems = (): PricingLineItem[] => {
    const meds = (f.medications ?? []).filter((m) => m.name.trim());
    if (meds.length > 0) {
      return meds.map((m) => ({
        id: m.id,
        name: `${m.name}${m.timesPerDay ? ` — ${m.timesPerDay}×/day` : ''}${m.freq && m.freq !== 'None' ? ` (${m.freq})` : ''}`,
        price: 0,
      }));
    }
    // legacy fallback
    if (!patientMedications || patientMedications.length === 0) {
      const name = f.medicationName?.trim();
      if (name) return [{ id: generateId(), name: `${name} (${f.medicationFreq || 'as prescribed'})`, price: 0 }];
      return [];
    }
    return patientMedications.map((m) => ({
      id: m.id,
      name: `${m.drugName}${m.dosage ? ` ${m.dosage}` : ''} — ${m.frequency} (${m.route})`,
      price: 0,
    }));
  };

  // Build prescription line items from final spectacle section
  const buildPrescriptionItems = (): PricingLineItem[] => {
    const fsp = useEncounterStore.getState().sectionData['final-spectacle-prescription'] as any;
    const rx = fsp?.rx ?? {};
    const items: PricingLineItem[] = [];
    const hasOd = rx.odDist?.sph || rx.odDist?.cyl;
    const hasOs = rx.osDist?.sph || rx.osDist?.cyl;
    if (hasOd || hasOs) {
      const odStr = hasOd ? `OD: ${rx.odDist?.sph ?? ''} / ${rx.odDist?.cyl ?? ''} × ${rx.odDist?.axis ?? ''}` : '';
      const osStr = hasOs ? `OS: ${rx.osDist?.sph ?? ''} / ${rx.osDist?.cyl ?? ''} × ${rx.osDist?.axis ?? ''}` : '';
      items.push({ id: generateId(), name: `Spectacle Rx ${[odStr, osStr].filter(Boolean).join(' | ')}`, price: 0 });
    }
    // spectacle recommendation from this section
    if (f.spectacleRecommendation && f.spectacleRecommendation !== 'Select...') {
      items.push({ id: generateId(), name: f.spectacleRecommendation, price: 0 });
    }
    return items;
  };

  const handleMedPricingConfirm = (items: PricingLineItem[], total: number) => {
    saveField({ medicationPricing: { items, total, confirmedAt: new Date().toISOString() } });
  };

  const handleRxPricingConfirm = (items: PricingLineItem[], total: number) => {
    saveField({ prescriptionPricing: { items, total, confirmedAt: new Date().toISOString() } });
  };

  const { referral, urgency, spectacleRecommendation, followUpPeriod, remarks, showInDischarge } = f;

  const patientName = useEncounterStore((s) => s.patient?.name);
  const patientMrn = useEncounterStore((s) => s.patient?.mrn);
  const patientAge = String(useEncounterStore((s) => s.patient?.age ?? ''));
  const patientSex = useEncounterStore((s) => s.patient?.gender ?? '');

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Action And Advice</h1>

      <div className="space-y-6 max-w-4xl mb-8">
        {/* Surgery (opens dedicated modal) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Surgery</label>
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setSurgeryOpen(true)}
              className="w-full flex items-center justify-between gap-3 border border-slate-200 rounded-lg px-4 py-3 bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-colors text-left"
            >
              <div className="min-w-0">
                {surgeries.length === 0 ? (
                  <span className="text-xs text-slate-400">No surgery added yet. Click to record a surgery.</span>
                ) : (
                  <span className="text-xs font-semibold text-slate-700">
                    {surgeries.length} {surgeries.length === 1 ? 'surgery' : 'surgeries'}:
                    {surgeries.map((s) => ` ${surgeryTypeLabel(s)}`).join(',')}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-2 shrink-0">
                {surgeries.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                    {surgeries.length}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <PlusCircle className="w-4 h-4" /> Perform Surgery
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Further Referral / Tests */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Further Referral / Tests</label>
          <div className="md:col-span-3">
            <select
              value={referral}
              onChange={(e) => patch({ referral: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {REFERRAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Urgency</label>
          <div className="md:col-span-3">
            <select
              value={urgency}
              onChange={(e) => patch({ urgency: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medications — multi-entry */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <label className="text-xs font-bold text-slate-800 pt-2">Medication</label>
          <div className="md:col-span-3 space-y-2">
            {(f.medications ?? []).map((med, idx) => (
              <div key={med.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-4 shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => {
                    const updated = (f.medications ?? []).map((m) => m.id === med.id ? { ...m, name: e.target.value } : m);
                    patch({ medications: updated });
                  }}
                  placeholder="Medication name"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                />
                <input
                  type="number"
                  value={med.timesPerDay}
                  onChange={(e) => {
                    const updated = (f.medications ?? []).map((m) => m.id === med.id ? { ...m, timesPerDay: e.target.value } : m);
                    patch({ medications: updated });
                  }}
                  placeholder="×/day"
                  min={1}
                  className="w-16 px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 text-center placeholder:text-slate-400"
                />
                <select
                  value={med.freq}
                  onChange={(e) => {
                    const updated = (f.medications ?? []).map((m) => m.id === med.id ? { ...m, freq: e.target.value } : m);
                    patch({ medications: updated });
                  }}
                  className="w-44 px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600"
                >
                  {FREQ_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => patch({ medications: (f.medications ?? []).filter((m) => m.id !== med.id) })}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ medications: [...(f.medications ?? []), { id: generateId(), name: '', freq: 'None', timesPerDay: '' }] })}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              + Add medication
            </button>
          </div>
        </div>

        {/* Spectacle Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Spectacle Recommendation</label>
          <div className="md:col-span-3">
            <select
              value={spectacleRecommendation}
              onChange={(e) => patch({ spectacleRecommendation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {SPECTACLE_RECOMMENDATIONS.map((opt) => (
                <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Follow up period */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Follow up period</label>
          <div className="md:col-span-3">
            <select
              value={followUpPeriod}
              onChange={(e) => patch({ followUpPeriod: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {FOLLOW_UP_PERIODS.map((opt) => (
                <option key={opt} value={opt === 'Select...' ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Billing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Billing</label>
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setBillingOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
                billing
                  ? 'text-teal-700 bg-teal-50 border border-teal-300 hover:bg-teal-100'
                  : 'text-white bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {billing ? (
                <><CheckCircle className="w-4 h-4" /> Billing created — click to edit</>
              ) : (
                <><Receipt className="w-4 h-4" /> Create Billing</>
              )}
            </button>
            {billing && (
              <p className="text-[10px] text-slate-500 mt-1">
                {billing.items.length} item{billing.items.length !== 1 ? 's' : ''} · Total: {billing.total.toLocaleString()} ETB
              </p>
            )}
          </div>
        </div>

        {/* Medication Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Medication Price</label>
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setMedPricingOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
                medicationPricing
                  ? 'text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {medicationPricing ? (
                <><CheckCircle className="w-4 h-4" /> Medication pricing — click to edit</>
              ) : (
                <><Pill className="w-4 h-4" /> Medication Price</>
              )}
            </button>
            {medicationPricing && (
              <p className="text-[10px] text-slate-500 mt-1">
                {medicationPricing.items.length} item{medicationPricing.items.length !== 1 ? 's' : ''} · Total: {medicationPricing.total.toLocaleString()} ETB
              </p>
            )}
          </div>
        </div>

        {/* Prescription Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Prescription Price</label>
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setRxPricingOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
                prescriptionPricing
                  ? 'text-purple-700 bg-purple-50 border border-purple-300 hover:bg-purple-100'
                  : 'text-white bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {prescriptionPricing ? (
                <><CheckCircle className="w-4 h-4" /> Prescription pricing — click to edit</>
              ) : (
                <><Glasses className="w-4 h-4" /> Prescription Price</>
              )}
            </button>
            {prescriptionPricing && (
              <p className="text-[10px] text-slate-500 mt-1">
                {prescriptionPricing.items.length} item{prescriptionPricing.items.length !== 1 ? 's' : ''} · Total: {prescriptionPricing.total.toLocaleString()} ETB
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-4xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => patch({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-4xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => patch({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>

      <SurgeryModal
        open={surgeryOpen}
        surgeries={surgeries}
        onChange={onSurgeriesChange}
        onClose={() => setSurgeryOpen(false)}
        patientName={patientName}
        patientMrn={patientMrn}
        patientAge={patientAge}
        patientSex={patientSex}
      />

      <BillingModal
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        onConfirm={handleBillingConfirm}
        initialItems={billing?.items ?? []}
      />

      <SimplePricingModal
        open={medPricingOpen}
        title="Medication Price"
        initialItems={medicationPricing?.items.length ? medicationPricing.items : buildMedicationItems()}
        onClose={() => setMedPricingOpen(false)}
        onConfirm={handleMedPricingConfirm}
      />

      <SimplePricingModal
        open={rxPricingOpen}
        title="Prescription Price"
        initialItems={prescriptionPricing?.items.length ? prescriptionPricing.items : buildPrescriptionItems()}
        onClose={() => setRxPricingOpen(false)}
        onConfirm={handleRxPricingConfirm}
      />
    </div>
  );
};
