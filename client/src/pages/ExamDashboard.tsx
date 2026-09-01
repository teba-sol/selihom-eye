import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { AsiraSidebar, ASIRA_EXAM_TREE } from '../components/AsiraSidebar';
import { ReasonForVisitView } from '../features/ReasonForVisitView';
import { SymptomaticHistoryView } from '../features/SymptomaticHistoryView';
import { OcularHistoryView } from '../features/OcularHistoryView';
import { SystemicHistoryView } from '../features/SystemicHistoryView';
import { MedicationView } from '../features/MedicationView';
import { FamilyOcularHistoryView } from '../features/FamilyOcularHistoryView';
import { FamilySystemicHistoryView } from '../features/FamilySystemicHistoryView';
import { SpectaclesView } from '../features/SpectaclesView';
import { ContactLensView } from '../features/ContactLensView';
import { ClPreFitView } from '../features/ClPreFitView';
import { ClFittingView } from '../features/ClFittingView';
import { LifestyleView } from '../features/LifestyleView';
import { VisionAndVisualAcuityView } from '../features/VisionAndVisualAcuityView';
import { RefractionView } from '../features/RefractionView';
import { SubjectiveRefractionView } from '../features/SubjectiveRefractionView';
import { CycloplegicView } from '../features/CycloplegicView';
import { BinocularVisionView } from '../features/BinocularVisionView';
import { Worth4DotView } from '../features/binocular/Worth4DotView';
import { OcularMotorBalanceView } from '../features/binocular/OcularMotorBalanceView';
import { NpcView } from '../features/binocular/NpcView';
import { MotilityView } from '../features/binocular/MotilityView';
import { PupilView } from '../features/binocular/PupilView';
import { AccommodationView } from '../features/binocular/AccommodationView';
import { StereopsisView } from '../features/binocular/StereopsisView';
import { AccommodativeLagView } from '../features/binocular/AccommodativeLagView';
import { AccommodativeFacilityView } from '../features/binocular/AccommodativeFacilityView';
import { RelativeAccommodationView } from '../features/binocular/RelativeAccommodationView';
import { FusionalVergencesView } from '../features/binocular/FusionalVergencesView';
import { DipliopiaChartingView } from '../features/binocular/DipliopiaChartingView';
import { HessScreenView } from '../features/binocular/HessScreenView';
import { AcaRatioView } from '../features/binocular/AcaRatioView';
import { AnteriorSegmentEvaluationView } from '../features/AnteriorSegmentEvaluationView';
import { CrystallineLensView } from '../features/CrystallineLensView';
import { PosteriorSegmentEvaluationView } from '../features/PosteriorSegmentEvaluationView';
import { TearFilmEvaluationView } from '../features/TearFilmEvaluationView';
import { ColourVisionView } from '../features/additional/ColourVisionView';
import { TonometryView } from '../features/additional/TonometryView';
import { PachymetryView } from '../features/additional/PachymetryView';
import { GonioscopyView } from '../features/additional/GonioscopyView';
import { AmslerView } from '../features/additional/AmslerView';
import { ContrastSensitivityView } from '../features/additional/ContrastSensitivityView';
import { TopographyView } from '../features/TopographyView';
import { AssessmentPlanView } from '../features/AssessmentPlanView';
import { ReferralView } from '../features/ReferralView';
import { ActionAndAdviceView } from '../features/ActionAndAdviceView';
import { FinalSpectaclePrescriptionView } from '../features/reports/FinalSpectaclePrescriptionView';
import { FinalContactLensSpecificationView } from '../features/reports/FinalContactLensSpecificationView';
import { DischargeSummaryView } from '../features/reports/DischargeSummaryView';
import { SpectacleDispensingView } from '../features/reports/SpectacleDispensingView';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAppStore, type Patient } from '../store/useAppStore';
import { useExamLoader } from '../hooks/useExamLoader';
import { useAutosave } from '../hooks/useAutoSave';
import { VisitContextBanner } from '../components/VisitContextBanner';
import { ExamHistoryModal } from '../components/ExamHistoryModal';
import { AddCorrectionModal } from '../components/AddCorrectionModal';
import { api } from '../lib/api';
import type { ComponentType } from 'react';
import { useState, useRef, useMemo } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

