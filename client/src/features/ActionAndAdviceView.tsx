import React, { useState } from 'react';

interface PrescriptionItem {
  id: string;
  name: string;
  eye: string;
  type: string;
  dose: string;
  duration: string;
  remark: string;
}

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
  'Within 1 month',
  'Within 2 - 4 weeks',
  'Within 1 week',
  'Within 24 hours / Emergency',
  'Routine (1 - 3 months)',
];

const EYE_OPTIONS = ['BE', 'RE', 'LE'];
const DRUG_TYPES = ['Drop', 'Ointment', 'Gel', 'Tablet', 'Suspension'];
const DOSE_OPTIONS = [
  '1 drop, 3 x daily',
  '1 drop, 2 x daily',
  '1 drop, 4 x daily',
  '1 drop, 1 x daily (Bedtime)',
  '1 drop, every 2 hours',
  '1 application at bedtime',
];
const DURATION_OPTIONS = ['12 weeks', '8 weeks', '4 weeks', '2 weeks', '1 week', 'SOS / As needed'];

export const ActionAndAdviceView: React.FC = () => {
  const [referral, setReferral] = useState('Referral to Ophthalmologist');
  const [urgency, setUrgency] = useState('Within 1 month');

  const [medName, setMedName] = useState('Flogel');
  const [medEye, setMedEye] = useState('BE');
  const [medType, setMedType] = useState('Ointment');
  const [medDose, setMedDose] = useState('1 drop, 2 x daily');
  const [medDuration, setMedDuration] = useState('12 weeks');
  const [medRemark, setMedRemark] = useState('AM');

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: '1',
      name: 'Hyla PF',
      eye: 'BE',
      type: 'Drop',
      dose: '1 drop, 3 x daily',
      duration: '12 weeks',
      remark: '-',
    },
    {
      id: '2',
      name: 'Flogel',
      eye: 'BE',
      type: 'Ointment',
      dose: '1 drop, 2 x daily',
      duration: '12 weeks',
      remark: 'AM and PM',
    },
  ]);

  const [spectacleRecommendation, setSpectacleRecommendation] = useState('');
  const [followUpPeriod, setFollowUpPeriod] = useState('6 months');
  const [remarks, setRemarks] = useState(
    'Referred to Dr. Agarwal:\nDear Dr. Agarwal, Mr. Obama has had a dramatic increase in the astigmatism in his RE in the last 6 months.'
  );
  const [showInDischarge, setShowInDischarge] = useState(false);

  const handleAddMedication = () => {
    if (!medName.trim()) return;
    const newItem: PrescriptionItem = {
      id: Date.now().toString(),
      name: medName,
      eye: medEye,
      type: medType,
      dose: medDose,
      duration: medDuration,
      remark: medRemark || '-',
    };
    setPrescriptions((prev) => [...prev, newItem]);
    setMedName('');
    setMedRemark('');
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

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
              onChange={(e) => setReferral(e.target.value)}
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
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medication Builder & List */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-800 block mb-2">Medication</label>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="Drug name"
              className="w-32 px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            />
            <select
              value={medEye}
              onChange={(e) => setMedEye(e.target.value)}
              className="w-16 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {EYE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={medType}
              onChange={(e) => setMedType(e.target.value)}
              className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {DRUG_TYPES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={medDose}
              onChange={(e) => setMedDose(e.target.value)}
              className="w-36 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {DOSE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              value={medDuration}
              onChange={(e) => setMedDuration(e.target.value)}
              className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              value={medRemark}
              onChange={(e) => setMedRemark(e.target.value)}
              placeholder="Remark"
              className="w-16 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center font-medium"
            />
            <button
              type="button"
              onClick={handleAddMedication}
              className="px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded transition-colors"
            >
              Add
            </button>
          </div>

          {prescriptions.length > 0 && (
            <div className="border border-slate-200 rounded overflow-hidden mt-3 mb-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Eye</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Dose</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Remark</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {prescriptions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.eye}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.type}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.dose}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.duration}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.remark}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(item.id)}
                          className="px-3 py-1 text-[11px] font-semibold text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Spectacle Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Spectacle Recommendation</label>
          <div className="md:col-span-3">
            <select
              value={spectacleRecommendation}
              onChange={(e) => setSpectacleRecommendation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">Select...</option>
              <option value="Single Vision Distance">Single Vision Distance</option>
              <option value="Single Vision Near">Single Vision Near</option>
              <option value="Progressive Addition Lenses (PALs)">Progressive Addition Lenses (PALs)</option>
              <option value="Bifocals (D-Segment / Kryptok)">Bifocals (D-Segment / Kryptok)</option>
              <option value="Not Recommended / Trial Frame Only">Not Recommended / Trial Frame Only</option>
            </select>
          </div>
        </div>

        {/* Follow up period */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Follow up period</label>
          <div className="md:col-span-3">
            <select
              value={followUpPeriod}
              onChange={(e) => setFollowUpPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-4xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 leading-relaxed font-sans"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-4xl">
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
