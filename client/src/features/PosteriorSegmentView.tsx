import React, { useState } from 'react';

export const PosteriorSegmentView: React.FC = () => {
  const [dilationStatus, setDilationStatus] = useState<'Dilated' | 'Undilated'>('Dilated');
  const [dilationDrug, setDilationDrug] = useState('Tropicamide 0.8% + Phenylephrine 5%');

  const [cdrOd, setCdrOd] = useState('0.3');
  const [cdrOs, setCdrOs] = useState('0.3');
  const [onhMargins, setOnhMargins] = useState('Pink, well-defined margins OU');

  const [maculaOd, setMaculaOd] = useState('Normal / Clear foveal reflex');
  const [maculaOs, setMaculaOs] = useState('Normal / Clear foveal reflex');

  const [diabeticRetinopathy, setDiabeticRetinopathy] = useState('No Diabetic Retinopathy (No DR)');

  const [peripheralRetina, setPeripheralRetina] = useState('Flat & intact 360\u00B0, no tears/holes');

  const [remarks, setRemarks] = useState('Dilated fundus examination normal OU. No signs of diabetic retinopathy or glaucoma.');
  const [showInDischarge, setShowInDischarge] = useState(true);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-[#1E3A8A]">Posterior Segment Examination</h1>

        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5">
          {(['Dilated', 'Undilated'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setDilationStatus(status)}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-colors ${
                dilationStatus === status
                  ? 'bg-[#1E40AF] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {dilationStatus === 'Dilated' && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900">Mydriatic Agent Used:</span>
          <select
            value={dilationDrug}
            onChange={(e) => setDilationDrug(e.target.value)}
            className="text-xs border border-blue-300 rounded px-2.5 py-1 bg-white font-medium focus:outline-none"
          >
            <option value="Tropicamide 0.8% + Phenylephrine 5%">Tropicamide 0.8% + Phenylephrine 5%</option>
            <option value="Tropicamide 1.0%">Tropicamide 1.0%</option>
            <option value="Cyclopentolate 1.0%">Cyclopentolate 1.0%</option>
            <option value="Homatropine 2.0%">Homatropine 2.0%</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800">RIGHT EYE (OD)</span>
            <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded">OD</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Cup-to-Disc Ratio (CDR)</label>
            <input
              type="text"
              value={cdrOd}
              onChange={(e) => setCdrOd(e.target.value)}
              placeholder="0.3"
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Macula & Fovea</label>
            <select
              value={maculaOd}
              onChange={(e) => setMaculaOd(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              <option value="Normal / Clear foveal reflex">Normal / Clear foveal reflex</option>
              <option value="Drusen / RPE changes">Drusen / RPE changes</option>
              <option value="Macular Edema">Macular Edema</option>
              <option value="Macular Hole">Macular Hole</option>
              <option value="ERM (Epiretinal Membrane)">ERM (Epiretinal Membrane)</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800">LEFT EYE (OS)</span>
            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">OS</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Cup-to-Disc Ratio (CDR)</label>
            <input
              type="text"
              value={cdrOs}
              onChange={(e) => setCdrOs(e.target.value)}
              placeholder="0.3"
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Macula & Fovea</label>
            <select
              value={maculaOs}
              onChange={(e) => setMaculaOs(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
            >
              <option value="Normal / Clear foveal reflex">Normal / Clear foveal reflex</option>
              <option value="Drusen / RPE changes">Drusen / RPE changes</option>
              <option value="Macular Edema">Macular Edema</option>
              <option value="Macular Hole">Macular Hole</option>
              <option value="ERM (Epiretinal Membrane)">ERM (Epiretinal Membrane)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Diabetic Retinopathy Grading</label>
          <select
            value={diabeticRetinopathy}
            onChange={(e) => setDiabeticRetinopathy(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="No Diabetic Retinopathy (No DR)">No Diabetic Retinopathy (No DR)</option>
            <option value="Mild Non-Proliferative DR (Mild NPDR)">Mild Non-Proliferative DR (Mild NPDR)</option>
            <option value="Moderate Non-Proliferative DR (Mod NPDR)">Moderate Non-Proliferative DR (Mod NPDR)</option>
            <option value="Severe Non-Proliferative DR (Severe NPDR)">Severe Non-Proliferative DR (Severe NPDR)</option>
            <option value="Proliferative Diabetic Retinopathy (PDR)">Proliferative Diabetic Retinopathy (PDR)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Optic Nerve Head Margins</label>
          <input
            type="text"
            value={onhMargins}
            onChange={(e) => setOnhMargins(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Peripheral Retina</label>
          <input
            type="text"
            value={peripheralRetina}
            onChange={(e) => setPeripheralRetina(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
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
