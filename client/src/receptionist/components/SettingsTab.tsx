import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, User, Save, Bell } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [facilityName, setFacilityName] = useState('Selihome Ophthalmic Medium Clinic');
  const [facilityCode, setFacilityCode] = useState('SOMC-01');
  const [nurseName, setNurseName] = useState('Sister Selamawit Tadesse');
  const [receptionDesk, setReceptionDesk] = useState('Main Reception & Triage Station A');
  const [defaultDoctor, setDefaultDoctor] = useState('Dr. Eyasu (Ophthalmic Specialist)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          Clinic Configuration
        </div>
        <h1 className="text-2xl font-extrabold text-[#102a43]">
          Facility & Reception / Nurse Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage clinic branding, triage defaults, and station profiles.
        </p>
      </section>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="clinic-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="clinic-label">FACILITY FULL NAME</label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="clinic-input font-bold"
            />
          </div>

          <div>
            <label className="clinic-label">FACILITY CODE</label>
            <input
              type="text"
              value={facilityCode}
              onChange={(e) => setFacilityCode(e.target.value)}
              className="clinic-input font-bold"
            />
          </div>

          <div>
            <label className="clinic-label">NURSE / RECEPTIONIST IN CHARGE</label>
            <input
              type="text"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
              className="clinic-input"
            />
          </div>

          <div>
            <label className="clinic-label">RECEPTION / TRIAGE DESK</label>
            <input
              type="text"
              value={receptionDesk}
              onChange={(e) => setReceptionDesk(e.target.value)}
              className="clinic-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="clinic-label">DEFAULT CONSULTING DOCTOR ROOM</label>
            <input
              type="text"
              value={defaultDoctor}
              onChange={(e) => setDefaultDoctor(e.target.value)}
              className="clinic-input"
            />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="clinic-button clinic-button-primary">
            <Save className="w-4 h-4" /> Save Clinic Settings
          </button>
        </div>
      </form>
    </div>
  );
};
