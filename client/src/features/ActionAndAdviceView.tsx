import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { CataractSurgeryForm, DEFAULT_CATARACT_DETAILS } from './CataractSurgeryForm';
import type { CataractDetails } from './CataractSurgeryForm';
import { GenericSurgeryForm, DEFAULT_GENERIC_SURGERY_DETAILS } from './GenericSurgeryForm';
import type { GenericSurgeryDetails } from './GenericSurgeryForm';

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

const SURGERY_OPTIONS = [
  'None',
  'Cataract Surgery',
  'LASIK / PRK',
  'Trabeculectomy',
  'Vitrectomy',
  'Corneal Graft / PKP',
  'Pterygium Excision',
  'Strabismus Surgery',
  'Oculoplastic Surgery',
  'Other (Enter Manually)',
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

type SurgeryEntry = {
  id: string;
  type: string;
  otherName: string;
  remarks: string;
  cataractDetails?: CataractDetails;
  genericDetails?: GenericSurgeryDetails;
};

type ActionAndAdviceData = {
  surgeryType: string;
  surgeryOther: string;
  surgeryRemarks: string;
  surgeries?: SurgeryEntry[];
  cataractDetails?: CataractDetails;
  genericSurgeryDetails?: Record<string, GenericSurgeryDetails>;
  referral: string;
  urgency: string;
  medicationName: string;
  medicationFreq: string;
  spectacleRecommendation: string;
  followUpPeriod: string;
  remarks: string;
  showInDischarge: boolean;
};

const DEFAULT_ACTION_AND_ADVICE: ActionAndAdviceData = {
  surgeryType: '',
  surgeryOther: '',
  surgeryRemarks: '',
  surgeries: [],
  cataractDetails: DEFAULT_CATARACT_DETAILS,
  genericSurgeryDetails: {},
  referral: 'Referral to Ophthalmologist',
  urgency: 'Soon (2 - 4 weeks)',
  medicationName: '',
  medicationFreq: 'None',
  spectacleRecommendation: 'Not Recommended / Trial Frame Only',
  followUpPeriod: '6 months',
  remarks: '',
  showInDischarge: false,
};

// Back-compat: old exams stored a single surgery in flat fields (surgeryType/surgeryOther/...).
// If the new `surgeries` array is missing, derive one entry from the legacy fields.
function legacyToSurgeries(f: ActionAndAdviceData): SurgeryEntry[] {
  if ((f.surgeries ?? []).length > 0) return f.surgeries as SurgeryEntry[];
  const type = f.surgeryType ?? '';
  if (!type) return [];
  const entry: SurgeryEntry = {
    id: crypto.randomUUID(),
    type,
    otherName: f.surgeryOther ?? '',
    remarks: f.surgeryRemarks ?? '',
  };
  if (type === 'Cataract Surgery') {
    entry.cataractDetails = f.cataractDetails ?? { ...DEFAULT_CATARACT_DETAILS };
  } else if (type !== 'Other (Enter Manually)') {
    entry.genericDetails = f.genericSurgeryDetails?.[type] ?? { ...DEFAULT_GENERIC_SURGERY_DETAILS };
  } else {
    entry.genericDetails = { ...DEFAULT_GENERIC_SURGERY_DETAILS };
  }
  return [entry];
}

// Mirror the first surgery back into the legacy flat fields so any other reader stays consistent.
function mirrorLegacy(list: SurgeryEntry[]): Partial<ActionAndAdviceData> {
  const first = list[0];
  const genericSurgeryDetails: Record<string, GenericSurgeryDetails> = {};
  for (const s of list) {
    if (s.type && s.type !== 'Cataract Surgery') {
      genericSurgeryDetails[s.type] = s.genericDetails ?? { ...DEFAULT_GENERIC_SURGERY_DETAILS };
    }
  }
  return {
    surgeryType: first?.type ?? '',
    surgeryOther: first?.otherName ?? '',
    surgeryRemarks: first?.remarks ?? '',
    surgeries: list,
    cataractDetails: first?.cataractDetails,
    genericSurgeryDetails,
  };
}

export const ActionAndAdviceView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_ACTION_AND_ADVICE, sectionData['action-and-advice'] ?? {}) as ActionAndAdviceData;
  const patch = (p: Partial<ActionAndAdviceData>) => setSectionData('action-and-advice', { ...f, ...p });
  const surgeries = legacyToSurgeries(f);
  const patchSurgery = (id: string, p: Partial<SurgeryEntry>) => {
    const next = surgeries.map((s) => (s.id === id ? { ...s, ...p } : s));
    patch(mirrorLegacy(next));
  };
  const addSurgery = () => {
    const entry: SurgeryEntry = { id: crypto.randomUUID(), type: '', otherName: '', remarks: '' };
    patch(mirrorLegacy([...surgeries, entry]));
  };
  const removeSurgery = (id: string) => patch(mirrorLegacy(surgeries.filter((s) => s.id !== id)));
  const { referral, urgency, medicationName, medicationFreq, spectacleRecommendation, followUpPeriod, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Action And Advice</h1>

      <div className="space-y-6 max-w-4xl mb-8">
        {/* Surgery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <label className="text-xs font-bold text-slate-800 pt-2">Surgery</label>
          <div className="md:col-span-3 space-y-3">
            {surgeries.map((s, i) => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Surgery #{i + 1}</span>
                  <button type="button" onClick={() => removeSurgery(s.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                    Remove
                  </button>
                </div>
                <select
                  value={s.type}
                  onChange={(e) => patchSurgery(s.id, { type: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                >
                  {SURGERY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt === 'None' ? '' : opt}>{opt}</option>
                  ))}
                </select>
                {s.type === 'Other (Enter Manually)' && (
                  <input
                    type="text"
                    value={s.otherName}
                    onChange={(e) => patchSurgery(s.id, { otherName: e.target.value })}
                    placeholder="Enter surgery name..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                  />
                )}
                {s.type === 'Cataract Surgery' && (
                  <CataractSurgeryForm
                    data={s.cataractDetails ?? DEFAULT_CATARACT_DETAILS}
                    onChange={(d) => patchSurgery(s.id, { cataractDetails: d })}
                  />
                )}
                {s.type && s.type !== 'None' && s.type !== 'Cataract Surgery' && s.type !== 'Other (Enter Manually)' && (
                  <GenericSurgeryForm
                    surgeryType={s.type}
                    data={s.genericDetails ?? DEFAULT_GENERIC_SURGERY_DETAILS}
                    onChange={(d) => patchSurgery(s.id, { genericDetails: d })}
                  />
                )}
                {s.type === 'Other (Enter Manually)' && (
                  <GenericSurgeryForm
                    surgeryType={s.otherName.trim() || 'Custom Surgery'}
                    data={s.genericDetails ?? DEFAULT_GENERIC_SURGERY_DETAILS}
                    onChange={(d) => patchSurgery(s.id, { genericDetails: d })}
                  />
                )}
                {s.type && s.type !== 'None' && (
                  <textarea
                    rows={2}
                    value={s.remarks}
                    onChange={(e) => patchSurgery(s.id, { remarks: e.target.value })}
                    placeholder="Surgery remarks / details..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSurgery}
              className="px-3 py-2 text-xs font-semibold rounded-md border border-dashed border-slate-400 text-slate-600 hover:border-blue-500 hover:text-blue-600"
            >
              ＋ Add Surgery
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

        {/* Medication */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Medication</label>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={medicationName}
              onChange={(e) => patch({ medicationName: e.target.value })}
              placeholder="Medication name (e.g. Systane Ultra)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
            />
            <select
              value={medicationFreq}
              onChange={(e) => patch({ medicationFreq: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="None">None</option>
              <option value="TDS (3 times a day)">TDS (3 times a day)</option>
              <option value="BD (Twice a day)">BD (Twice a day)</option>
              <option value="QID (4 times a day)">QID (4 times a day)</option>
              <option value="HS (At bedtime)">HS (At bedtime)</option>
              <option value="PRN (As needed)">PRN (As needed)</option>
            </select>
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
    </div>
  );
};