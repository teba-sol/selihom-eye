import React, { useState } from 'react';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200">
      {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
    </select>
  );
}

function Txt({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full max-w-lg px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200" />
  );
}

const FRAME_TYPES = ['','Full Rim','Half Rim','Rimless','Semi-rimless'];
const LENS_TYPES = ['','Single Vision','Bifocal','Progressive (PAL)','Office/Occupational','Reading Only'];
const LENS_MATERIALS = ['','CR-39 (Plastic)','Polycarbonate','High Index 1.60','High Index 1.67','High Index 1.74','Trivex','Glass'];
const COATINGS = ['Anti-Reflective (AR)','UV400 Protection','Blue Light Filter','Photochromic (Transitions)','Hardening','Mirror coating','Tint'];
const COLLECTION_OPTIONS = ['','In clinic','To be ordered','Home delivery','Patient to collect'];

export const SpectacleDispensingView: React.FC = () => {
  const [frameType, setFrameType] = useState('');
  const [frameBrand, setFrameBrand] = useState('');
  const [frameRef, setFrameRef] = useState('');
  const [lensType, setLensType] = useState('');
  const [lensMaterial, setLensMaterial] = useState('');
  const [lensBrand, setLensBrand] = useState('');
  const [coatings, setCoatings] = useState<string[]>([]);
  const [rightPd, setRightPd] = useState('');
  const [leftPd, setLeftPd] = useState('');
  const [heightOd, setHeightOd] = useState('');
  const [heightOs, setHeightOs] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [labName, setLabName] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [collectionMethod, setCollectionMethod] = useState('');
  const [price, setPrice] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const toggleCoating = (c: string) =>
    setCoatings(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#2563eb]">Spectacle Dispensing</h1>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Save</button>
        </div>

        {/* Frame */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Frame Details</p>
        <div className="space-y-1 mb-6">
          <Row label="Frame Type"><Sel value={frameType} onChange={setFrameType} options={FRAME_TYPES}/></Row>
          <Row label="Frame Brand / Model"><Txt value={frameBrand} onChange={setFrameBrand} placeholder="e.g. Ray-Ban, Essilor, local"/></Row>
          <Row label="Frame Reference / Code"><Txt value={frameRef} onChange={setFrameRef} placeholder="e.g. RB-5154-2000"/></Row>
        </div>

        {/* Lens */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Lens Details</p>
        <div className="space-y-1 mb-4">
          <Row label="Lens Type"><Sel value={lensType} onChange={setLensType} options={LENS_TYPES}/></Row>
          <Row label="Lens Material"><Sel value={lensMaterial} onChange={setLensMaterial} options={LENS_MATERIALS}/></Row>
          <Row label="Lens Brand / Lab"><Txt value={lensBrand} onChange={setLensBrand} placeholder="e.g. Essilor Varilux, Zeiss, Hoya"/></Row>
        </div>

        {/* Coatings */}
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-800 mb-2">Coatings / Treatments</p>
          <div className="flex flex-wrap gap-2">
            {COATINGS.map(c => (
              <label key={c} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${coatings.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
                <input type="checkbox" checked={coatings.includes(c)} onChange={() => toggleCoating(c)} className="sr-only"/>
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* PD & Heights */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Measurements</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'PD Right (OD)', value: rightPd, onChange: setRightPd, unit: 'mm' },
            { label: 'PD Left (OS)', value: leftPd, onChange: setLeftPd, unit: 'mm' },
            { label: 'Seg Height OD', value: heightOd, onChange: setHeightOd, unit: 'mm' },
            { label: 'Seg Height OS', value: heightOs, onChange: setHeightOs, unit: 'mm' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{f.label}</label>
              <div className="flex items-center gap-2">
                <input type="number" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder="0"
                  className="w-24 px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white font-semibold text-center focus:outline-none focus:border-blue-600" />
                <span className="text-xs text-slate-500">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Order Details</p>
        <div className="space-y-1 mb-6">
          <Row label="Order Reference"><Txt value={orderRef} onChange={setOrderRef} placeholder="e.g. ORD-2024-001"/></Row>
          <Row label="Lab / Supplier"><Txt value={labName} onChange={setLabName} placeholder="e.g. Essilor Lab, local lab"/></Row>
          <Row label="Expected Dispatch"><input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600"/></Row>
          <Row label="Collection Method"><Sel value={collectionMethod} onChange={setCollectionMethod} options={COLLECTION_OPTIONS}/></Row>
        </div>

        {/* Payment */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Payment</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Price</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
              className="w-40 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Advance Paid</label>
            <input type="number" value={advancePaid} onChange={e => setAdvancePaid(e.target.value)} placeholder="0"
              className="w-40 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
          <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any remarks..."
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"/>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
            Show in Discharge Summary
          </label>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Save</button>
        </div>
      </div>
    </div>
  );
};
