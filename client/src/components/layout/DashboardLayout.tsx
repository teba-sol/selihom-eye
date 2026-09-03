import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, Eye, LogOut, Stethoscope } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    </div>
  );
};
