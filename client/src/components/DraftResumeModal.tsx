import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DraftResumeModalProps {
  patientName: string;
  onCancel: () => void;
  onContinue: () => void;
}

export const DraftResumeModal: React.FC<DraftResumeModalProps> = ({ patientName, onCancel, onContinue }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F2038]">Draft examination in progress</h3>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">{patientName}</span> already has a draft
          examination in progress. Opening it will continue that draft — please finish and finalize
          the current draft before starting a new examination.
        </p>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-white text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          className="px-4 py-2 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium transition-colors"
        >
          Open draft
        </button>
      </div>
    </div>
  </div>
);