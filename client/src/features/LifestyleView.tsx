import React, { useState } from 'react';

export const LifestyleView: React.FC = () => {
  const [occupation, setOccupation] = useState('Cook');
  const [hobbies, setHobbies] = useState('Reading, watching TV');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Lifestyle</h1>

      <div className="space-y-5 mb-8">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Occupation</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Cook, Accountant, Driver..."
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Hobbies</label>
          <input
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="e.g. Reading, watching TV, Swimming..."
            className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      <div className="flex justify-end">
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
