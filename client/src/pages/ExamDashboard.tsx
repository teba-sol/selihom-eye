import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { AsiraSidebar, ASIRA_EXAM_TREE } from '../components/AsiraSidebar';
import { ModuleErrorBoundary } from '../components/ModuleErrorBoundary';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAppStore, type Patient } from '../store/useAppStore';
import { useExamLoader } from '../hooks/useExamLoader';
import { useDraftPersistence } from '../hooks/useDraftPersistence';
import { VisitContextBanner } from '../components/VisitContextBanner';
import { ExamHistoryModal } from '../components/ExamHistoryModal';
import { AddCorrectionModal } from '../components/AddCorrectionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { readDraft, clearDraft } from '../lib/draft';
import { api } from '../lib/api';
import { lazy, Suspense, useState, useMemo, useRef, type ComponentType } from 'react';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  diagnosis: lazyView(() => import('../features/DiagnosisView'), 'DiagnosisView'),
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
  const saveEncounter = useEncounterStore((s) => s.saveEncounter);
  const dismissDraftNotice = useEncounterStore((s) => s.dismissDraftNotice);
  const draftNotice = useEncounterStore((s) => s.draftNotice);

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showLockedNotice, setShowLockedNotice] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [reopening, setReopening] = useState(false);
  const retriedOnceRef = useRef(false);

  useDraftPersistence();

  const currentIndex = NAV_ORDER.indexOf(activeTab);

  const goToTab = (tab: string) => {
    if (!tab || !TAB_VIEWS[tab]) return;
    setActiveTab(tab);
  };

  const blockFinalizedEdit = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLocked) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-allow-finalized-action]')) return;
    if (!target.closest('button, input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    event.stopPropagation();
    setShowLockedNotice(true);
  };

  const handleSaveAndExit = async (isRetry = false) => {
    if (finalizing || isLocked) return;
    if (!isRetry) retriedOnceRef.current = false;
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
      clearDraft(eid);
      useEncounterStore.getState().dismissDraftNotice();
      navigate('/appointments');
    } catch (err: any) {
      if (!retriedOnceRef.current) {
        retriedOnceRef.current = true;
        setFinalizeError('Save failed — retrying automatically. Your work is preserved locally.');
        setTimeout(() => {
          handleSaveAndExit(true);
        }, 4000);
      } else {
        setFinalizeError(
          err?.message ??
            'Save failed. Your work is preserved locally — please retry.',
        );
        setFinalizing(false);
      }
    }
  };

  const handleCorrectionSaved = async () => {
    const st = useEncounterStore.getState();
    if (!st.encounterId) return;
    try {
      const data = await api.get<any>(`/clinical/encounter/${st.encounterId}`);
      if (data && !data.isLocked) {
        const draft = readDraft(st.encounterId);
        const backendTs = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
        if (draft && draft.savedAt > backendTs) {
          st.loadDraftData(draft.data, draft.savedAt);
          return;
        }
      }
      if (data) st.loadEncounterFromDb(data);
    } catch {}
  };

  const handleReopenExam = async () => {
    const st = useEncounterStore.getState();
    const eid = st.encounterId;
    if (!eid) return;
    setReopening(true);
    setShowReopenConfirm(false);
    try {
      await api.patch(`/clinical/encounter/${eid}/unlock`);
      const data = await api.get<any>(`/clinical/encounter/${eid}`);
      if (data) {
        st.loadEncounterFromDb(data);
      }
      setFinalizeError(null);
    } catch (err: any) {
      setFinalizeError(err?.message ?? 'Could not re-open the exam for editing.');
    } finally {
      setReopening(false);
    }
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
        onFinalize={handleSaveAndExit}
        onOpenCorrection={() => setShowCorrection(true)}
        onReopen={() => setShowReopenConfirm(true)}
        finalizing={finalizing}
        finalizeError={finalizeError}
      />

      {draftNotice && !isLocked && (
        <div className="mx-5 mt-3 flex items-center justify-between gap-3 flex-wrap bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <span className="text-xs font-medium text-amber-800">
            <AlertTriangle className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            You have an unsaved draft from{' '}
            {new Date(draftNotice.savedAt).toLocaleTimeString()}.
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => useEncounterStore.getState().discardDraft()}
              className="px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={dismissDraftNotice}
              className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-white border border-amber-300 rounded-md hover:bg-amber-100"
            >
              Keep working
            </button>
          </span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <AsiraSidebar />

        <main className="relative flex-1 overflow-y-auto bg-slate-50" onClickCapture={blockFinalizedEdit}>
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

      {showReopenConfirm && (
        <ConfirmDialog
          title="Edit finalized exam?"
          message="This re-opens the finalized exam so you can update it. It will remain unlocked until you Save &amp; Exit, which re-finalizes it."
          confirmLabel="Re-open for editing"
          cancelLabel="Cancel"
          busy={reopening}
          onConfirm={handleReopenExam}
          onCancel={() => setShowReopenConfirm(false)}
        />
      )}

      {showLockedNotice && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-700">
              <Lock className="h-5 w-5" />
              <h2 className="text-base font-bold">Examination finalized</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Editing this examination is not allowed after finalization. Use the Add Correction option to create an append-only clinical addendum.
            </p>
            <button type="button" onClick={() => setShowLockedNotice(false)} className="mt-5 w-full rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152c49]">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
