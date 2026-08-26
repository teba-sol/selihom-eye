import React, { useState } from 'react';

export const SlitLampView: React.FC = () => {
  const [lidsLashes, setLidsLashes] = useState('Normal');
  const [conjunctiva, setConjunctiva] = useState('Normal');
  const [cornea, setCornea] = useState('Abnormal');
  const [anteriorChamber, setAnteriorChamber] = useState('Normal');
  const [irisLens, setIrisLens] = useState('Normal');

  const [corneaNotes, setCorneaNotes] = useState('Central corneal scarring OD secondary to childhood infection.');
  const [remarks, setRemarks] = useState('Right cornea has irregular scar tissue. Left cornea is clear.');
  const [showInDischarge, setShowInDischarge] = useState(true);

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full space-y-6">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Slit Lamp Examination</h1>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Lids and Lashes</label>
          <select
            value={lidsLashes}
            onChange={(e) => setLidsLashes(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Normal">Normal</option>
            <option value="Blepharitis">Blepharitis</option>
            <option value="Meibomian Gland Dysfunction">Meibomian Gland Dysfunction</option>
            <option value="Trichiasis">Trichiasis</option>
            <option value="Ptosis">Ptosis</option>
            <option value="Abnormal">Abnormal (See remarks)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Conjunctiva</label>
          <select
            value={conjunctiva}
            onChange={(e) => setConjunctiva(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Normal">Normal</option>
            <option value="Hyperemia / Injection">Hyperemia / Injection</option>
            <option value="Ciliary Flush">Ciliary Flush</option>
            <option value="Follicles / Papillae">Follicles / Papillae</option>
            <option value="Subconjunctival Hemorrhage">Subconjunctival Hemorrhage</option>
            <option value="Abnormal">Abnormal (See remarks)</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="text-xs font-semibold text-slate-700">Cornea</label>
            <select
              value={cornea}
              onChange={(e) => setCornea(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="Normal">Normal / Clear</option>
              <option value="Abnormal">Abnormal</option>
              <option value="Corneal Scarring / Opacity">Corneal Scarring / Opacity</option>
              <option value="Epithelial Defect / Staining">Epithelial Defect / Staining</option>
              <option value="Stromal Infiltrate">Stromal Infiltrate</option>
              <option value="Corneal Edema">Corneal Edema</option>
            </select>
          </div>
          {cornea === 'Abnormal' && (
            <div className="md:ml-auto md:w-1/2">
              <input
                type="text"
                value={corneaNotes}
                onChange={(e) => setCorneaNotes(e.target.value)}
                placeholder="Specify corneal findings..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-slate-50 text-slate-800"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Anterior Chamber</label>
          <select
            value={anteriorChamber}
            onChange={(e) => setAnteriorChamber(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Normal">Normal (Quiet & Deep)</option>
            <option value="Shallow">Shallow</option>
            <option value="Cells & Flare (1+ / 2+)">Cells & Flare (1+ / 2+)</option>
            <option value="Hypopyon / Hyphema">Hypopyon / Hyphema</option>
            <option value="Abnormal">Abnormal</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="text-xs font-semibold text-slate-700">Iris / Crystalline Lens</label>
          <select
            value={irisLens}
            onChange={(e) => setIrisLens(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Normal">Normal / Clear</option>
            <option value="Early Nuclear Sclerosis (NS 1+)">Early Nuclear Sclerosis (NS 1+)</option>
            <option value="Cortical Cataract">Cortical Cataract</option>
            <option value="Posterior Subcapsular (PSC)">Posterior Subcapsular (PSC)</option>
            <option value="Pseudophakic (PCIOL)">Pseudophakic (PCIOL)</option>
            <option value="Aphakic">Aphakic</option>
          </select>
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
