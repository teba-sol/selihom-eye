import React, { useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import {
  FileText, CheckCircle2, ChevronDown, ChevronRight,
  Search, Eye, Glasses, Activity, Stethoscope, Sparkles
} from 'lucide-react';

interface SubItem {
  id: string;
  label: string;
  completed?: boolean;
}

interface SectionGroup {
  id: string;
  title: string;
  items: SubItem[];
}

export const ASIRA_SIDEBAR_CONFIG: SectionGroup[] = [
  {
    id: 'history-and-symptoms',
    title: 'History And Symptoms',
    items: [
      { id: 'reason-for-visit', label: 'Reason For Visit', completed: true },
      { id: 'symptomatic-history', label: 'Symptomatic History', completed: true },
      { id: 'ocular-history', label: 'Ocular History', completed: true },
      { id: 'systemic-history', label: 'Systemic History', completed: true },
      { id: 'medication', label: 'Medication', completed: true },
      { id: 'family-ocular-history', label: 'Family Ocular History', completed: true },
      { id: 'family-systemic-history', label: 'Family Systemic History', completed: true },
      { id: 'spectacles', label: 'Spectacles', completed: true },
      { id: 'contact-lens', label: 'Contact Lens', completed: true },
      { id: 'lifestyle', label: 'Lifestyle', completed: true },
    ],
  },
  {
    id: 'vision-and-visual-acuity',
    title: 'Vision And Visual Acuity',
    items: [
      { id: 'visual-acuity', label: 'Visual Acuity', completed: true },
    ],
  },
  {
    id: 'refraction',
    title: 'Refraction',
    items: [
      { id: 'objective-refraction', label: 'Objective / Retinoscopy' },
      { id: 'subjective-refraction', label: 'Subjective Refraction', completed: true },
    ],
  },
  {
    id: 'binocular-vision-assessment',
    title: 'Binocular Vision Assessment',
    items: [
      { id: 'worth-4-dot', label: 'Worth 4 Dot Test' },
      { id: 'ocular-motor-balance', label: 'Ocular Motor Balance / Cover Test' },
      { id: 'npc', label: 'Near Point of Convergence (NPC)' },
      { id: 'amplitude-accommodation', label: 'Amplitude of Accommodation' },
      { id: 'ocular-motility', label: 'Ocular Motility' },
      { id: 'pupil-evaluation', label: 'Pupil Evaluation' },
      { id: 'stereopsis', label: 'Stereopsis' },
      { id: 'accommodative-tests', label: 'Accommodative & Vergence Testing' },
    ],
  },
  {
    id: 'anterior-segment',
    title: 'Anterior Segment',
    items: [
      { id: 'slit-lamp', label: 'Slit Lamp', completed: true },
      { id: 'cornea-canvas', label: 'Drawing', completed: true },
    ],
  },
  {
    id: 'posterior-segment',
    title: 'Posterior Segment',
    items: [
      { id: 'posterior-segment', label: 'Dilated / Undilated Fundus', completed: true },
    ],
  },
  {
    id: 'special-tests',
    title: 'Special Tests / Diagnostics',
    items: [
      { id: 'tear-film', label: 'Tear Film Evaluation', completed: true },
      { id: 'tonometry', label: 'Tonometry', completed: true },
      { id: 'topography', label: 'Investigations / Topography' },
    ],
  },
  {
    id: 'assessment-and-management',
    title: 'Assessment And Management',
    items: [
      { id: 'assessment-plan', label: 'Assessment & Advice', completed: true },
      { id: 'referral', label: 'Referral / Co-Management', completed: true },
    ],
  },
];

export const AsiraSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useEncounterStore();
  const [activeTopTab, setActiveTopTab] = useState<'TESTS' | 'REPORTS'>('TESTS');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'history-and-symptoms': true,
    'vision-and-visual-acuity': true,
    'refraction': true,
    'binocular-vision-assessment': true,
    'anterior-segment': true,
    'posterior-segment': true,
    'special-tests': true,
    'assessment-and-management': true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-xs">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTopTab('TESTS')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider text-center border-b-2 flex items-center justify-center gap-2 ${
            activeTopTab === 'TESTS'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> TESTS
        </button>
        <button
          onClick={() => setActiveTopTab('REPORTS')}
          className={`flex-1 py-3 text-xs font-bold tracking-wider text-center border-b-2 flex items-center justify-center gap-2 ${
            activeTopTab === 'REPORTS'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          REPORTS
        </button>
      </div>

      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for tests"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {ASIRA_SIDEBAR_CONFIG.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 fill-teal-50" />
                  <span>{group.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-4 pl-2 border-l border-slate-200 space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                          isActive
                            ? 'bg-teal-50 text-teal-800 font-bold border-l-2 border-teal-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
