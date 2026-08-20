import React from 'react';
import type { SystemicConditionDetail } from '../store/useEncounterStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { FileCheck, Activity } from 'lucide-react';

const SYSTEMIC_CONFIG = [
  { key: 'diabetes', title: 'Diabetes Mellitus', types: ['Type 2 (NIDDM)', 'Type 1 (IDDM)', 'Gestational', 'Pre-Diabetes / Impaired Fasting'] },
  { key: 'hypertension', title: 'Hypertension (High Blood Pressure)', types: ['Essential / Primary', 'Secondary', 'Malignant / Accelerated'] },
  { key: 'thyroid', title: 'Thyroid Disease', types: ['Hypothyroidism (Hashimoto)', 'Hyperthyroidism / Graves', 'Euthyroid Goitre'] },
  { key: 'autoimmune', title: 'Autoimmune & Rheumatic Disease', types: ['Rheumatoid Arthritis', 'Systemic Lupus Erythematosus (SLE)', 'Ankylosing Spondylitis', "Sjogren's Syndrome", 'Sarcoidosis'] },
  { key: 'cardiovascular', title: 'Cardiovascular / Heart Disease', types: ['Coronary Artery Disease', 'Myocardial Infarction', 'Arrhythmia / AFib', 'Heart Failure'] },
  { key: 'cholesterol', title: 'Hyperlipidemia / High Cholesterol', types: ['Mixed Hyperlipidemia', 'Hypercholesterolemia', 'Hypertriglyceridemia'] },
  { key: 'respiratoryAsthma', title: 'Respiratory Disease / Asthma', types: ['Bronchial Asthma', 'COPD', 'Sleep Apnea'] },
  { key: 'allergies', title: 'Allergies & Drug Sensitivities', types: ['Penicillin / Beta-lactams', 'Sulfa Drugs', 'Latex', 'Seasonal / Atopic', 'Preservatives (BAK)'] },
];

export const SystemicHistoryView: React.FC = () => {
  const {
    systemicHistory,
    updateSystemicCondition,
    setSystemicGeneralRemarks,
    setNoSystemicHistory,
  } = useEncounterStore();

  return (
    <div className="p-8 max-w-4xl bg-white rounded-xl shadow-xs border border-slate-200 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-[#1E3A8A] flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Systemic Medical History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record general medical conditions, glycemic control, hypertension, and systemic risk factors.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={systemicHistory.noHistoryReported}
            onChange={(e) => setNoSystemicHistory(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
          />
          <span>No Systemic History Reported</span>
        </label>
      </div>

      {!systemicHistory.noHistoryReported && (
        <div className="space-y-4">
          {SYSTEMIC_CONFIG.map((config) => {
            const detail: SystemicConditionDetail = (systemicHistory.conditions as any)[config.key] || {
              active: false,
              durationValue: 1,
              durationUnit: 'years',
              type: config.types[0],
              controlStatus: 'Well Controlled',
              remarks: '',
              showInDischarge: true,
            };

            return (
              <div
                key={config.key}
                className={`border rounded-lg transition-all ${
                  detail.active
                    ? 'border-slate-300 bg-slate-50/70 p-4 shadow-xs'
                    : 'border-transparent p-2 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detail.active}
                      onChange={() => updateSystemicCondition(config.key, { active: !detail.active })}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-0"
                    />
                    <span>{config.title}</span>
                  </label>

                  {detail.active && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={detail.showInDischarge}
                        onChange={(e) => updateSystemicCondition(config.key, { showInDischarge: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-teal-600 border-slate-300 focus:ring-0"
                      />
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Show in discharge</span>
                    </label>
                  )}
                </div>

                {detail.active && (
                  <div className="ml-7 space-y-4 pt-3 mt-2 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Classification / Type</label>
                        <select
                          value={detail.type || config.types[0]}
                          onChange={(e) => updateSystemicCondition(config.key, { type: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-hidden focus:border-teal-600"
                        >
                          {config.types.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Duration</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={detail.durationValue || 1}
                            onChange={(e) => updateSystemicCondition(config.key, { durationValue: parseInt(e.target.value, 10) || 1 })}
                            className="w-16 px-2 py-2 text-xs border border-slate-300 rounded-md bg-white text-center font-bold"
                          />
                          <select
                            value={detail.durationUnit || 'years'}
                            onChange={(e) => updateSystemicCondition(config.key, { durationUnit: e.target.value as any })}
                            className="flex-1 px-2 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium"
                          >
                            <option value="months">Months</option>
                            <option value="years">Years</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Clinical Control</label>
                        <select
                          value={detail.controlStatus || 'Well Controlled'}
                          onChange={(e) => updateSystemicCondition(config.key, { controlStatus: e.target.value as any })}
                          className={`w-full px-3 py-2 text-xs border rounded-md font-bold ${
                            detail.controlStatus === 'Poorly Controlled' || detail.controlStatus === 'Uncontrolled'
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="Well Controlled">Well Controlled</option>
                          <option value="Moderately Controlled">Moderately Controlled</option>
                          <option value="Poorly Controlled">Poorly Controlled</option>
                          <option value="Uncontrolled">Uncontrolled / Unchecked</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Medications, Fasting Glucose / HbA1c, or Specific Notes</label>
                      <textarea
                        rows={2}
                        value={detail.remarks}
                        onChange={(e) => updateSystemicCondition(config.key, { remarks: e.target.value })}
                        placeholder="e.g., Last HbA1c 6.8% (2 months ago), on Metformin 500mg BD..."
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:border-teal-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Any other systemic history / General Remarks
        </label>
        <textarea
          rows={3}
          value={systemicHistory.generalRemarks}
          onChange={(e) => setSystemicGeneralRemarks(e.target.value)}
          placeholder="Enter surgical history, hospital admissions, or general medical notes not listed above..."
          className="w-full p-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-teal-600"
        />
      </div>
    </div>
  );
};
