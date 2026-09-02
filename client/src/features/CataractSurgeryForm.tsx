import React from 'react';

export type CataractDetails = {
  diagnosis: string;
  preOpIopOd: string;
  preOpIopOs: string;
  preOpVaOd: string;
  preOpVaOs: string;
  eyeToBeOperated: string;
  coMorbidities: Record<string, { od: string; os: string }>;
  coMorbiditiesOther: string;
  biometryOd: { k1: string; k2: string; axl: string; iol: string };
  biometryOs: { k1: string; k2: string; axl: string; iol: string };
  bp: string;
  dateOfSurgery: string;
  surgeon: string;
  iolPcOd: string; iolPcOs: string;
  iolAcOd: string; iolAcOs: string;
  iolNoOd: string; iolNoOs: string;
  intraOpComplications: Record<string, { od: string; os: string }>;
  intraOpComplicationAction: string;
  documentedBy: string;
  surgeonPostOp: string;
  postOpDay1VaOd: string;
  postOpDay1VaOs: string;
  postOpDay1Complications: Record<string, { od: string; os: string }>;
  assessment: string;
  plan: string;
};

export const DEFAULT_CATARACT_DETAILS: CataractDetails = {
  diagnosis: '',
  preOpIopOd: '', preOpIopOs: '',
  preOpVaOd: '', preOpVaOs: '',
  eyeToBeOperated: '',
  coMorbidities: {}, coMorbiditiesOther: '',
  biometryOd: { k1: '', k2: '', axl: '', iol: '' },
  biometryOs: { k1: '', k2: '', axl: '', iol: '' },
  bp: '',
  dateOfSurgery: '', surgeon: '',
  iolPcOd: '', iolPcOs: '',
  iolAcOd: '', iolAcOs: '',
  iolNoOd: '', iolNoOs: '',
  intraOpComplications: {}, intraOpComplicationAction: '',
  documentedBy: '', surgeonPostOp: '',
  postOpDay1VaOd: '', postOpDay1VaOs: '',
  postOpDay1Complications: {},
  assessment: '', plan: '',
};

interface Props {
  data: CataractDetails;
  onChange: (data: CataractDetails) => void;
}

const CO_MORBIDITIES = [
  'Corneal Scar', 'Pseudoexfoliation', 'Retinal Disease (DR, AMD, etc.)', 'Glaucoma', 'Trachoma',
];

const INTRA_OP_COMPLICATIONS = [
  'Increased IOP', 'PCR/Vitreous Loss', 'Zonular Dehiscence', 'Retained Lens Loss', 'Wound Leak',
  'Hyphema', 'Air in AC', 'Corneal Endothelial Tear', 'Floppy Iris', 'Iris Prolapse', 'Iridodialysis',
  'Lens Material Drop', 'No',
];

const POST_OP_COMPLICATIONS = [
  'High IOP', 'Wound Gap', 'Corneal Edema', 'Striate Keratopathy (SK)', 'Shallow AC', 'Hyphema',
  'Severe AC Reaction', 'Vitreous in AC', 'Iris Prolapse', 'IOL Subluxation', 'IOL Dislocation',
];

const inputCls = 'w-full border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 text-xs bg-transparent';

