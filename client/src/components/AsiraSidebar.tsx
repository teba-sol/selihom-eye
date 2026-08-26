import React, { useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { CheckCircle2, ChevronDown, ChevronRight, FileText, Search } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  isCompleted?: boolean;
}

export interface SidebarSection {
  id: string;
  label: string;
  isExpandable: boolean;
  isCompleted?: boolean;
  children?: SidebarItem[];
}

export const ASIRA_EXAM_TREE: SidebarSection[] = [
  {
    id: 'history-and-symptoms',
    label: 'History And Symptoms',
    isExpandable: true,
    isCompleted: true,
    children: [
      { id: 'reason-for-visit', label: 'Reason For Visit', isCompleted: true },
      { id: 'symptomatic-history', label: 'Symptomatic History', isCompleted: true },
      { id: 'ocular-history', label: 'Ocular History', isCompleted: true },
      { id: 'systemic-history', label: 'Systemic History', isCompleted: true },
      { id: 'medication', label: 'Medication', isCompleted: false },
      { id: 'family-ocular-history', label: 'Family Ocular History', isCompleted: false },
      { id: 'family-systemic-history', label: 'Family Systemic History', isCompleted: false },
      { id: 'spectacles', label: 'Spectacles', isCompleted: false },
      { id: 'contact-lens', label: 'Contact Lens', isCompleted: false },
      { id: 'lifestyle', label: 'Lifestyle', isCompleted: false },
    ],
  },
  {
    id: 'vision-and-visual-acuity',
    label: 'Vision And Visual Acuity',
    isExpandable: false,
    isCompleted: true,
  },
  {
    id: 'refraction',
    label: 'Refraction',
    isExpandable: true,
    isCompleted: true,
    children: [
      { id: 'objective-subjective', label: 'Objective-subjective', isCompleted: true },
      { id: 'cycloplegic', label: 'Cycloplegic', isCompleted: false },
    ],
  },
  {
    id: 'binocular-vision-assessment',
    label: 'Binocular Vision Assessment',
    isExpandable: true,
    isCompleted: true,
    children: [
      { id: 'worth-4-dot', label: 'Worth 4 Dot Test', isCompleted: true },
      { id: 'ocular-motor-balance', label: 'Ocular Motor Balance', isCompleted: true },
      { id: 'near-point-of-convergence', label: 'Near Point Of Convergence', isCompleted: true },
      { id: 'amplitude-of-accommodation', label: 'Amplitude Of Accommodation', isCompleted: false },
      { id: 'ocular-motility', label: 'Ocular Motility', isCompleted: true },
      { id: 'pupil-evaluation', label: 'Pupil Evaluation', isCompleted: true },
      { id: 'stereopsis', label: 'Stereopsis', isCompleted: false },
      { id: 'accommodative-lag', label: 'Accommodative Lag', isCompleted: false },
      { id: 'accommodative-facility', label: 'Accommodative Facility', isCompleted: false },
      { id: 'relative-accommodation', label: 'Relative Accommodation', isCompleted: false },
      { id: 'fusional-vergences', label: 'Fusional Vergences', isCompleted: false },
      { id: 'diplopia-charting', label: 'Diplopia Charting', isCompleted: false },
      { id: 'hess-screen', label: 'Hess Screen', isCompleted: false },
      { id: 'aca-ratio', label: 'Ac-a Ratio', isCompleted: false },
    ],
  },
  {
    id: 'anterior-segment-eval',
    label: 'Anterior Segment Evaluation',
    isExpandable: false,
    isCompleted: true,
  },
  {
    id: 'crystalline-lens',
    label: 'Crystalline Lens Evaluation',
    isExpandable: false,
    isCompleted: true,
  },
  {
    id: 'posterior-segment',
    label: 'Posterior Segment Evaluation',
    isExpandable: false,
    isCompleted: true,
  },
  {
    id: 'additional-tests',
    label: 'Additional Tests',
    isExpandable: true,
    isCompleted: true,
    children: [
      { id: 'tear-film', label: 'Tear Film Evaluation', isCompleted: true },
      { id: 'colour-vision', label: 'Colour Vision', isCompleted: false },
      { id: 'pachymetry', label: 'Pachymetry', isCompleted: false },
      { id: 'tonometry', label: 'Tonometry', isCompleted: true },
      { id: 'gonioscopy', label: 'Gonioscopy', isCompleted: false },
      { id: 'amsler', label: 'Amsler', isCompleted: false },
      { id: 'contrast-sensitivity', label: 'Contrast Sensitivity', isCompleted: false },
    ],
  },
  {
    id: 'contact-lens-evaluation',
    label: 'Contact Lens Evaluation',
    isExpandable: true,
    isCompleted: false,
    children: [
      { id: 'cl-pre-fit', label: 'Pre-Fitting Evaluation', isCompleted: false },
      { id: 'cl-fitting', label: 'Lens Fitting Assessment', isCompleted: false },
    ],
  },
  {
    id: 'action-and-advice',
    label: 'Action And Advice',
    isExpandable: false,
    isCompleted: false,
  },
];

