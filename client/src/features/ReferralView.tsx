import React, { useState } from 'react';

const REFERRAL_REASON_OPTIONS = [
  'Glaucoma Management',
  'Retinal Disease',
  'Corneal & External Disease',
  'Pediatric Ophthalmology',
  'Neuro-Ophthalmology',
  'Oculoplastic Surgery',
  'Uveitis / Inflammation',
  'Strabismus Surgery',
  'Cataract Surgery',
  'LASIK / Refractive Surgery',
  'Low Vision Rehabilitation',
  'Ocular Oncology',
  'General Consultation',
];

const CO_MANAGEMENT_OPTIONS = [
  'Post-Operative Care',
  'Ongoing Medical Management',
  'Contact Lens Fitting',
  'Visual Field Monitoring',
  'Intravitreal Injection Monitoring',
  'Laser Treatment Monitoring',
  'Specialty Contact Lens',
];

const PRIORITY_OPTIONS = [
  'Routine',
  'Urgent',
  'Emergent',
];

export const ReferralView: React.FC = () => {
  const [referralType, setReferralType] = useState<'referral' | 'co-management'>('referral');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [referringDoctor, setReferringDoctor] = useState('');
  const [facility, setFacility] = useState('');
  const [priority, setPriority] = useState('Routine');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const reasonOptions = referralType === 'referral' ? REFERRAL_REASON_OPTIONS : CO_MANAGEMENT_OPTIONS;

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-8">Referral / Co-Management</h1>

      <div className="space-y-6 max-w-3xl mb-8">
        {/* Referral Type Toggle */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-2">Type</label>
          <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
            {(['referral', 'co-management'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setReferralType(type);
                  setSelectedReasons([]);
                }}
                className={`px-6 py-2 text-xs font-semibold transition-colors border-r last:border-r-0 border-slate-200 ${
                  referralType === type
                    ? 'bg-[#1E40AF] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type === 'referral' ? 'Referral' : 'Co-Management'}
              </button>
            ))}
          </div>
        </div>

        {/* Reason / Purpose Selection */}
        <div>
          <label className="text-xs font-bold text-slate-900 block mb-3">
            {referralType === 'referral' ? 'Referral Reason' : 'Co-Management Purpose'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasonOptions.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border cursor-pointer transition-colors ${
                  selectedReasons.includes(reason)
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-0"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referring Doctor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">
            {referralType === 'referral' ? 'Referring Doctor' : 'Co-Managing Doctor'}
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={referringDoctor}
              onChange={(e) => setReferringDoctor(e.target.value)}
              placeholder="Dr. ..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Facility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Facility / Clinic</label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="Clinic / Hospital name"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-900">Priority</label>
          <div className="md:col-span-2">
            <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-5 py-1.5 text-xs font-semibold transition-colors border-r last:border-r-0 border-slate-200 ${
                    priority === p
                      ? p === 'Emergent'
                        ? 'bg-red-600 text-white font-bold'
                        : p === 'Urgent'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-[#1E40AF] text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <label className="text-xs font-bold text-slate-900 pt-2">Clinical Summary</label>
          <div className="md:col-span-2">
            <textarea
              rows={4}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="Brief clinical summary for the receiving doctor..."
              className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <label className="text-xs font-bold text-slate-900 pt-2">Additional Notes</label>
          <div className="md:col-span-2">
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Special instructions or requests..."
              className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
            />
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