const TAB_VIEWS: Record<string, ComponentType> = {
  'history-and-symptoms': ReasonForVisitView,
  'reason-for-visit': ReasonForVisitView,
  'symptomatic-history': SymptomaticHistoryView,
  'ocular-history': OcularHistoryView,
  'systemic-history': SystemicHistoryView,
  medication: MedicationView,
  'family-ocular-history': FamilyOcularHistoryView,
  'family-systemic-history': FamilySystemicHistoryView,
  spectacles: SpectaclesView,
  'contact-lens': ContactLensView,
  'contact-lens-evaluation': ClPreFitView,
  'cl-pre-fit': ClPreFitView,
  'cl-fitting': ClFittingView,
  lifestyle: LifestyleView,
  'vision-and-visual-acuity': VisionAndVisualAcuityView,
  'visual-acuity': VisionAndVisualAcuityView,
  refraction: RefractionView,
  'objective-subjective': SubjectiveRefractionView,
  cycloplegic: CycloplegicView,
  'binocular-vision-assessment': BinocularVisionView,
  'worth-4-dot': Worth4DotView,
  'ocular-motor-balance': OcularMotorBalanceView,
  'near-point-of-convergence': NpcView,
  'amplitude-of-accommodation': AccommodationView,
  'ocular-motility': MotilityView,
  'pupil-evaluation': PupilView,
  stereopsis: StereopsisView,
  'accommodative-lag': AccommodativeLagView,
  'accommodative-facility': AccommodativeFacilityView,
  'relative-accommodation': RelativeAccommodationView,
  'fusional-vergences': FusionalVergencesView,
  'diplopia-charting': DipliopiaChartingView,
  'hess-screen': HessScreenView,
  'aca-ratio': AcaRatioView,
  'anterior-segment-eval': AnteriorSegmentEvaluationView,
  'crystalline-lens': CrystallineLensView,
  'posterior-segment': PosteriorSegmentEvaluationView,
  'tear-film': TearFilmEvaluationView,
  'colour-vision': ColourVisionView,
  tonometry: TonometryView,
  pachymetry: PachymetryView,
  gonioscopy: GonioscopyView,
  amsler: AmslerView,
  'contrast-sensitivity': ContrastSensitivityView,
  topography: TopographyView,
  'assessment-plan': AssessmentPlanView,
  referral: ReferralView,
  'action-and-advice': ActionAndAdviceView,
  'final-spectacle-prescription': FinalSpectaclePrescriptionView,
  'final-contact-lens-specification': FinalContactLensSpecificationView,
  'discharge-summary': DischargeSummaryView,
  'spectacle-dispensing': SpectacleDispensingView,
};

const NAV_ORDER = ASIRA_EXAM_TREE.flatMap((sec) => [
  sec.id,
  ...(sec.children?.map((c) => c.id) ?? []),
]);

function findSectionForTab(tab: string): { label: string } | null {
  for (const sec of ASIRA_EXAM_TREE) {
    if (sec.id === tab) return { label: sec.label };
    const child = sec.children?.find((c) => c.id === tab);
    if (child) return { label: sec.label };
  }
  return null;
}

