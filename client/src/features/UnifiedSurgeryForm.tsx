import React from 'react';
import { Eye, Stethoscope, Calendar, Activity, FileText, Plus, X, AlertCircle } from 'lucide-react';

export type UnifiedSurgeryDetails = {
  // Patient Info
  patientType: 'inpatient' | 'outpatient';
  phone: string;
  addressZone: string;
  addressDistrict: string;
  addressKebele: string;
  addressVillage: string;
  
  // Diagnosis
  diagnosis: string;
  diagnosisOther: string;
  
  // Pre-Operative
  preOpVaOd: string;
  preOpVaOs: string;
  preOpIopOd: string;
  preOpIopOs: string;
  eyeToBeOperated: string;
  preOpFindings: Record<string, { od: string; os: string }>;
  preOpFindingsOther: string;
  preOpNotes: string;
  
  // Biometry
  biometryOd: { k1: string; k2: string; axl: string; iol: string };
  biometryOs: { k1: string; k2: string; axl: string; iol: string };
  
  // BP
  bp: string[];
  
  // Surgical Information
  dateOfSurgery: string;
  surgeon: string;
  surgicalFields: Record<string, string>;
  
  // IOL
  iolPcOd: string;
  iolPcOs: string;
  iolAcOd: string;
  iolAcOs: string;
  iolNoOd: string;
  iolNoOs: string;
  
  // Intra-Op
  intraOpComplications: Record<string, { od: string; os: string }>;
  intraOpAction: string;
  documentedBy: string;
  
  // Post-Op
  postOpDay1VaOd: string;
  postOpDay1VaOs: string;
  postOpDay1IopOd: string;
  postOpDay1IopOs: string;
  postOpFindings: Record<string, { od: string; os: string }>;
  postOpNotes: string;
  assessment: string;
  plan: string;
  
  // Custom fields
  customPreOpLabels: string[];
  customPostOpLabels: string[];
  customIntraOpLabels: string[];
  customSurgicalFieldLabels: string[];
  customBiometryLabels: string[];
};

export const DEFAULT_UNIFIED_SURGERY_DETAILS: UnifiedSurgeryDetails = {
  patientType: 'outpatient',
  phone: '',
  addressZone: '',
  addressDistrict: '',
  addressKebele: '',
  addressVillage: '',
  diagnosis: '',
  diagnosisOther: '',
  preOpVaOd: '',
  preOpVaOs: '',
  preOpIopOd: '',
  preOpIopOs: '',
  eyeToBeOperated: '',
  preOpFindings: {},
  preOpFindingsOther: '',
  preOpNotes: '',
  biometryOd: { k1: '', k2: '', axl: '', iol: '' },
  biometryOs: { k1: '', k2: '', axl: '', iol: '' },
  bp: ['', '', '', '', '', '', '', '', ''],
  dateOfSurgery: '',
  surgeon: '',
  surgicalFields: {},
  iolPcOd: '',
  iolPcOs: '',
  iolAcOd: '',
  iolAcOs: '',
  iolNoOd: '',
  iolNoOs: '',
  intraOpComplications: {},
  intraOpAction: '',
  documentedBy: '',
  postOpDay1VaOd: '',
  postOpDay1VaOs: '',
  postOpDay1IopOd: '',
  postOpDay1IopOs: '',
  postOpFindings: {},
  postOpNotes: '',
  assessment: '',
  plan: '',
  customPreOpLabels: [],
  customPostOpLabels: [],
  customIntraOpLabels: [],
  customSurgicalFieldLabels: [],
  customBiometryLabels: [],
};

interface Props {
  surgeryType: string;
  data: UnifiedSurgeryDetails;
  onChange: (data: UnifiedSurgeryDetails) => void;
  patientInfo: { name: string; age: string; sex: string; mrn: string };
}

