import React, { useState } from 'react';

const REASONS_LEFT = [
  'Routine eye examination',
  'Referral',
  'Dilated Posterior Segment Examination',
  'Lasik Evaluation',
  'PMT'
];

const REASONS_RIGHT = [
  'Ocular Symptom',
  'Medical Examination',
  'Cataract Evaluation',
  'Glaucoma Evaluation',
  'Others'
];

export const ReasonForVisitView: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full font-sans">
      <h1 className="text-2xl font-bold text-[#2957a4] mb-8">Reason For Visit</h1>
      
      <div className="grid grid-cols-2 gap-x-8 mb-12 max-w-3xl">
        <div className="space-y-5">
          {REASONS_LEFT.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-[#2957a4] bg-white border-slate-300 focus:ring-1 focus:ring-[#2957a4]"
              />
              <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-800">{reason}</span>
            </label>
          ))}
        </div>
        <div className="space-y-5">
          {REASONS_RIGHT.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-[#2957a4] bg-white border-slate-300 focus:ring-1 focus:ring-[#2957a4]"
              />
              <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-800">{reason}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 mt-8">
        <label className="text-sm font-semibold text-[#4a5f73] block mb-2">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2957a4] focus:ring-1 focus:ring-[#2957a4] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-[#2957a4] border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
