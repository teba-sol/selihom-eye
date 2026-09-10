import React, { useEffect, useState, useCallback } from 'react';
import { Lock, X, Eye } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { onSessionExpired, onSessionRestored, notifySessionRestored } from '../lib/authExpired';

export const SessionExpiredModal: React.FC = () => {
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const offExpired = onSessionExpired(() => setOpen(true));
    const offRestored = onSessionRestored(() => setOpen(false));
    return () => {
      offExpired();
      offRestored();
    };
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setPassword('');
    setError('');
    logout();
    window.location.href = '/login';
  }, [logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setError('');
    setLoading(true);
    const result = await login(user.email, password);
    setLoading(false);
    if (result.success) {
      setPassword('');
      notifySessionRestored();
    } else {
      setError(result.error ?? 'Unable to re-authenticate.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#081b3d] shadow-2xl">
        <div className="h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
        <div className="px-6 py-7 sm:px-8">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
              Session expired
            </span>
            <button
              onClick={handleCancel}
              className="ml-auto rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[22px] font-bold tracking-tight text-white">Re-enter your password</h2>
          <p className="mt-1.5 text-sm leading-5 text-slate-300/75">
            Your session has expired. Your current work is preserved — enter your password to continue where you left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Email
              </label>
              <input
                type="text"
                value={user?.email ?? ''}
                readOnly
                className="h-[48px] w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus
                  autoComplete="current-password"
                  className="h-[48px] w-full rounded-xl border border-white/10 bg-white/[0.07] pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/60 focus:bg-white/[0.10] focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="group relative flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-sm font-bold text-white shadow-[0_10px_30px_rgba(6,182,212,0.25)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_14px_38px_rgba(6,182,212,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {loading ? 'Re-authenticating...' : 'Continue'}
              </span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-200 hover:underline"
              >
                Cancel and sign out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
