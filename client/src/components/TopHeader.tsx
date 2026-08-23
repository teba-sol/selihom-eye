import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEncounterStore } from '../store/useEncounterStore';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, LogOut } from 'lucide-react';

interface TopHeaderProps {
  onEndExam?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onEndExam }) => {
  const { patient, consentObtained, setConsent } = useEncounterStore();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-[#0F2038] text-white shadow-md">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-wider text-teal-400 font-mono">SELIHOME</span>
          <span className="text-xs bg-teal-900/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-500/40">
            EMR Clinic Engine
          </span>
        </div>

        <div className="flex items-center gap-4">
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
            onClick={onEndExam}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-xs transition-colors"
          >
            End exam
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-xs transition-colors"
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
      </div>
    </header>
  );
};
