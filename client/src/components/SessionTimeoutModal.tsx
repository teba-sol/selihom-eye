import React, { useEffect, useRef, useState } from 'react';
import { Clock, LogOut, RefreshCw, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';

const IDLE_MS = 60 * 60 * 1000; // 1 hour without interaction
const GRACE_MS = 5 * 60 * 1000; // auto-logout if popup untouched for 5 minutes

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'click'] as const;

export const SessionTimeoutModal: React.FC = () => {
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const restoring = useAuthStore((s) => s.restoring);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const lastActivity = useRef<number>(Date.now());

  const handleLogout = () => {
    setOpen(false);
    setBusy(false);
    logout();
  };

  const handleExtend = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await api.refreshAccessToken();
    setBusy(false);
    lastActivity.current = Date.now();
    if (ok) {
      setOpen(false);
    } else {
      handleLogout();
    }
  };

  useEffect(() => {
    lastActivity.current = Date.now();
    const onActivity = () => {
      lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    const ticker = window.setInterval(() => {
      if (restoring) return;
      if (!isAuthenticated) {
        if (open) setOpen(false);
        return;
      }
      const idleFor = Date.now() - lastActivity.current;
      if (open) {
        if (idleFor >= GRACE_MS) handleLogout();
      } else if (idleFor >= IDLE_MS) {
        setOpen(true);
      }
    }, 15_000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.clearInterval(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoring, isAuthenticated]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#081b3d] shadow-2xl">
        <div className="h-[2px] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
        <div className="px-6 py-7 sm:px-8">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
              Inactivity notice
            </span>
            <button
              onClick={handleLogout}
              className="ml-auto rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10">
            <Clock className="h-6 w-6 text-amber-300" />
          </div>

          <h2 className="text-[22px] font-bold tracking-tight text-white">Session idle</h2>
          <p className="mt-1.5 text-sm leading-5 text-slate-300/75">
            There has been no activity for over 1 hour. Your work is fully preserved — extend your
            session to keep going, or log out to end it.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleExtend}
              disabled={busy}
              className="group relative flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-sm font-bold text-white shadow-[0_10px_30px_rgba(6,182,212,0.25)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_14px_38px_rgba(6,182,212,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              {busy ? 'Extending…' : 'Extend session & continue'}
            </button>

            <button
              onClick={handleLogout}
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>

            <p className="text-center text-[11px] text-slate-500">
              If you do not respond within 5 minutes, you will be logged out automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};