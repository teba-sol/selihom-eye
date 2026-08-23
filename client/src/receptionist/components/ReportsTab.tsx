import React from 'react';
import { FileText, CheckCircle2, Clock, User, Activity, Eye, Printer, Syringe } from 'lucide-react';
import type { RegisteredPatient } from '../types.ts';

interface ReportsTabProps {
  patients: RegisteredPatient[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ patients }) => {
  const triagedPatients = patients.filter(p => !!p.triageData);
  const pendingTriage = patients.filter(p => !p.triageData);
  const diabeticCount = patients.filter(p => p.triageData && p.triageData.diabeticScreening.isDiabetic !== 'no').length;
  const emergencyCount = patients.filter(p => p.triageData && p.triageData.urgencyLevel === 'emergency').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Clinic Activity & Registry Reports
          </div>
          <h1 className="text-2xl font-extrabold text-[#102a43]">
            Daily Patient & Triage Reports (ዕለታዊ ሪፖርቶች)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Summary of registered patients, nurse triage evaluations, and doctor consultation queue.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="clinic-button clinic-button-primary self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" /> Print Daily Report
        </button>
      </section>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clinic-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 grid place-items-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Registered</div>
            <div className="text-xl font-extrabold text-slate-900">{patients.length}</div>
          </div>
        </div>

        <div className="clinic-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Triage Completed</div>
            <div className="text-xl font-extrabold text-emerald-700">{triagedPatients.length}</div>
          </div>
        </div>

        <div className="clinic-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 grid place-items-center font-bold">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Diabetic Screened</div>
            <div className="text-xl font-extrabold text-purple-700">{diabeticCount}</div>
          </div>
        </div>

        <div className="clinic-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 grid place-items-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Pending Triage</div>
            <div className="text-xl font-extrabold text-amber-700">{pendingTriage.length}</div>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="clinic-card p-5">
        <h3 className="font-extrabold text-base text-[#102a43] mb-4">
          Patient Registry & Handover Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">MRN</th>
                <th className="py-3 px-3">Patient Full Name</th>
                <th className="py-3 px-3">Age/Sex</th>
                <th className="py-3 px-3">Reg Date (Eth/Euro)</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Blood Pressure & Sugar</th>
                <th className="py-3 px-3">Visual Acuity (OD/OS)</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No patients registered yet.
                  </td>
                </tr>
              ) : (
                patients.map(p => {
                  const t = p.triageData;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-extrabold text-blue-700">{p.meta.mrn}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {p.personalInfo.firstName} {p.personalInfo.fatherName} {p.personalInfo.grandFatherName}
                      </td>
                      <td className="py-3 px-3">{p.age}y / {p.personalInfo.sex}</td>
                      <td className="py-3 px-3 text-slate-500">
                        {p.meta.registrationDate.ethiopian || p.meta.registrationDate.gregorian}
                      </td>
                      <td className="py-3 px-3">{p.contact.phone || 'N/A'}</td>
                      <td className="py-3 px-3">
                        {t ? (
                          <div className="space-y-0.5">
                            <div>BP: <b>{t.vitals.bloodPressureSys}/{t.vitals.bloodPressureDia}</b></div>
                            <div className="text-[10px] text-slate-500">Sugar: {t.diabeticScreening.bloodSugarValue} mg/dL</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not taken</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {t ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div>OD: {t.ocularAssessment.vaUnaidedOD}</div>
                            <div>OS: {t.ocularAssessment.vaUnaidedOS}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not tested</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {t ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Ready for Doctor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Waiting for Triage
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
