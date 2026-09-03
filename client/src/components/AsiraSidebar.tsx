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
    isCompleted: false,
    children: [
      { id: 'reason-for-visit', label: 'Reason For Visit', isCompleted: false },
      { id: 'symptomatic-history', label: 'Symptomatic History', isCompleted: false },
      { id: 'ocular-history', label: 'Ocular History', isCompleted: false },
      { id: 'systemic-history', label: 'Systemic History', isCompleted: false },
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
    isCompleted: false,
  },
  {
    id: 'refraction',
    label: 'Refraction',
    isExpandable: true,
    isCompleted: false,
    children: [
      { id: 'objective-subjective', label: 'Objective-subjective', isCompleted: false },
      { id: 'cycloplegic', label: 'Cycloplegic', isCompleted: false },
    ],
  },
  {
    id: 'binocular-vision-assessment',
    label: 'Binocular Vision Assessment',
    isExpandable: true,
    isCompleted: false,
    children: [
      { id: 'worth-4-dot', label: 'Worth 4 Dot Test', isCompleted: false },
      { id: 'ocular-motor-balance', label: 'Ocular Motor Balance', isCompleted: false },
      { id: 'near-point-of-convergence', label: 'Near Point Of Convergence', isCompleted: false },
      { id: 'amplitude-of-accommodation', label: 'Amplitude Of Accommodation', isCompleted: false },
      { id: 'ocular-motility', label: 'Ocular Motility', isCompleted: false },
      { id: 'pupil-evaluation', label: 'Pupil Evaluation', isCompleted: false },
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
    isCompleted: false,
  },
  {
    id: 'crystalline-lens',
    label: 'Crystalline Lens Evaluation',
    isExpandable: false,
    isCompleted: false,
  },
  {
    id: 'posterior-segment',
    label: 'Posterior Segment Evaluation',
    isExpandable: false,
    isCompleted: false,
  },
  {
    id: 'additional-tests',
    label: 'Additional Tests',
    isExpandable: true,
    isCompleted: false,
    children: [
      { id: 'tear-film', label: 'Tear Film Evaluation', isCompleted: false },
      { id: 'colour-vision', label: 'Colour Vision', isCompleted: false },
      { id: 'pachymetry', label: 'Pachymetry', isCompleted: false },
      { id: 'tonometry', label: 'Tonometry', isCompleted: false },
      { id: 'gonioscopy', label: 'Gonioscopy', isCompleted: false },
      { id: 'amsler', label: 'Amsler', isCompleted: false },
      { id: 'contrast-sensitivity', label: 'Contrast Sensitivity', isCompleted: false },
      { id: 'topography', label: 'Corneal Topography', isCompleted: false },
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

  // Deep "has meaningful data" check for module blobs managed via sectionData.
  const nonEmpty = (v: any): boolean => {
    if (v == null) return false;
    if (typeof v === 'string') return v.trim() !== '';
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (Array.isArray(v)) return v.some(nonEmpty);
    if (typeof v === 'object') return Object.values(v).some(nonEmpty);
    return false;
  };
  const sectionHasData = (sectionId: string) => nonEmpty(encounterState.sectionData[sectionId]);

  const isSectionCompleted = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'history-and-symptoms':
        return [
          'reason-for-visit',
          'symptomatic-history',
          'ocular-history',
          'systemic-history',
          'medication',
          'family-ocular-history',
          'family-systemic-history',
          'spectacles',
          'contact-lens',
          'lifestyle',
        ].some((id) => isSectionCompleted(id));
      case 'binocular-vision-assessment':
        return [
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
          'fusional-vergences',
          'diplopia-charting',
          'hess-screen',
          'aca-ratio',
        ].some((id) => isSectionCompleted(id));
      case 'worth-4-dot':
      case 'ocular-motor-balance':
      case 'near-point-of-convergence':
      case 'amplitude-of-accommodation':
      case 'ocular-motility':
      case 'pupil-evaluation':
      case 'stereopsis':
      case 'accommodative-lag':
      case 'accommodative-facility':
      case 'relative-accommodation':
      case 'fusional-vergences':
      case 'diplopia-charting':
      case 'hess-screen':
      case 'aca-ratio':
        return sectionHasData(sectionId);
      case 'additional-tests':
        return [
          'tear-film',
          'colour-vision',
          'pachymetry',
          'tonometry',
          'gonioscopy',
          'amsler',
          'contrast-sensitivity',
          'topography',
        ].some((id) => isSectionCompleted(id));
      case 'contact-lens-evaluation':
        return ['cl-pre-fit', 'cl-fitting'].some((id) => isSectionCompleted(id));
      case 'reason-for-visit':
        return encounterState.patient.reasonForVisit.trim() !== '';
      case 'symptomatic-history':
        return encounterState.symptoms.length > 0;
      case 'ocular-history':
        return (
          Object.values(encounterState.ocularHistory.conditions).some(c => c.active) ||
          !!encounterState.ocularHistory.noHistoryReported
        );
      case 'systemic-history':
        return (
          Object.values(encounterState.systemicHistory.conditions).some((c: any) => c.active) ||
          !!encounterState.systemicHistory.noHistoryReported
        );
      case 'medication':
        return (
          encounterState.patientMedications.length > 0 ||
          !!encounterState.sectionData['medication']?.none
        );
      case 'family-ocular-history':
        return (
          encounterState.familyOcularHistory.length > 0 ||
          !!encounterState.sectionData['family-ocular-history']?.noHistory
        );
      case 'family-systemic-history':
        return (
          encounterState.familySystemicHistory.length > 0 ||
          !!encounterState.sectionData['family-systemic-history']?.noHistory
        );
      case 'spectacles':
        return (
          encounterState.spectaclesHistory.currentlyWears === true ||
          !!encounterState.sectionData['spectacles']?.none
        );
      case 'contact-lens':
        return (
          encounterState.contactLensHistory.currentWearer === true ||
          !!encounterState.sectionData['contact-lens']?.none
        );
      case 'lifestyle': {
        const l = encounterState.lifestyleDemands;
        return l.occupation.trim() !== '' || l.hobbies.trim() !== '' || l.outdoorActivities.trim() !== '';
      }
      case 'vision-and-visual-acuity':
      case 'visual-acuity': {
        const va = encounterState.visualAcuity;
        return [va.od, va.os, va.ou].some((eye) =>
          Object.values(eye).some((scope) => Object.values(scope).some((v) => v.trim() !== '')),
        );
      }
      case 'refraction':
      case 'objective-subjective': {
        const rf = encounterState.refraction;
        if (rf.odSph.trim() !== '' || rf.osSph.trim() !== '') return true;
        const f = encounterState.sectionData['objective-subjective'] as any;
        if (!f) return sectionId === 'objective-subjective' ? false : isSectionCompleted('objective-subjective');
        const has = (o: any) =>
          !!o &&
          (String(o.sph ?? '').trim() !== '' ||
            String(o.cyl ?? '').trim() !== '' ||
            String(o.axis ?? '').trim() !== '' ||
            String(o.va ?? '').trim() !== '');
        return (
          has(f.subjOd?.dist) ||
          has(f.subjOs?.dist) ||
          has(f.objOd) ||
          has(f.objOs) ||
          String(f.subjOd?.near?.add ?? '').trim() !== '' ||
          String(f.subjOs?.near?.add ?? '').trim() !== '' ||
          String(f.subjOd?.inter?.add ?? '').trim() !== '' ||
          String(f.subjOs?.inter?.add ?? '').trim() !== ''
        );
      }
      case 'cycloplegic': {
        const f = encounterState.sectionData['cycloplegic'] as any;
        if (!f) return false;
        const has = (o: any) =>
          !!o &&
          (String(o.sph ?? '').trim() !== '' ||
            String(o.cyl ?? '').trim() !== '' ||
            String(o.axis ?? '').trim() !== '');
        return has(f.cycloOd) || has(f.cycloOs);
      }
      case 'tonometry':
        return (
          encounterState.tonometry.odIop.trim() !== '' ||
          encounterState.tonometry.osIop.trim() !== '' ||
          sectionHasData('tonometry')
        );
      case 'anterior-segment-eval':
        return (
          encounterState.slitLamp.cornea.trim() !== '' ||
          encounterState.odCanvasVectors !== '' ||
          sectionHasData('anterior-segment-eval')
        );
      case 'crystalline-lens':
        return sectionHasData('crystalline-lens');
      case 'posterior-segment':
        return sectionHasData('posterior-segment');
      case 'tear-film':
      case 'colour-vision':
      case 'pachymetry':
      case 'gonioscopy':
      case 'amsler':
      case 'contrast-sensitivity':
      case 'topography':
      case 'cl-pre-fit':
      case 'cl-fitting':
        return sectionHasData(sectionId);
      case 'action-and-advice':
        return sectionHasData('action-and-advice');
      case 'final-spectacle-prescription':
      case 'final-contact-lens-specification':
      case 'spectacle-dispensing':
      case 'discharge-summary':
        return sectionHasData(sectionId);
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
