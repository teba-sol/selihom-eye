import { useNavigate, useParams } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { AsiraSidebar } from '../components/AsiraSidebar';
import { ReasonForVisitView } from '../features/ReasonForVisitView';
import { SymptomaticHistoryView } from '../features/SymptomaticHistoryView';
import { OcularHistoryView } from '../features/OcularHistoryView';
import { SystemicHistoryView } from '../features/SystemicHistoryView';
import { MedicationView } from '../features/MedicationView';
import { FamilyOcularHistoryView } from '../features/FamilyOcularHistoryView';
import { FamilySystemicHistoryView } from '../features/FamilySystemicHistoryView';
import { SpectaclesView } from '../features/SpectaclesView';
import { ContactLensView } from '../features/ContactLensView';
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
import { FinalSpectaclePrescriptionView } from '../features/reports/FinalSpectaclePrescriptionView';
import { FinalContactLensSpecificationView } from '../features/reports/FinalContactLensSpecificationView';
import { DischargeSummaryView } from '../features/reports/DischargeSummaryView';
import { SpectacleDispensingView } from '../features/reports/SpectacleDispensingView';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAppStore } from '../store/useAppStore';
import { useExamLoader } from '../hooks/useExamLoader';
import { api } from '../lib/api';
import type { ComponentType } from 'react';

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
  'final-spectacle-prescription': FinalSpectaclePrescriptionView,
  'final-contact-lens-specification': FinalContactLensSpecificationView,
  'discharge-summary': DischargeSummaryView,
  'spectacle-dispensing': SpectacleDispensingView,
};

export function ExamDashboard() {
  useExamLoader();

  const navigate = useNavigate();
  const { appointmentId: routeAppointmentId } = useParams<{ appointmentId: string }>();
  const activeTab = useEncounterStore((s) => s.activeTab);
  const appointmentId = useEncounterStore((s) => s.appointmentId);
  const patientName = useEncounterStore((s) => s.patient.name);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const saveEncounter = useEncounterStore((s) => s.saveEncounter);

  const handleEndExam = async () => {
    try {
      await saveEncounter();
    } catch {}
    const id = appointmentId ?? routeAppointmentId;
    if (id) {
      updateAppointment(id, { status: 'completed' });
    }
    const patientId = useEncounterStore.getState().patient.id;
    if (patientId) {
      try { await api.patch(`/patients/${patientId}`, {}); } catch {}
    }
    navigate('/appointments');
  };

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
    </div>
  );
}
