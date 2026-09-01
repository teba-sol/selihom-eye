import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

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

type ActionAndAdviceData = {
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
  referral: 'Referral to Ophthalmologist',
  urgency: 'Soon (2 - 4 weeks)',
  medicationName: '',
  medicationFreq: 'None',
  spectacleRecommendation: 'Not Recommended / Trial Frame Only',
  followUpPeriod: '6 months',
  remarks: '',
  showInDischarge: false,
};

export const ActionAndAdviceView: React.FC = () => {
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const f = Object.assign({}, DEFAULT_ACTION_AND_ADVICE, sectionData['action-and-advice'] ?? {}) as ActionAndAdviceData;
  const patch = (p: Partial<ActionAndAdviceData>) => setSectionData('action-and-advice', { ...f, ...p });
  const { referral, urgency, medicationName, medicationFreq, spectacleRecommendation, followUpPeriod, remarks, showInDischarge } = f;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Action And Advice</h1>

      <div className="space-y-6 max-w-4xl mb-8">
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