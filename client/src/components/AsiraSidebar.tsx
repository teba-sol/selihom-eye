import React, { useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { CheckCircle2, Check, ChevronDown, ChevronRight, Search, FileText } from 'lucide-react';

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
      { id: 'objective-refraction', label: 'Objective / Retinoscopy', isCompleted: false },
      { id: 'subjective-refraction', label: 'Subjective Refraction', isCompleted: true },
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
    id: 'imaging-and-diagnostics',
    label: 'Imaging And Diagnostics',
    isExpandable: false,
    isCompleted: false,
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

export const AsiraSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useEncounterStore();
  const [navTab, setNavTab] = useState<'TESTS' | 'REPORTS'>('TESTS');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'history-and-symptoms': true,
    'refraction': false,
    'binocular-vision-assessment': false,
    'additional-tests': true,
    'contact-lens-evaluation': false,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-[270px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Top TESTS vs REPORTS Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setNavTab('TESTS')}
          className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            navTab === 'TESTS'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> TESTS
        </button>
        <button
          type="button"
          onClick={() => setNavTab('REPORTS')}
          className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            navTab === 'REPORTS'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          REPORTS
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for tests"
            className="w-full pl-3 pr-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {ASIRA_EXAM_TREE.map((section) => {
          const isExp = !!expanded[section.id];
          const isCurrentActive = activeTab === section.id;

          return (
            <div key={section.id} className="text-xs">
              {section.isExpandable ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(section.id)}
                    className="w-full flex items-center justify-between py-1.5 text-left text-slate-700 hover:text-slate-900 group"
                  >
                    <div className="flex items-center gap-2">
                      {section.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-50 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-700">{section.label}</span>
                    </div>
                    {isExp ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </button>

                  {/* Children Sub-menu */}
                  {isExp && section.children && (
                    <div className="pl-6 space-y-1 py-1">
                      {section.children.map((child) => {
                        const isChildActive = activeTab === child.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setActiveTab(child.id)}
                            className={`w-full flex items-center gap-2 py-1 text-left rounded transition-colors ${
                              isChildActive
                                ? 'text-blue-600 font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {child.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 fill-teal-50 shrink-0" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{child.label}</span>
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
                  className={`w-full flex items-center gap-2 py-1.5 text-left rounded transition-colors ${
                    isCurrentActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {section.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-50 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span className="font-semibold">{section.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
