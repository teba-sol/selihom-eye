import React from 'react';
import { Calendar } from 'lucide-react';
import { useEncounterStore } from '../store/useEncounterStore';
import type { SystemicConditionDetail } from '../store/useEncounterStore';

interface ConditionState {
  active: boolean;
  dateOfDiagnosis: string;
}

const LEFT_CONDITIONS = [
  { key: 'dm1', label: 'Diabetes Type 1' },
  { key: 'dm2_non_insulin', label: 'Diabetes Type 2 Non Insulin Dependent' },
  { key: 'connective_tissue', label: 'Connective Tissue Disorder' },
  { key: 'kidney', label: 'Kidney Disorders' },
  { key: 'hyperthyroid', label: 'Hyperthyroidism' },
  { key: 'tb', label: 'Tuberculosis' },
  { key: 'cardiac', label: 'Cardiac Disorder' },
  { key: 'allergy', label: 'Allergy' },
  { key: 'inflammatory', label: 'Inflammatory disorder' },
];

const RIGHT_CONDITIONS = [
  { key: 'dm2_insulin', label: 'Diabetes Type 2 Insulin Dependent' },
  { key: 'htn', label: 'Hypertension' },
  { key: 'asthma', label: 'Asthma' },
  { key: 'hypothyroid', label: 'Hypothyroidism' },
  { key: 'dental', label: 'Dental Disorder' },
  { key: 'preterm', label: 'Pre-Term Birth' },
  { key: 'eczema', label: 'Eczema' },
  { key: 'autoimmune', label: 'Autoimmune disorder' },
  { key: 'myasthenia', label: 'Myasthenia Gravis' },
];

export const SystemicHistoryView: React.FC = () => {
  const systemicHistory = useEncounterStore((s) => s.systemicHistory);
  const setSystemicConditions = useEncounterStore((s) => s.setSystemicConditions);
  const setNoSystemicHistory = useEncounterStore((s) => s.setNoSystemicHistory);
  const sectionData = useEncounterStore((s) => s.sectionData);
  const setSectionData = useEncounterStore((s) => s.setSectionData);

  const conditions = systemicHistory.conditions;
  const noHistory = systemicHistory.noHistoryReported;
  const extra = (sectionData['systemic-history'] ?? { remarks: '', showInDischarge: false }) as {
    remarks: string;
    showInDischarge: boolean;
  };

  const updateExtra = (patch: Partial<typeof extra>) =>
    setSectionData('systemic-history', { ...extra, ...patch });

  const handleNoHistoryChange = (checked: boolean) => {
    setNoSystemicHistory(checked);
    if (checked) {
      setSystemicConditions({});
    }
  };

  const toggleCondition = (key: string, label: string) => {
    const current: SystemicConditionDetail = conditions[key] ?? { active: false as const, dateOfDiagnosis: '' };
    setSystemicConditions({
      ...conditions,
      [key]: {
        ...current,
        active: !current.active,
        type: label,
      },
    });
  };

  const updateDate = (key: string, date: string) => {
    setSystemicConditions({
      ...conditions,
      [key]: {
        ...(conditions[key] ?? { active: false as const }),
        dateOfDiagnosis: date,
      },
    });
  };

  const renderConditionItem = (item: { key: string; label: string }) => {
    const state: ConditionState = (conditions[item.key] ?? { active: false, dateOfDiagnosis: '' }) as ConditionState;

    return (
      <div key={item.key} className="space-y-1.5">
        <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={state.active}
            disabled={noHistory}
            onChange={() => toggleCondition(item.key, item.label)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 disabled:opacity-40"
          />
          <span>{item.label}</span>
        </label>

        {state.active && !noHistory && (
          <div className="pl-7 pt-1">
            <span className="text-[11px] text-slate-400 block mb-1">Date of diagnosis</span>
            <div className="relative max-w-[260px] flex items-center">
              <input
                type="text"
                value={state.dateOfDiagnosis}
                onChange={(e) => updateDate(item.key, e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full pl-3 pr-8 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-white"
              />
              <Calendar className="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-2xl font-bold text-[#2563eb] mb-6">Systemic History</h1>

      {/* No Systemic History Reported Master Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={noHistory}
            onChange={(e) => handleNoHistoryChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>No Systemic History Reported</span>
        </label>
      </div>

      {/* 2-Column Checkbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
        <div className="space-y-4">
          {LEFT_CONDITIONS.map(renderConditionItem)}
        </div>
        <div className="space-y-4">
          {RIGHT_CONDITIONS.map(renderConditionItem)}
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6 max-w-4xl">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={extra.remarks}
          onChange={(e) => updateExtra({ remarks: e.target.value })}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end max-w-4xl">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={extra.showInDischarge}
            onChange={(e) => updateExtra({ showInDischarge: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
