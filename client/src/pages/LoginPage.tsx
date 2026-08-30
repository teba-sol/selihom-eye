import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  <div className="relative min-h-screen overflow-hidden bg-[#03142f] text-white">
    {/* ================= BACKGROUND ================= */}
    <div className="absolute inset-0">
      <img
        src="/image.png"
        alt=""
        className="
          h-full w-full object-cover object-center
          scale-[1.04]
          opacity-[0.82]
          animate-[loginBgDrift_35s_ease-in-out_infinite_alternate]
        "
      />

      {/* Navy cinematic overlay */}
      <div className="absolute inset-0 bg-[#03142f]/35" />

      {/* Left readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#03142f]/80 via-[#03142f]/35 to-transparent" />

      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03142f]/85 via-transparent to-[#03142f]/25" />

      {/* Ambient cyan glow */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
    </div>

    {/* ================= TOP BRAND ================= */}
    <header className="relative z-20 flex justify-center pt-8 sm:pt-10">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div
          className="
            relative flex h-[62px] w-[62px] items-center justify-center
            rounded-[20px]
            bg-gradient-to-br from-cyan-300 via-teal-400 to-blue-600
            shadow-[0_0_45px_rgba(34,211,238,0.35)]
            ring-1 ring-white/30
          "
        >
          <div className="absolute inset-[2px] rounded-[18px] bg-gradient-to-br from-white/20 to-transparent" />

          <Eye className="relative z-10 h-8 w-8 text-white drop-shadow-lg" />
        </div>

        <h1
          className="
            mt-3 text-[25px] font-black tracking-[0.18em]
            text-white drop-shadow-lg
          "
        >
          SELIHOME
        </h1>

        <p
          className="
            mt-1 text-[10px] font-semibold uppercase
            tracking-[0.32em] text-cyan-100/80
          "
        >
          Ophthalmic Medium Clinic
        </p>
      </div>
    </header>

    {/* ================= MAIN ================= */}
    <main className="relative z-20 flex min-h-[calc(100vh-170px)] items-center justify-center px-4 py-8 sm:px-6">
      <div
        className="
          w-full max-w-[430px]
          animate-[loginCardIn_0.55s_ease-out_both]
        "
      >
        {/* Outer glow */}
        <div
          className="
            absolute left-1/2 -z-10
            h-[420px] w-[430px]
            -translate-x-1/2
            rounded-[36px]
            bg-cyan-400/10
            blur-[70px]
          "
        />

        {/* ================= GLASS CARD ================= */}
        <div
          className="
            overflow-hidden rounded-[28px]
            border border-white/20
            bg-[#081b3d]/75
            shadow-[0_30px_100px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
          "
        >
          {/* Top gradient line */}
          <div
            className="
              h-[2px]
              bg-gradient-to-r
              from-cyan-400 via-blue-500 to-violet-500
            "
          />

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            {/* ================= CARD HEADER ================= */}
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/70">
                  Secure clinic access
                </span>
              </div>

              <h2 className="text-[27px] font-bold tracking-tight text-white">
                Welcome back
              </h2>

              <p className="mt-1.5 text-sm leading-5 text-slate-300/75">
                Sign in to continue to your clinic workspace.
              </p>
            </div>

            {/* ================= FORM ================= */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                  Email or phone number
                </label>

                <div className="group relative">
                  <Mail
                    className="
                      absolute left-4 top-1/2 z-10
                      h-[18px] w-[18px]
                      -translate-y-1/2
                      text-slate-400
                      transition-colors
                      group-focus-within:text-cyan-400
                    "
                  />

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@selihome.com"
                    autoComplete="username"
                    className="
                      h-[50px] w-full rounded-xl
                      border border-white/10
                      bg-white/[0.07]
                      pl-11 pr-4
                      text-sm text-white
                      placeholder:text-slate-500
                      outline-none
                      transition-all

                      focus:border-cyan-400/60
                      focus:bg-white/[0.10]
                      focus:ring-4
                      focus:ring-cyan-400/10

                      hover:border-white/20
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                  Password
                </label>

                <div className="group relative">
                  <Lock
                    className="
                      absolute left-4 top-1/2 z-10
                      h-[18px] w-[18px]
                      -translate-y-1/2
                      text-slate-400
                      transition-colors
                      group-focus-within:text-cyan-400
                    "
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="
                      h-[50px] w-full rounded-xl
                      border border-white/10
                      bg-white/[0.07]
                      pl-11 pr-4
                      text-sm text-white
                      placeholder:text-slate-500
                      outline-none
                      transition-all

                      focus:border-cyan-400/60
                      focus:bg-white/[0.10]
                      focus:ring-4
                      focus:ring-cyan-400/10

                      hover:border-white/20
                    "
                  />
                </div>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  onClick={(e) => e.preventDefault()}
                  className="
                    text-xs font-medium
                    text-cyan-300
                    transition-colors
                    hover:text-cyan-200
                    hover:underline
                  "
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="
                    rounded-xl
                    border border-red-400/20
                    bg-red-500/10
                    px-4 py-3
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
                  group relative h-[52px] w-full overflow-hidden
                  rounded-xl

                  bg-gradient-to-r
                  from-blue-600
                  via-cyan-500
                  to-teal-400

                  text-sm font-bold text-white

                  shadow-[0_10px_30px_rgba(6,182,212,0.25)]

                  transition-all duration-300

                  hover:-translate-y-[1px]
                  hover:shadow-[0_14px_38px_rgba(6,182,212,0.35)]

                  active:translate-y-0

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {/* shine */}
                <span
                  className="
                    absolute inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    transition-transform duration-700
                    group-hover:translate-x-full
                  "
                />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

    {/* ================= FOOTER ================= */}
    <footer className="relative z-20 pb-5 text-center">
      <p className="text-[10px] tracking-wide text-slate-400/60">
        Selihome Ophthalmic Medium Clinic
        <span className="mx-2 text-cyan-500/50">•</span>
        PECC
      </p>
    </footer>
  </div>
);
};