import React, { useCallback } from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';
import { downloadEncounterPdf } from '../../lib/generatePdf';
import { SendToReceptionButton } from '../../components/SendToReceptionButton';
import type { OpticalOrderPayload } from '../../lib/opticalOrders';

const VA_SNELLEN = ['-','6/4','6/5','6/6','6/7.5','6/9','6/12','6/18','6/24','6/36','6/60','CF','HM','PL','NPL'];
const VA_NEAR = ['-','N4','N5','N6','N8','N10','N12','N14','N18','N24','N36'];
const PRISM_BASE = ['-','BI','BO','BU','BD'];

interface RxRow { sph: string; cyl: string; axis: string; prism: string; base: string; va: string; }
const emptyRow = (): RxRow => ({ sph: '', cyl: '', axis: '', prism: '', base: '-', va: '-' });

function RxInput({ value, onChange, placeholder = '-' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-1 py-1 text-sm text-center border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded" />
  );
}

function VaSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-sm text-center border-0 bg-transparent focus:outline-none cursor-pointer">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function EyeRows({ prefix, label, rx, upd }: {
  prefix: string; label: string;
  rx: Record<string, RxRow>;
  upd: (key: string, field: keyof RxRow, v: string) => void;
}) {
  const rows = [
    { key: `${prefix}Dist`, label: 'DISTANCE', vaOpts: VA_SNELLEN },
    { key: `${prefix}Near`, label: 'NEAR', vaOpts: VA_NEAR },
    { key: `${prefix}Inter`, label: 'INTERMEDIATE', vaOpts: VA_SNELLEN },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <tr key={r.key} className="border-b border-slate-200">
          {i === 0 && (
            <td rowSpan={3} className="border-r border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 bg-teal-50/50 align-middle text-center whitespace-pre-line w-20">
              {label}
            </td>
          )}
          <td className="border-r border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-teal-50/30 w-28">{r.label}</td>
          <td className="border-r border-slate-200 w-16"><RxInput value={rx[r.key].sph} onChange={v => upd(r.key,'sph',v)} /></td>
          <td className="border-r border-slate-200 w-16"><RxInput value={rx[r.key].cyl} onChange={v => upd(r.key,'cyl',v)} /></td>
          <td className="border-r border-slate-200 w-16"><RxInput value={rx[r.key].axis} onChange={v => upd(r.key,'axis',v)} /></td>
          <td className="border-r border-slate-200 w-16"><RxInput value={rx[r.key].prism} onChange={v => upd(r.key,'prism',v)} /></td>
          <td className="border-r border-slate-200 w-20"><VaSelect value={rx[r.key].base} onChange={v => upd(r.key,'base',v)} options={PRISM_BASE} /></td>
          <td className="w-20"><VaSelect value={rx[r.key].va} onChange={v => upd(r.key,'va',v)} options={r.vaOpts} /></td>
        </tr>
      ))}
    </>
  );
}

const SECTION_KEY = 'final-spectacle-prescription';

interface FspData {
  vaType: string;
  ipd: string;
  bvd: string;
  remarks: string;
  showInDischarge: boolean;
  rx: Record<string, RxRow>;
}

const defaultRx = (): Record<string, RxRow> => ({
  odDist: emptyRow(), odNear: emptyRow(), odInter: emptyRow(),
  osDist: emptyRow(), osNear: emptyRow(), osInter: emptyRow(),
});

const DEFAULT_FSP: FspData = {
  vaType: 'Snellan', ipd: '', bvd: '', remarks: '', showInDischarge: false,
  rx: defaultRx(),
};

