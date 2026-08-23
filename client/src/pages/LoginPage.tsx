import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      // Route based on user role
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
    <div className="min-h-screen bg-[#888888] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white shadow-lg overflow-hidden">
        <div className="h-16 bg-[#e8e8e8] border-b border-[#d0d0d0]" />

        <div className="px-10 py-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-600 mb-6">
            Sign in with your credentials
          </p>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="font-semibold text-blue-900 mb-1">Login Credentials:</p>
            <p className="text-blue-800"><strong>Doctor:</strong> Any email (e.g., doctor@clinic.com)</p>
            <p className="text-blue-800"><strong>Receptionist:</strong> Email with "receptionist" or "nurse"</p>
            <p className="text-blue-700 mt-1">Password: any non-empty text</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1.5">
                Email or Phone number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 bg-white"
                autoComplete="current-password"
              />
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-[#0066cc] hover:underline block"
              onClick={(e) => e.preventDefault()}
            >
              Forgot your password?
            </Link>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2d5986] hover:bg-[#244a72] text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="px-10 py-5 border-t border-slate-100 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link to="/signup" className="text-[#0066cc] hover:underline" onClick={(e) => e.preventDefault()}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
