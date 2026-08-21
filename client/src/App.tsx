import { TopHeader } from './components/TopHeader';
import { AsiraSidebar } from './components/AsiraSidebar';
import { SymptomaticHistoryView } from './features/SymptomaticHistoryView';
import { OcularHistoryView } from './features/OcularHistoryView';
import { SystemicHistoryView } from './features/SystemicHistoryView';
import { MedicationView } from './features/MedicationView';
import { FamilyOcularHistoryView } from './features/FamilyOcularHistoryView';
import { FamilySystemicHistoryView } from './features/FamilySystemicHistoryView';
import { SpectaclesView } from './features/SpectaclesView';
import { ContactLensView } from './features/ContactLensView';
import { LifestyleView } from './features/LifestyleView';
import { VisionAndVisualAcuityView } from './features/VisionAndVisualAcuityView';
import { ObjectiveRefractionView } from './features/ObjectiveRefractionView';
import { SubjectiveRefractionView } from './features/SubjectiveRefractionView';
import { Worth4DotView } from './features/binocular/Worth4DotView';
import { OcularMotorBalanceView } from './features/binocular/OcularMotorBalanceView';
import { NpcView } from './features/binocular/NpcView';
import { MotilityView } from './features/binocular/MotilityView';
import { PupilView } from './features/binocular/PupilView';
import { AccommodationView } from './features/binocular/AccommodationView';
import { StereopsisView } from './features/binocular/StereopsisView';
import { AccommodativeLagView } from './features/binocular/AccommodativeLagView';
import { AccommodativeFacilityView } from './features/binocular/AccommodativeFacilityView';
import { RelativeAccommodationView } from './features/binocular/RelativeAccommodationView';
import { AnteriorSegmentEvaluationView } from './features/AnteriorSegmentEvaluationView';
import { CrystallineLensView } from './features/CrystallineLensView';
import { PosteriorSegmentEvaluationView } from './features/PosteriorSegmentEvaluationView';
import { TearFilmEvaluationView } from './features/TearFilmEvaluationView';
import { ColourVisionView } from './features/additional/ColourVisionView';
import { TonometryView } from './features/additional/TonometryView';
import { PachymetryView } from './features/additional/PachymetryView';
import { GonioscopyView } from './features/additional/GonioscopyView';
import { AmslerView } from './features/additional/AmslerView';
import { ContrastSensitivityView } from './features/additional/ContrastSensitivityView';
import { useEncounterStore } from './store/useEncounterStore';

const IMPLEMENTED_TABS = [
  'symptomatic-history',
  'ocular-history',
  'systemic-history',
  'medication',
  'family-ocular-history',
  'family-systemic-history',
  'spectacles',
  'contact-lens',
  'lifestyle',
  'visual-acuity',
  'objective-refraction',
  'subjective-refraction',
  'worth-4-dot',
  'ocular-motor-balance',
  'near-point-of-convergence',
  'amplitude-of-accommodation',
  'ocular-motility',
  'pupil-evaluation',
  'stereopsis',
  'accommodative-lag',
  'accommodative-facility',
  'relative-accommodation',
  'anterior-segment-eval',
  'crystalline-lens',
  'posterior-segment',
  'tear-film',
  'colour-vision',
  'tonometry',
  'pachymetry',
  'gonioscopy',
  'amsler',
  'contrast-sensitivity',
];

export default function App() {
  const { activeTab } = useEncounterStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      <TopHeader />

      <div className="flex flex-1 overflow-hidden">
        <AsiraSidebar />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'symptomatic-history' && <SymptomaticHistoryView />}
          {activeTab === 'ocular-history' && <OcularHistoryView />}
          {activeTab === 'systemic-history' && <SystemicHistoryView />}
          {activeTab === 'medication' && <MedicationView />}
          {activeTab === 'family-ocular-history' && <FamilyOcularHistoryView />}
          {activeTab === 'family-systemic-history' && <FamilySystemicHistoryView />}
          {activeTab === 'spectacles' && <SpectaclesView />}
          {activeTab === 'contact-lens' && <ContactLensView />}
          {activeTab === 'lifestyle' && <LifestyleView />}
          {activeTab === 'visual-acuity' && <VisionAndVisualAcuityView />}
          {activeTab === 'objective-refraction' && <ObjectiveRefractionView />}
          {activeTab === 'subjective-refraction' && <SubjectiveRefractionView />}
          {activeTab === 'worth-4-dot' && <Worth4DotView />}
          {activeTab === 'ocular-motor-balance' && <OcularMotorBalanceView />}
          {activeTab === 'near-point-of-convergence' && <NpcView />}
          {activeTab === 'amplitude-of-accommodation' && <AccommodationView />}
          {activeTab === 'ocular-motility' && <MotilityView />}
          {activeTab === 'pupil-evaluation' && <PupilView />}
          {activeTab === 'stereopsis' && <StereopsisView />}
          {activeTab === 'accommodative-lag' && <AccommodativeLagView />}
          {activeTab === 'accommodative-facility' && <AccommodativeFacilityView />}
          {activeTab === 'relative-accommodation' && <RelativeAccommodationView />}
          {activeTab === 'anterior-segment-eval' && <AnteriorSegmentEvaluationView />}
          {activeTab === 'crystalline-lens' && <CrystallineLensView />}
          {activeTab === 'posterior-segment' && <PosteriorSegmentEvaluationView />}
          {activeTab === 'tear-film' && <TearFilmEvaluationView />}
          {activeTab === 'colour-vision' && <ColourVisionView />}
          {activeTab === 'tonometry' && <TonometryView />}
          {activeTab === 'pachymetry' && <PachymetryView />}
          {activeTab === 'gonioscopy' && <GonioscopyView />}
          {activeTab === 'amsler' && <AmslerView />}
          {activeTab === 'contrast-sensitivity' && <ContrastSensitivityView />}

          {!IMPLEMENTED_TABS.includes(activeTab) && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs max-w-4xl">
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
