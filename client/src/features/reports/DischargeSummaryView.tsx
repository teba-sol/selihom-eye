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

// helper: dash for empty
function dash(v: any): string {
  return v === undefined || v === null || String(v).trim() === '' ? '—' : String(v);
}

// OD/OS two-byte display row
function EyeRow({ label, od, os, unit }: { label: string; od?: string; os?: string; unit?: string }) {
  return (
    <Row
      label={label}
      value={<span><span className="font-medium">OD</span> {dash(od)}{unit ? ` ${unit}` : ''} &nbsp;·&nbsp; <span className="font-medium">OS</span> {dash(os)}{unit ? ` ${unit}` : ''}</span>}
    />
  );
}

// Value row that hides itself if the value is empty
function KV({ label, value }: { label: string; value: any }) {
  const d = dash(value);
  if (d === '—') return null;
  return <Row label={label} value={d} />;
}

// Wrapper: only render a section block if its toggle is ON
function ToggleSection({
  s,
  sectionKey,
  title,
  children,
  extraCondition = true,
}: {
  s: any;
  sectionKey: string;
  title: React.ReactNode;
  children: React.ReactNode;
  extraCondition?: boolean;
}) {
  const on = s.sectionData[sectionKey]?.showInDischarge === true;
  if (!on || !extraCondition) return null;
  return (
    <tr className="border-b border-slate-200">
      <SectionHeader>{title}</SectionHeader>
      <td className="p-0">
        <table className="w-full border-collapse">{children}</table>
      </td>
    </tr>
  );
}