export const FinalSpectaclePrescriptionView: React.FC = () => {
  const encounterState = useEncounterStore.getState();
  const sectionData = useEncounterStore(s => s.sectionData);
  const setSectionData = useEncounterStore(s => s.setSectionData);
  const f = Object.assign({}, DEFAULT_FSP, sectionData[SECTION_KEY] ?? {}) as FspData;
  const rx = Object.assign(defaultRx(), f.rx ?? {});
  const patch = (p: Partial<FspData>) => setSectionData(SECTION_KEY, { ...f, ...p });

  const upd = (key: string, field: keyof RxRow, v: string) => {
    rx[key] = { ...(rx[key] ?? emptyRow()), [field]: v };
    patch({ rx: { ...rx } });
  };

  const handleDownloadPdf = () => downloadEncounterPdf(encounterState);

  const buildPayload = useCallback((): OpticalOrderPayload => {
    const dispensing: any = sectionData['spectacle-dispensing'] ?? {};
    return {
      encounterId: encounterState.encounterId ?? '',
      appointmentId: encounterState.appointmentId,
      patientId: encounterState.patient.id,
      rx: {
        od: { sph: rx.odDist?.sph, cyl: rx.odDist?.cyl, axis: rx.odDist?.axis },
        os: { sph: rx.osDist?.sph, cyl: rx.osDist?.cyl, axis: rx.osDist?.axis },
      },
      lensType: dispensing.lensType || f.vaType,
      lensMaterial: dispensing.lensMaterial,
      coatings: dispensing.coatings,
      frameType: dispensing.frameType,
      frameRef: dispensing.frameRef,
      collectionMethod: dispensing.collectionMethod,
      orderRef: dispensing.orderRef,
      pdMm: f.ipd,
      notes: f.remarks || dispensing.remarks,
    };
  }, [encounterState, sectionData, rx, f]);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <h1 className="text-2xl font-bold text-[#2563eb]">Final Spectacle Prescription</h1>
          <div className="flex flex-wrap items-center gap-2">
            <SendToReceptionButton buildPayload={buildPayload} />
            <button onClick={handleDownloadPdf} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">Download PDF</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Share</button>
          </div>
        </div>

        {/* VA type */}
        <div className="flex justify-end mb-3">
          <select value={f.vaType} onChange={e => patch({ vaType: e.target.value })}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600">
            <option>Snellan</option><option>LogMAR</option><option>Decimal</option>
          </select>
        </div>

        {/* Prescription table */}
        <div className="overflow-x-auto mb-5">
          <table className="w-full border-collapse border border-slate-200 text-sm">
            <thead>
              <tr className="bg-teal-50 border-b border-slate-200">
                <th className="border-r border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 text-center" colSpan={2}></th>
                {['SPHERE','CYL','AXIS','PRISM','BASE','VA'].map(h => (
                  <th key={h} className="border-r border-slate-200 px-2 py-2 text-xs font-bold text-slate-600 text-center last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <EyeRows prefix="od" label={'RIGHT EYE\n(O.D)'} rx={rx} upd={upd} />
              <EyeRows prefix="os" label={'LEFT EYE\n(O.S)'} rx={rx} upd={upd} />
              <tr className="bg-teal-50/40 border-t border-slate-200">
                <td className="border-r border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 bg-teal-50" colSpan={2}>IPD</td>
                <td className="border-r border-slate-200 px-1 py-1" colSpan={2}>
                  <input type="number" value={f.ipd} onChange={e => patch({ ipd: e.target.value })} placeholder="0-20"
                    className="w-full px-2 py-1 text-sm text-center border border-slate-300 rounded focus:outline-none focus:border-blue-600" />
                </td>
                <td className="border-r border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 bg-teal-50 text-center" colSpan={2}>BVD</td>
                <td className="px-1 py-1" colSpan={2}>
                  <input type="number" value={f.bvd} onChange={e => patch({ bvd: e.target.value })} placeholder="0-20"
                    className="w-full px-2 py-1 text-sm text-center border border-slate-300 rounded focus:outline-none focus:border-blue-600" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
          <textarea rows={3} value={f.remarks} onChange={e => patch({ remarks: e.target.value })}
            placeholder="Add any remarks..."
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={f.showInDischarge} onChange={e => patch({ showInDischarge: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
            Show in Discharge Summary
          </label>
          <button onClick={handleDownloadPdf} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
};
