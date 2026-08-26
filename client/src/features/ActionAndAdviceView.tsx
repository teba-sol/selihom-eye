import React, { useState, useRef, useEffect } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAppStore } from '../store/useAppStore';

interface MedItem { id: string; name: string; eye: string; type: string; dose: string; duration: string; remark: string; }

const REFERRAL_OPTIONS = ['None','Referral to Ophthalmologist','Speciality Contact Lens Fitting','Glaucoma Evaluation','Diabetic Eye Examination','Vitreo-Retinal Evaluation','Neuro-Ophthalmology Evaluation','Cataract Evaluation','Orthoptic Evaluation','Refractive Surgery Evaluation','Referral to Low Vision Clinic','Referral to Vision Therapy Clinic','Referral to Dry Eye Clinic','Referral to Paediatric Clinic','Referral to Myopia Clinic','Referral to General Physician','Referral to Neurologist','Referral to Diabetologist','Referral to Cardiologist'];
const URGENCY_OPTIONS = ['None','Immediate','Within 24 Hours','Within 1 week','Within 1 month','Within 3 months','Within 6 months'];
const EYE_OPTIONS = ['None','RE','LE','BE'];
const TYPE_OPTIONS = ['Drop','Ointment'];
const DOSE_OPTIONS = ['Dose','1 drop, 1 x daily','1 drop, 2 x daily','1 drop, 3 x daily','1 drop, 4 x daily','1 drop, 5 x daily','1 drop, 6 x daily'];
const DURATION_OPTIONS = ['Duration','2 days','3 days','4 days','5 days','1 week','2 weeks','4 weeks','6 weeks','12 weeks'];
const REMARK_SUGGESTIONS = ['use especially while working on the screen','every 12 hours','Pataday','Hyla PF','Eye mist gel','at night','AM and OM','AM and PM'];
const DRUG_SUGGESTIONS = ['Hyla PF','Hylo','Pataday Eye Drops','Eye mist','Flogel','Refresh Tears'];
const SPECTACLE_OPTIONS = ['','Single Vision Distance','Single Vision Near','Progressive Addition Lenses (PALs)','Bifocals','Not Recommended'];
const FOLLOWUP_OPTIONS = ['None','1 week','2 weeks','1 month','3 months','6 months','1 year'];

const SEL_CLS = 'px-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-500';
const FULL_SEL_CLS = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-500';

function AC({ value, onChange, suggestions, placeholder, inputCls = '' }: {
  value: string; onChange: (v: string) => void; suggestions: string[]; placeholder: string; inputCls?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <input type="text" value={value} onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} placeholder={placeholder}
        className={`w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${inputCls}`} />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 min-w-[180px] mt-0.5 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <div key={s} onMouseDown={e => { e.preventDefault(); onChange(s); setOpen(false); }}
              className="px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-blue-50">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ActionAndAdviceView: React.FC = () => {
  const appointmentId = useEncounterStore(s => s.appointmentId);
  const updateAppointment = useAppStore(s => s.updateAppointment);

  const [referral, setReferral] = useState('None');
  const [urgency, setUrgency] = useState('None');
  const [medName, setMedName] = useState('');
  const [medEye, setMedEye] = useState('None');
  const [medType, setMedType] = useState('Drop');
  const [medDose, setMedDose] = useState('Dose');
  const [medDuration, setMedDuration] = useState('Duration');
  const [medRemark, setMedRemark] = useState('');
  const [meds, setMeds] = useState<MedItem[]>([]);
  const [spectacle, setSpectacle] = useState('');
  const [followUp, setFollowUp] = useState('None');
  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const addMed = () => {
    if (!medName.trim()) return;
    setMeds(p => [...p, {
      id: Date.now().toString(), name: medName, eye: medEye,
      type: medType, dose: medDose, duration: medDuration, remark: medRemark || '-'
    }]);
    setMedName(''); setMedEye('None'); setMedType('Drop');
    setMedDose('Dose'); setMedDuration('Duration'); setMedRemark('');
  };

  return (
    <div className="p-8 max-w-4xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Action And Advice</h1>

      <div className="space-y-5 mb-6">
        {/* Further Referral / Tests */}
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-1.5">Further Referral / Tests</label>
          <select value={referral} onChange={e => setReferral(e.target.value)} className={FULL_SEL_CLS}>
            {REFERRAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-1.5">Urgency</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)} className={FULL_SEL_CLS}>
            {URGENCY_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Medication */}
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-2">Medication</label>

          {/* Input row — exactly matches screenshot order */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Drug name — blue border when focused, wider */}
            <div className="w-[130px]">
              <AC value={medName} onChange={setMedName} suggestions={DRUG_SUGGESTIONS}
                placeholder="Medication na..." inputCls="focus:border-blue-600 focus:ring-1 focus:ring-blue-300" />
            </div>

            <select value={medEye} onChange={e => setMedEye(e.target.value)} className={`${SEL_CLS} w-[80px]`}>
              {EYE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            <select value={medType} onChange={e => setMedType(e.target.value)} className={`${SEL_CLS} w-[110px]`}>
              {TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            <select value={medDose} onChange={e => setMedDose(e.target.value)} className={`${SEL_CLS} w-[140px]`}>
              {DOSE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            <select value={medDuration} onChange={e => setMedDuration(e.target.value)} className={`${SEL_CLS} w-[120px]`}>
              {DURATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            {/* Remark — text input with autocomplete (turns into "AM a" style shown in screenshot) */}
            <div className="w-[90px]">
              <AC value={medRemark} onChange={setMedRemark} suggestions={REMARK_SUGGESTIONS} placeholder="" />
            </div>

            {/* Gray Add (for remark context, does nothing alone) */}
            <button type="button"
              className="px-3 py-1.5 text-sm font-semibold border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 bg-white">
              Add
            </button>

            {/* Blue Add — adds full row to table */}
            <button type="button" onClick={addMed}
              className="px-4 py-1.5 text-sm font-bold bg-[#2563eb] text-white rounded-md hover:bg-[#1d4ed8] transition-colors">
              Add
            </button>
          </div>

          {/* Medication table — shown as soon as first med is added */}
          {meds.length > 0 && (
            <div className="mt-3 border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200">
                    {['Name','Eye','Type','Dose','Duration','Remark','Action'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {meds.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{m.name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.eye}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.type}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.dose}</td>
                      <td className="px-3 py-2.5 text-slate-600">{m.duration}</td>
                      <td className="px-3 py-2.5 text-slate-500">{m.remark}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => setMeds(p => p.filter(x => x.id !== m.id))}
                          className="px-3 py-1 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 text-slate-600">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Spectacle Recommendation */}
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-1.5">Spectacle Recommendation</label>
          <div className="relative">
            <select value={spectacle} onChange={e => setSpectacle(e.target.value)} className={FULL_SEL_CLS}>
              <option value="">Select...</option>
              {SPECTACLE_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Follow up period */}
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-1.5">Follow up period</label>
          <select value={followUp} onChange={e => setFollowUp(e.target.value)} className={FULL_SEL_CLS}>
            {FOLLOWUP_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea rows={4} value={remarks} onChange={e => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 resize-none" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showInDischarge} onChange={e => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
          Show in Discharge Summary
        </label>
        <button type="button"
          onClick={() => appointmentId && updateAppointment(appointmentId, { status: 'completed' })}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors">
          Finish examination
        </button>
      </div>
    </div>
  );
};
