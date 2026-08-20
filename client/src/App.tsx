import { TopHeader } from './components/TopHeader';
import { AsiraSidebar } from './components/AsiraSidebar';
import { OcularHistoryView } from './features/OcularHistoryView';
import { SymptomaticHistoryView } from './features/SymptomaticHistoryView';
import { VisualAcuityView } from './features/VisualAcuityView';
import { RefractionView } from './features/RefractionView';
import { AnteriorSegmentCanvasView } from './features/AnteriorSegmentCanvasView';
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
          {activeTab === 'visual-acuity' && <VisualAcuityView />}
          {activeTab === 'subjective-refraction' && <RefractionView />}
          {activeTab === 'cornea-canvas' && <AnteriorSegmentCanvasView />}

          {![
            'symptomatic-history',
            'ocular-history',
            'visual-acuity',
            'subjective-refraction',
            'cornea-canvas',
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
