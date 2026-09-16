import React, { useMemo, useState } from 'react';
import { Stethoscope, Plus, X } from 'lucide-react';
import { useEncounterStore } from '../store/useEncounterStore';

type Diagnosis = { title: string; eye: 'OD' | 'OS' | 'OU'; notes: string };

const PROFESSIONAL_DIAGNOSES = [
  'Myopia', 'Hyperopia', 'Astigmatism', 'Presbyopia', 'Dry Eye Disease',
  'Glaucoma Suspect', 'Primary Open-Angle Glaucoma', 'Cataract', 'Pterygium',
  'Blepharitis', 'Allergic Conjunctivitis', 'Diabetic Retinopathy',
  'Hypertensive Retinopathy', 'Age-Related Macular Degeneration',
  'Optic Disc Cupping', 'Keratoconus', 'Amblyopia', 'Strabismus',
];

export const DiagnosisView: React.FC = () => {
  const diagnoses = useEncounterStore((s) => s.diagnoses) as Diagnosis[];
  const setSectionData = useEncounterStore((s) => s.setSectionData);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const tonometry = useEncounterStore((s) => s.tonometry);
  const [custom, setCustom] = useState('');
  const [eye, setEye] = useState<Diagnosis['eye']>('OU');
  const diagnosisState = (sectionData.diagnosis as { items?: Diagnosis[]; showInDischarge?: boolean } | undefined);
  const showInDischarge = diagnosisState?.showInDischarge ?? false;

  const suggestions = useMemo(() => {
    const result: string[] = [];
    if (Number(tonometry.odIop) > 21 || Number(tonometry.osIop) > 21) result.push('Glaucoma Suspect');
    const tear = sectionData['tear-film'] as { tbutOd?: string; tbutOs?: string; schirmerOd?: string; schirmerOs?: string } | undefined;
    if (Number(tear?.tbutOd) > 0 && Number(tear?.tbutOd) < 10 || Number(tear?.tbutOs) > 0 && Number(tear?.tbutOs) < 10) result.push('Dry Eye Disease');
    const refraction = sectionData.refraction as { od?: { sph?: string }; os?: { sph?: string } } | undefined;
    if (Number(refraction?.od?.sph) < -0.5 || Number(refraction?.os?.sph) < -0.5) result.push('Myopia');
    if (Number(refraction?.od?.sph) > 0.5 || Number(refraction?.os?.sph) > 0.5) result.push('Hyperopia');
    return [...new Set(result)];
  }, [sectionData, tonometry]);

  const save = (next: Diagnosis[]) => setSectionData('diagnosis', { items: next, showInDischarge });
  const items = (diagnosisState?.items ?? diagnoses) as Diagnosis[];
  const add = (title: string) => {
    const clean = title.trim();
    if (!clean || items.some((item) => item.title === clean && item.eye === eye)) return;
    save([...items, { title: clean, eye, notes: '' }]);
    setCustom('');
  };

  return <div className="min-h-full max-w-5xl bg-white p-8">
    <div className="mb-7 flex items-start gap-3">
      <div className="rounded-xl bg-blue-100 p-2 text-blue-700"><Stethoscope className="h-5 w-5" /></div>
      <div><h1 className="text-2xl font-bold text-[#1e3a8a]">Diagnosis</h1><p className="mt-1 text-sm text-slate-500">Review examination findings and document the clinician-confirmed ophthalmic diagnosis.</p></div>
    </div>
    {suggestions.length > 0 && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Suggested from recorded findings — confirm clinically</p><div className="mt-2 flex flex-wrap gap-2">{suggestions.map((s) => <button key={s} onClick={() => add(s)} className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100">+ {s}</button>)}</div></div>}
    <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto]"><select value={eye} onChange={(e) => setEye(e.target.value as Diagnosis['eye'])} className="order-2 rounded-md border border-slate-300 px-3 py-2 text-sm sm:order-1"><option value="OD">OD</option><option value="OS">OS</option><option value="OU">OU</option></select><select defaultValue="" onChange={(e) => { if (e.target.value) add(e.target.value); e.target.value = ''; }} className="order-1 rounded-md border border-slate-300 px-3 py-2 text-sm sm:order-2"><option value="">Select a diagnosis…</option>{PROFESSIONAL_DIAGNOSES.map((d) => <option key={d}>{d}</option>)}</select><div className="order-3 flex gap-2"><input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(custom)} placeholder="Other diagnosis" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"/><button onClick={() => add(custom)} className="rounded-md bg-blue-700 px-3 text-white"><Plus className="h-4 w-4" /></button></div></div>
    <div className="mt-6 space-y-3">{items.length ? items.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-lg border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-800">{item.title} <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{item.eye}</span></p><button onClick={() => save(items.filter((_, i) => i !== index))} className="text-slate-400 hover:text-rose-600"><X className="h-4 w-4" /></button></div><textarea value={item.notes} onChange={(e) => save(items.map((d, i) => i === index ? { ...d, notes: e.target.value } : d))} placeholder="Clinical notes, staging, or supporting findings…" className="mt-3 w-full rounded-md border border-slate-200 p-2 text-sm" rows={2} /></div>) : <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No diagnosis documented yet.</p>}</div>
    <label className="mt-6 flex items-center justify-end gap-2 text-xs font-medium text-slate-600"><input type="checkbox" checked={showInDischarge} onChange={(e) => setSectionData('diagnosis', { items, showInDischarge: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600" />Show in discharge summary</label>
  </div>;
};
