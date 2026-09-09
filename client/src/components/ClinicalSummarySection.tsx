import React from 'react';
import { AlertTriangle, Activity, Stethoscope, Syringe, Pill, ClipboardList, ChevronRight } from 'lucide-react';
import type { ClinicalDashboard, DashboardAlert, DashboardSurgery } from '../lib/clinicalDashboard';
import { fmtDate } from '../lib/examHistory';

interface Props {
  dashboard: ClinicalDashboard;
  onOpenExam: (id: string) => void;
}

function AlertRow({ alert, onOpenExam }: { alert: DashboardAlert; onOpenExam: Props['onOpenExam'] }) {
  return (
    <button
      onClick={() => onOpenExam(alert.encounterId)}
      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${
        alert.level === 'critical'
          ? 'border-red-200 bg-red-50 hover:bg-red-100'
          : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
      }`}
    >
      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.level === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${alert.level === 'critical' ? 'text-red-700' : 'text-amber-800'}`}>{alert.message}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
    </button>
  );
}

function statusTone(status: string): string {
  const s = (status ?? '').toUpperCase();
  if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
  if (s === 'PLANNED') return 'bg-amber-100 text-amber-700';
  if (s === 'CANCELLED') return 'bg-rose-100 text-rose-600';
  if (s === 'RE-SCHEDULED') return 'bg-sky-100 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

function SectionTitle({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count?: number }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {label}
      {count !== undefined && <span className="text-slate-400">({count})</span>}
    </p>
  );
}

export const ClinicalSummarySection: React.FC<Props> = ({ dashboard, onOpenExam }) => {
  const d = dashboard;
  if (!d.hasData) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Clinical summary</p>
        {d.lastExamDate && <span className="text-[10px] text-slate-400 font-medium">Last exam {fmtDate(d.lastExamDate)}</span>}
      </div>

      {d.alerts.length > 0 && (
        <div className="mb-3">
          <SectionTitle icon={AlertTriangle} label={d.alerts.some((a) => a.level === 'critical') ? 'Critical alerts' : 'Alerts'} count={d.alerts.length} />
          <div className="space-y-1.5">
            {d.alerts.map((a) => <AlertRow key={a.message} alert={a} onOpenExam={onOpenExam} />)}
          </div>
        </div>
      )}

      {d.snapshot && (
        <div className="mb-3">
          <SectionTitle icon={Activity} label="Latest clinical snapshot" />
          <button
            onClick={() => onOpenExam(d.snapshot!.encounterId)}
            className={`w-full border ${d.snapshot.highIop ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} rounded-lg overflow-hidden transition-colors hover:border-slate-300 text-left`}
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{fmtDate(d.snapshot.date)}</span>
              {d.snapshot.highIop && <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">High IOP</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-1.5 px-3 py-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">VA OD</p>
                <p className="font-semibold text-slate-700">{d.snapshot.vaOd || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">VA OS</p>
                <p className="font-semibold text-slate-700">{d.snapshot.vaOs || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">IOP OD</p>
                <p className={`font-semibold ${d.snapshot.highIop ? 'text-red-600' : 'text-emerald-600'}`}>
                  {d.snapshot.iopOd ? `${d.snapshot.iopOd} mmHg` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">IOP OS</p>
                <p className={`font-semibold ${d.snapshot.highIop ? 'text-red-600' : 'text-emerald-600'}`}>
                  {d.snapshot.iopOs ? `${d.snapshot.iopOs} mmHg` : '—'}
                </p>
              </div>
              {d.snapshot.refraction && (
                <div className="col-span-full border-t border-slate-100 pt-1.5 mt-0.5">
                  <p className="text-[10px] text-slate-400 uppercase">Refraction</p>
                  <p className="font-medium text-slate-600">{d.snapshot.refraction}</p>
                </div>
              )}
            </div>
          </button>
        </div>
      )}

      {d.activeProblems.length > 0 && (
        <div className="mb-3">
          <SectionTitle icon={Stethoscope} label="Active problems" count={d.activeProblems.length} />
          <div className="flex flex-wrap gap-1.5">
            {d.activeProblems.map((p, i) => (
              <button
                key={`${p.title}|${p.eye}|${i}`}
                onClick={() => onOpenExam(p.encounterId)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs transition-colors"
                title={p.notes || p.date}
              >
                <span className="font-semibold text-blue-800">{p.title}</span>
                {p.eye && p.eye !== '—' && (
                  <span className="text-[10px] font-bold text-blue-600 bg-white rounded-full px-1.5 py-0.5 border border-blue-200">{p.eye}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {d.surgeries.length > 0 && (
        <div className="mb-3">
          <SectionTitle icon={Syringe} label="Surgical history" count={d.surgeries.length} />
          <div className="space-y-1.5">
            {d.surgeries.map((s: DashboardSurgery, i: number) => (
              <button
                key={`${s.type}|${s.eye}|${i}`}
                onClick={() => onOpenExam(s.encounterId)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{s.otherName || s.type}</p>
                  <p className="text-[10px] text-slate-400">
                    {[s.dateOfSurgery || (s.status === 'PLANNED' ? null : s.date), s.eye, s.surgeon].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${statusTone(s.status)}`}>{s.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {d.medications.length > 0 && (
        <div className="mb-3">
          <SectionTitle icon={Pill} label="Medications" count={d.medications.length} />
          <div className="space-y-1.5">
            {d.medications.map((m) => {
              const sub = [m.dosage, m.frequency, m.targetEye].filter(Boolean).join(' · ');
              return (
                <div key={m.drugName} className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{m.drugName}</p>
                    {sub && <p className="text-[10px] text-slate-400 truncate">{sub}</p>}
                  </div>
                  {m.route && <span className="text-[10px] font-medium text-slate-400 shrink-0">{m.route}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {d.treatmentPlan && (
        <div>
          <SectionTitle icon={ClipboardList} label="Treatment plan" />
          <div className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-left">
            <p className="text-xs text-slate-700 leading-relaxed">{d.treatmentPlan.text}</p>
            <p className="text-[10px] text-slate-400 mt-1">{fmtDate(d.treatmentPlan.date)}</p>
          </div>
        </div>
      )}
    </section>
  );
};