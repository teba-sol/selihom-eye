import React, { useState } from 'react';
import { Eye, Activity, FileText, Pill, Heart, Users, Glasses, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import type { EncounterSnapshot, RefractionGridValues, VisualAcuityState } from '../store/useEncounterStore';

// ── Helpers ──────────────────────────────────────────────────────────────────
export function SectionHeader({ title, icon, expanded, onToggle, count }: {
  title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; count?: number;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 transition-colors">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        {icon}
        {title}
        {count !== undefined && <span className="ml-1 text-xs font-normal text-slate-400">({count})</span>}
      </div>
      {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
    </button>
  );
}

export function Field({ label, value, wide }: { label: string; value?: string | number | null; wide?: boolean }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={`bg-slate-50 rounded-lg p-2.5 border border-slate-100 ${wide ? 'col-span-2' : ''}`}>
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{value}</span>
    </div>
  );
}

export function RefTable({ label, data }: { label: string; data?: RefractionGridValues | null }) {
  if (!data?.odSph && !data?.osSph && !data?.odVa && !data?.osVa) return null;
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
      <table className="w-full text-xs border-collapse mb-1">
        <thead><tr className="bg-[#1e3a5f] text-white">
          <th className="px-2 py-1 text-left">Eye</th>
          <th className="px-2 py-1 text-center">Sph</th>
          <th className="px-2 py-1 text-center">Cyl</th>
          <th className="px-2 py-1 text-center">Axis</th>
          <th className="px-2 py-1 text-center">VA</th>
          <th className="px-2 py-1 text-center">Add</th>
        </tr></thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="px-2 py-1.5 font-bold text-slate-700">OD</td>
            {(['odSph','odCyl','odAxis','odVa','odAdd'] as const).map(k => <td key={k} className="px-2 py-1.5 text-center">{data[k]||'—'}</td>)}
          </tr>
          <tr>
            <td className="px-2 py-1.5 font-bold text-slate-700">OS</td>
            {(['osSph','osCyl','osAxis','osVa','osAdd'] as const).map(k => <td key={k} className="px-2 py-1.5 text-center">{data[k]||'—'}</td>)}
          </tr>
        </tbody>
      </table>
      {data.pdBinocular && <p className="text-[11px] text-slate-500">PD Binocular: <b>{data.pdBinocular} mm</b>{data.bvdMm ? ` · BVD: ${data.bvdMm} mm` : ''}</p>}
    </div>
  );
}

export function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{text}</span>;
}

type VaEyeKey = 'od' | 'os' | 'ou';
type VaScopeKey = 'dist' | 'near';
type VaCellKey = 'unaided' | 'aided' | 'pinhole';

type VaData = VisualAcuityState | null | undefined;

export function vaVal(va: VaData, eye: VaEyeKey, scope: VaScopeKey, key: VaCellKey): string {
  if (!va) return '';
  const e = va[eye];
  if (e && e[scope] && typeof e[scope][key] === 'string') return e[scope][key] || '';
  if (scope === 'dist') {
    const flat = va as unknown as Record<string, string>;
    const suffix = eye === 'od' ? 'Od' : eye === 'os' ? 'Os' : '';
    const flatKey = `${key}${suffix}`;
    return typeof flat[flatKey] === 'string' ? flat[flatKey] : '';
  }
  return '';
}

export function vaHasData(va: VaData): boolean {
  if (!va) return false;
  const flat = va as unknown as Record<string, unknown>;
  if (['unaidedOd', 'unaidedOs', 'aidedOd', 'aidedOs', 'pinholeOd', 'pinholeOs'].some((k) => flat[k])) return true;
  return (['od', 'os', 'ou'] as const).some((eye) =>
    (['dist', 'near'] as const).some((scope) =>
      (['unaided', 'aided', 'pinhole'] as const).some((key) => vaVal(va, eye, scope, key)),
    ),
  );
}