export const ASIRA_REPORTS_TREE: SidebarSection[] = [
  {
    id: 'final-spectacle-prescription',
    label: 'Final Spectacle Prescription',
    isExpandable: false,
    isCompleted: true,
  },
  {
    id: 'final-contact-lens-specification',
    label: 'Final Contact Lens Specification',
    isExpandable: false,
    isCompleted: false,
  },
  {
    id: 'discharge-summary',
    label: 'Discharge Summary',
    isExpandable: false,
    isCompleted: false,
  },
  {
    id: 'spectacle-dispensing',
    label: 'Spectacle Dispensing',
    isExpandable: false,
    isCompleted: false,
  },
];

export const AsiraSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useEncounterStore();
  const encounterState = useEncounterStore();
  const [navTab, setNavTab] = useState<'TESTS' | 'REPORTS'>('TESTS');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'history-and-symptoms': true,
    'refraction': true,
    'binocular-vision-assessment': false,
    'additional-tests': true,
    'contact-lens-evaluation': false,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper function to check if a section is completed based on actual data
  const isSectionCompleted = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'reason-for-visit':
        return encounterState.patient.reasonForVisit !== '';
      case 'symptomatic-history':
        return encounterState.symptoms.length > 0;
      case 'ocular-history':
        return !encounterState.ocularHistory.noHistoryReported || 
               Object.values(encounterState.ocularHistory.conditions).some(c => c.active);
      case 'systemic-history':
        return !encounterState.systemicHistory.noHistoryReported ||
               Object.values(encounterState.systemicHistory.conditions).some((c: any) => c.active);
      case 'medication':
        return encounterState.patientMedications.length > 0;
      case 'family-ocular-history':
        return encounterState.familyOcularHistory.length > 0;
      case 'family-systemic-history':
        return encounterState.familySystemicHistory.length > 0;
      case 'spectacles':
        return encounterState.spectaclesHistory.currentlyWears !== undefined;
      case 'contact-lens':
        return encounterState.contactLensHistory.currentWearer !== undefined;
      case 'lifestyle':
        return encounterState.lifestyleDemands.occupation !== '';
      case 'vision-and-visual-acuity':
      case 'visual-acuity':
        return Object.values(encounterState.visualAcuity).some(v => v !== '');
      case 'refraction':
      case 'objective-subjective':
        return encounterState.refraction.odSph !== '' || encounterState.refraction.osSph !== '';
      case 'tonometry':
        return encounterState.tonometry.odIop !== '' || encounterState.tonometry.osIop !== '';
      case 'anterior-segment-eval':
        return encounterState.slitLamp.cornea !== '' || encounterState.odCanvasVectors !== '';
      default:
        return false;
    }
  };

  // Update the tree with dynamic completion status
  const getUpdatedTree = (tree: SidebarSection[]) => {
    return tree.map(section => ({
      ...section,
      isCompleted: isSectionCompleted(section.id),
      children: section.children?.map(child => ({
        ...child,
        isCompleted: isSectionCompleted(child.id),
      })),
    }));
  };

  return (
    <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Top TESTS vs REPORTS Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setNavTab('TESTS')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors ${
            navTab === 'TESTS'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> TESTS
        </button>
        <button
          type="button"
          onClick={() => setNavTab('REPORTS')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors ${
            navTab === 'REPORTS'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          REPORTS
        </button>
      </div>

      {/* Search Input - Only show for TESTS tab */}
      {navTab === 'TESTS' && (
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for tests"
              className="w-full pl-10 pr-3 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-teal-500 focus:bg-white placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Main Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2">
        {getUpdatedTree(navTab === 'TESTS' ? ASIRA_EXAM_TREE : ASIRA_REPORTS_TREE).map((section) => {
          const isExp = !!expanded[section.id];
          const isCurrentActive = activeTab === section.id;

          return (
            <div key={section.id} className="text-sm">
              {section.isExpandable ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(section.id)}
                    className="w-full flex items-center justify-between py-2 text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      {section.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-700 text-[15px]">
                        {section.label}
                      </span>
                    </div>
                    {isExp ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </button>

                  {/* Children Sub-menu */}
                  {isExp && section.children && (
                    <div className="pl-7 space-y-1 py-1">
                      {section.children.map((child) => {
                        const isChildActive = activeTab === child.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setActiveTab(child.id)}
                            className={`w-full flex items-center gap-2.5 py-2 px-2 text-left rounded-md transition-all ${
                              isChildActive
                                ? 'bg-slate-50'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {child.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                            <span className={`text-[14px] ${
                              isChildActive ? 'text-slate-700 font-medium' : 'text-slate-600'
                            }`}>
                              {child.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Flat Root Item */
                <button
                  type="button"
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-2.5 py-2 px-2 text-left rounded-md transition-all ${
                    isCurrentActive
                      ? 'bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {section.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={`font-semibold text-[15px] ${
                    isCurrentActive ? 'text-slate-700' : 'text-slate-700'
                  }`}>
                    {section.label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
