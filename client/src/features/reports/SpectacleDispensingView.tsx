import React, { useState, useCallback } from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';
import { SendToReceptionButton } from '../../components/SendToReceptionButton';
import type { OpticalOrderPayload } from '../../lib/opticalOrders';

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

const SECTION_KEY = 'spectacle-dispensing';

interface SdData {
  frameType: string;
  frameBrand: string;
  frameRef: string;
  lensType: string;
  lensMaterial: string;
  lensBrand: string;
  coatings: string[];
  rightPd: string;
  leftPd: string;
  heightOd: string;
  heightOs: string;
  orderRef: string;
  labName: string;
  dispatchDate: string;
  collectionMethod: string;
  price: string;
  advancePaid: string;
  remarks: string;
  showInDischarge: boolean;
}

const DEFAULT_SD: SdData = {
  frameType: '', frameBrand: '', frameRef: '',
  lensType: '', lensMaterial: '', lensBrand: '',
  coatings: [],
  rightPd: '', leftPd: '', heightOd: '', heightOs: '',
  orderRef: '', labName: '', dispatchDate: '', collectionMethod: '',
  price: '', advancePaid: '',
  remarks: '', showInDischarge: false,
};

export const SpectacleDispensingView: React.FC = () => {
  const sectionData = useEncounterStore(s => s.sectionData);
  const setSectionData = useEncounterStore(s => s.setSectionData);
  const saveEncounter = useEncounterStore(s => s.saveEncounter);
  const d = Object.assign({}, DEFAULT_SD, sectionData[SECTION_KEY] ?? {}) as SdData;
  const patch = (p: Partial<SdData>) => setSectionData(SECTION_KEY, { ...d, ...p });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const toggleCoating = (c: string) =>
    patch({ coatings: d.coatings.includes(c) ? d.coatings.filter(x => x !== c) : [...d.coatings, c] });

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveEncounter();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  };

  const encounterState = useEncounterStore.getState();

  const buildPayload = useCallback((): OpticalOrderPayload => {
    const fsp: any = sectionData['final-spectacle-prescription'] ?? {};
    const r = fsp.rx ?? {};
    return {
      encounterId: encounterState.encounterId ?? '',
      appointmentId: encounterState.appointmentId,
      patientId: encounterState.patient.id,
      rx: {
        od: { sph: r.odDist?.sph, cyl: r.odDist?.cyl, axis: r.odDist?.axis },
        os: { sph: r.osDist?.sph, cyl: r.osDist?.cyl, axis: r.osDist?.axis },
      },
      lensType: d.lensType,
      lensMaterial: d.lensMaterial,
      coatings: d.coatings,
      frameType: d.frameType,
      frameRef: d.frameRef,
      collectionMethod: d.collectionMethod,
      orderRef: d.orderRef,
      pdMm: d.rightPd || d.leftPd,
      notes: d.remarks,
    };
  }, [encounterState, sectionData, d]);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <h1 className="text-2xl font-bold text-[#2563eb]">Spectacle Dispensing</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <SendToReceptionButton buildPayload={buildPayload} />
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}</button>
          </div>
        </div>

        {/* Frame */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Frame Details</p>
        <div className="space-y-1 mb-6">
          <Row label="Frame Type"><Sel value={d.frameType} onChange={(v: string) => patch({ frameType: v })} options={FRAME_TYPES}/></Row>
          <Row label="Frame Brand / Model"><Txt value={d.frameBrand} onChange={(v: string) => patch({ frameBrand: v })} placeholder="e.g. Ray-Ban, Essilor, local"/></Row>
          <Row label="Frame Reference / Code"><Txt value={d.frameRef} onChange={(v: string) => patch({ frameRef: v })} placeholder="e.g. RB-5154-2000"/></Row>
        </div>

        {/* Lens */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Lens Details</p>
        <div className="space-y-1 mb-4">
          <Row label="Lens Type"><Sel value={d.lensType} onChange={(v: string) => patch({ lensType: v })} options={LENS_TYPES}/></Row>
          <Row label="Lens Material"><Sel value={d.lensMaterial} onChange={(v: string) => patch({ lensMaterial: v })} options={LENS_MATERIALS}/></Row>
          <Row label="Lens Brand / Lab"><Txt value={d.lensBrand} onChange={(v: string) => patch({ lensBrand: v })} placeholder="e.g. Essilor Varilux, Zeiss, Hoya"/></Row>
        </div>

        {/* Coatings */}
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-800 mb-2">Coatings / Treatments</p>
          <div className="flex flex-wrap gap-2">
            {COATINGS.map(c => (
              <label key={c} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${d.coatings.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
                <input type="checkbox" checked={d.coatings.includes(c)} onChange={() => toggleCoating(c)} className="sr-only"/>
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* PD & Heights */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Measurements</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'PD Right (OD)', value: d.rightPd, onChange: (v: string) => patch({ rightPd: v }), unit: 'mm' },
            { label: 'PD Left (OS)', value: d.leftPd, onChange: (v: string) => patch({ leftPd: v }), unit: 'mm' },
            { label: 'Seg Height OD', value: d.heightOd, onChange: (v: string) => patch({ heightOd: v }), unit: 'mm' },
            { label: 'Seg Height OS', value: d.heightOs, onChange: (v: string) => patch({ heightOs: v }), unit: 'mm' },
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
          <Row label="Order Reference"><Txt value={d.orderRef} onChange={(v: string) => patch({ orderRef: v })} placeholder="e.g. ORD-2024-001"/></Row>
          <Row label="Lab / Supplier"><Txt value={d.labName} onChange={(v: string) => patch({ labName: v })} placeholder="e.g. Essilor Lab, local lab"/></Row>
          <Row label="Expected Dispatch"><input type="date" value={d.dispatchDate} onChange={e => patch({ dispatchDate: e.target.value })}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-600"/></Row>
          <Row label="Collection Method"><Sel value={d.collectionMethod} onChange={(v: string) => patch({ collectionMethod: v })} options={COLLECTION_OPTIONS}/></Row>
        </div>

        {/* Payment */}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Payment</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Price</label>
            <input type="number" value={d.price} onChange={e => patch({ price: e.target.value })} placeholder="0"
              className="w-40 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Advance Paid</label>
            <input type="number" value={d.advancePaid} onChange={e => patch({ advancePaid: e.target.value })} placeholder="0"
              className="w-40 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white font-semibold focus:outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
          <textarea rows={3} value={d.remarks} onChange={e => patch({ remarks: e.target.value })} placeholder="Add any remarks..."
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"/>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={d.showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
            Show in Discharge Summary
          </label>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};
