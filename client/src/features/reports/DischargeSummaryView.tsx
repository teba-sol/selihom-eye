import React from 'react';
import { useEncounterStore } from '../../store/useEncounterStore';
import { useAppStore } from '../../store/useAppStore';
import { downloadEncounterPdf } from '../../lib/generatePdf';
import { formatDobEthiopian } from '../../lib/formatters';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 align-top w-32 border-r border-slate-200">
      {children}
    </td>
  );
}

function Row({ label, value }: { label?: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-100">
      {label !== undefined && <td className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50/50 w-48 border-r border-slate-200">{label}</td>}
      <td className="px-3 py-2 text-sm text-slate-700">{value}</td>
    </tr>
  );
}

function vaValDisp(va: any, eye: 'od' | 'os'): string[] {
  if (!va) return [];
  const e = va[eye];
  if (e && e.dist) {
    return [e.dist.unaided ?? '', e.dist.aided ?? '', e.dist.pinhole ?? ''];
  }
  if (eye === 'od') return [va.unaidedOd ?? '', va.aidedOd ?? '', va.pinholeOd ?? ''];
  return [va.unaidedOs ?? '', va.aidedOs ?? '', va.pinholeOs ?? ''];
}

export const DischargeSummaryView: React.FC = () => {
  const s = useEncounterStore();
  const patient = s.patient;
  const appPatient = useAppStore(st => st.getPatientById(patient.id));

  const handleDownloadPdf = () => downloadEncounterPdf(useEncounterStore.getState());

  // Gather active conditions
  const activeOcular = Object.entries(s.ocularHistory?.conditions || {}).filter(([,v]) => v.active);
  const activeSystemic = Object.entries(s.systemicHistory?.conditions || {}).filter(([,v]) => (v as any).active);

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto overflow-hidden">

        {/* Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-[#2563eb]">Discharge Summary</h1>
            <div className="flex gap-2">
              <button onClick={handleDownloadPdf} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Download PDF</button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Share with patient</button>
            </div>
          </div>

          {/* Patient Header */}
          <div className="bg-blue-700 text-white rounded-xl p-5 mb-6">
            <h2 className="text-xl font-bold mb-3">{patient.name}</h2>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div><span className="text-blue-200 uppercase tracking-wide block mb-0.5">Gender</span>{patient.gender}</div>
              <div><span className="text-blue-200 uppercase tracking-wide block mb-0.5">DOB</span>{appPatient ? formatDobEthiopian(appPatient.dateOfBirth) : '—'}</div>
              <div><span className="text-blue-200 uppercase tracking-wide block mb-0.5">Phone</span>{appPatient?.phone ?? '—'}</div>
              <div><span className="text-blue-200 uppercase tracking-wide block mb-0.5">MRN</span>{patient.mrn}</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <tbody className="divide-y divide-slate-100">

                {/* History & Symptoms */}
                <tr className="border-b border-slate-200">
                  <SectionHeader>History<br/>And<br/>Symptoms</SectionHeader>
                  <td className="p-0">
                    <table className="w-full border-collapse">
                      <tbody>
                        <Row label="Reason For Visit" value={patient.reasonForVisit || '—'} />
                        {s.symptoms?.length > 0 && (
                          <tr className="border-b border-slate-100">
                            <td className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50/50 w-48 border-r border-slate-200">Symptomatic History</td>
                            <td className="px-3 py-2">
                              <table className="w-full text-xs">
                                <thead><tr className="text-[10px] font-bold uppercase text-slate-400">
                                  <th className="pr-4 py-1 text-left">Symptom</th>
                                  <th className="pr-4 py-1 text-left">Eye</th>
                                  <th className="pr-4 py-1 text-left">Since</th>
                                  <th className="pr-4 py-1 text-left">Frequency</th>
                                  <th className="py-1 text-left">Severity</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                  {s.symptoms.map(sym => (
                                    <tr key={sym.id}>
                                      <td className="pr-4 py-1.5">{sym.name}</td>
                                      <td className="pr-4 py-1.5">{sym.eye}</td>
                                      <td className="pr-4 py-1.5">{sym.since || (sym.durationValue ? `${sym.durationValue} ${sym.durationUnit}` : '—')}</td>
                                      <td className="pr-4 py-1.5">{sym.frequency}</td>
                                      <td className="py-1.5">{sym.severity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                        {activeOcular.length > 0 && (
                          <Row label="Ocular History" value={activeOcular.map(([k,v]) => `${k.replace(/([A-Z])/g,' $1').trim()}: ${(v as any).eye}`).join(' · ')} />
                        )}
                        {s.ocularHistory?.generalRemarks && (
                          <tr className="border-b border-slate-100">
                            <td className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-50/50 border-r border-slate-200 align-middle"><span className="flex items-center gap-1">○ Remarks</span></td>
                            <td className="px-3 py-1.5 text-sm text-slate-600 italic">{s.ocularHistory.generalRemarks}</td>
                          </tr>
                        )}
                        {activeSystemic.length > 0 && (
                          <Row label="Systemic History" value={activeSystemic.map(([k,v]: any) => `${v.type || k.replace(/([A-Z])/g,' $1').replace(/_/g,' ').trim()}${v.dateOfDiagnosis ? ` (dx: ${v.dateOfDiagnosis})` : ''}`).join(', ')} />
                        )}
                        {s.patientMedications?.length > 0 && (
                          <Row label="Medication" value={s.patientMedications.map(m => `${m.drugName} ${m.dosage}`).join(', ') || '—'} />
                        )}
                        {s.spectaclesHistory?.currentlyWears && (
                          <Row label="Spectacles" value={`${s.spectaclesHistory.type} — ${s.spectaclesHistory.material}${s.spectaclesHistory.coating?.length ? ', '+s.spectaclesHistory.coating.join(', ') : ''}`} />
                        )}
                        {s.lifestyleDemands?.occupation && (
                          <Row label="Lifestyle" value={`Occupation: ${s.lifestyleDemands.occupation}`} />
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Vision & VA */}
                {(() => {
                  const va = s.visualAcuity as any;
                  const hasVa = !!va && (
                    (va.unaidedOd || va.unaidedOs) ||
                    (va.od?.dist?.unaided || va.od?.dist?.aided || va.od?.dist?.pinhole) ||
                    (va.os?.dist?.unaided || va.os?.dist?.aided || va.os?.dist?.pinhole)
                  );
                  if (!hasVa) return null;
                  return (
                  <tr className="border-b border-slate-200">
                    <SectionHeader>Vision And<br/>Visual Acuity</SectionHeader>
                    <td className="p-0">
                      <table className="w-full border-collapse text-xs">
                        <thead><tr className="bg-slate-50/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                          <th className="px-3 py-2 text-left w-48"></th>
                          <th className="px-3 py-2 text-center">Unaided</th>
                          <th className="px-3 py-2 text-center">Aided</th>
                          <th className="px-3 py-2 text-center">Pinhole</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                          {[
                            ['RIGHT EYE (O.D)', vaValDisp(va, 'od')],
                            ['LEFT EYE (O.S)', vaValDisp(va, 'os')],
                          ].map(([label, vals]) => (
                            <tr key={label as string}>
                              <td className="px-3 py-2 text-xs font-semibold text-slate-500">{label}</td>
                              {(vals as string[]).map((v, i) => <td key={i} className="px-3 py-2 text-center text-slate-700">{v || '—'}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  );
                })()}

                {/* Refraction */}
                {s.refraction && (s.refraction.odSph || s.refraction.osSph) && (
                  <tr className="border-b border-slate-200">
                    <SectionHeader>Spectacle<br/>Prescription</SectionHeader>
                    <td className="p-0">
                      <table className="w-full border-collapse text-xs">
                        <thead><tr className="bg-slate-50/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                          <th className="px-3 py-2 text-left" colSpan={2}></th>
                          {['Sphere','Cyl','Axis','Prism','Base','VA'].map(h => <th key={h} className="px-3 py-2 text-center">{h}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                          {[
                            ['RIGHT EYE\n(O.D)','Distance',s.refraction.odSph,s.refraction.odCyl,s.refraction.odAxis,'—','—',s.refraction.odVa],
                            ['','Near',s.refraction.odAdd||'—',s.refraction.odCyl,'—','—','—','—'],
                            ['LEFT EYE\n(O.S)','Distance',s.refraction.osSph,s.refraction.osCyl,s.refraction.osAxis,'—','—',s.refraction.osVa],
                            ['','Near',s.refraction.osAdd||'—',s.refraction.osCyl,'—','—','—','—'],
                          ].map(([eye,dist,...vals],i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-xs font-bold text-slate-500 whitespace-pre-line align-middle w-24">{eye}</td>
                              <td className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase bg-slate-50/50 w-24">{dist}</td>
                              {vals.map((v,j) => <td key={j} className="px-3 py-2 text-center text-slate-700">{v||'—'}</td>)}
                            </tr>
                          ))}
                          <tr className="bg-slate-50/40">
                            <td colSpan={2} className="px-3 py-1.5 text-xs font-bold text-slate-500">IPD</td>
                            <td colSpan={3} className="px-3 py-1.5 text-sm text-center">{s.refraction.pdBinocular ? `${s.refraction.pdBinocular} mm` : '—'}</td>
                            <td colSpan={2} className="px-3 py-1.5 text-xs font-bold text-slate-500 text-center">BVD</td>
                            <td className="px-3 py-1.5 text-sm text-center">{s.refraction.bvdMm ? `${s.refraction.bvdMm} mm` : '—'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}

                {/* Final Spectacle Prescription */}
                {(() => {
                  const fsp = (s.sectionData['final-spectacle-prescription'] as any) ?? null;
                  if (!fsp || !fsp.showInDischarge) return null;
                  const rx = fsp.rx ?? {};
                  const hasVal = (r?: any) => !!r && [r.sph, r.cyl, r.axis, r.prism, r.va, r.base].some((v: any) => v && String(v).trim() !== '' && String(v) !== '-');
                  const rows = [
                    ['RIGHT EYE (O.D)', 'DISTANCE', rx.odDist],
                    ['', 'NEAR', rx.odNear],
                    ['', 'INTERMEDIATE', rx.odInter],
                    ['LEFT EYE (O.S)', 'DISTANCE', rx.osDist],
                    ['', 'NEAR', rx.osNear],
                    ['', 'INTERMEDIATE', rx.osInter],
                  ];
                  const show = rows.some(([, , r]) => hasVal(r)) || !!(fsp.ipd || fsp.bvd || fsp.remarks);
                  if (!show) return null;
                  return (
                    <tr className="border-b border-slate-200">
                      <SectionHeader>Final Spectacle<br/>Prescription</SectionHeader>
                      <td className="p-0">
                        <table className="w-full border-collapse text-xs">
                          <thead><tr className="bg-slate-50/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                            <th className="px-3 py-2 text-left w-28"></th>
                            <th className="px-3 py-2 text-left w-24"></th>
                            {['Sphere','Cyl','Axis','Prism','Base','VA'].map(h => <th key={h} className="px-3 py-2 text-center">{h}</th>)}
                          </tr></thead>
                          <tbody className="divide-y divide-slate-50">
                            {rows.map(([eye, dist, r], i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-xs font-bold text-slate-500 whitespace-pre-line align-middle w-28">{eye}</td>
                                <td className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase bg-slate-50/50 w-24">{dist}</td>
                                {['sph','cyl','axis','prism','base','va'].map(k => (
                                  <td key={k} className="px-3 py-2 text-center text-slate-700">{(r?.[k] && String(r[k]) !== '-' && String(r[k]).trim() !== '') ? r[k] : '—'}</td>
                                ))}
                              </tr>
                            ))}
                            <tr className="bg-slate-50/40">
                              <td colSpan={2} className="px-3 py-1.5 text-xs font-bold text-slate-500">IPD</td>
                              <td colSpan={2} className="px-3 py-1.5 text-sm text-center">{fsp.ipd ? `${fsp.ipd} mm` : '—'}</td>
                              <td colSpan={2} className="px-3 py-1.5 text-xs font-bold text-slate-500 text-center">BVD</td>
                              <td className="px-3 py-1.5 text-sm text-center">{fsp.bvd ? `${fsp.bvd} mm` : '—'}</td>
                            </tr>
                          </tbody>
                        </table>
                        {fsp.remarks && <div className="px-3 py-2 text-sm text-slate-600 italic">Remarks: {fsp.remarks}</div>}
                      </td>
                    </tr>
                  );
                })()}

                {/* Final Contact Lens Specification */}
                {(() => {
                  const fcl = (s.sectionData['final-contact-lens-specification'] as any) ?? null;
                  if (!fcl || !fcl.showInDischarge) return null;
                  const od = fcl.od ?? {};
                  const os = fcl.os ?? {};
                  const hasVal = (v?: any) => !!v && String(v).trim() !== '';
                  const cells = [
                    ['Base Curve (mm)', od.bc, os.bc],
                    ['Diameter (mm)', od.dia, os.dia],
                    ['Sphere (D)', od.sph, os.sph],
                    ['Cylinder (D)', od.cyl, os.cyl],
                    ['Axis (°)', od.axis, os.axis],
                    ['Addition (D)', od.add, os.add],
                    ['Visual Acuity', od.va, os.va],
                  ];
                  const show = [fcl.clType, fcl.brand, fcl.modality, fcl.material, fcl.solution, fcl.wearingSchedule, fcl.reviewDate, fcl.remarks]
                    .some(hasVal) || cells.some(([, o, l]) => hasVal(o) || hasVal(l));
                  if (!show) return null;
                  return (
                    <tr className="border-b border-slate-200">
                      <SectionHeader>Final Contact Lens<br/>Specification</SectionHeader>
                      <td className="p-0">
                        <table className="w-full border-collapse text-xs">
                          <thead><tr className="bg-slate-50/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                            <th className="px-3 py-2 text-left w-44">Parameter</th>
                            <th className="px-3 py-2 text-center">Right Eye (OD)</th>
                            <th className="px-3 py-2 text-center">Left Eye (OS)</th>
                          </tr></thead>
                          <tbody className="divide-y divide-slate-50">
                            {cells.map(([label, o, l], i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-xs font-semibold text-slate-500">{label}</td>
                                <td className="px-3 py-2 text-center text-slate-700">{hasVal(o) ? o : '—'}</td>
                                <td className="px-3 py-2 text-center text-slate-700">{hasVal(l) ? l : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <table className="w-full border-collapse text-xs">
                          <tbody>{[
                            ['CL Type', fcl.clType], ['Brand / Product', fcl.brand], ['Modality', fcl.modality], ['Material', fcl.material],
                            ['Solution', fcl.solution], ['Wearing Schedule', fcl.wearingSchedule], ['Review Date', fcl.reviewDate],
                          ].map(([label, val]) => (
                            <Row key={label as string} label={label as string} value={hasVal(val) ? val : '—'} />
                          ))}</tbody>
                        </table>
                        {fcl.remarks && <div className="px-3 py-2 text-sm text-slate-600 italic">Remarks: {fcl.remarks}</div>}
                      </td>
                    </tr>
                  );
                })()}

                {/* Spectacle Dispensing */}
                {(() => {
                  const sd = (s.sectionData['spectacle-dispensing'] as any) ?? null;
                  if (!sd || !sd.showInDischarge) return null;
                  const hasVal = (v?: any) => !!v && String(v).trim() !== '';
                  const show = [
                    sd.frameType, sd.frameBrand, sd.frameRef, sd.lensType, sd.lensMaterial, sd.lensBrand,
                    ...(sd.coatings ?? []), sd.rightPd, sd.leftPd, sd.heightOd, sd.heightOs,
                    sd.orderRef, sd.labName, sd.dispatchDate, sd.collectionMethod, sd.price, sd.advancePaid, sd.remarks,
                  ].some(hasVal);
                  if (!show) return null;
                  const m = (v: any) => hasVal(v) ? v : '—';
                  return (
                    <tr className="border-b border-slate-200">
                      <SectionHeader>Spectacle<br/>Dispensing</SectionHeader>
                      <td className="p-0">
                        <table className="w-full border-collapse text-xs">
                          <tbody>
                            <Row label="Frame Type" value={m(sd.frameType)} />
                            <Row label="Frame Brand / Model" value={m(sd.frameBrand)} />
                            <Row label="Frame Reference / Code" value={m(sd.frameRef)} />
                            <Row label="Lens Type" value={m(sd.lensType)} />
                            <Row label="Lens Material" value={m(sd.lensMaterial)} />
                            <Row label="Lens Brand / Lab" value={m(sd.lensBrand)} />
                            <Row label="Coatings" value={(sd.coatings ?? []).filter(hasVal).join(', ') || '—'} />
                            {(hasVal(sd.rightPd) || hasVal(sd.leftPd)) && <Row label="PD (OD / OS)" value={`${m(sd.rightPd)} / ${m(sd.leftPd)} mm`} />}
                            {(hasVal(sd.heightOd) || hasVal(sd.heightOs)) && <Row label="Seg Height" value={`${m(sd.heightOd)} / ${m(sd.heightOs)} mm`} />}
                            <Row label="Order Reference" value={m(sd.orderRef)} />
                            <Row label="Lab / Supplier" value={m(sd.labName)} />
                            <Row label="Expected Dispatch" value={m(sd.dispatchDate)} />
                            <Row label="Collection Method" value={m(sd.collectionMethod)} />
                            <Row label="Total Price" value={m(sd.price)} />
                            <Row label="Advance Paid" value={m(sd.advancePaid)} />
                          </tbody>
                        </table>
                        {sd.remarks && <div className="px-3 py-2 text-sm text-slate-600 italic">Remarks: {sd.remarks}</div>}
                      </td>
                    </tr>
                  );
                })()}

                {/* Tonometry */}
                {s.tonometry && (s.tonometry.odIop || s.tonometry.osIop) && (
                  <tr className="border-b border-slate-200">
                    <SectionHeader>Additional<br/>Tests</SectionHeader>
                    <td className="p-0">
                      <table className="w-full border-collapse text-xs">
                        <tbody className="divide-y divide-slate-50">
                          <Row label="Tonometry — Instrument" value={s.tonometry.method} />
                          <Row label="Right Eye IOP" value={s.tonometry.odIop ? `${s.tonometry.odIop} mmHg` : '—'} />
                          <Row label="Left Eye IOP" value={s.tonometry.osIop ? `${s.tonometry.osIop} mmHg` : '—'} />
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}

                {/* Diagnoses */}
                {s.diagnoses?.length > 0 && (
                  <tr className="border-b border-slate-200">
                    <SectionHeader>Assessment</SectionHeader>
                    <td className="px-3 py-3 text-sm text-slate-700">
                      {s.diagnoses.map((d,i) => <div key={i}>{d.title} ({d.eye}){d.notes ? ` — ${d.notes}` : ''}</div>)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Extra remarks */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-[#2563eb] mb-3">Remarks</h3>
            <textarea rows={4} value={(s.sectionData['discharge-summary'] as any)?.extraRemarks ?? ''}
              onChange={e => s.setSectionData('discharge-summary', { ...(s.sectionData['discharge-summary'] ?? {}), extraRemarks: e.target.value })}
              placeholder="Add any additional remarks..."
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none" />
          </div>

          {/* Doctor signature */}
          <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-5">
            <div />
            <div className="text-right text-sm">
              <p className="font-bold text-slate-800">Senior Optometrist, PECC</p>
              <p className="text-slate-600">Dr. Tarekegn</p>
              <p className="text-slate-500 text-xs">Selihome Ophthalmic Medium Clinic</p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={handleDownloadPdf} className="px-4 py-2 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};
