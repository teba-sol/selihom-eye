import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, Sparkles, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleSettings = () => {
    const action = window.confirm('Settings panel coming soon.\n\nLog out?');
    if (action) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <aside className="w-[200px] bg-[#1a2744] flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-lg tracking-wide">ASIRA</span>
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
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-[#1a2744] flex items-center justify-end px-6 shrink-0">
          <button
            onClick={handleSettings}
            className="flex items-center gap-2 text-white text-sm hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
};
