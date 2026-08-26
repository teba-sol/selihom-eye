import React, { useState } from 'react';
import { X, FileText, Eye, Activity, Pill, Calendar, ChevronDown, ChevronRight, Printer, Heart, Glasses, Users, Briefcase } from 'lucide-react';
import type { Patient, Appointment } from '../data/mockData';
import type { EncounterSnapshot } from '../store/useEncounterStore';
import { formatDob, calcAge } from '../data/mockData';

interface PatientRecordModalProps {
  patient: Patient;
  appointments: Appointment[];
  snapshots: Record<string, EncounterSnapshot>;
  onClose: () => void;
  onOpenExam: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, icon, expanded, onToggle, count }: {
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

function Field({ label, value, wide }: { label: string; value?: string | number | null; wide?: boolean }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={`bg-slate-50 rounded-lg p-2.5 border border-slate-100 ${wide ? 'col-span-2' : ''}`}>
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{value}</span>
    </div>
  );
}

function RefTable({ label, data }: { label: string; data: any }) {
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
            {['odSph','odCyl','odAxis','odVa','odAdd'].map(k => <td key={k} className="px-2 py-1.5 text-center">{data[k]||'—'}</td>)}
          </tr>
          <tr>
            <td className="px-2 py-1.5 font-bold text-slate-700">OS</td>
            {['osSph','osCyl','osAxis','osVa','osAdd'].map(k => <td key={k} className="px-2 py-1.5 text-center">{data[k]||'—'}</td>)}
          </tr>
        </tbody>
      </table>
      {data.pdBinocular && <p className="text-[11px] text-slate-500">PD Binocular: <b>{data.pdBinocular} mm</b>{data.bvdMm ? ` · BVD: ${data.bvdMm} mm` : ''}</p>}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{text}</span>;
}

