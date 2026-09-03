import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { AsiraSidebar, ASIRA_EXAM_TREE } from '../components/AsiraSidebar';
import { ModuleErrorBoundary } from '../components/ModuleErrorBoundary';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAppStore, type Patient } from '../store/useAppStore';
import { useExamLoader } from '../hooks/useExamLoader';
import { useAutosave } from '../hooks/useAutoSave';
import { VisitContextBanner } from '../components/VisitContextBanner';
import { ExamHistoryModal } from '../components/ExamHistoryModal';
import { AddCorrectionModal } from '../components/AddCorrectionModal';
import { api } from '../lib/api';
import { lazy, Suspense, useState, useMemo, type ComponentType } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

const lazyView = (
  loader: () => Promise<Record<string, ComponentType>>,
  name: string,
) => lazy(() => loader().then((m) => ({ default: m[name] })));

const TAB_VIEWS: Record<string, ComponentType> = {
  // ? Canonical: 'reason-for-visit'
  'reason-for-visit': lazyView(() => import('../features/ReasonForVisitView'), 'ReasonForVisitView'),
  'history-and-symptoms': lazyView(() => import('../features/ReasonForVisitView'), 'ReasonForVisitView'),
  'symptomatic-history': lazyView(() => import('../features/SymptomaticHistoryView'), 'SymptomaticHistoryView'),
  'ocular-history': lazyView(() => import('../features/OcularHistoryView'), 'OcularHistoryView'),
  'systemic-history': lazyView(() => import('../features/SystemicHistoryView'), 'SystemicHistoryView'),
  medication: lazyView(() => import('../features/MedicationView'), 'MedicationView'),
  'family-ocular-history': lazyView(() => import('../features/FamilyOcularHistoryView'), 'FamilyOcularHistoryView'),
  'family-systemic-history': lazyView(() => import('../features/FamilySystemicHistoryView'), 'FamilySystemicHistoryView'),
  spectacles: lazyView(() => import('../features/SpectaclesView'), 'SpectaclesView'),
  'contact-lens': lazyView(() => import('../features/ContactLensView'), 'ContactLensView'),
  // ? Canonical: 'cl-pre-fit'
  'cl-pre-fit': lazyView(() => import('../features/ClPreFitView'), 'ClPreFitView'),
  'contact-lens-evaluation': lazyView(() => import('../features/ClPreFitView'), 'ClPreFitView'),
  'cl-fitting': lazyView(() => import('../features/ClFittingView'), 'ClFittingView'),
  lifestyle: lazyView(() => import('../features/LifestyleView'), 'LifestyleView'),
  // ? Canonical: 'vision-and-visual-acuity'
  'vision-and-visual-acuity': lazyView(() => import('../features/VisionAndVisualAcuityView'), 'VisionAndVisualAcuityView'),
  'visual-acuity': lazyView(() => import('../features/VisionAndVisualAcuityView'), 'VisionAndVisualAcuityView'),
  refraction: lazyView(() => import('../features/RefractionView'), 'RefractionView'),
  'objective-subjective': lazyView(() => import('../features/SubjectiveRefractionView'), 'SubjectiveRefractionView'),
  cycloplegic: lazyView(() => import('../features/CycloplegicView'), 'CycloplegicView'),
  'binocular-vision-assessment': lazyView(() => import('../features/BinocularVisionView'), 'BinocularVisionView'),
  'worth-4-dot': lazyView(() => import('../features/binocular/Worth4DotView'), 'Worth4DotView'),
  'ocular-motor-balance': lazyView(() => import('../features/binocular/OcularMotorBalanceView'), 'OcularMotorBalanceView'),
  'near-point-of-convergence': lazyView(() => import('../features/binocular/NpcView'), 'NpcView'),
  'amplitude-of-accommodation': lazyView(() => import('../features/binocular/AccommodationView'), 'AccommodationView'),
  'ocular-motility': lazyView(() => import('../features/binocular/MotilityView'), 'MotilityView'),
  'pupil-evaluation': lazyView(() => import('../features/binocular/PupilView'), 'PupilView'),
  stereopsis: lazyView(() => import('../features/binocular/StereopsisView'), 'StereopsisView'),
  'accommodative-lag': lazyView(() => import('../features/binocular/AccommodativeLagView'), 'AccommodativeLagView'),
  'accommodative-facility': lazyView(() => import('../features/binocular/AccommodativeFacilityView'), 'AccommodativeFacilityView'),
  'relative-accommodation': lazyView(() => import('../features/binocular/RelativeAccommodationView'), 'RelativeAccommodationView'),
  'fusional-vergences': lazyView(() => import('../features/binocular/FusionalVergencesView'), 'FusionalVergencesView'),
  'diplopia-charting': lazyView(() => import('../features/binocular/DipliopiaChartingView'), 'DipliopiaChartingView'),
  'hess-screen': lazyView(() => import('../features/binocular/HessScreenView'), 'HessScreenView'),
  'aca-ratio': lazyView(() => import('../features/binocular/AcaRatioView'), 'AcaRatioView'),
  'anterior-segment-eval': lazyView(() => import('../features/AnteriorSegmentEvaluationView'), 'AnteriorSegmentEvaluationView'),
  'crystalline-lens': lazyView(() => import('../features/CrystallineLensView'), 'CrystallineLensView'),
  'posterior-segment': lazyView(() => import('../features/PosteriorSegmentEvaluationView'), 'PosteriorSegmentEvaluationView'),
  'tear-film': lazyView(() => import('../features/TearFilmEvaluationView'), 'TearFilmEvaluationView'),
  'colour-vision': lazyView(() => import('../features/additional/ColourVisionView'), 'ColourVisionView'),
  tonometry: lazyView(() => import('../features/additional/TonometryView'), 'TonometryView'),
  pachymetry: lazyView(() => import('../features/additional/PachymetryView'), 'PachymetryView'),
  gonioscopy: lazyView(() => import('../features/additional/GonioscopyView'), 'GonioscopyView'),
  amsler: lazyView(() => import('../features/additional/AmslerView'), 'AmslerView'),
  'contrast-sensitivity': lazyView(() => import('../features/additional/ContrastSensitivityView'), 'ContrastSensitivityView'),
  topography: lazyView(() => import('../features/TopographyView'), 'TopographyView'),
  'assessment-plan': lazyView(() => import('../features/AssessmentPlanView'), 'AssessmentPlanView'),
  referral: lazyView(() => import('../features/ReferralView'), 'ReferralView'),
  'action-and-advice': lazyView(() => import('../features/ActionAndAdviceView'), 'ActionAndAdviceView'),
  'final-spectacle-prescription': lazyView(() => import('../features/reports/FinalSpectaclePrescriptionView'), 'FinalSpectaclePrescriptionView'),
  'final-contact-lens-specification': lazyView(() => import('../features/reports/FinalContactLensSpecificationView'), 'FinalContactLensSpecificationView'),
  'discharge-summary': lazyView(() => import('../features/reports/DischargeSummaryView'), 'DischargeSummaryView'),
  'spectacle-dispensing': lazyView(() => import('../features/reports/SpectacleDispensingView'), 'SpectacleDispensingView'),
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

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  useAutosave(2000);

  const currentIndex = NAV_ORDER.indexOf(activeTab);

  const goToTab = async (tab: string) => {
    if (!tab || !TAB_VIEWS[tab]) return;
    await saveEncounter({ toast: false }).catch(() => {});
    setActiveTab(tab);
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
      <TopHeader />

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
          <Suspense
            fallback={
              <div className="bg-white p-8 m-6 rounded-xl border border-slate-200 shadow-xs max-w-4xl">
                <h2 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">
                  Loading module…
                </h2>
              </div>
            }
          >
            <ModuleErrorBoundary key={activeTab}>
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
            </ModuleErrorBoundary>
          </Suspense>
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
          {isLocked && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full px-3 py-2">
              <CheckCircle2 className="w-4 h-4" />
              Examination finalized
              <Lock className="w-3.5 h-3.5" />
            </span>
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