// Surgery type configurations
const SURGERY_CONFIGS: Record<string, {
  preOpItems: string[];
  surgicalFields: string[];
  intraOpItems: string[];
  postOpItems: string[];
  showIOL: boolean;
  showBiometry: boolean;
  showBP: boolean;
}> = {
  'Cataract Surgery': {
    preOpItems: ['Corneal Scar', 'Pseudoexfoliation', 'Retinal Disease (DR, AMD, etc.)', 'Glaucoma', 'Trachoma'],
    surgicalFields: ['Procedure Type (Phaco/ECCE)', 'Incision Size (mm)', 'Viscoelastic Used', 'Capsulorhexis Size (mm)', 'Hydrodissection Done'],
    intraOpItems: ['Increased IOP', 'PCR/Vitreous Loss', 'Zonular Dehiscence', 'Wound Leak', 'Hyphema', 'Floppy Iris', 'No'],
    postOpItems: ['High IOP', 'Corneal Edema', 'Hyphema', 'Vitreous in AC', 'Iris Prolapse', 'IOL Subluxation'],
    showIOL: true,
    showBiometry: true,
    showBP: true,
  },
  'LASIK / PRK': {
    preOpItems: ['Manifest Refraction (Sph)', 'Manifest Refraction (Cyl)', 'Manifest Refraction (Axis)', 'Cycloplegic Refraction', 'Pachymetry (µm)', 'Thinnest Point (µm)', 'Topography (Kmax)', 'Pupil Size (Scotopic)', 'Pupil Size (Mesopic)', 'Schirmer Test (mm)', 'TBUT (sec)', 'Endothelial Cell Count'],
    surgicalFields: ['Laser Platform / Device', 'Procedure Type (LASIK/PRK/SMILE)', 'Optical Zone (mm)', 'Ablation Depth (µm)', 'Flap Thickness (µm)', 'Flap Diameter (mm)', 'Hinge Position', 'Residual Stromal Bed (µm)', 'Treatment Target'],
    intraOpItems: ['Incomplete Flap', 'Buttonhole', 'Free Cap', 'Epithelial Defect', 'Decentered Ablation', 'Flap Striae', 'Interface Debris', 'No'],
    postOpItems: ['Flap Position', 'Epithelial Ingrowth', 'DLK (Diffuse Lamellar Keratitis)', 'Haze Grade', 'Dry Eye Symptoms', 'Pain Score (0-10)', 'Residual Refractive Error'],
    showIOL: false,
    showBiometry: false,
    showBP: false,
  },
  'Trabeculectomy': {
    preOpItems: ['C/D Ratio', 'Visual Field MD (dB)', 'Gonioscopy Angle', 'Number of Glaucoma Meds', 'Central Corneal Thickness (µm)', 'RNFL Thickness (µm)', 'Target IOP'],
    surgicalFields: ['Antimetabolite Used (MMC/5-FU)', 'Concentration (mg/ml)', 'Application Duration (min)', 'Scleral Flap Size (mm)', 'Scleral Flap Shape', 'Sclerostomy Size', 'Iridectomy Performed', 'Suture Material', 'Releasable Sutures'],
    intraOpItems: ['Conjunctival Buttonhole', 'Scleral Flap Tear', 'Vitreous Loss', 'Hyphema', 'Lens Touch', 'Choroidal Effusion', 'Excessive Bleeding', 'Iris Prolapse', 'No'],
    postOpItems: ['Bleb Appearance', 'AC Depth', 'Wound Leak (Seidel)', 'Hypotony', 'Choroidal Detachment', 'Hyphema', 'Bleb Leak', 'Malignant Glaucoma', 'Endophthalmitis Signs'],
    showIOL: false,
    showBiometry: false,
    showBP: true,
  },
  'Vitrectomy': {
    preOpItems: ['Lens Status', 'B-Scan Findings', 'Fundus Findings', 'OCT Findings', 'FFA Findings', 'Retinal Status'],
    surgicalFields: ['Gauge (20G/23G/25G/27G)', 'Trocar System', 'Vitrectomy Type', 'Membrane Peeling Performed', 'Dye Used', 'Endolaser Applied', 'Laser Spots', 'Cryotherapy Applied', 'Tamponade', 'Fill Percentage'],
    intraOpItems: ['Iatrogenic Retinal Break', 'Lens Touch', 'Suprachoroidal Hemorrhage', 'Retinal Incarceration', 'Incomplete Membrane Peel', 'Bleeding', 'Choroidal Detachment', 'No'],
    postOpItems: ['Retinal Status', 'Tamponade Status', 'Macular Status', 'Vitreous Cavity Clarity', 'Hypotony', 'Elevated IOP', 'Endophthalmitis Signs'],
    showIOL: false,
    showBiometry: false,
    showBP: true,
  },
  'Corneal Graft / PKP': {
    preOpItems: ['Corneal Opacity Grade', 'Endothelial Cell Count', 'Pachymetry (µm)', 'Corneal Topography (Kmax)', 'AC Depth', 'Lens Status', 'Fundus Visibility'],
    surgicalFields: ['Graft Type', 'Donor Eye Bank', 'Donor Age', 'Death-to-Preservation Time (hr)', 'Donor Endothelial Cell Count', 'Preservation Medium', 'Donor Trephine Size (mm)', 'Recipient Trephine Size (mm)', 'Suture Technique', 'Suture Material', 'Number of Sutures'],
    intraOpItems: ['Donor Button Damage', 'Iris Prolapse', 'Lens Damage', 'Vitreous Loss', 'Suprachoroidal Hemorrhage', 'Descemet Membrane Detachment', 'Graft-Host Mismatch', 'Wound Leak', 'No'],
    postOpItems: ['Graft Clarity', 'Graft-Host Junction', 'Suture Status', 'Epithelial Defect', 'AC Depth', 'Rejection Signs', 'Elevated IOP', 'Wound Leak', 'Infection Signs'],
    showIOL: false,
    showBiometry: true,
    showBP: true,
  },
  'Pterygium Excision': {
    preOpItems: ['Pterygium Grade', 'Pterygium Size (mm)', 'Corneal Involvement (mm)', 'Restriction of Motility', 'Induced Astigmatism', 'Previous Pterygium Surgery'],
    surgicalFields: ['Technique', 'Autograft Harvested From', 'Graft Fixation', 'Antimetabolite (MMC) Used', 'MMC Concentration', 'MMC Duration (min)', 'Corneal Surface Smoothing', 'Extent of Excision'],
    intraOpItems: ['Excessive Bleeding', 'Graft Loss', 'Scleral Thinning', 'Muscle Damage', 'Perforation', 'No'],
    postOpItems: ['Graft Position', 'Corneal Epithelial Healing', 'Scleral Bed Status', 'Granuloma', 'Recurrence Signs', 'Dellen', 'Infection Signs'],
    showIOL: false,
    showBiometry: false,
    showBP: true,
  },
  'Strabismus Surgery': {
    preOpItems: ['Deviation Distance (PD)', 'Deviation Near (PD)', 'Deviation Up-gaze', 'Deviation Down-gaze', 'Versions', 'Ductions', 'Forced Duction Test', 'Forced Generation Test', 'Stereopsis', 'Diplopia Pattern'],
    surgicalFields: ['Muscles Operated', 'OD: Muscle & Procedure', 'OD: Amount (mm)', 'OS: Muscle & Procedure', 'OS: Amount (mm)', 'Adjustable Sutures', 'Suture Material', 'Conjunctival Approach'],
    intraOpItems: ['Lost Muscle', 'Scleral Perforation', 'Excessive Bleeding', 'Muscle Slippage', 'Wrong Muscle', 'Suture Breakage', 'No'],
    postOpItems: ['Post-Op Alignment (PD)', 'Residual Deviation', 'Over-correction', 'Under-correction', 'New Diplopia', 'Conjunctival Swelling', 'Restricted Motility', 'Infection Signs'],
    showIOL: false,
    showBiometry: false,
    showBP: false,
  },
  'Oculoplastic Surgery': {
    preOpItems: ['MRD1 (mm)', 'MRD2 (mm)', 'Levator Function (mm)', 'Palpebral Fissure Height (mm)', 'Bell Phenomenon', 'Lid Crease Height (mm)', 'Lagophthalmos (mm)', 'Orbicularis Function', 'Proptosis (mm)'],
    surgicalFields: ['Procedure Type', 'Approach', 'Implant Used', 'Tissue Graft Used', 'Amount of Resection/Advancement (mm)', 'Suture Material', 'Incision Location', 'Drain Placed'],
    intraOpItems: ['Excessive Bleeding', 'Globe Injury', 'Nerve Damage', 'Implant Malposition', 'Fat Prolapse', 'Tissue Necrosis', 'Wound Dehiscence', 'No'],
    postOpItems: ['Lid Position', 'MRD1 Post-Op', 'Lagophthalmos Post-Op', 'Wound Status', 'Edema', 'Infection Signs', 'Implant Status', 'Cosmetic Outcome'],
    showIOL: false,
    showBiometry: false,
    showBP: true,
  },
};

