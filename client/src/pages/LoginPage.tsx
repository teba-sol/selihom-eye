import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'RECEPTIONIST') {
        navigate('/receptionist', { replace: true });
      } else {
        navigate('/patients', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'RECEPTIONIST') {
        navigate('/receptionist');
      } else {
        navigate('/patients');
      }
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] text-white flex flex-col">
      
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/20 to-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      {/* ================= TOP BRAND - Compact ================= */}
      <header className="relative z-20 flex justify-center pt-5 sm:pt-7 flex-shrink-0">
        <div className="flex flex-col items-center">
          {/* Logo - Smaller */}
          <div className="relative">
            <div
              className="
                relative flex h-[56px] w-[56px] items-center justify-center
                rounded-[18px]
                bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-600
                shadow-[0_0_40px_rgba(34,211,238,0.25)]
                ring-1 ring-white/20
              "
            >
              <div className="absolute inset-[2px] rounded-[16px] bg-gradient-to-br from-white/20 to-transparent" />
              <Eye className="relative z-10 h-7 w-7 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1
            className="
              mt-2.5 text-[22px] font-black tracking-[0.2em]
              bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300
              bg-clip-text text-transparent
              drop-shadow-lg
            "
          >
            SELIHOME
          </h1>

          <div className="flex items-center gap-3 mt-0.5">
            <div className="h-px w-6 bg-gradient-to-r from-transparent to-cyan-400/50" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-200/60">
              Ophthalmic Medium Clinic
            </p>
            <div className="h-px w-6 bg-gradient-to-l from-transparent to-cyan-400/50" />
          </div>
        </div>
      </header>

      {/* ================= MAIN - Centered ================= */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-4 sm:px-6">
        <div className="w-full max-w-[400px]">
          {/* Card glow effect */}
          <div className="absolute left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-[40px] bg-gradient-to-r from-cyan-400/15 via-blue-500/15 to-violet-500/15 blur-[90px]" />

          {/* ================= GLASS CARD ================= */}
          <div
            className="
              relative overflow-hidden rounded-[28px]
              border border-white/10
              bg-gradient-to-br from-[#0a1e3d]/80 via-[#0f2a4a]/80 to-[#1a3a5c]/80
              shadow-[0_30px_120px_rgba(0,0,0,0.6)]
              backdrop-blur-2xl
            "
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="relative px-6 py-7 sm:px-8 sm:py-8">
              {/* ================= CARD HEADER ================= */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                      Secure
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400/50">•</span>
                  <span className="text-[8px] font-medium text-slate-400/40 uppercase tracking-wider">
                    v3.2.1
                  </span>
                </div>

                <h2 className="text-[26px] font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-slate-300/60">
                  Sign in to continue to your clinic workspace.
                </p>
              </div>

              {/* ================= FORM ================= */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-300/70">
                    <Mail className="h-3 w-3" />
                    Email or phone number
                  </label>

                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-400">
                      <Mail className="h-[16px] w-[16px]" />
                    </div>

                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@selihome.com"
                      autoComplete="username"
                      className="
                        h-[48px] w-full rounded-xl
                        border border-white/10
                        bg-white/[0.05]
                        pl-10 pr-4
                        text-sm text-white
                        placeholder:text-slate-500
                        outline-none
                        transition-all duration-300
                        focus:border-cyan-400/50
                        focus:bg-white/[0.08]
                        focus:ring-4
                        focus:ring-cyan-400/10
                        hover:border-white/20
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-300/70">
                    <Lock className="h-3 w-3" />
                    Password
                  </label>

                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-400">
                      <Lock className="h-[16px] w-[16px]" />
                    </div>

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="
                        h-[48px] w-full rounded-xl
                        border border-white/10
                        bg-white/[0.05]
                        pl-10 pr-11
                        text-sm text-white
                        placeholder:text-slate-500
                        outline-none
                        transition-all duration-300
                        focus:border-cyan-400/50
                        focus:bg-white/[0.08]
                        focus:ring-4
                        focus:ring-cyan-400/10
                        hover:border-white/20
                      "
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-[16px] w-[16px]" />
                      ) : (
                        <Eye className="h-[16px] w-[16px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password + Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-3.5 h-3.5 rounded border border-white/20 bg-white/5 flex items-center justify-center transition-all group-hover:border-white/40">
                      <input type="checkbox" className="opacity-0 absolute" />
                      <div className="w-1.5 h-1.5 rounded-sm bg-cyan-400 opacity-0 group-hover:opacity-20" />
                    </div>
                    <span className="text-[11px] text-slate-400/70 group-hover:text-slate-300 transition-colors">
                      Remember me
                    </span>
                  </label>
                  
                  <Link
                    to="/forgot-password"
                    onClick={(e) => e.preventDefault()}
                    className="
                      text-[11px] font-medium
                      text-cyan-300/80
                      transition-all duration-300
                      hover:text-cyan-200
                      hover:underline
                    "
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="
                      rounded-xl
                      border border-red-400/20
                      bg-red-500/10
                      px-4 py-2.5
                      text-xs text-red-200
                    "
                  >
                    {error}
                  </div>
                )}

                {/* ================= SIGN IN ================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group relative h-[48px] w-full overflow-hidden
                    rounded-xl

                    bg-gradient-to-r
                    from-blue-600
                    via-cyan-500
                    to-teal-400
                    bg-[length:200%_100%]

                    text-sm font-bold text-white

                    shadow-[0_10px_30px_rgba(6,182,212,0.2)]

                    transition-all duration-500

                    hover:-translate-y-[1px]
                    hover:shadow-[0_14px_40px_rgba(6,182,212,0.3)]
                    hover:bg-[position:100%_0%]

                    active:translate-y-0
                    active:shadow-[0_8px_20px_rgba(6,182,212,0.15)]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                  "
                >
                  {/* Shine effect */}
                  <span
                    className="
                      absolute inset-0
                      -translate-x-full
                      bg-gradient-to-r
                      from-transparent
                      via-white/25
                      to-transparent
                      transition-transform duration-700
                      group-hover:translate-x-full
                    "
                  />

                  <span className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* ================= FOOTER NOTE ================= */}
              <div className="mt-5 text-center">
                <p className="text-[9px] text-slate-400/40">
                  Protected by end-to-end encryption
                  <span className="mx-2">•</span>
                  <span className="text-emerald-400/50">●</span>
                  <span className="mx-2">•</span>
                  HIPAA compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-20 pb-5 text-center flex-shrink-0">
        <div className="flex items-center justify-center gap-3 text-[9px] tracking-wide text-slate-400/30">
          <span>Selihome Ophthalmic Medium Clinic</span>
          <span className="text-cyan-500/20">•</span>
          <span className="flex items-center gap-1">
            <Activity className="h-2.5 w-2.5 text-emerald-400/30" />
            PECC
          </span>
        </div>
      </footer>
    </div>
  );
};