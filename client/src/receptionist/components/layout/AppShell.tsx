import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListOrdered,
  Stethoscope,
  FileText,
  PenTool,
  Package,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  Menu,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { initials, formatDateTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Role } from '../../lib/types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
  end?: boolean;
}

interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    key: 'overview',
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: <LayoutDashboard size={19} />, roles: ['doctor', 'receptionist'], end: true }],
  },
  {
    key: 'clinical',
    label: 'Clinical',
    items: [
      { to: '/patients', label: 'Patients', icon: <Users size={19} />, roles: ['doctor', 'receptionist'] },
      { to: '/appointments', label: 'Appointments', icon: <CalendarDays size={19} />, roles: ['doctor', 'receptionist'] },
      { to: '/queue', label: 'Queue', icon: <ListOrdered size={19} />, roles: ['doctor', 'receptionist'] },
      { to: '/examinations', label: 'Examinations', icon: <Stethoscope size={19} />, roles: ['doctor'] },
      { to: '/prescriptions', label: 'Prescriptions', icon: <FileText size={19} />, roles: ['doctor'] },
      { to: '/surgeries', label: 'Surgeries', icon: <PenTool size={19} />, roles: ['doctor'] },
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    items: [{ to: '/inventory', label: 'Inventory', icon: <Package size={19} />, roles: ['doctor', 'receptionist'] }],
  },
];

const navItemBase =
  'flex items-center gap-[11px] whitespace-nowrap rounded-xl px-3 py-[10px] text-[13.5px] font-semibold text-[#b6c8e2] transition-all duration-150 hover:bg-white/[0.07] hover:text-white';

const navItemActive =
  'bg-teal/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(120,220,255,0.35),0_0_18px_rgba(43,140,255,0.20)]';

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('selihome_sidebar') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('selihome_nav_sections') ?? '{}');
    } catch {
      return {};
    }
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isDashboard = pathname === '/';

  useEffect(() => {
    localStorage.setItem('selihome_sidebar', collapsed ? '1' : '0');
  }, [collapsed]);

  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => {
      const next = { ...prev, [key]: !(prev[key] ?? false) };
      localStorage.setItem('selihome_nav_sections', JSON.stringify(next));
      return next;
    });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const sections = NAV
    .map((section) => ({ ...section, items: section.items.filter((i) => user && i.roles.includes(user.role)) }))
    .filter((section) => section.items.length > 0);

  const renderNavItem = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(navItemBase, isActive && navItemActive, collapsed && 'justify-center px-[11px]')}
      title={collapsed ? item.label : undefined}
      onClick={() => setMobileOpen(false)}
    >
      <span className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">{item.icon}</span>
      {!collapsed ? <span>{item.label}</span> : null}
    </NavLink>
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebar = (
    <nav
      className={cn(
        'flex h-full flex-col overflow-hidden p-4 transition-[width] duration-200',
        'border-r border-[rgba(120,210,255,0.10)] bg-[rgba(4,18,44,0.97)] backdrop-blur-[18px]',
        collapsed ? 'w-20 p-[10px]' : 'w-[256px]',
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-1.5 pb-6', collapsed && 'px-0 justify-center')}>
        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[radial-gradient(circle_at_35%_35%,#06b6d4,#0d52d6_60%,#0a46c9_130%)] text-white shadow-[0_4px_16px_rgba(25,200,255,0.25)]">
          <Eye size={20} />
        </div>
        {!collapsed ? (
          <div className="whitespace-nowrap leading-[1.15]">
            <div className="text-[17px] font-extrabold tracking-[-0.01em] text-white">Selihome</div>
            <div className="text-[11.5px] font-medium text-[#9db4d4]">Eye Care Clinic</div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[3px] overflow-y-auto">
        {collapsed
          ? sections.flatMap((section) => section.items.map(renderNavItem))
          : sections.map((section) => (
              <div className="flex flex-col gap-0.5" key={section.key}>
                <button
                  className="mt-1 flex w-full items-center justify-between gap-2 px-3 pb-1.5 pt-2 text-left text-[11.5px] font-extrabold uppercase tracking-[0.09em] text-[#9db4d4] transition-colors hover:text-white"
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={!collapsedSections[section.key]}
                >
                  <span className="leading-[1.2]">{section.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform duration-200', collapsedSections[section.key] && '-rotate-90')}
                  />
                </button>
                {!collapsedSections[section.key] ? (
                  <div className="flex flex-col gap-[3px]">{section.items.map(renderNavItem)}</div>
                ) : null}
              </div>
            ))}
      </div>

      <div className="border-t border-[rgba(120,220,255,0.10)] pt-3">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className={cn('flex items-center gap-2.5 px-1.5 py-1', collapsed && 'justify-center px-0')}>
              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#132347] text-[12px] font-extrabold text-[#b6c8e2]">
                {initials(user.name)}
              </div>
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-white">{user.name}</div>
                  <div className="text-[11.5px] text-[#9db4d4] capitalize">{user.role === 'doctor' ? 'Doctor' : 'Receptionist'}</div>
                </div>
              ) : null}
            </div>

            {!collapsed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#b6c8e2] hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );

  return (
    <div className={cn('flex h-dvh overflow-hidden bg-app', isDashboard && 'shell-bg')}>
      {collapsed ? null : <aside className="shrink-0">{sidebar}</aside>}
      {mobileOpen ? (
        <>
          <div className="fixed inset-0 z-[65] bg-scrim" onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 top-0 z-[70] animate-slide-right">
            <div className="h-full">{sidebar}</div>
          </div>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-header-line bg-header px-5 backdrop-blur-[16px]">
          <div className="flex items-center gap-1">
            <button
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-panel-soft hover:text-navy lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <button
              className="hidden h-[34px] w-[34px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-panel-soft hover:text-navy lg:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="whitespace-nowrap text-[13px] font-medium text-slate-500 max-sm:hidden">
              {formatDateTime(new Date().toISOString())}
            </div>
            <button
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-panel-soft hover:text-navy"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-700 bg-transparent py-[5px] pl-[5px] pr-3 transition-colors hover:border-teal"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#132347] text-[13px] font-extrabold text-[#b6c8e2]">
                  {initials(user?.name)}
                </div>
                <div className="hidden text-left leading-[1.15] sm:block">
                  <div className="text-[13px] font-bold text-navy">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{user?.role === 'doctor' ? 'Doctor' : 'Receptionist'}</div>
                </div>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 animate-pop-in overflow-hidden rounded-xl border border-line bg-panel shadow-panel">
                  <div className="border-b border-line px-4 py-3.5">
                    <div className="font-bold text-navy">{user?.name}</div>
                    <div className="text-[13px] text-slate-400">{user?.email}</div>
                  </div>
                  <button
                    className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.5px] font-semibold text-ink transition hover:bg-panel-soft"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    className="flex w-full items-center gap-2.5 px-4 py-[11px] text-left text-[13.5px] font-semibold text-ink transition hover:bg-panel-soft"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