// ── ExamDetails: full clinical data ──────────────────────────────────────────
export function ExamDetails({ snap }: { snap: EncounterSnapshot }) {
  type Sec = 'va'|'refraction'|'slitlamp'|'tono'|'symptoms'|'ocularHx'|'systemicHx'|'meds'|'family'|'spectacles'|'cl'|'lifestyle'|'assessment';
  const init: Record<Sec,boolean> = { va:true, refraction:true, slitlamp:true, tono:true, symptoms:true, ocularHx:false, systemicHx:false, meds:true, family:false, spectacles:false, cl:false, lifestyle:false, assessment:true };
  const [s, setS] = useState(init);
  const tog = (k: Sec) => setS(p => ({ ...p, [k]: !p[k] }));

  const va = snap.visualAcuity;
  const ref = snap.refraction;
  const tono = snap.tonometry;
  const sl = snap.slitLamp;
  const spec = snap.spectaclesHistory;
  const cl = snap.contactLensHistory;
  const life = snap.lifestyleDemands;

  const hasVa = vaHasData(va);
  const hasRef = ref && (ref.odSph||ref.osSph||ref.odVa||ref.osVa);
  const hasTono = tono && (tono.odIop||tono.osIop);
  const hasSlitLamp = sl && (sl.lidsLashes||sl.conjunctiva||sl.cornea||sl.anteriorChamber||sl.irisLens);
  const hasSymptoms = snap.symptoms?.length > 0;
  const hasMeds = snap.patientMedications?.length > 0;
  const hasOcular = snap.ocularHistory && Object.values(snap.ocularHistory.conditions).some(c => c.active);
  const hasSystemic = snap.systemicHistory && Object.values(snap.systemicHistory.conditions).some(c => c.active);
  const hasFamilyOcular = snap.familyOcularHistory?.length > 0;
  const hasFamilySystemic = snap.familySystemicHistory?.length > 0;
  const hasSpec = spec && spec.currentlyWears;
  const hasCL = cl && cl.currentWearer;
  const hasLifestyle = life && (life.occupation||life.screenTimeHoursPerDay||life.outdoorActivities);
  const hasAssessment = snap.diagnoses?.length > 0 || snap.counselingAdvice || snap.treatmentPathway;

  const nothing = !hasVa && !hasRef && !hasTono && !hasSlitLamp && !hasSymptoms && !hasMeds && !hasOcular && !hasSystemic && !hasAssessment;
  if (nothing) return <p className="px-4 py-3 text-xs text-slate-400 italic">No clinical data recorded yet.</p>;

  return (
    <div className="divide-y divide-slate-100">

      {/* Visual Acuity */}
      {hasVa && <>
        <SectionHeader title="Visual Acuity" icon={<Eye className="w-4 h-4 text-blue-500"/>} expanded={s.va} onToggle={() => tog('va')}/>
        {s.va && <div className="px-4 py-3">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-[#1e3a5f] text-white">
              <th className="px-2 py-1.5 text-left">Eye</th>
              <th className="px-2 py-1.5 text-center">Unaided</th>
              <th className="px-2 py-1.5 text-center">Aided</th>
              <th className="px-2 py-1.5 text-center">Pinhole</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-2 py-1.5 font-bold">OD (Right)</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'od','dist','unaided')||'—'}</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'od','dist','aided')||'—'}</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'od','dist','pinhole')||'—'}</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 font-bold">OS (Left)</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'os','dist','unaided')||'—'}</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'os','dist','aided')||'—'}</td>
                <td className="px-2 py-1.5 text-center">{vaVal(va,'os','dist','pinhole')||'—'}</td>
              </tr>
            </tbody>
          </table>
        </div>}
      </>}

      {/* Refraction */}
      {hasRef && <>
        <SectionHeader title="Refraction" icon={<Eye className="w-4 h-4 text-teal-500"/>} expanded={s.refraction} onToggle={() => tog('refraction')}/>
        {s.refraction && <div className="px-4 py-3 space-y-3">
          <RefTable label="Refraction Results" data={ref}/>
        </div>}
      </>}

      {/* Slit Lamp / Anterior Segment */}
      {hasSlitLamp && <>
        <SectionHeader title="Anterior Segment (Slit Lamp)" icon={<Eye className="w-4 h-4 text-violet-500"/>} expanded={s.slitlamp} onToggle={() => tog('slitlamp')}/>
        {s.slitlamp && <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {[
            ['Lids & Lashes', sl.lidsLashes],
            ['Conjunctiva', sl.conjunctiva],
            ['Cornea', sl.cornea],
            ['Anterior Chamber', sl.anteriorChamber],
            ['Iris & Lens', sl.irisLens],
          ].filter(([,v]) => v).map(([label, value]) => (
            <div key={label as string} className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
              <span className="block text-[10px] font-bold text-violet-400 uppercase mb-0.5">{label}</span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>}
      </>}

      {/* Tonometry */}
      {hasTono && <>
        <SectionHeader title="Tonometry (IOP)" icon={<Activity className="w-4 h-4 text-orange-500"/>} expanded={s.tono} onToggle={() => tog('tono')}/>
        {s.tono && <div className="px-4 py-3 grid grid-cols-3 gap-3">
          <Field label="OD IOP" value={tono.odIop ? `${tono.odIop} mmHg` : null}/>
          <Field label="OS IOP" value={tono.osIop ? `${tono.osIop} mmHg` : null}/>
          <Field label="Method" value={tono.method}/>
        </div>}
      </>}

      {/* Symptoms */}
      {hasSymptoms && <>
        <SectionHeader title="Presenting Symptoms" icon={<Activity className="w-4 h-4 text-rose-500"/>} expanded={s.symptoms} onToggle={() => tog('symptoms')} count={snap.symptoms.length}/>
        {s.symptoms && <div className="px-4 py-3 space-y-1.5">
          {snap.symptoms.map(sym => (
            <div key={sym.id} className="text-xs bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800">{sym.name}</span>
              <Badge text={sym.eye} color="bg-blue-100 text-blue-700"/>
              <Badge text={`${sym.durationValue} ${sym.durationUnit}`} color="bg-slate-100 text-slate-600"/>
              <Badge text={sym.frequency} color="bg-slate-100 text-slate-600"/>
              <Badge text={sym.severity} color={sym.severity==='Severe' ? 'bg-red-100 text-red-700' : sym.severity==='Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}/>
              {sym.remarks && <span className="text-slate-400 italic">"{sym.remarks}"</span>}
            </div>
          ))}
        </div>}
      </>}

      {/* Ocular History */}
      {hasOcular && <>
        <SectionHeader title="Ocular History" icon={<FileText className="w-4 h-4 text-indigo-500"/>} expanded={s.ocularHx} onToggle={() => tog('ocularHx')}/>
        {s.ocularHx && <div className="px-4 py-3 space-y-1.5">
          {snap.ocularHistory.generalRemarks && <p className="text-xs text-slate-500 italic mb-2">{snap.ocularHistory.generalRemarks}</p>}
          {Object.entries(snap.ocularHistory.conditions).filter(([,v]) => v.active).map(([k,v]) => (
            <div key={k} className="text-xs bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
              <span className="font-bold text-slate-800 capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
              <span className="text-slate-500 ml-2">{v.type} · {v.eye}{v.date ? ` · ${v.date}` : ''}</span>
              {v.remarks && <span className="text-slate-400 ml-2">· {v.remarks}</span>}
            </div>
          ))}
        </div>}
      </>}

      {/* Systemic History */}
      {hasSystemic && <>
        <SectionHeader title="Systemic History" icon={<Heart className="w-4 h-4 text-red-500"/>} expanded={s.systemicHx} onToggle={() => tog('systemicHx')}/>
        {s.systemicHx && <div className="px-4 py-3 space-y-1.5">
          {snap.systemicHistory.generalRemarks && <p className="text-xs text-slate-500 italic mb-2">{snap.systemicHistory.generalRemarks}</p>}
          {Object.entries(snap.systemicHistory.conditions).filter(([,v]) => v.active).map(([k, v]) => (
            <div key={k} className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <span className="font-bold text-slate-800 capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
              <span className="text-slate-500 ml-2">{v.type}</span>
              <span className="text-slate-500 ml-2">· {v.durationValue} {v.durationUnit}</span>
              <Badge text={v.controlStatus || ''} color={v.controlStatus==='Well Controlled' ? 'bg-green-100 text-green-700' : v.controlStatus==='Uncontrolled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}/>
              {v.remarks && <span className="text-slate-400 ml-2">· {v.remarks}</span>}
            </div>
          ))}
        </div>}
      </>}

      {/* Medications */}
      {hasMeds && <>
        <SectionHeader title="Current Medications" icon={<Pill className="w-4 h-4 text-purple-500"/>} expanded={s.meds} onToggle={() => tog('meds')} count={snap.patientMedications.length}/>
        {s.meds && <div className="px-4 py-3 space-y-1.5">
          {snap.patientMedications.map(m => (
            <div key={m.id} className="text-xs bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800">{m.drugName}</span>
              {m.dosage && <Badge text={m.dosage} color="bg-slate-100 text-slate-600"/>}
              <Badge text={m.frequency} color="bg-slate-100 text-slate-600"/>
              <Badge text={m.route} color="bg-purple-100 text-purple-700"/>
              {m.targetEye && <Badge text={m.targetEye} color="bg-blue-100 text-blue-700"/>}
              <Badge text={m.compliance} color={m.compliance==='Compliant' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}/>
            </div>
          ))}
        </div>}
      </>}

      {/* Family History */}
      {(hasFamilyOcular || hasFamilySystemic) && <>
        <SectionHeader title="Family History" icon={<Users className="w-4 h-4 text-cyan-500"/>} expanded={s.family} onToggle={() => tog('family')}/>
        {s.family && <div className="px-4 py-3 space-y-1.5">
          {hasFamilyOcular && <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ocular</p>}
          {snap.familyOcularHistory?.map(f => (
            <div key={f.id} className="text-xs bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2">
              <span className="font-bold text-slate-800">{f.relation}</span>
              <span className="text-slate-500 ml-2">— {f.condition}</span>
              {f.notes && <span className="text-slate-400 ml-2">· {f.notes}</span>}
            </div>
          ))}
          {hasFamilySystemic && <p className="text-xs font-bold text-slate-500 uppercase mt-2 mb-1">Systemic</p>}
          {snap.familySystemicHistory?.map(f => (
            <div key={f.id} className="text-xs bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2">
              <span className="font-bold text-slate-800">{f.relation}</span>
              <span className="text-slate-500 ml-2">— {f.condition}</span>
              {f.notes && <span className="text-slate-400 ml-2">· {f.notes}</span>}
            </div>
          ))}
        </div>}
      </>}

      {/* Spectacles */}
      {hasSpec && <>
        <SectionHeader title="Spectacles History" icon={<Glasses className="w-4 h-4 text-blue-400"/>} expanded={s.spectacles} onToggle={() => tog('spectacles')}/>
        {s.spectacles && <div className="px-4 py-3 grid grid-cols-2 gap-2">
          <Field label="Type" value={spec.type}/>
          <Field label="Age of Current Glasses" value={spec.ageOfCurrentGlasses}/>
          <Field label="Material" value={spec.material}/>
          <Field label="Coatings" value={spec.coating?.join(', ')}/>
          <Field label="Satisfaction" value={spec.satisfaction}/>
          {spec.remarks && <Field label="Remarks" value={spec.remarks} wide/>}
        </div>}
      </>}

      {/* Contact Lens */}
      {hasCL && <>
        <SectionHeader title="Contact Lens History" icon={<Eye className="w-4 h-4 text-sky-500"/>} expanded={s.cl} onToggle={() => tog('cl')}/>
        {s.cl && <div className="px-4 py-3 grid grid-cols-2 gap-2">
          <Field label="Modality" value={cl.modality}/>
          <Field label="Wearing Hours/Day" value={`${cl.wearingHoursPerDay} hrs`}/>
          <Field label="Solution Used" value={cl.solutionUsed}/>
          <Field label="Cleaning Compliance" value={cl.complianceWithCleaning}/>
          <Field label="Last Eye Check" value={cl.lastEyeCheckDate}/>
          {cl.remarks && <Field label="Remarks" value={cl.remarks} wide/>}
        </div>}
      </>}

      {/* Lifestyle */}
      {hasLifestyle && <>
        <SectionHeader title="Lifestyle & Demands" icon={<Briefcase className="w-4 h-4 text-slate-500"/>} expanded={s.lifestyle} onToggle={() => tog('lifestyle')}/>
        {s.lifestyle && <div className="px-4 py-3 grid grid-cols-2 gap-2">
          <Field label="Occupation" value={life.occupation}/>
          <Field label="Screen Time/Day" value={`${life.screenTimeHoursPerDay} hrs`}/>
          <Field label="Outdoor Activities" value={life.outdoorActivities}/>
          <Field label="Hobbies" value={life.hobbies}/>
          <Field label="Workplace Lighting" value={life.lightingConditionWorkplace}/>
          <Field label="Driving Needs" value={life.drivingRequirements}/>
        </div>}
      </>}

      {/* Assessment & Plan */}
      {hasAssessment && <>
        <SectionHeader title="Assessment & Plan" icon={<Activity className="w-4 h-4 text-emerald-500"/>} expanded={s.assessment} onToggle={() => tog('assessment')}/>
        {s.assessment && <div className="px-4 py-3 space-y-2">
          {snap.diagnoses?.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Diagnoses</p>
              {snap.diagnoses.map((d, i) => (
                <div key={i} className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-slate-800">{d.title}</span>
                  <Badge text={d.eye} color="bg-emerald-100 text-emerald-700"/>
                  {d.notes && <span className="text-slate-500">· {d.notes}</span>}
                </div>
              ))}
            </div>
          )}
          {snap.counselingAdvice && <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"><b>Counseling:</b> {snap.counselingAdvice}</div>}
          {snap.treatmentPathway && <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"><b>Treatment Pathway:</b> {snap.treatmentPathway}</div>}
        </div>}
      </>}
    </div>
  );
}