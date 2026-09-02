import React from 'react';

export type GenericSurgeryDetails = {
  diagnosis: string;
  eyeToBeOperated: string;
  preOpVaOd: string; preOpVaOs: string;
  preOpIopOd: string; preOpIopOs: string;
  preOpFindings: Record<string, { od: string; os: string }>;
  preOpNotes: string;
  dateOfSurgery: string;
  surgeon: string;
  surgicalFields: Record<string, string>;
  intraOpComplications: Record<string, { od: string; os: string }>;
  intraOpAction: string;
  documentedBy: string;
  postOpDay1VaOd: string; postOpDay1VaOs: string;
  postOpDay1IopOd: string; postOpDay1IopOs: string;
  postOpFindings: Record<string, { od: string; os: string }>;
  postOpNotes: string;
  assessment: string;
  plan: string;
  customPreOpLabels: string[];
  customPostOpLabels: string[];
  customIntraOpLabels: string[];
  customSurgicalFieldLabels: string[];
};

export const DEFAULT_GENERIC_SURGERY_DETAILS: GenericSurgeryDetails = {
  diagnosis: '', eyeToBeOperated: '',
  preOpVaOd: '', preOpVaOs: '', preOpIopOd: '', preOpIopOs: '',
  preOpFindings: {}, preOpNotes: '',
  dateOfSurgery: '', surgeon: '', surgicalFields: {},
  intraOpComplications: {}, intraOpAction: '', documentedBy: '',
  postOpDay1VaOd: '', postOpDay1VaOs: '',
  postOpDay1IopOd: '', postOpDay1IopOs: '',
  postOpFindings: {}, postOpNotes: '',
  assessment: '', plan: '',
  customPreOpLabels: [],
  customPostOpLabels: [],
  customIntraOpLabels: [],
  customSurgicalFieldLabels: [],
};

interface Props {
  surgeryType: string;
  data: GenericSurgeryDetails;
  onChange: (data: GenericSurgeryDetails) => void;
}

const inputCls = 'w-full border-b border-slate-300 focus:border-blue-600 outline-none px-1 py-0.5 text-xs bg-transparent';