export const DischargeSummaryView: React.FC = () => {
  const s = useEncounterStore();
  const patient = s.patient;
  const appPatient = useAppStore(st => st.getPatientById(patient.id));

  const handleDownloadPdf = () => downloadEncounterPdf(useEncounterStore.getState());

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto overflow-hidden" id="discharge-summary-report">

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
              {/* ================= HISTORY & SYMPTOMS ================= */}
              {(() => {
                const historyToggled = [
                  'reason-for-visit', 'symptomatic-history', 'ocular-history', 'systemic-history',
                  'medication', 'family-ocular-history', 'family-systemic-history', 'spectacles',
                  'contact-lens', 'lifestyle',
                ].some((k) => s.sectionData[k]?.showInDischarge === true);
                if (!historyToggled) return null;
                return (
                <tr className="border-b border-slate-200">
                  <SectionHeader>History<br />And<br />Symptoms</SectionHeader>
                  <td className="p-0">
                    <table className="w-full border-collapse">
                      <tbody>
                        {s.sectionData['reason-for-visit']?.showInDischarge === true && (
                          <Row label="Reason For Visit" value={dash(patient.reasonForVisit || s.sectionData['reason-for-visit']?.remarks)} />
                        )}
                  {s.sectionData['symptomatic-history']?.showInDischarge === true && s.symptoms.length > 0 && (
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
                            {s.symptoms.map((sym, i) => (
                              <tr key={sym.id || i}>
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
                  {s.sectionData['ocular-history']?.showInDischarge === true && (() => {
                    const active = Object.entries(s.ocularHistory?.conditions || {}).filter(([, v]) => (v as any).active);
                    if (active.length === 0) return null;
                    return <Row label="Ocular History" value={active.map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${(v as any).eye}`).join(' · ')} />;
                  })()}
                  {s.sectionData['systemic-history']?.showInDischarge === true && (() => {
                    const active = Object.entries(s.systemicHistory?.conditions || {}).filter(([, v]) => (v as any).active);
                    if (active.length === 0) return null;
                    return <Row label="Systemic History" value={active.map(([, v]: any) => `${v.type || ''}${v.dateOfDiagnosis ? ` (dx: ${v.dateOfDiagnosis})` : ''}`).join(', ')} />;
                  })()}
                  {s.sectionData['medication']?.showInDischarge === true && s.patientMedications.filter((m) => m.showInDischarge !== false).length > 0 && (
                    <Row label="Medication" value={s.patientMedications.filter((m) => m.showInDischarge !== false).map((m) => `${m.drugName} ${m.dosage}${m.frequency ? ` (${m.frequency})` : ''}`).join(', ')} />
                  )}
                  {s.sectionData['family-ocular-history']?.showInDischarge === true && s.familyOcularHistory.filter((f) => f.showInDischarge !== false).length > 0 && (
                    <Row label="Family Ocular History" value={s.familyOcularHistory.filter((f) => f.showInDischarge !== false).map((f) => `${f.condition} (${f.relation})${f.notes ? ` — ${f.notes}` : ''}`).join(' · ')} />
                  )}
                  {s.sectionData['family-systemic-history']?.showInDischarge === true && s.familySystemicHistory.filter((f) => f.showInDischarge !== false).length > 0 && (
                    <Row label="Family Systemic History" value={s.familySystemicHistory.filter((f) => f.showInDischarge !== false).map((f) => `${f.condition} (${f.relation})${f.notes ? ` — ${f.notes}` : ''}`).join(' · ')} />
                  )}
                  {s.sectionData['spectacles']?.showInDischarge === true && s.spectaclesHistory?.currentlyWears && (
                    <Row label="Spectacles" value={`${s.spectaclesHistory.type} — ${s.spectaclesHistory.material}${s.spectaclesHistory.coating?.length ? ', ' + s.spectaclesHistory.coating.join(', ') : ''}`} />
                  )}
                  {s.sectionData['contact-lens']?.showInDischarge === true && s.contactLensHistory?.currentWearer && (
                    <Row label="Contact Lenses" value={`${s.contactLensHistory.modality}${s.contactLensHistory.solutionUsed ? ` — ${s.contactLensHistory.solutionUsed}` : ''}`} />
                  )}
                  {s.sectionData['lifestyle']?.showInDischarge === true && s.lifestyleDemands?.occupation && (
                    <Row label="Lifestyle" value={`Occupation: ${s.lifestyleDemands.occupation}${s.lifestyleDemands.hobbies ? `; Hobbies: ${s.lifestyleDemands.hobbies}` : ''}`} />
                  )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                );
              })()}


              {/* ================= VISION & VISUAL ACUITY ================= */}
              <ToggleSection s={s} sectionKey="vision-and-visual-acuity" title={<>Vision And<br />Visual Acuity</>}>
                <tbody>
                  {(() => {
                    const va = s.visualAcuity as any;
                    const u = (eye: string) => va?.[eye]?.dist ?? {};
                    return (
                      <>
                        <tr className="bg-slate-50/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2 text-center">Unaided</td>
                          <td className="px-3 py-2 text-center">Aided</td>
                          <td className="px-3 py-2 text-center">Pinhole</td>
                        </tr>
                        {[['Right Eye (OD)', u('od')], ['Left Eye (OS)', u('os')]].map(([label, e]) => (
                          <tr key={label as string} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-xs font-semibold text-slate-500 w-28">{label}</td>
                            <td className="px-3 py-2 text-center">{dash(e?.unaided)}</td>
                            <td className="px-3 py-2 text-center">{dash(e?.aided)}</td>
                            <td className="px-3 py-2 text-center">{dash(e?.pinhole)}</td>
                          </tr>
                        ))}
                      </>
                    );
                  })()}
                </tbody>
              </ToggleSection>

              {/* ================= REFRACTION (Spectacle Prescription) ================= */}
              <ToggleSection s={s} sectionKey="objective-subjective" title={<>Spectacle<br />Prescription</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['objective-subjective'] ?? {};
                    const od = f.objOd ?? {}; const os = f.objOs ?? {};
                    const g = (r: any) => `${dash(r.sph)}${r.cyl ? ` / ${r.cyl}` : ''}${r.axis ? ` ×${r.axis}` : ''}${r.va ? ` VA ${r.va}` : ''}`;
                    return (
                      <Row label="Objective Refraction" value={<div><div><span className="font-medium">OD</span> {g(od)}</div><div><span className="font-medium">OS</span> {g(os)}</div></div>} />
                    );
                  })()}
                  {(() => {
                    const f = s.sectionData['objective-subjective'] ?? {};
                    const so = f.subjOd ?? {}; const ss = f.subjOs ?? {};
                    const g = (r: any) => `${dash(r.sph)}${r.cyl ? ` / ${r.cyl}` : ''}${r.axis ? ` ×${r.axis}` : ''}${r.va ? ` VA ${r.va}` : ''}`;
                    const has = Object.keys(so).length || Object.keys(ss).length;
                    if (!has) return null;
                    return <Row label="Subjective Refraction" value={<div><div><span className="font-medium">OD</span> {g(so)}</div><div><span className="font-medium">OS</span> {g(ss)}</div></div>} />;
                  })()}
                </tbody>
              </ToggleSection>

              {/* ================= ADDITIONAL TESTS ================= */}
              <ToggleSection s={s} sectionKey="tonometry" title={<>Tonometry</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['tonometry'] ?? {};
                    return <><KV label="Instrument" value={f.instrument} /><EyeRow label="IOP" od={f.rightEye} os={f.leftEye} unit="mmHg" /><KV label="Time" value={f.timeOfMeasurement} /></>;
                  })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="amsler" title={<>Amsler</>}>
                <tbody>
                  {(() => { const f = s.sectionData['amsler'] ?? {}; return <><KV label="Chart" value={f.chartType} /><EyeRow label="Result" od={f.rightEyeResult} os={f.leftEyeResult} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="colour-vision" title={<>Colour<br />Vision</>}>
                <tbody>
                  {(() => { const f = s.sectionData['colour-vision'] ?? {}; return <><KV label="Test" value={f.testType} /><EyeRow label="Score" od={f.rightEyeScore} os={f.leftEyeScore} /><KV label="Interpretation" value={f.interpretation} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="contrast-sensitivity" title={<>Contrast<br />Sensitivity</>}>
                <tbody>
                  {(() => { const f = s.sectionData['contrast-sensitivity'] ?? {}; return <><KV label="Chart" value={f.chart} /><EyeRow label="Log CS" od={f.logCsOd} os={f.logCsOs} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="gonioscopy" title={<>Gonioscopy</>}>
                <tbody>
                  {(() => { const f = s.sectionData['gonioscopy'] ?? {}; return <><KV label="Lens" value={f.lensType} /><EyeRow label="Angle" od={f.angleOd} os={f.angleOs} /><KV label="PAS" value={f.pas} /><KV label="Pigmentation" value={f.pigmentation} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="pachymetry" title={<>Pachymetry</>}>
                <tbody>
                  {(() => { const f = s.sectionData['pachymetry'] ?? {}; return <><KV label="Device" value={f.device} /><EyeRow label="CCT" od={f.cct?.od} os={f.cct?.os} unit="µm" /><EyeRow label="Thinnest" od={f.thinnest?.od} os={f.thinnest?.os} unit="µm" /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="topography" title={<>Topography</>}>
                <tbody>
                  {(() => { const f = s.sectionData['topography'] ?? {}; return <><KV label="Device" value={f.device} /><KV label="Type" value={f.topoType} /><EyeRow label="K Max" od={f.kMaxOd} os={f.kMaxOs} /><EyeRow label="Pupil Size" od={f.pupilSizeOd} os={f.pupilSizeOs} unit="mm" /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="tear-film" title={<>Tear Film</>}>
                <tbody>
                  {(() => { const f = s.sectionData['tear-film'] ?? {}; return <><EyeRow label="Schirmer I" od={f.schirmer1?.od} os={f.schirmer1?.os} unit="mm" /><EyeRow label="Schirmer II" od={f.schirmer2?.od} os={f.schirmer2?.os} unit="mm" /><EyeRow label="TBUT" od={f.tbut?.od} os={f.tbut?.os} unit="sec" /><EyeRow label="NIBUT" od={f.nibut?.od} os={f.nibut?.os} unit="sec" /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="crystalline-lens" title={<>Crystalline<br />Lens</>}>
                <tbody>
                  {(() => { const f = s.sectionData['crystalline-lens'] ?? {}; return <><KV label="Instrument" value={f.instrument} /><KV label="Mydriatic" value={f.mydriaticDrug} /><KV label="OD" value={JSON.stringify(f.odObs ?? {})} /><KV label="OS" value={JSON.stringify(f.osObs ?? {})} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="anterior-segment-eval" title={<>Anterior<br />Segment</>}>
                <tbody>
                  {(() => { const f = s.sectionData['anterior-segment-eval'] ?? {}; return <><KV label="Instrument" value={f.instrument} /><KV label="Findings" value={f.findingsText ?? ''} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="posterior-segment" title={<>Posterior<br />Segment</>}>
                <tbody>
                  {(() => { const f = s.sectionData['posterior-segment'] ?? {}; return <><KV label="Instrument" value={f.instrument} /><KV label="Mydriatic" value={f.mydriaticDrug} /><EyeRow label="C/D Ratio" od={f.cdr?.od} os={f.cdr?.os} /></>; })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="binocular-vision-assessment" title={<>Binocular<br />Vision</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['binocular-vision-assessment'] ?? {};
                    return (
                      <>
                        <EyeRow label="Worth 4 Dot" od={f.w4dDist} os={f.w4dNear} />
                        <Row label="Cover Test Distance" value={f.coverTestDistance ? `${dash(f.coverTestDistance)}${f.prismDist ? ` (${f.prismDist}Δ)` : ''}` : '—'} />
                        <Row label="Cover Test Near" value={f.coverTestNear ? `${dash(f.coverTestNear)}${f.prismNear ? ` (${f.prismNear}Δ)` : ''}` : '—'} />
                        <EyeRow label="AOA" od={f.aoaOd} os={f.aoaOs} />
                        <EyeRow label="NPC" od={f.npcBreak} os={f.npcRecovery} unit="cm" />
                        <KV label="Motility" value={f.motilityResult} />
                        <KV label="Direct Reflex" value={f.directReflex} />
                        <KV label="RAPD" value={f.rapdStatus} />
                        <KV label="Stereopsis" value={f.stereopsisTest ? `${f.stereopsisTest}${f.stereoSeconds ? ` (${f.stereoSeconds}")` : ''}` : ''} />
                      </>
                    );
                  })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="worth-4-dot" title={<>Worth<br />4 Dot</>}>
                <tbody><Row label="Result" value={dash(s.sectionData['worth-4-dot']?.selected)} /></tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="stereopsis" title={<>Stereopsis</>}>
                <tbody>{(() => { const f = s.sectionData['stereopsis'] ?? {}; return <><KV label="Test" value={f.testType} /><KV label="Arc Seconds" value={f.arcSec} /></>; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="ocular-motility" title={<>Motility</>}>
                <tbody><Row label="Result" value={dash(s.sectionData['ocular-motility']?.selected)} /></tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="near-point-of-convergence" title={<>NPC</>}>
                <tbody>{(() => { const f = s.sectionData['near-point-of-convergence'] ?? {}; return <><EyeRow label="Break" od={f.breakCm} os={f.recoveryCm} unit="cm" /></>; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="hess-screen" title={<>Hess<br />Screen</>}>
                <tbody>{(() => { const f = s.sectionData['hess-screen'] ?? {}; return <><KV label="Underaction" value={f.underaction} /><KV label="Overaction" value={f.overaction} /></>; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="amplitude-of-accommodation" title={<>Amplitude<br />Accommodation</>}>
                <tbody>{(() => { const f = s.sectionData['amplitude-of-accommodation'] ?? {}; return <EyeRow label="AA" od={f.od} os={f.os} unit="D" />; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="accommodative-facility" title={<>Accom.<br />Facility</>}>
                <tbody>{(() => { const f = s.sectionData['accommodative-facility'] ?? {}; return <EyeRow label="Facility" od={f.od} os={f.os} unit="cpm" />; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="accommodative-lag" title={<>Accom.<br />Lag</>}>
                <tbody>{(() => { const f = s.sectionData['accommodative-lag'] ?? {}; return <EyeRow label="Lag" od={f.od} os={f.os} unit="D" />; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="relative-accommodation" title={<>Relative<br />Accommodation</>}>
                <tbody>{(() => { const f = s.sectionData['relative-accommodation'] ?? {}; return <><EyeRow label="NRA" od={f.nraOd} os={f.nraOs} unit="D" /><EyeRow label="PRA" od={f.praOd} os={f.praOs} unit="D" /></>; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="aca-ratio" title={<>AC/A<br />Ratio</>}>
                <tbody>{(() => { const f = s.sectionData['aca-ratio'] ?? {}; return <><KV label="Method" value={f.method} /><KV label="IPD" value={f.ipd} /><KV label="Distance Phoria" value={f.distPhoria} /><KV label="Near Phoria" value={f.nearPhoria} /><KV label="AC/A" value={f.acaCalculated} /><KV label="Interpretation" value={f.interpretation} /></>; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="diplopia-charting" title={<>Diplopia<br />Charting</>}>
                <tbody>{(() => { const f = s.sectionData['diplopia-charting'] ?? {}; return <KV label="Type" value={f.type} />; })()}</tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="fusional-vergences" title={<>Fusional<br />Vergences</>}>
                <tbody><Row label="Fusional Vergences" value={dash((s.sectionData['fusional-vergences'] as any)?.remarks)} /></tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="ocular-motor-balance" title={<>Ocular<br />Motor Balance</>}>
                <tbody><Row label="Ocular Motor Balance" value={dash((s.sectionData['ocular-motor-balance'] as any)?.remarks)} /></tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="pupil-evaluation" title={<>Pupil<br />Evaluation</>}>
                <tbody>{(() => { const f = s.sectionData['pupil-evaluation'] ?? {}; return <KV label="Findings" value={f.checked} />; })()}</tbody>
              </ToggleSection>

              {/* ================= CYCLOPLEGIC ================= */}
              <ToggleSection s={s} sectionKey="cycloplegic" title={<>Cycloplegic<br />Refraction</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['cycloplegic'] ?? {};
                    const g = (r: any) => `${dash(r?.sph)}${r?.cyl ? ` / ${r.cyl}` : ''}${r?.axis ? ` ×${r.axis}` : ''}${r?.va ? ` VA ${r.va}` : ''}`;
                    return <Row label="Cycloplegic" value={<div><div><span className="font-medium">OD</span> {g(f.cycloOd)}</div><div><span className="font-medium">OS</span> {g(f.cycloOs)}</div></div>} />;
                  })()}
                </tbody>
              </ToggleSection>

              {/* ================= CL FITTING / PRE-FIT ================= */}
              <ToggleSection s={s} sectionKey="cl-fitting" title={<>Contact Lens<br />Fitting</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['cl-fitting'] ?? {};
                    const g = (r: any) => r ? `BC ${dash(r.bc)} / DIA ${dash(r.dia)} / SPH ${dash(r.sph)}${r.cyl ? ` CYL ${r.cyl}` : ''}` : '—';
                    return <><KV label="Type" value={f.clType} /><KV label="Brand" value={f.brand} /><Row label="OD Rx" value={g(f.odRx)} /><Row label="OS Rx" value={g(f.osRx)} /><KV label="Comfort" value={f.comfort} /><KV label="Wearing Time" value={f.wearingTime} /><KV label="Follow-up" value={f.followUp} /></>;
                  })()}
                </tbody>
              </ToggleSection>
              <ToggleSection s={s} sectionKey="cl-pre-fit" title={<>Contact Lens<br />Pre-Fit</>}>
                <tbody>
                  {(() => {
                    const f = s.sectionData['cl-pre-fit'] ?? {};
                    const g = (r: any) => r ? `K1 ${dash(r.k1)} / K2 ${dash(r.k2)}${r.axis ? ` ×${r.axis}` : ''}` : '—';
                    return <><KV label="Indication" value={f.indication} /><KV label="Previous CL" value={f.previousCL} /><KV label="Corneal Shape" value={f.cornealShape} /><KV label="Tear Quality" value={f.tearQuality} /><Row label="OD K" value={g(f.od)} /><Row label="OS K" value={g(f.os)} /></>;
                  })()}
                </tbody>
              </ToggleSection>

              {/* ================= FINAL SPECTACLE PRESCRIPTION ================= */}
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

              {/* ================= FINAL CONTACT LENS SPECIFICATION ================= */}
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

              {/* ================= SPECTACLE DISPENSING ================= */}
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
                          <Row label="Lens Type" value={m(sd.lensType)} />
                          <Row label="Lens Material" value={m(sd.lensMaterial)} />
                          <Row label="Coatings" value={(sd.coatings ?? []).filter(hasVal).join(', ') || '—'} />
                          {(hasVal(sd.rightPd) || hasVal(sd.leftPd)) && <Row label="PD (OD / OS)" value={`${m(sd.rightPd)} / ${m(sd.leftPd)} mm`} />}
                          <Row label="Lab / Supplier" value={m(sd.labName)} />
                          <Row label="Collection Method" value={m(sd.collectionMethod)} />
                          <Row label="Total Price" value={m(sd.price)} />
                        </tbody>
                      </table>
                      {sd.remarks && <div className="px-3 py-2 text-sm text-slate-600 italic">Remarks: {sd.remarks}</div>}
                    </td>
                  </tr>
                );
              })()}

              {/* ================= ASSESSMENT & PLAN / DISCHARGE ITEMS ================= */}
              <ToggleSection s={s} sectionKey="assessment-plan" title={<>Assessment<br />& Plan</>}>
                <tbody>
                  {(() => {
                    const p = s.sectionData['assessment-plan'] ?? {};
                    const dx = Array.isArray(p.selectedDiagnoses) ? p.selectedDiagnoses : [];
                    return (
                      <>
                        {dx.length > 0 && <Row label="Diagnosis" value={dx.join(', ')} />}
                        <KV label="Plan Type" value={p.planType} />
                        <KV label="Plan Details" value={p.planDetails} />
                        <KV label="Follow-up Interval" value={p.followUp} />
                      </>
                    );
                  })()}
                </tbody>
              </ToggleSection>

              <ToggleSection s={s} sectionKey="referral" title={<>Referral</>}>
                <tbody>
                  {(() => {
                    const r = s.sectionData['referral'] ?? {};
                    const reasons = Array.isArray(r.selectedReasons) ? r.selectedReasons : [];
                    return (
                      <>
                        <KV label="Type" value={r.referralType === 'co-management' ? 'Co-Management' : 'Referral'} />
                        {reasons.length > 0 && <Row label="Reason / Purpose" value={reasons.join(', ')} />}
                        <KV label="Doctor" value={r.referringDoctor} />
                        <KV label="Facility" value={r.facility} />
                        <KV label="Priority" value={r.priority} />
                        <KV label="Clinical Summary" value={r.clinicalSummary} />
                        <KV label="Additional Notes" value={r.additionalNotes} />
                      </>
                    );
                  })()}
                </tbody>
              </ToggleSection>

              {/* ================= ACTION & ADVICE (Medications + Follow-up) ================= */}
              <ToggleSection s={s} sectionKey="action-and-advice" title={<>Action &<br />Advice</>}>
                <tbody>
                  {(() => {
                    const a = s.sectionData['action-and-advice'] ?? {};
                    return (
                      <>
                        <KV label="Prescribed Medication" value={a.medicationName ? `${a.medicationName}${a.medicationFreq ? ` (${a.medicationFreq})` : ''}` : ''} />
                        <KV label="Spectacle Recommendation" value={a.spectacleRecommendation} />
                        <KV label="Referral" value={a.referral} />
                        <KV label="Urgency" value={a.urgency} />
                        <KV label="Follow-up Period" value={a.followUpPeriod} />
                      </>
                    );
                  })()}
                </tbody>
              </ToggleSection>

              {/* Top-level diagnoses; gates on assessment-plan toggle OR diagnoses themselves */}
              {s.diagnoses?.length > 0 && (() => {
                const p = (s.sectionData['assessment-plan'] as any) ?? {};
                const include = p.showInDischarge === true || s.sectionData['diagnoses']?.showInDischarge === true;
                if (!include) return null;
                return (
                  <tr className="border-b border-slate-200">
                    <SectionHeader>Diagnosis</SectionHeader>
                    <td className="px-3 py-3 text-sm text-slate-700">
                      {s.diagnoses.map((d, i) => <div key={i}>{d.title} ({d.eye}){d.notes ? ` — ${d.notes}` : ''}</div>)}
                    </td>
                  </tr>
                );
              })()}
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
