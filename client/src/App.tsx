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
import { BinocularVisionView } from './features/BinocularVisionView';
import { SlitLampView } from './features/SlitLampView';
import { AnteriorDrawingView } from './features/AnteriorDrawingView';
import { PosteriorSegmentView } from './features/PosteriorSegmentView';
import { useEncounterStore } from './store/useEncounterStore';

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
          {activeTab === 'worth-4-dot' && <BinocularVisionView />}
          {activeTab === 'ocular-motor-balance' && <BinocularVisionView />}
          {activeTab === 'npc' && <BinocularVisionView />}
          {activeTab === 'amplitude-accommodation' && <BinocularVisionView />}
          {activeTab === 'ocular-motility' && <BinocularVisionView />}
          {activeTab === 'pupil-evaluation' && <BinocularVisionView />}
          {activeTab === 'stereopsis' && <BinocularVisionView />}
          {activeTab === 'accommodative-tests' && <BinocularVisionView />}
          {activeTab === 'slit-lamp' && <SlitLampView />}
          {activeTab === 'cornea-canvas' && <AnteriorDrawingView />}
          {activeTab === 'posterior-segment' && <PosteriorSegmentView />}

          {![
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
            'npc',
            'amplitude-accommodation',
            'ocular-motility',
            'pupil-evaluation',
            'stereopsis',
            'accommodative-tests',
            'slit-lamp',
            'cornea-canvas',
            'posterior-segment',
          ].includes(activeTab) && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs max-w-4xl">
              <h2 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">
                Active Module: {activeTab.replace('-', ' ')}
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