export function ExamDashboard() {
  useExamLoader();

  const navigate = useNavigate();
  const activeTab = useEncounterStore((s) => s.activeTab);
  const encounterId = useEncounterStore((s) => s.encounterId);
  const isLocked = useEncounterStore((s) => s.isLocked);
  const encounterPatient = useEncounterStore((s) => s.patient);
  const patientName = useEncounterStore((s) => s.patient.name);
  const setActiveTab = useEncounterStore((s) => s.setActiveTab);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const saveEncounter = useEncounterStore((s) => s.saveEncounter);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  const flashStatus = (
    status: 'idle' | 'saving' | 'saved' | 'error',
    resetMs: number,
  ) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus(status);
    if (status === 'idle') return;
    saveTimer.current = setTimeout(() => setSaveStatus('idle'), resetMs);
  };

  useAutosave(2000, (status) => flashStatus(status, status === 'error' ? 3000 : 2000));

  const handleSave = async () => {
    if (saveStatus === 'saving') return;
    if (isLocked) return;
    setSaveStatus('saving');
    try {
      await saveEncounter();
      flashStatus('saved', 2000);
    } catch {
      flashStatus('error', 3000);
    }
  };

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved ✓'
        : saveStatus === 'error'
          ? 'Save failed'
          : 'Save';

  const saveButtonClass = `px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
    saveStatus === 'saved'
      ? 'bg-green-600 hover:bg-green-700'
      : saveStatus === 'error'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-teal-600 hover:bg-teal-700'
  }`;

  const currentIndex = NAV_ORDER.indexOf(activeTab);

  const goToTab = async (tab: string) => {
    if (!tab || !TAB_VIEWS[tab]) return;
    await saveEncounter().catch(() => {});
    setActiveTab(tab);
  };

  const handleEndExam = async () => {
    try {
      await saveEncounter();
    } catch {}
    const st = useEncounterStore.getState();
    if (st.appointmentId) {
      updateAppointment(st.appointmentId, { status: 'completed' });
    }
    navigate(st.appointmentId ? '/appointments' : '/patients');
  };

  const handleFinalize = async () => {
    if (finalizing || isLocked) return;
    setFinalizing(true);
    setFinalizeError(null);
    try {
      await saveEncounter();
      const st = useEncounterStore.getState();
      const eid = st.encounterId;
      if (!eid) {
        throw new Error('Encounter not found — save failed.');
      }
      await api.patch(`/clinical/encounter/${eid}/lock`);
      useEncounterStore.getState().markExamFinalized(eid);
      if (st.appointmentId) {
        updateAppointment(st.appointmentId, { status: 'completed' });
      }
      flashStatus('saved', 2000);
    } catch (err: any) {
      setFinalizeError(
        err?.message ?? 'Finalization failed. The examination remains editable — please retry.',
      );
    } finally {
      setFinalizing(false);
    }
  };

  const handleCorrectionSaved = async () => {
    const st = useEncounterStore.getState();
    if (!st.encounterId) return;
    try {
      const data = await api.get<any>(`/clinical/encounter/${st.encounterId}`);
      if (data) st.loadEncounterFromDb(data);
    } catch {}
  };

  const patientForHistory = useMemo<Patient>(() => {
    const fromStore = useAppStore.getState().getPatientById(encounterPatient.id);
    if (fromStore) return fromStore;
    const nameParts = (encounterPatient.name || '').split(' ').filter(Boolean);
    return {
      id: encounterPatient.id,
      mrn: encounterPatient.mrn || undefined,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      gender: (encounterPatient.gender as Patient['gender']) || 'Other',
      dateOfBirth: '',
      phone: '',
      email: '',
    };
  }, [encounterPatient]);

  const ActiveView = TAB_VIEWS[activeTab];

  if (!patientName) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-500">
        Loading examination…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      <TopHeader onEndExam={handleEndExam} />

      <VisitContextBanner
        onOpenHistory={() => setShowHistory(true)}
        onFinalize={handleFinalize}
        onOpenCorrection={() => setShowCorrection(true)}
        finalizing={finalizing}
        finalizeError={finalizeError}
      />

      <div className="flex flex-1 overflow-hidden">
        <AsiraSidebar />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {ActiveView ? (
            <ActiveView key={activeTab} />
          ) : (
            <div className="bg-white p-8 m-6 rounded-xl border border-slate-200 shadow-xs max-w-4xl">
              <h2 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">
                Active Module: {activeTab.replace(/-/g, ' ')}
              </h2>
              <p className="text-xs text-slate-500">
                Ready for next module implementation.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Bottom navigation bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-t border-slate-200 shrink-0 select-none">
        <button
          type="button"
          onClick={() => goToTab(NAV_ORDER[Math.max(0, currentIndex - 1)])}
          disabled={currentIndex <= 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span aria-hidden="true">◀</span> Previous
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">
            {findSectionForTab(activeTab)?.label ?? activeTab.replace(/-/g, ' ')}
          </span>
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full px-3 py-2">
              <CheckCircle2 className="w-4 h-4" />
              Examination finalized
              <Lock className="w-3.5 h-3.5" />
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`${saveButtonClass} ${saveStatus === 'saving' ? 'opacity-70 cursor-wait' : ''}`}
            >
              {saveLabel}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => goToTab(NAV_ORDER[currentIndex + 1])}
          disabled={currentIndex === NAV_ORDER.length - 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <span aria-hidden="true">▶</span>
        </button>
      </div>

      {showHistory && patientForHistory && (
        <ExamHistoryModal
          patient={patientForHistory}
          onClose={() => setShowHistory(false)}
          onCreateExam={() => { setShowHistory(false); navigate('/patients'); }}
        />
      )}

      {showCorrection && encounterId && (
        <AddCorrectionModal
          encounterId={encounterId}
          patientName={patientName}
          onClose={() => setShowCorrection(false)}
          onSaved={handleCorrectionSaved}
        />
      )}
    </div>
  );
}
