import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, LogOut, Download, X, CheckCircle2 } from 'lucide-react';
import { downloadEncounterPdf } from '../lib/generatePdf';

interface TopHeaderProps {
  onEndExam?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onEndExam }) => {
  const encounterState = useEncounterStore();
  const { patient, consentObtained, setConsent } = encounterState;
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadPdf = () => {
    downloadEncounterPdf(useEncounterStore.getState());
  };

  return (
    <>
      <header className="w-full bg-[#0F2038] text-white shadow-md">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-wider text-teal-400 font-mono">SELIHOME</span>
            <span className="text-xs bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-500/40">
              EMR Clinic Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentObtained}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded text-teal-500 focus:ring-0"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Digital Consent Verified</span>
            </label>

            <button
              onClick={handleDownloadPdf}
              title="Download / Print PDF report"
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>

            <button
              onClick={() => setShowEndConfirm(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors"
            >
              End exam
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Patient Demographic Sub-Banner */}
        <div className="flex items-center gap-8 px-6 py-3 bg-[#132845] border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-sm shadow-inner">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {patient.name}
                <span className="text-[11px] font-normal text-slate-400 font-mono">({patient.mrn})</span>
              </h2>
              <p className="text-xs text-slate-300">
                {patient.age} years · {patient.gender}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
              Appointment time
            </span>
            <span className="text-xs font-medium text-slate-200">{patient.appointmentTime}</span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
              Reason for visit
            </span>
            <span className="text-xs font-medium text-teal-300">{patient.reasonForVisit}</span>
          </div>

          <div className="ml-auto">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download report
            </button>
          </div>
        </div>
      </header>

      {/* End Exam confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">End Examination?</h3>
              <button onClick={() => setShowEndConfirm(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              This will mark the exam as completed for <strong>{patient.name}</strong>.
            </p>
            <p className="text-xs text-slate-400 mb-5">
              You can still download the PDF report before closing.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF first
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndExam?.();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                End Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
