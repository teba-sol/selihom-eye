import React, { useState } from 'react';

const DIAGNOSIS_OPTIONS = [
  'Myopia (OD)',
  'Myopia (OS)',
  'Myopia (OU)',
  'Hyperopia (OD)',
  'Hyperopia (OS)',
  'Hyperopia (OU)',
  'Astigmatism (OD)',
  'Astigmatism (OS)',
  'Astigmatism (OU)',
  'Presbyopia',
  'Amblyopia (OD)',
  'Amblyopia (OS)',
  'Strabismus',
  'Dry Eye Disease',
  'Glaucoma Suspect',
  'Open-Angle Glaucoma',
  'Angle-Closure Glaucoma',
  'Cataract',
  'Keratoconus',
  'Pterygium',
  'Conjunctivitis',
  'Blepharitis',
  'Hordeolum',
  'Chalazion',
  'Corneal Ulcer',
  'Retinal Detachment',
  'Diabetic Retinopathy',
  'AMD',
  'Optic Neuropathy',
];

const PLAN_TYPE_OPTIONS = [
  'Observation',
  'Medical Management',
  'Referral',
  'Surgical Consultation',
  'Follow-up',
  'Contact Lens Fitting',
  'Visual Rehabilitation',
];

export const AssessmentPlanView: React.FC = () => {
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [planType, setPlanType] = useState('Observation');
  const [planDetails, setPlanDetails] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const toggleDiagnosis = (dx: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(dx) ? prev.filter((d) => d !== dx) : [...prev, dx]
    );
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Assessment & Plan</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Diagnosis Selection */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-3">Diagnosis</label>
          <div className="grid grid-cols-2 gap-2">
            {DIAGNOSIS_OPTIONS.map((dx) => (
              <label
                key={dx}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                  selectedDiagnoses.includes(dx)
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDiagnoses.includes(dx)}
                  onChange={() => toggleDiagnosis(dx)}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-0"
                />
                <span>{dx}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Plan Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Plan Type</label>
          <div className="md:col-span-2">
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {PLAN_TYPE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <label className="text-xs font-bold text-slate-900 pt-2">Plan Details</label>
          <div className="md:col-span-2">
            <textarea
              rows={4}
              value={planDetails}
              onChange={(e) => setPlanDetails(e.target.value)}
              placeholder="Describe the management plan in detail..."
              className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Follow-up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Follow-up</label>
          <div className="md:col-span-2">
            <select
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">Select...</option>
              <option value="1 week">1 Week</option>
              <option value="2 weeks">2 Weeks</option>
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="as-needed">As Needed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-3xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-3xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