/* Reusable OD/OS table where each row has two text inputs */
function OdOsTable({ title, items, values, onChange }: {
  title: string;
  items: string[];
  values: Record<string, { od: string; os: string }>;
  onChange: (next: Record<string, { od: string; os: string }>) => void;
}) {
  const set = (item: string, eye: 'od' | 'os', val: string) => {
    const cur = values[item] ?? { od: '', os: '' };
    onChange({ ...values, [item]: { ...cur, [eye]: val } });
  };
  return (
    <table className="w-full bg-white border border-slate-200 text-xs text-left">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-2 border-r border-slate-200 w-1/2">{title}</th>
          <th className="p-2 border-r border-slate-200 text-center w-1/4">OD</th>
          <th className="p-2 text-center w-1/4">OS</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item} className="border-t border-slate-200 hover:bg-slate-50/50">
            <td className="p-2 border-r border-slate-200">{item}</td>
            <td className="p-2 border-r border-slate-200">
              <input type="text" value={values[item]?.od ?? ''} onChange={e => set(item, 'od', e.target.value)} className={inputCls} />
            </td>
            <td className="p-2">
              <input type="text" value={values[item]?.os ?? ''} onChange={e => set(item, 'os', e.target.value)} className={inputCls} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const CataractSurgeryForm: React.FC<Props> = ({ data, onChange }) => {
  const patch = (p: Partial<CataractDetails>) => onChange({ ...data, ...p });

  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-8 text-sm mt-4">

      {/* DIAGNOSIS */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3">Diagnosis</h3>
        <input type="text" value={data.diagnosis} onChange={e => patch({ diagnosis: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 text-xs"
          placeholder="e.g. ARM (OS) + Pseudophakia (OD)" />
      </div>

      {/* PRE-OPERATIVE EXAMINATION */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Pre-Operative Examination</h3>
        <table className="w-full mb-4 bg-white border border-slate-200 text-xs text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border-r border-slate-200 w-1/3"></th>
              <th className="p-2 border-r border-slate-200 text-center">OD</th>
              <th className="p-2 text-center">OS</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-semibold">IOP</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpIopOd} onChange={e => patch({ preOpIopOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.preOpIopOs} onChange={e => patch({ preOpIopOs: e.target.value })} className={inputCls} /></td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-semibold">Visual Acuity</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpVaOd} onChange={e => patch({ preOpVaOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.preOpVaOs} onChange={e => patch({ preOpVaOs: e.target.value })} className={inputCls} /></td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span>Eye to be operated (circle):</span>
          {['OD', 'OS', 'Bilateral'].map(opt => (
            <label key={opt} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="cataractEyeToBeOperated" checked={data.eyeToBeOperated === opt} onChange={() => patch({ eyeToBeOperated: opt })} className="text-blue-600 focus:ring-0" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* CO-EXISTING OCULAR CO-MORBIDITY */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Co-Existing Ocular Co-Morbidity</h3>
        <OdOsTable title="Ocular Co-Morbidity" items={CO_MORBIDITIES} values={data.coMorbidities} onChange={v => patch({ coMorbidities: v })} />
        <div className="flex gap-2 items-center text-xs font-semibold mt-2">
          <span>Other (Please List):</span>
          <input type="text" value={data.coMorbiditiesOther} onChange={e => patch({ coMorbiditiesOther: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
      </div>

      {/* BIOMETRY & BP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Biometry</h3>
          <table className="w-full bg-white border border-slate-200 text-xs text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 border-r border-slate-200 w-1/3"></th>
                <th className="p-2 border-r border-slate-200 text-center">OD</th>
                <th className="p-2 text-center">OS</th>
              </tr>
            </thead>
            <tbody>
              {(['k1', 'k2', 'axl', 'iol'] as const).map(k => (
                <tr key={k} className="border-t border-slate-200">
                  <td className="p-2 border-r border-slate-200 uppercase font-semibold">{k === 'axl' ? 'AXL' : k === 'iol' ? 'IOL' : k.toUpperCase()}</td>
                  <td className="p-2 border-r border-slate-200"><input type="text" value={data.biometryOd[k]} onChange={e => patch({ biometryOd: { ...data.biometryOd, [k]: e.target.value } })} className={inputCls + ' text-center'} /></td>
                  <td className="p-2"><input type="text" value={data.biometryOs[k]} onChange={e => patch({ biometryOs: { ...data.biometryOs, [k]: e.target.value } })} className={inputCls + ' text-center'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">BP</h3>
          <textarea rows={6} value={data.bp} onChange={e => patch({ bp: e.target.value })} placeholder="Date: ___  BP: ___/___" className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 text-xs resize-none" />
        </div>
      </div>

      {/* SURGICAL INFORMATION */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Surgical Information</h3>
        <div className="flex gap-4 mb-4 text-xs font-semibold">
          <div className="flex-1 flex gap-2 items-center">
            <span className="whitespace-nowrap">Date of Surgery:</span>
            <input type="text" value={data.dateOfSurgery} onChange={e => patch({ dateOfSurgery: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
          </div>
          <div className="flex-1 flex gap-2 items-center">
            <span>Surgeon:</span>
            <input type="text" value={data.surgeon} onChange={e => patch({ surgeon: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
          </div>
        </div>

        {/* Type of IOL Implant — text inputs for power values */}
        <table className="w-full bg-white border border-slate-200 text-xs text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border-r border-slate-200 w-1/2">Type of IOL Implant</th>
              <th className="p-2 border-r border-slate-200 text-center">OD</th>
              <th className="p-2 text-center">OS</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-medium">PC IOL</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolPcOd} onChange={e => patch({ iolPcOd: e.target.value })} className={inputCls} placeholder="" /></td>
              <td className="p-2"><input type="text" value={data.iolPcOs} onChange={e => patch({ iolPcOs: e.target.value })} className={inputCls} /></td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-medium">AC IOL</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolAcOd} onChange={e => patch({ iolAcOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.iolAcOs} onChange={e => patch({ iolAcOs: e.target.value })} className={inputCls} /></td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-medium">NO IOL</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolNoOd} onChange={e => patch({ iolNoOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.iolNoOs} onChange={e => patch({ iolNoOs: e.target.value })} className={inputCls} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* INTRAOPERATIVE COMPLICATION */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Intraoperative Complication</h3>
        <OdOsTable title="Complication" items={INTRA_OP_COMPLICATIONS} values={data.intraOpComplications} onChange={v => patch({ intraOpComplications: v })} />
        <div className="flex gap-2 items-start text-xs font-semibold mt-3">
          <span className="whitespace-nowrap pt-1">Any procedure or action done for complication management:</span>
          <input type="text" value={data.intraOpComplicationAction} onChange={e => patch({ intraOpComplicationAction: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
      </div>

      {/* DOCUMENTED BY & SURGEON */}
      <div className="flex gap-4 text-xs font-semibold">
        <div className="flex-1 flex gap-2 items-center">
          <span className="whitespace-nowrap">Documented By:</span>
          <input type="text" value={data.documentedBy} onChange={e => patch({ documentedBy: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
        <div className="flex-1 flex gap-2 items-center">
          <span>Surgeon:</span>
          <input type="text" value={data.surgeonPostOp} onChange={e => patch({ surgeonPostOp: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
      </div>

      {/* 1st POST-OP DAY */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">1st Post-Op Day</h3>

        {/* Visual Acuity */}
        <table className="w-full mb-4 bg-white border border-slate-200 text-xs text-center">
          <thead className="bg-slate-100">
            <tr><th colSpan={2} className="p-2 font-semibold border-b border-slate-200">1st Post-Op Day Visual Acuity</th></tr>
            <tr>
              <th className="p-2 border-r border-slate-200 w-1/2">OD</th>
              <th className="p-2 w-1/2">OS</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.postOpDay1VaOd} onChange={e => patch({ postOpDay1VaOd: e.target.value })} className={inputCls + ' text-center'} /></td>
              <td className="p-2"><input type="text" value={data.postOpDay1VaOs} onChange={e => patch({ postOpDay1VaOs: e.target.value })} className={inputCls + ' text-center'} /></td>
            </tr>
          </tbody>
        </table>

        {/* Post-Op Complications */}
        <OdOsTable title="Complication" items={POST_OP_COMPLICATIONS} values={data.postOpDay1Complications} onChange={v => patch({ postOpDay1Complications: v })} />

        {/* Assessment & Plan */}
        <div className="flex gap-4 text-xs font-semibold mt-4">
          <div className="flex-1 flex gap-2 items-center">
            <span className="whitespace-nowrap">Ass't:</span>
            <input type="text" value={data.assessment} onChange={e => patch({ assessment: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
          </div>
          <div className="flex-1 flex gap-2 items-center">
            <span>Plan:</span>
            <input type="text" value={data.plan} onChange={e => patch({ plan: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
          </div>
        </div>
      </div>

    </div>
  );
};