export const UnifiedSurgeryForm: React.FC<Props> = ({ surgeryType, data, onChange, patientInfo }) => {
  const patch = (p: Partial<UnifiedSurgeryDetails>) => onChange({ ...data, ...p });

  const inputCls = 'w-full border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm bg-transparent';
  const sectionHeaderCls = 'font-bold text-blue-800 flex items-center gap-2 mb-3 text-sm';

  const config = SURGERY_CONFIGS[surgeryType] || {
    preOpItems: [],
    surgicalFields: [],
    intraOpItems: [],
    postOpItems: [],
    showIOL: false,
    showBiometry: false,
    showBP: false,
  };

  const OdOsTable = ({ title, items, values, onChange: onTableChange, customItems = [], onRemove }: {
    title: string;
    items: string[];
    values: Record<string, { od: string; os: string }>;
    onChange: (v: Record<string, { od: string; os: string }>) => void;
    customItems?: string[];
    onRemove?: (label: string) => void;
  }) => {
    const set = (item: string, eye: 'od' | 'os', val: string) => {
      const cur = values[item] ?? { od: '', os: '' };
      onTableChange({ ...values, [item]: { ...cur, [eye]: val } });
    };
    const rows = [...items, ...customItems.filter(l => !items.includes(l))];
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full bg-white text-sm text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 border-r border-slate-200 w-1/2 font-semibold text-slate-700">{title}</th>
              <th className="p-2 border-r border-slate-200 text-center w-1/4 font-semibold text-blue-600">OD</th>
              <th className="p-2 text-center w-1/4 font-semibold text-indigo-600">OS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(item => (
              <tr key={item} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-2 border-r border-slate-200">
                  <span className="flex items-center justify-between gap-2 text-sm">
                    <span>{item}</span>
                    {customItems.includes(item) && onRemove && (
                      <button type="button" onClick={() => onRemove(item)} className="text-red-400 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                </td>
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
      </div>
    );
  };

  const AddRowInput = ({ onAdd, placeholder }: { onAdd: (label: string) => void; placeholder: string }) => {
    const [val, setVal] = React.useState('');
    const submit = () => {
      const v = val.trim();
      if (!v) return;
      onAdd(v);
      setVal('');
    };
    return (
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button type="button" onClick={submit} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-sm font-medium">
          <Plus className="w-3.5 h-3.5 inline mr-1" /> Add
        </button>
      </div>
    );
  };

  const customPreOp = data.customPreOpLabels ?? [];
  const customPostOp = data.customPostOpLabels ?? [];
  const customIntraOp = data.customIntraOpLabels ?? [];
  const customSurgicalFields = data.customSurgicalFieldLabels ?? [];

  const addPreOp = (label: string) => patch({ customPreOpLabels: [...customPreOp, label], preOpFindings: { ...data.preOpFindings, [label]: { od: '', os: '' } } });
  const addPostOp = (label: string) => patch({ customPostOpLabels: [...customPostOp, label], postOpFindings: { ...data.postOpFindings, [label]: { od: '', os: '' } } });
  const addIntraOp = (label: string) => patch({ customIntraOpLabels: [...customIntraOp, label], intraOpComplications: { ...data.intraOpComplications, [label]: { od: '', os: '' } } });
  const addSurgicalField = (label: string) => patch({ customSurgicalFieldLabels: [...customSurgicalFields, label], surgicalFields: { ...data.surgicalFields, [label]: '' } });

  const removePreOp = (label: string) => { const pf = { ...data.preOpFindings }; delete pf[label]; patch({ customPreOpLabels: customPreOp.filter(l => l !== label), preOpFindings: pf }); };
  const removePostOp = (label: string) => { const pf = { ...data.postOpFindings }; delete pf[label]; patch({ customPostOpLabels: customPostOp.filter(l => l !== label), postOpFindings: pf }); };
  const removeIntraOp = (label: string) => { const co = { ...data.intraOpComplications }; delete co[label]; patch({ customIntraOpLabels: customIntraOp.filter(l => l !== label), intraOpComplications: co }); };
  const removeSurgicalField = (label: string) => { const nf = { ...data.surgicalFields }; delete nf[label]; patch({ customSurgicalFieldLabels: customSurgicalFields.filter(l => l !== label), surgicalFields: nf }); };

  return (
    <div className="space-y-6">
      {surgeryType && surgeryType !== 'None' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-900 text-white text-sm font-bold uppercase tracking-wider">
          <Eye className="w-4 h-4" /> {surgeryType}
          {config.showIOL ? (
            <span className="ml-auto text-[10px] bg-amber-400 text-slate-900 rounded px-2 py-0.5">IOL PLAN</span>
          ) : (
            <span className="ml-auto text-[10px] bg-slate-600 rounded px-2 py-0.5">NO IOL</span>
          )}
        </div>
      )}
      {/* Patient Info */}
      <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Patient Name</span>
            <span className="font-medium">{patientInfo.name}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Age / Sex</span>
            <span className="font-medium">{patientInfo.age} yrs · {patientInfo.sex}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">MRN</span>
            <span className="font-medium">{patientInfo.mrn}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Patient Type</span>
            <div className="flex gap-3 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" checked={data.patientType === 'inpatient'} onChange={() => patch({ patientType: 'inpatient' })} className="text-blue-600" />
                <span>In Patient</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" checked={data.patientType === 'outpatient'} onChange={() => patch({ patientType: 'outpatient' })} className="text-blue-600" />
                <span>Out Patient</span>
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2 pt-2 border-t border-blue-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Zone</span>
            <input type="text" value={data.addressZone} onChange={e => patch({ addressZone: e.target.value })} className="w-full border-b border-slate-300 focus:border-blue-500 outline-none text-sm" placeholder="Zone" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">District</span>
            <input type="text" value={data.addressDistrict} onChange={e => patch({ addressDistrict: e.target.value })} className="w-full border-b border-slate-300 focus:border-blue-500 outline-none text-sm" placeholder="District" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Kebele</span>
            <input type="text" value={data.addressKebele} onChange={e => patch({ addressKebele: e.target.value })} className="w-full border-b border-slate-300 focus:border-blue-500 outline-none text-sm" placeholder="Kebele" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Village</span>
            <input type="text" value={data.addressVillage} onChange={e => patch({ addressVillage: e.target.value })} className="w-full border-b border-slate-300 focus:border-blue-500 outline-none text-sm" placeholder="Village" />
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-blue-100">
          <span className="text-xs font-semibold text-slate-500 block">Phone No.</span>
          <input type="text" value={data.phone} onChange={e => patch({ phone: e.target.value })} className="w-full border-b border-slate-300 focus:border-blue-500 outline-none text-sm" placeholder="Phone number" />
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <h3 className={sectionHeaderCls}><FileText className="w-4 h-4" /> Diagnosis</h3>
        <div className="space-y-2">
          <input type="text" value={data.diagnosis} onChange={e => patch({ diagnosis: e.target.value })} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm" 
            placeholder="Enter diagnosis..." />
          <input type="text" value={data.diagnosisOther} onChange={e => patch({ diagnosisOther: e.target.value })} 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm" 
            placeholder="Other (Please List)..." />
        </div>
      </div>

      {/* Pre-Operative */}
      <div>
        <h3 className={sectionHeaderCls}><Stethoscope className="w-4 h-4" /> Pre-Operative Examination</h3>
        
        <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border-r border-slate-200 w-1/3"></th>
                <th className="p-2 border-r border-slate-200 text-center font-semibold text-blue-600">OD</th>
                <th className="p-2 text-center font-semibold text-indigo-600">OS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="p-2 border-r border-slate-200 font-semibold">IOP</td>
                <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpIopOd} onChange={e => patch({ preOpIopOd: e.target.value })} className={inputCls} placeholder="19" /></td>
                <td className="p-2"><input type="text" value={data.preOpIopOs} onChange={e => patch({ preOpIopOs: e.target.value })} className={inputCls} placeholder="16" /></td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="p-2 border-r border-slate-200 font-semibold">Visual Acuity</td>
                <td className="p-2 border-r border-slate-200"><input type="text" value={data.preOpVaOd} onChange={e => patch({ preOpVaOd: e.target.value })} className={inputCls} placeholder="6/12" /></td>
                <td className="p-2"><input type="text" value={data.preOpVaOs} onChange={e => patch({ preOpVaOs: e.target.value })} className={inputCls} placeholder="6/6" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-600">Eye to be operated (circle):</span>
          {['OD', 'OS', 'Bilateral'].map(opt => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="eyeToBeOperated" checked={data.eyeToBeOperated === opt} onChange={() => patch({ eyeToBeOperated: opt })} className="w-4 h-4 text-blue-600" />
              <span className={data.eyeToBeOperated === opt ? 'text-blue-600 font-bold' : ''}>{opt}</span>
            </label>
          ))}
        </div>

        <OdOsTable 
          title="Pre-Operative Findings" 
          items={config.preOpItems} 
          values={data.preOpFindings} 
          onChange={v => patch({ preOpFindings: v })} 
          customItems={customPreOp} 
          onRemove={removePreOp} 
        />
        <AddRowInput onAdd={addPreOp} placeholder="Add pre-op finding (e.g. Corneal Scar)" />

        <div className="mt-3">
          <label className="text-sm font-semibold text-slate-600 block mb-1">Additional Notes:</label>
          <textarea rows={2} value={data.preOpNotes} onChange={e => patch({ preOpNotes: e.target.value })} placeholder="Additional pre-op notes..." className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none" />
        </div>
      </div>

      {/* Biometry & BP (surgery-type specific) */}
      {(config.showBiometry || config.showBP) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.showBiometry && (
          <div>
            <h3 className={sectionHeaderCls}>Biometry</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full bg-white text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 border-r border-slate-200 w-1/3"></th>
                  <th className="p-2 border-r border-slate-200 text-center font-semibold text-blue-600">OD</th>
                  <th className="p-2 text-center font-semibold text-indigo-600">OS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="p-2 border-r border-slate-200 font-semibold">K1</td>
                  <td className="p-2 border-r border-slate-200"><input type="text" value={data.biometryOd.k1} onChange={e => patch({ biometryOd: { ...data.biometryOd, k1: e.target.value } })} className={inputCls + ' text-center'} placeholder="44.05" /></td>
                  <td className="p-2"><input type="text" value={data.biometryOs.k1} onChange={e => patch({ biometryOs: { ...data.biometryOs, k1: e.target.value } })} className={inputCls + ' text-center'} placeholder="44.95" /></td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-2 border-r border-slate-200 font-semibold">K2</td>
                  <td className="p-2 border-r border-slate-200"><input type="text" value={data.biometryOd.k2} onChange={e => patch({ biometryOd: { ...data.biometryOd, k2: e.target.value } })} className={inputCls + ' text-center'} placeholder="22.82" /></td>
                  <td className="p-2"><input type="text" value={data.biometryOs.k2} onChange={e => patch({ biometryOs: { ...data.biometryOs, k2: e.target.value } })} className={inputCls + ' text-center'} placeholder="22.00" /></td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-2 border-r border-slate-200 font-semibold">AXL</td>
                  <td className="p-2 border-r border-slate-200"><input type="text" value={data.biometryOd.axl} onChange={e => patch({ biometryOd: { ...data.biometryOd, axl: e.target.value } })} className={inputCls + ' text-center'} /></td>
                  <td className="p-2"><input type="text" value={data.biometryOs.axl} onChange={e => patch({ biometryOs: { ...data.biometryOs, axl: e.target.value } })} className={inputCls + ' text-center'} /></td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-2 border-r border-slate-200 font-semibold">IOL</td>
                  <td className="p-2 border-r border-slate-200"><input type="text" value={data.biometryOd.iol} onChange={e => patch({ biometryOd: { ...data.biometryOd, iol: e.target.value } })} className={inputCls + ' text-center'} /></td>
                  <td className="p-2"><input type="text" value={data.biometryOs.iol} onChange={e => patch({ biometryOs: { ...data.biometryOs, iol: e.target.value } })} className={inputCls + ' text-center'} placeholder="22.00" /></td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
          )}

          {config.showBP && (
          <div>
            <h3 className={sectionHeaderCls}>BP</h3>
          <div className="space-y-2">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={data.bp[row * 3] ?? ''} 
                  onChange={e => { const newBp = [...data.bp]; newBp[row * 3] = e.target.value; patch({ bp: newBp }); }} 
                  placeholder="Date" 
                  className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-sm" 
                />
                <input 
                  type="text" 
                  value={data.bp[row * 3 + 1] ?? ''} 
                  onChange={e => { const newBp = [...data.bp]; newBp[row * 3 + 1] = e.target.value; patch({ bp: newBp }); }} 
                  placeholder="BP" 
                  className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-sm" 
                />
                <input 
                  type="text" 
                  value={data.bp[row * 3 + 2] ?? ''} 
                  onChange={e => { const newBp = [...data.bp]; newBp[row * 3 + 2] = e.target.value; patch({ bp: newBp }); }} 
                  placeholder="Pulse" 
                  className="flex-1 px-2 py-1 border border-slate-300 rounded-lg text-sm" 
                />
              </div>
            ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Surgical Information */}
      <div>
        <h3 className={sectionHeaderCls}><Calendar className="w-4 h-4" /> Surgical Information</h3>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Date of Surgery:</span>
            <input type="text" value={data.dateOfSurgery} onChange={e => patch({ dateOfSurgery: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm" placeholder="19/12/18" />
          </div>
          <div className="flex-1 flex gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Surgeon:</span>
            <input type="text" value={data.surgeon} onChange={e => patch({ surgeon: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm" placeholder="Dr." />
          </div>
        </div>

        {config.showIOL && (
          <div className="mt-4">
            <h3 className="font-bold text-blue-800 mb-2 text-sm">Type of IOL Implant</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full bg-white text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 border-r border-slate-200 w-1/2 font-semibold text-slate-700">Type</th>
                    <th className="p-2 border-r border-slate-200 text-center font-semibold text-blue-600">OD</th>
                    <th className="p-2 text-center font-semibold text-indigo-600">OS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="p-2 border-r border-slate-200 font-medium">PC IOL</td>
                    <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolPcOd} onChange={e => patch({ iolPcOd: e.target.value })} className={inputCls} /></td>
                    <td className="p-2"><input type="text" value={data.iolPcOs} onChange={e => patch({ iolPcOs: e.target.value })} className={inputCls} /></td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="p-2 border-r border-slate-200 font-medium">AC IOL</td>
                    <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolAcOd} onChange={e => patch({ iolAcOd: e.target.value })} className={inputCls} /></td>
                    <td className="p-2"><input type="text" value={data.iolAcOs} onChange={e => patch({ iolAcOs: e.target.value })} className={inputCls} placeholder="+22.00" /></td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="p-2 border-r border-slate-200 font-medium">NO IOL</td>
                    <td className="p-2 border-r border-slate-200"><input type="text" value={data.iolNoOd} onChange={e => patch({ iolNoOd: e.target.value })} className={inputCls} /></td>
                    <td className="p-2"><input type="text" value={data.iolNoOs} onChange={e => patch({ iolNoOs: e.target.value })} className={inputCls} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-bold text-blue-800 mb-2 text-sm">Surgical Details</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full bg-white text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 border-r border-slate-200 w-1/2 font-semibold text-slate-700">Field</th>
                  <th className="p-2 text-center w-1/2 font-semibold text-slate-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {config.surgicalFields.map(label => (
                  <tr key={label} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 font-medium">{label}</td>
                    <td className="p-2">
                      <input type="text" value={data.surgicalFields[label] ?? ''} onChange={e => patch({ surgicalFields: { ...data.surgicalFields, [label]: e.target.value } })} className={inputCls} />
                    </td>
                  </tr>
                ))}
                {customSurgicalFields.map(label => (
                  <tr key={label} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 font-medium">
                      <span className="flex items-center justify-between">
                        <span>{label}</span>
                        <button onClick={() => removeSurgicalField(label)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    </td>
                    <td className="p-2">
                      <input type="text" value={data.surgicalFields[label] ?? ''} onChange={e => patch({ surgicalFields: { ...data.surgicalFields, [label]: e.target.value } })} className={inputCls} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowInput onAdd={addSurgicalField} placeholder="Add surgical field" />
        </div>

        {/* Intra-Op Complications */}
        <div className="mt-4">
          <h3 className={sectionHeaderCls}><AlertCircle className="w-4 h-4" /> Intraoperative Complications</h3>
          <OdOsTable 
            title="Complication" 
            items={config.intraOpItems} 
            values={data.intraOpComplications} 
            onChange={v => patch({ intraOpComplications: v })} 
            customItems={customIntraOp} 
            onRemove={removeIntraOp} 
          />
          <AddRowInput onAdd={addIntraOp} placeholder="Add complication" />
          <div className="flex gap-2 items-center mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Management:</span>
            <input type="text" value={data.intraOpAction} onChange={e => patch({ intraOpAction: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm" />
          </div>
        </div>

        <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-sm font-semibold text-slate-600">Documented By:</span>
          <input type="text" value={data.documentedBy} onChange={e => patch({ documentedBy: e.target.value })} className="ml-2 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm w-48" />
        </div>
      </div>

      {/* Post-Op */}
      <div>
        <h3 className={sectionHeaderCls}><Activity className="w-4 h-4" /> 1st Post-Op Day</h3>
        
        <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border-r border-slate-200 w-1/3"></th>
                <th className="p-2 border-r border-slate-200 text-center font-semibold text-blue-600">OD</th>
                <th className="p-2 text-center font-semibold text-indigo-600">OS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="p-2 border-r border-slate-200 font-semibold">Visual Acuity</td>
                <td className="p-2 border-r border-slate-200"><input type="text" value={data.postOpDay1VaOd} onChange={e => patch({ postOpDay1VaOd: e.target.value })} className={inputCls} /></td>
                <td className="p-2"><input type="text" value={data.postOpDay1VaOs} onChange={e => patch({ postOpDay1VaOs: e.target.value })} className={inputCls} /></td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="p-2 border-r border-slate-200 font-semibold">IOP</td>
                <td className="p-2 border-r border-slate-200"><input type="text" value={data.postOpDay1IopOd} onChange={e => patch({ postOpDay1IopOd: e.target.value })} className={inputCls} /></td>
                <td className="p-2"><input type="text" value={data.postOpDay1IopOs} onChange={e => patch({ postOpDay1IopOs: e.target.value })} className={inputCls} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <OdOsTable 
          title="Post-Op Findings" 
          items={config.postOpItems} 
          values={data.postOpFindings} 
          onChange={v => patch({ postOpFindings: v })} 
          customItems={customPostOp} 
          onRemove={removePostOp} 
        />
        <AddRowInput onAdd={addPostOp} placeholder="Add finding" />

        <div className="mt-3">
          <label className="text-sm font-semibold text-slate-600 block mb-1">Post-Op Notes:</label>
          <textarea rows={2} value={data.postOpNotes} onChange={e => patch({ postOpNotes: e.target.value })} placeholder="Additional post-op notes..." className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-3">
          <div className="flex-1 flex gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Ass't:</span>
            <input type="text" value={data.assessment} onChange={e => patch({ assessment: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm" />
          </div>
          <div className="flex-1 flex gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Plan:</span>
            <input type="text" value={data.plan} onChange={e => patch({ plan: e.target.value })} className="flex-1 border-b border-slate-300 focus:border-blue-500 outline-none px-1 py-0.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};