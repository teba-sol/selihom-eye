import React, { useState } from 'react';

export const ContactLensView: React.FC = () => {
  const [none, setNone] = useState(true);
  const [softDaily, setSoftDaily] = useState(false);
  const [softMonthly, setSoftMonthly] = useState(false);
  const [extendedWear, setExtendedWear] = useState(false);
  const [rgpHard, setRgpHard] = useState(false);
  const [scleral, setScleral] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const handleNoneChange = (checked: boolean) => {
    setNone(checked);
    if (checked) {
      setSoftDaily(false);
      setSoftMonthly(false);
      setExtendedWear(false);
      setRgpHard(false);
      setScleral(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Contact Lens</h1>

      <div className="space-y-4 mb-8">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={none}
            onChange={(e) => handleNoneChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>None</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={softDaily}
            disabled={none}
            onChange={(e) => setSoftDaily(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Soft Daily Disposable</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={softMonthly}
            disabled={none}
            onChange={(e) => setSoftMonthly(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Soft Monthly Disposable</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={extendedWear}
            disabled={none}
            onChange={(e) => setExtendedWear(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Extended Wear</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={rgpHard}
            disabled={none}
            onChange={(e) => setRgpHard(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>RGP / Hard</span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={scleral}
            disabled={none}
            onChange={(e) => setScleral(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-50"
          />
          <span>Scleral</span>
        </label>
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
