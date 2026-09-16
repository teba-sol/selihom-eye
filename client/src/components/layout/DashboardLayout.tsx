import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, Eye, LogOut, Stethoscope, Settings, Trash2, Download } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/api';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../../lib/toast';
import { exportPatientRecordsZip } from '../../lib/exportPatientRecords';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [confirmClean, setConfirmClean] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const showStorageWarning = () => setConfirmClean(true);
    window.addEventListener('database-storage-full', showStorageWarning);
    return () => window.removeEventListener('database-storage-full', showStorageWarning);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleClean = async () => {
    setCleaning(true);
    try {
      const result = await api.delete<{ deletedPatients: number }>('/patients/purge');
      toast.success(`Database reset: ${result.deletedPatients} patient record(s) removed.`);
      setConfirmClean(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not clear the database.');
    } finally { setCleaning(false); }
  };
  const handleExport = async () => {
    setExporting(true);
    try {
      const records = await api.get<any[]>('/patients/export-records');
      await exportPatientRecordsZip(records);
      toast.success(`Exported ${records.length} patient record(s) to ZIP.`);
    } catch (err: any) { toast.error(err?.message ?? 'Could not export patient records.'); }
    finally { setExporting(false); }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <aside className="w-[200px] bg-[#1a2744] flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34d399] to-[#14b8a6] flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </span>
          <span className="text-white font-bold text-lg tracking-wide">SELIHOME</span>
        </div>

        <nav className="flex-1 px-2 pt-2 space-y-1">
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                isActive
                  ? 'bg-[#2a3f6b] text-white'
                  : 'text-slate-300 hover:bg-[#243659] hover:text-white'
              }`
            }
          >
            <Users className="w-4 h-4" />
            Patients
          </NavLink>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                isActive
                  ? 'bg-[#2a3f6b] text-white'
                  : 'text-slate-300 hover:bg-[#243659] hover:text-white'
              }`
            }
          >
            <Calendar className="w-4 h-4" />
            Appointments
          </NavLink>
          <NavLink
            to="/surgeries"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors ${
                isActive
                  ? 'bg-[#2a3f6b] text-white'
                  : 'text-slate-300 hover:bg-[#243659] hover:text-white'
              }`
            }
          >
            <Stethoscope className="w-4 h-4" />
            Surgeries
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 px-2 mb-2 truncate">{user?.name ?? 'Doctor'}</div>
          {user?.role === 'DOCTOR' && (
            <button
              onClick={handleExport}
              disabled={exporting}
              title="Download one PDF discharge-summary record for each patient"
              className="mb-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-emerald-200 transition-colors hover:bg-emerald-600/20 hover:text-emerald-100 disabled:opacity-60"
            >
              <Download className="w-4 h-4 shrink-0" /> {exporting ? 'Exporting…' : 'Export patient discharge PDFs'}
            </button>
          )}
          {user?.role === 'DOCTOR' && (
            <button onClick={() => setConfirmClean(true)} className="mb-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-rose-200 transition-colors hover:bg-rose-600/20 hover:text-rose-100">
              <Trash2 className="w-4 h-4" /> Clear database
            </button>
          )}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 w-full px-3 py-2 text-sm rounded-sm transition-colors mb-1 ${
                isActive
                  ? 'bg-[#2a3f6b] text-white'
                  : 'text-slate-300 hover:bg-[#243659] hover:text-white'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-rose-600/20 hover:text-rose-300 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
      {confirmClean && <ConfirmDialog title="Clear patient database?" message="First make sure you have the patients' records in PDF. This permanently removes every patient record and related appointment, examination, billing, and optical-order data." confirmLabel="OK, reset" cancelLabel="Cancel" busy={cleaning} onConfirm={handleClean} onCancel={() => setConfirmClean(false)} />}
    </div>
  );
};
