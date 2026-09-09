import React from 'react';

interface DraftResumeModalProps {
  patientName: string;
  onCancel: () => void;
  onContinue: () => void;
}

export const DraftResumeModal: React.FC<DraftResumeModalProps> = ({ patientName, onCancel, onContinue }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 className="text-lg font-semibold text-[#0F2038]">Draft examination in progress</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        <span className="font-semibold text-slate-800">{patientName}</span> already has a draft
        examination in progress. Opening it will continue that draft — please finish and finalize
        the current draft before starting a new examination.
      </p>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          className="px-4 py-2 rounded-md bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          Open draft
        </button>
      </div>
    </div>
  </div>
);