// ── ExamDetails: full clinical data ──────────────────────────────────────────
function ExamDetails({ snap }: { snap: EncounterSnapshot }) {
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

  const hasVa = va && (va.unaidedOd||va.unaidedOs||va.aidedOd||va.aidedOs||va.pinholeOd||va.pinholeOs);
  const hasRef = ref && (ref.odSph||ref.osSph||ref.odVa||ref.osVa);
  const hasTono = tono && (tono.odIop||tono.osIop);
  const hasSlitLamp = sl && (sl.lidsLashes||sl.conjunctiva||sl.cornea||sl.anteriorChamber||sl.irisLens);
  const hasSymptoms = snap.symptoms?.length > 0;
  const hasMeds = snap.patientMedications?.length > 0;
  const hasOcular = snap.ocularHistory && Object.values(snap.ocularHistory.conditions).some(c => c.active);
  const hasSystemic = snap.systemicHistory && Object.values(snap.systemicHistory.conditions).some(c => (c as any).active);
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
                <td className="px-2 py-1.5 text-center">{va.unaidedOd||'—'}</td>
                <td className="px-2 py-1.5 text-center">{va.aidedOd||'—'}</td>
                <td className="px-2 py-1.5 text-center">{va.pinholeOd||'—'}</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 font-bold">OS (Left)</td>
                <td className="px-2 py-1.5 text-center">{va.unaidedOs||'—'}</td>
                <td className="px-2 py-1.5 text-center">{va.aidedOs||'—'}</td>
                <td className="px-2 py-1.5 text-center">{va.pinholeOs||'—'}</td>
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
          {Object.entries(snap.systemicHistory.conditions).filter(([,v]) => (v as any).active).map(([k,v]: any) => (
            <div key={k} className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <span className="font-bold text-slate-800 capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
              <span className="text-slate-500 ml-2">{v.type}</span>
              <span className="text-slate-500 ml-2">· {v.durationValue} {v.durationUnit}</span>
              <Badge text={v.controlStatus} color={v.controlStatus==='Well Controlled' ? 'bg-green-100 text-green-700' : v.controlStatus==='Uncontrolled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}/>
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

// ── ExamRecord: collapsible appointment row ───────────────────────────────────
function ExamRecord({ apt, snap }: { apt: Appointment; snap: EncounterSnapshot | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${apt.status==='completed' ? 'bg-emerald-500' : apt.status==='in_exam' ? 'bg-purple-500' : 'bg-slate-300'}`}/>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">{apt.date} · {apt.startTime}–{apt.endTime}</p>
            <p className="text-xs text-slate-500">{apt.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            apt.status==='completed' ? 'bg-emerald-100 text-emerald-700' :
            apt.status==='in_exam' ? 'bg-purple-100 text-purple-700' :
            apt.status==='confirmed' ? 'bg-teal-100 text-teal-700' :
            'bg-slate-100 text-slate-600'
          }`}>{apt.status.replace('_',' ')}</span>
          {open ? <ChevronDown className="w-4 h-4 text-slate-400"/> : <ChevronRight className="w-4 h-4 text-slate-400"/>}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-white">
          {snap ? <ExamDetails snap={snap}/> : <p className="px-4 py-3 text-xs text-slate-400 italic">No clinical data recorded yet.</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export const PatientRecordModal: React.FC<PatientRecordModalProps> = ({ patient, appointments, snapshots, onClose, onOpenExam }) => {
  const [tab, setTab] = useState<'info' | 'exams'>('exams');

  const handlePrint = () => {
    // helper to build a two-column info table row
    const tr = (label: string, value: string | null | undefined) =>
      value ? `<tr><td class="lbl">${label}</td><td class="val">${value}</td></tr>` : '';

    // helper for a section header in print
    const secH = (title: string) =>
      `<h3 class="sec-title">${title}</h3>`;

    // helper for a refraction table
    const refTable = (label: string, r: any) => {
      if (!r || (!r.odSph && !r.osSph && !r.odVa && !r.osVa)) return '';
      return `
        <p class="sub-label">${label}</p>
        <table class="data-table">
          <thead><tr><th>Eye</th><th>Sph</th><th>Cyl</th><th>Axis</th><th>VA</th><th>Add</th></tr></thead>
          <tbody>
            <tr><td><b>OD</b></td><td>${r.odSph||'—'}</td><td>${r.odCyl||'—'}</td><td>${r.odAxis||'—'}</td><td>${r.odVa||'—'}</td><td>${r.odAdd||'—'}</td></tr>
            <tr><td><b>OS</b></td><td>${r.osSph||'—'}</td><td>${r.osCyl||'—'}</td><td>${r.osAxis||'—'}</td><td>${r.osVa||'—'}</td><td>${r.osAdd||'—'}</td></tr>
          </tbody>
        </table>
        ${r.pdBinocular ? `<p class="note">PD Binocular: ${r.pdBinocular} mm${r.bvdMm ? ` · BVD: ${r.bvdMm} mm` : ''}</p>` : ''}`;
    };

    const examSections = appointments.map(apt => {
      const snap = snapshots[apt.id];
      const statusBadge = `<span class="badge badge-${apt.status==='completed'?'green':apt.status==='in_exam'?'purple':'gray'}">${apt.status.replace('_',' ')}</span>`;
      let body = '';

      if (!snap) {
        body = '<p class="empty">No clinical data recorded for this appointment.</p>';
      } else {
        const va = snap.visualAcuity;
        const ref = snap.refraction;
        const sl = snap.slitLamp;
        const tono = snap.tonometry;
        const spec = snap.spectaclesHistory;
        const cl = snap.contactLensHistory;
        const life = snap.lifestyleDemands;

        // Visual Acuity
        if (va && (va.unaidedOd||va.unaidedOs||va.aidedOd||va.aidedOs||va.pinholeOd||va.pinholeOs)) {
          body += secH('Visual Acuity');
          body += `<table class="data-table">
            <thead><tr><th>Eye</th><th>Unaided</th><th>Aided</th><th>Pinhole</th></tr></thead>
            <tbody>
              <tr><td><b>OD (Right)</b></td><td>${va.unaidedOd||'—'}</td><td>${va.aidedOd||'—'}</td><td>${va.pinholeOd||'—'}</td></tr>
              <tr><td><b>OS (Left)</b></td><td>${va.unaidedOs||'—'}</td><td>${va.aidedOs||'—'}</td><td>${va.pinholeOs||'—'}</td></tr>
            </tbody></table>`;
        }

        // Refraction
        if (ref && (ref.odSph||ref.osSph||ref.odVa||ref.osVa)) {
          body += secH('Refraction');
          body += refTable('Refraction Results', ref);
        }

        // Anterior Segment / Slit Lamp
        if (sl && (sl.lidsLashes||sl.conjunctiva||sl.cornea||sl.anteriorChamber||sl.irisLens)) {
          body += secH('Anterior Segment (Slit Lamp)');
          body += `<table class="info-table">
            ${tr('Lids & Lashes', sl.lidsLashes)}
            ${tr('Conjunctiva', sl.conjunctiva)}
            ${tr('Cornea', sl.cornea)}
            ${tr('Anterior Chamber', sl.anteriorChamber)}
            ${tr('Iris & Lens', sl.irisLens)}
          </table>`;
        }

        // Tonometry
        if (tono && (tono.odIop||tono.osIop)) {
          body += secH('Tonometry (IOP)');
          body += `<table class="data-table">
            <thead><tr><th>Eye</th><th>IOP</th><th>Method</th></tr></thead>
            <tbody>
              <tr><td><b>OD</b></td><td>${tono.odIop||'—'} mmHg</td><td rowspan="2">${tono.method}</td></tr>
              <tr><td><b>OS</b></td><td>${tono.osIop||'—'} mmHg</td></tr>
            </tbody></table>`;
        }

        // Symptoms
        if (snap.symptoms?.length) {
          body += secH(`Presenting Symptoms (${snap.symptoms.length})`);
          body += snap.symptoms.map(s =>
            `<div class="row-item"><b>${s.name}</b> · ${s.eye} · ${s.durationValue} ${s.durationUnit} · ${s.frequency} · <span class="sev-${s.severity.toLowerCase()}">${s.severity}</span>${s.remarks ? ` · "${s.remarks}"` : ''}</div>`
          ).join('');
        }

        // Ocular History
        const activeOcular = Object.entries(snap.ocularHistory?.conditions||{}).filter(([,v])=>v.active);
        if (activeOcular.length) {
          body += secH('Ocular History');
          body += `<table class="info-table">${activeOcular.map(([k,v]) =>
            tr(k.replace(/([A-Z])/g,' $1'), `${v.type} · ${v.eye}${v.date?` · ${v.date}`:''}${v.remarks?` · ${v.remarks}`:''}`)
          ).join('')}</table>`;
          if (snap.ocularHistory.generalRemarks) body += `<p class="note">${snap.ocularHistory.generalRemarks}</p>`;
        }

        // Systemic History
        const activeSystemic = Object.entries(snap.systemicHistory?.conditions||{}).filter(([,v])=>(v as any).active);
        if (activeSystemic.length) {
          body += secH('Systemic History');
          body += `<table class="info-table">${activeSystemic.map(([k,v]: any) =>
            tr(k.replace(/([A-Z])/g,' $1'), `${v.type} · ${v.durationValue} ${v.durationUnit} · ${v.controlStatus}${v.remarks?` · ${v.remarks}`:''}`)
          ).join('')}</table>`;
          if (snap.systemicHistory.generalRemarks) body += `<p class="note">${snap.systemicHistory.generalRemarks}</p>`;
        }

        // Medications
        if (snap.patientMedications?.length) {
          body += secH(`Medications (${snap.patientMedications.length})`);
          body += `<table class="data-table">
            <thead><tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Route</th><th>Target Eye</th><th>Compliance</th></tr></thead>
            <tbody>${snap.patientMedications.map(m =>
              `<tr><td><b>${m.drugName}</b></td><td>${m.dosage||'—'}</td><td>${m.frequency}</td><td>${m.route}</td><td>${m.targetEye||'Systemic'}</td><td>${m.compliance}</td></tr>`
            ).join('')}</tbody></table>`;
        }

        // Family History
        if (snap.familyOcularHistory?.length || snap.familySystemicHistory?.length) {
          body += secH('Family History');
          if (snap.familyOcularHistory?.length) {
            body += '<p class="sub-label">Ocular</p>';
            body += snap.familyOcularHistory.map(f =>
              `<div class="row-item"><b>${f.relation}</b> — ${f.condition}${f.notes?` · ${f.notes}`:''}</div>`
            ).join('');
          }
          if (snap.familySystemicHistory?.length) {
            body += '<p class="sub-label">Systemic</p>';
            body += snap.familySystemicHistory.map(f =>
              `<div class="row-item"><b>${f.relation}</b> — ${f.condition}${f.notes?` · ${f.notes}`:''}</div>`
            ).join('');
          }
        }

        // Spectacles
        if (spec?.currentlyWears) {
          body += secH('Spectacles History');
          body += `<table class="info-table">
            ${tr('Type', spec.type)}
            ${tr('Age of Glasses', spec.ageOfCurrentGlasses)}
            ${tr('Material', spec.material)}
            ${tr('Coatings', spec.coating?.join(', '))}
            ${tr('Satisfaction', spec.satisfaction)}
            ${tr('Remarks', spec.remarks)}
          </table>`;
        }

        // Contact Lens
        if (cl?.currentWearer) {
          body += secH('Contact Lens History');
          body += `<table class="info-table">
            ${tr('Modality', cl.modality)}
            ${tr('Wearing Hours/Day', `${cl.wearingHoursPerDay} hrs`)}
            ${tr('Solution Used', cl.solutionUsed)}
            ${tr('Cleaning Compliance', cl.complianceWithCleaning)}
            ${tr('Last Eye Check', cl.lastEyeCheckDate)}
            ${tr('Remarks', cl.remarks)}
          </table>`;
        }

        // Lifestyle
        if (life && (life.occupation||life.screenTimeHoursPerDay||life.outdoorActivities)) {
          body += secH('Lifestyle & Demands');
          body += `<table class="info-table">
            ${tr('Occupation', life.occupation)}
            ${tr('Screen Time/Day', life.screenTimeHoursPerDay ? `${life.screenTimeHoursPerDay} hrs` : null)}
            ${tr('Outdoor Activities', life.outdoorActivities)}
            ${tr('Hobbies', life.hobbies)}
            ${tr('Workplace Lighting', life.lightingConditionWorkplace)}
            ${tr('Driving Requirements', life.drivingRequirements)}
          </table>`;
        }

        // Assessment & Plan
        if (snap.diagnoses?.length || snap.counselingAdvice || snap.treatmentPathway) {
          body += secH('Assessment & Plan');
          if (snap.diagnoses?.length) {
            body += '<p class="sub-label">Diagnoses</p>';
            body += snap.diagnoses.map(d =>
              `<div class="row-item"><b>${d.title}</b> <span class="eye-tag">(${d.eye})</span>${d.notes?` — ${d.notes}`:''}</div>`
            ).join('');
          }
          if (snap.counselingAdvice) body += `<div class="row-item"><b>Counseling:</b> ${snap.counselingAdvice}</div>`;
          if (snap.treatmentPathway) body += `<div class="row-item"><b>Treatment Pathway:</b> ${snap.treatmentPathway}</div>`;
        }
      }

      return `
        <div class="visit-card">
          <div class="visit-header">
            <span class="visit-date">${apt.date} · ${apt.startTime}–${apt.endTime}</span>
            <span class="visit-reason">${apt.reason}</span>
            ${statusBadge}
          </div>
          <div class="visit-body">${body}</div>
        </div>`;
    }).join('');

    const today = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
    <title>Medical Record – ${patient.firstName} ${patient.lastName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',sans-serif;font-size:12px;color:#1e293b;padding:28px;background:#fff}
      h1{font-size:20px;font-weight:900;color:#0f2038;margin-bottom:2px}
      h2{font-size:15px;font-weight:800;color:#1e3a5f;margin:14px 0 4px}
      .clinic-tag{font-size:10px;color:#64748b;margin-bottom:12px}
      .patient-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:18px}
      .meta-field label{display:block;font-size:9px;font-weight:800;text-transform:uppercase;color:#94a3b8;letter-spacing:.05em;margin-bottom:2px}
      .meta-field span{font-weight:700;font-size:12px;color:#1e293b}
      .visit-card{border:1px solid #e2e8f0;border-radius:10px;margin-bottom:18px;overflow:hidden;page-break-inside:avoid}
      .visit-header{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f1f5f9;border-bottom:1px solid #e2e8f0}
      .visit-date{font-weight:800;font-size:12px;color:#1e3a5f}
      .visit-reason{font-size:11px;color:#64748b;flex:1}
      .visit-body{padding:10px 12px}
      .sec-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#2563eb;border-bottom:1px solid #dbeafe;padding-bottom:3px;margin:10px 0 6px}
      .sec-title:first-child{margin-top:0}
      .info-table{width:100%;border-collapse:collapse;margin-bottom:6px}
      .info-table .lbl{width:35%;padding:3px 6px;font-weight:700;color:#64748b;font-size:11px}
      .info-table .val{padding:3px 6px;color:#1e293b;font-size:11px}
      .data-table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}
      .data-table thead tr{background:#1e3a5f;color:#fff}
      .data-table th{padding:4px 6px;text-align:left;font-weight:700}
      .data-table td{padding:4px 6px;border-bottom:1px solid #f1f5f9}
      .row-item{padding:4px 6px;border-left:3px solid #2563eb;margin:3px 0;background:#f8fafc;font-size:11px;line-height:1.5}
      .sub-label{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin:6px 0 3px}
      .note{font-size:10px;color:#94a3b8;font-style:italic;margin-top:3px}
      .empty{font-size:11px;color:#94a3b8;font-style:italic;padding:6px 0}
      .badge{display:inline-block;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:800}
      .badge-green{background:#dcfce7;color:#166534}
      .badge-purple{background:#f3e8ff;color:#6b21a8}
      .badge-gray{background:#f1f5f9;color:#475569}
      .eye-tag{font-size:10px;color:#2563eb;font-weight:700}
      .sev-severe{color:#dc2626;font-weight:700}
      .sev-moderate{color:#d97706;font-weight:700}
      .sev-mild{color:#16a34a;font-weight:700}
      .footer{margin-top:28px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
      @media print{body{padding:16px}.visit-card{page-break-inside:avoid}}
    </style>
    </head><body>
      <h1>Patient Medical Record</h1>
      <p class="clinic-tag">SELIHOME Ophthalmic Medium Clinic — Confidential Clinical Document</p>

      <div class="patient-meta">
        <div class="meta-field"><label>MRN</label><span>${patient.mrn??`SEL-${patient.id}`}</span></div>
        <div class="meta-field"><label>Full Name</label><span>${patient.firstName} ${patient.lastName}</span></div>
        <div class="meta-field"><label>Gender</label><span>${patient.gender}</span></div>
        <div class="meta-field"><label>Date of Birth</label><span>${formatDob(patient.dateOfBirth)}</span></div>
        <div class="meta-field"><label>Age</label><span>${calcAge(patient.dateOfBirth)} years</span></div>
        <div class="meta-field"><label>Phone</label><span>${patient.phone}</span></div>
        <div class="meta-field"><label>Status</label><span>${patient.isNew?'New Patient':'Returning Patient'}</span></div>
        <div class="meta-field"><label>Address</label><span>${patient.address??'—'}</span></div>
      </div>

      <h2>Examination History — ${appointments.length} Visit${appointments.length!==1?'s':''}</h2>
      ${examSections}

      <div class="footer">
        <span>SELIHOME Ophthalmic Medium Clinic · Confidential Medical Record</span>
        <span>Printed: ${today}</span>
      </div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{patient.firstName} {patient.lastName}</h2>
              <p className="text-xs text-slate-500">{patient.mrn??`SEL-${patient.id}`} · {calcAge(patient.dateOfBirth)} yrs · {patient.gender}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
              <Printer className="w-3.5 h-3.5"/> Print
            </button>
            <button onClick={onOpenExam} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
              <Eye className="w-3.5 h-3.5"/> Open Exam
            </button>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0">
          {(['info','exams'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 ${tab===t ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t==='info' ? 'Patient Info' : `Exam History (${appointments.length})`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'info' && (
            <div className="p-5 grid grid-cols-2 gap-3">
              <Field label="MRN" value={patient.mrn??`SEL-${patient.id}`}/>
              <Field label="Full Name" value={`${patient.firstName} ${patient.lastName}`}/>
              <Field label="Gender" value={patient.gender}/>
              <Field label="Date of Birth" value={formatDob(patient.dateOfBirth)}/>
              <Field label="Age" value={`${calcAge(patient.dateOfBirth)} years`}/>
              <Field label="Phone" value={patient.phone}/>
              <Field label="Address" value={patient.address??'—'} wide/>
              <Field label="Last Visit" value={patient.lastVisit??'—'}/>
              <Field label="Status" value={patient.isNew ? 'New Patient' : 'Returning Patient'}/>
            </div>
          )}
          {tab === 'exams' && (
            <div className="p-5">
              {appointments.length === 0
                ? <div className="text-center py-10 text-slate-400"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-40"/><p className="text-sm">No appointments found</p></div>
                : appointments.map(apt => <ExamRecord key={apt.id} apt={apt} snap={snapshots[apt.id]}/>)
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