function OdOsTable({ title, items, customItems, values, onChange, onRemove }: {
  title: string; items: string[]; customItems: string[];
  values: Record<string, { od: string; os: string }>;
  onChange: (v: Record<string, { od: string; os: string }>) => void;
  onRemove: (label: string) => void;
}) {
  const set = (item: string, eye: 'od' | 'os', val: string) => {
    onChange({ ...values, [item]: { ...(values[item] ?? { od: '', os: '' }), [eye]: val } });
  };
  const rows = [...items, ...customItems.filter(l => !items.includes(l))];
  return (
    <table className="w-full bg-white border border-slate-200 text-xs text-left">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-2 border-r border-slate-200 w-1/2">{title}</th>
          <th className="p-2 border-r border-slate-200 text-center w-1/4">OD</th>
          <th className="p-2 text-center w-1/4">OS</th>
        </tr>
      </thead>
      <tbody>{rows.map(item => (
        <tr key={item} className="border-t border-slate-200 hover:bg-slate-50/50">
          <td className="p-2 border-r border-slate-200">
            <span className="flex items-center justify-between gap-2">
              <span>{item}</span>
              {customItems.includes(item) && (
                <button type="button" title="Remove row" onClick={() => onRemove(item)}
                  className="text-red-400 hover:text-red-600 text-xs leading-none shrink-0">✕</button>
              )}
            </span>
          </td>
          <td className="p-2 border-r border-slate-200"><input type="text" value={values[item]?.od ?? ''} onChange={e => set(item, 'od', e.target.value)} className={inputCls} /></td>
          <td className="p-2"><input type="text" value={values[item]?.os ?? ''} onChange={e => set(item, 'os', e.target.value)} className={inputCls} /></td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function FieldRow({ label, value, onChange, placeholder, custom, onRemove }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; custom?: boolean; onRemove?: (label: string) => void }) {
  return (
    <div className="flex gap-2 items-center text-xs font-semibold">
      <span className="whitespace-nowrap min-w-[140px] flex items-center gap-1">
        {custom && onRemove && (
          <button type="button" title="Remove field" onClick={() => onRemove(label)}
            className="text-red-400 hover:text-red-600 text-[10px] leading-none shrink-0">✕</button>
        )}
        {label}:
      </span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none py-0.5" />
    </div>
  );
}

function AddRowInput({ onAdd, placeholder }: { onAdd: (label: string) => void; placeholder: string }) {
  const [val, setVal] = React.useState('');
  const submit = () => {
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal('');
  };
  return (
    <div className="flex items-center gap-2 mt-2 text-xs">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        placeholder={`${placeholder} (e.g. Biometry K1)`}
        className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-600"
      />
      <button type="button" onClick={submit} className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold whitespace-nowrap">＋ Add</button>
    </div>
  );
}

type SurgeryConfig = {
  preOpItems: string[];
  surgicalFieldLabels: string[];
  intraOpItems: string[];
  postOpItems: string[];
};

const SURGERY_CONFIGS: Record<string, SurgeryConfig> = {
  'LASIK / PRK': {
    preOpItems: ['Manifest Refraction (Sph/Cyl/Axis)', 'Cycloplegic Refraction', 'Pachymetry (µm)', 'Thinnest Point (µm)', 'Topography (Kmax)', 'Pupil Size (Scotopic)', 'Pupil Size (Mesopic)', 'Schirmer Test (mm)', 'TBUT (sec)', 'Endothelial Cell Count'],
    surgicalFieldLabels: ['Laser Platform / Device', 'Procedure Type (LASIK/PRK/SMILE)', 'Optical Zone (mm)', 'Ablation Depth (µm)', 'Flap Thickness (µm) (LASIK only)', 'Flap Diameter (mm)', 'Hinge Position', 'Residual Stromal Bed (µm)', 'Treatment Target'],
    intraOpItems: ['Incomplete Flap', 'Buttonhole', 'Free Cap', 'Epithelial Defect', 'Decentered Ablation', 'Bleeding (sub-conjunctival)', 'Flap Striae', 'Interface Debris', 'No Complication'],
    postOpItems: ['Flap Position / Alignment', 'Epithelial Ingrowth', 'DLK (Diffuse Lamellar Keratitis)', 'Haze Grade', 'Dry Eye Symptoms', 'Pain Score (0-10)', 'Residual Refractive Error', 'No Complication'],
  },
  'Trabeculectomy': {
    preOpItems: ['C/D Ratio', 'Visual Field MD (dB)', 'Gonioscopy Angle', 'Number of Glaucoma Meds', 'Central Corneal Thickness (µm)', 'RNFL Thickness (µm)', 'Target IOP'],
    surgicalFieldLabels: ['Antimetabolite Used (MMC/5-FU)', 'Concentration (mg/ml)', 'Application Duration (min)', 'Scleral Flap Size (mm)', 'Scleral Flap Shape', 'Sclerostomy Size', 'Iridectomy Performed', 'Suture Material & Technique', 'Releasable Sutures (Yes/No)'],
    intraOpItems: ['Conjunctival Buttonhole', 'Scleral Flap Tear', 'Vitreous Loss', 'Hyphema', 'Lens Touch', 'Choroidal Effusion', 'Excessive Bleeding', 'Iris Prolapse', 'No Complication'],
    postOpItems: ['Bleb Appearance (Diffuse/Cystic/Flat)', 'AC Depth (Shallow/Normal/Deep)', 'Wound Leak (Seidel Test)', 'Hypotony', 'Choroidal Detachment', 'Hyphema', 'Bleb Leak', 'Malignant Glaucoma', 'Endophthalmitis Signs', 'No Complication'],
  },
  'Vitrectomy': {
    preOpItems: ['Lens Status (Phakic/Pseudophakic/Aphakic)', 'B-Scan Findings', 'Fundus Findings', 'OCT Findings', 'FFA Findings', 'Retinal Status'],
    surgicalFieldLabels: ['Gauge (20G/23G/25G/27G)', 'Trocar System', 'Vitrectomy Type (Core/Complete)', 'Membrane Peeling Performed', 'Dye Used (ICG/BBG/TB)', 'Endolaser Applied', 'Laser Spots (approx)', 'Cryotherapy Applied', 'Tamponade (Air/SF6/C3F8/Silicone Oil)', 'Fill Percentage', 'Combined Procedure (Phaco/SB)', 'Scleral Buckle Details'],
    intraOpItems: ['Iatrogenic Retinal Break', 'Lens Touch', 'Suprachoroidal Hemorrhage', 'Retinal Incarceration', 'Incomplete Membrane Peel', 'Subretinal PFCL', 'Bleeding', 'Choroidal Detachment', 'No Complication'],
    postOpItems: ['Retinal Status (Attached/Detached)', 'Tamponade Status', 'Macular Status', 'Vitreous Cavity Clarity', 'Hypotony', 'Elevated IOP', 'Endophthalmitis Signs', 'Positioning Instructions Compliance', 'No Complication'],
  },
  'Corneal Graft / PKP': {
    preOpItems: ['Corneal Opacity Grade', 'Endothelial Cell Count', 'Pachymetry (µm)', 'Corneal Topography (Kmax)', 'AC Depth', 'Lens Status', 'Fundus Visibility'],
    surgicalFieldLabels: ['Graft Type (PKP/DALK/DSAEK/DMEK)', 'Donor Eye Bank', 'Donor Age', 'Death-to-Preservation Time (hr)', 'Donor Endothelial Cell Count', 'Preservation Medium', 'Donor Trephine Size (mm)', 'Recipient Trephine Size (mm)', 'Suture Technique (Interrupted/Running/Combined)', 'Suture Material (10-0 Nylon)', 'Number of Sutures', 'Combined Procedures'],
    intraOpItems: ['Donor Button Damage', 'Iris Prolapse', 'Lens Damage', 'Vitreous Loss', 'Suprachoroidal Hemorrhage', 'Descemet Membrane Detachment', 'Graft-Host Mismatch', 'Wound Leak', 'No Complication'],
    postOpItems: ['Graft Clarity (Clear/Hazy/Opaque)', 'Graft-Host Junction', 'Suture Status', 'Epithelial Defect', 'AC Depth / Reaction', 'Rejection Signs (KPs/Edema/Vascularization)', 'Elevated IOP', 'Wound Leak', 'Infection Signs', 'No Complication'],
  },
  'Pterygium Excision': {
    preOpItems: ['Pterygium Grade (I/II/III/IV)', 'Pterygium Size (mm from limbus)', 'Corneal Involvement (mm)', 'Restriction of Motility', 'Induced Astigmatism', 'Previous Pterygium Surgery'],
    surgicalFieldLabels: ['Technique (Bare Sclera/Conjunctival Autograft/AMT)', 'Autograft Harvested From', 'Graft Fixation (Sutures/Fibrin Glue)', 'Antimetabolite (MMC) Used', 'MMC Concentration', 'MMC Duration (min)', 'Corneal Surface Smoothing', 'Extent of Excision'],
    intraOpItems: ['Excessive Bleeding', 'Graft Loss / Displacement', 'Scleral Thinning', 'Muscle Damage', 'Perforation', 'No Complication'],
    postOpItems: ['Graft Position & Viability', 'Corneal Epithelial Healing', 'Scleral Bed Status', 'Granuloma', 'Recurrence Signs', 'Dellen', 'Infection Signs', 'No Complication'],
  },
  'Strabismus Surgery': {
    preOpItems: ['Deviation Distance (PD) — Primary', 'Deviation Near (PD)', 'Deviation Up-gaze', 'Deviation Down-gaze', 'Versions (Grading)', 'Ductions (Grading)', 'Forced Duction Test', 'Forced Generation Test', 'Stereopsis (Arc Sec)', 'Diplopia Pattern', 'AHP (Abnormal Head Posture)', 'Previous Strabismus Surgery'],
    surgicalFieldLabels: ['Muscles Operated (List)', 'OD: Muscle & Procedure', 'OD: Amount (mm)', 'OS: Muscle & Procedure', 'OS: Amount (mm)', 'Adjustable Sutures (Yes/No)', 'Suture Material', 'Conjunctival Approach (Limbal/Fornix)'],
    intraOpItems: ['Lost Muscle', 'Scleral Perforation', 'Excessive Bleeding', 'Muscle Slippage', 'Wrong Muscle', 'Suture Breakage', 'Anterior Segment Ischemia', 'No Complication'],
    postOpItems: ['Post-Op Alignment (PD)', 'Residual Deviation', 'Over-correction', 'Under-correction', 'New Diplopia', 'Conjunctival Swelling', 'Restricted Motility', 'Infection Signs', 'No Complication'],
  },
  'Oculoplastic Surgery': {
    preOpItems: ['MRD1 (mm)', 'MRD2 (mm)', 'Levator Function (mm)', 'Palpebral Fissure Height (mm)', 'Bell Phenomenon', 'Lid Crease Height (mm)', 'Lagophthalmos (mm)', 'Orbicularis Function', 'Proptosis / Exophthalmometry (mm)', 'Tear Film / Dry Eye Status', 'Lacrimal Drainage (Syringing)', 'CT/MRI Findings'],
    surgicalFieldLabels: ['Procedure Type', 'Approach (Anterior/Posterior/External/Endo)', 'Implant Used (Type & Size)', 'Tissue Graft Used', 'Amount of Resection/Advancement (mm)', 'Suture Material', 'Incision Location', 'Drain Placed (Yes/No)'],
    intraOpItems: ['Excessive Bleeding', 'Globe Injury', 'Nerve Damage', 'Implant Malposition', 'Fat Prolapse', 'Tissue Necrosis', 'Wound Dehiscence', 'No Complication'],
    postOpItems: ['Lid Position / Symmetry', 'MRD1 Post-Op', 'Lagophthalmos Post-Op', 'Wound Status', 'Edema / Ecchymosis', 'Infection Signs', 'Implant Status', 'Cosmetic Outcome', 'No Complication'],
  },
};

export const GenericSurgeryForm: React.FC<Props> = ({ surgeryType, data, onChange }) => {
  const patch = (p: Partial<GenericSurgeryDetails>) => onChange({ ...data, ...p });
  const cfg = SURGERY_CONFIGS[surgeryType] ?? { preOpItems: [], surgicalFieldLabels: [], intraOpItems: [], postOpItems: [] };
  const sf = data.surgicalFields;
  const setSf = (k: string, v: string) => patch({ surgicalFields: { ...sf, [k]: v } });

  const customPreOp = data.customPreOpLabels ?? [];
  const customPostOp = data.customPostOpLabels ?? [];
  const customIntraOp = data.customIntraOpLabels ?? [];
  const customFields = data.customSurgicalFieldLabels ?? [];

  const addPreOp = (label: string) => patch({ customPreOpLabels: [...customPreOp, label], preOpFindings: { ...data.preOpFindings, [label]: { od: '', os: '' } } });
  const addPostOp = (label: string) => patch({ customPostOpLabels: [...customPostOp, label], postOpFindings: { ...data.postOpFindings, [label]: { od: '', os: '' } } });
  const addIntraOp = (label: string) => patch({ customIntraOpLabels: [...customIntraOp, label], intraOpComplications: { ...data.intraOpComplications, [label]: { od: '', os: '' } } });
  const addField = (label: string) => patch({ customSurgicalFieldLabels: [...customFields, label], surgicalFields: { ...sf, [label]: '' } });

  const removePreOp = (label: string) => {
    const pf = { ...data.preOpFindings }; delete pf[label];
    patch({ customPreOpLabels: customPreOp.filter(l => l !== label), preOpFindings: pf });
  };
  const removePostOp = (label: string) => {
    const pf = { ...data.postOpFindings }; delete pf[label];
    patch({ customPostOpLabels: customPostOp.filter(l => l !== label), postOpFindings: pf });
  };
  const removeIntraOp = (label: string) => {
    const co = { ...data.intraOpComplications }; delete co[label];
    patch({ customIntraOpLabels: customIntraOp.filter(l => l !== label), intraOpComplications: co });
  };
  const removeField = (label: string) => {
    const nf = { ...sf }; delete nf[label];
    patch({ customSurgicalFieldLabels: customFields.filter(l => l !== label), surgicalFields: nf });
  };

  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-8 text-sm mt-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{surgeryType}</div>

      {/* DIAGNOSIS */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3">Diagnosis</h3>
        <input type="text" value={data.diagnosis} onChange={e => patch({ diagnosis: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 text-xs"
          placeholder="Enter diagnosis..." />
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
              <td className="p-2 border-r border-slate-200 font-semibold">Visual Acuity</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpVaOd} onChange={e => patch({ preOpVaOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.preOpVaOs} onChange={e => patch({ preOpVaOs: e.target.value })} className={inputCls} /></td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-semibold">IOP</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpIopOd} onChange={e => patch({ preOpIopOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.preOpIopOs} onChange={e => patch({ preOpIopOs: e.target.value })} className={inputCls} /></td>
            </tr>
          </tbody>
        </table>

        <OdOsTable title="Pre-Op Findings" items={cfg.preOpItems} customItems={customPreOp} values={data.preOpFindings} onChange={v => patch({ preOpFindings: v })} onRemove={removePreOp} />
        <AddRowInput onAdd={addPreOp} placeholder="Add measurement row" />

        <div className="flex items-center gap-4 text-xs font-semibold mt-3">
          <span>Eye to be operated:</span>
          {['OD', 'OS', 'Bilateral'].map(opt => (
            <label key={opt} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name={`${surgeryType}-eye`} checked={data.eyeToBeOperated === opt} onChange={() => patch({ eyeToBeOperated: opt })} className="text-blue-600 focus:ring-0" />
              {opt}
            </label>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs font-semibold block mb-1">Additional Pre-Op Notes:</label>
          <textarea rows={2} value={data.preOpNotes} onChange={e => patch({ preOpNotes: e.target.value })} placeholder="Additional pre-operative notes..." className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 text-xs resize-none" />
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
        <div className="space-y-2">
          {cfg.surgicalFieldLabels.map(label => (
            <FieldRow key={label} label={label} value={sf[label] ?? ''} onChange={v => setSf(label, v)} />
          ))}
          {customFields.map(label => (
            <FieldRow key={label} label={label} value={sf[label] ?? ''} onChange={v => setSf(label, v)} custom onRemove={removeField} />
          ))}
          <AddRowInput onAdd={addField} placeholder="Add surgical field" />
        </div>
      </div>

      {/* INTRAOPERATIVE COMPLICATION */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">Intraoperative Complications</h3>
        <OdOsTable title="Complication" items={cfg.intraOpItems} customItems={customIntraOp} values={data.intraOpComplications} onChange={v => patch({ intraOpComplications: v })} onRemove={removeIntraOp} />
        <AddRowInput onAdd={addIntraOp} placeholder="Add complication row" />
        <div className="flex gap-2 items-start text-xs font-semibold mt-3">
          <span className="whitespace-nowrap pt-1">Complication management:</span>
          <input type="text" value={data.intraOpAction} onChange={e => patch({ intraOpAction: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
      </div>

      {/* DOCUMENTED BY */}
      <div className="flex gap-4 text-xs font-semibold">
        <div className="flex-1 flex gap-2 items-center">
          <span className="whitespace-nowrap">Documented By:</span>
          <input type="text" value={data.documentedBy} onChange={e => patch({ documentedBy: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-600 outline-none" />
        </div>
      </div>

      {/* 1st POST-OP DAY */}
      <div>
        <h3 className="font-bold text-[#1E3A8A] mb-3 border-b border-slate-200 pb-2">1st Post-Op Day</h3>
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
              <td className="p-2 border-r border-slate-200 font-semibold">Visual Acuity</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.postOpDay1VaOd} onChange={e => patch({ postOpDay1VaOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.postOpDay1VaOs} onChange={e => patch({ postOpDay1VaOs: e.target.value })} className={inputCls} /></td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-2 border-r border-slate-200 font-semibold">IOP</td>
              <td className="p-2 border-r border-slate-200"><input type="text" value={data.postOpDay1IopOd} onChange={e => patch({ postOpDay1IopOd: e.target.value })} className={inputCls} /></td>
              <td className="p-2"><input type="text" value={data.postOpDay1IopOs} onChange={e => patch({ postOpDay1IopOs: e.target.value })} className={inputCls} /></td>
            </tr>
          </tbody>
        </table>

        <OdOsTable title="Post-Op Findings" items={cfg.postOpItems} customItems={customPostOp} values={data.postOpFindings} onChange={v => patch({ postOpFindings: v })} onRemove={removePostOp} />
        <AddRowInput onAdd={addPostOp} placeholder="Add measurement row" />

        <div className="mt-3">
          <label className="text-xs font-semibold block mb-1">Post-Op Notes:</label>
          <textarea rows={2} value={data.postOpNotes} onChange={e => patch({ postOpNotes: e.target.value })} placeholder="Additional post-operative notes..." className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 text-xs resize-none" />
        </div>

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
