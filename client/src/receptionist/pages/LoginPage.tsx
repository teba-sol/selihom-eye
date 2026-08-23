import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Stethoscope, HeartPulse, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { Button } from '../components/ui/Button';
import { Input, Field } from '../components/ui/Input';

export function LoginPage() {
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('doctor@selihome.et');
  const [password, setPassword] = useState('Doctor@2026');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'receptionist'>('doctor');

  const handleQuickFill = (role: 'doctor' | 'receptionist') => {
    setSelectedRole(role);
    if (role === 'doctor') {
      setEmail('doctor@selihome.et');
      setPassword('Doctor@2026');
    } else {
      setEmail('reception@selihome.et');
      setPassword('Nurse@2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast('Logged in successfully', 'success');

      // Navigate based on user role
      if (email.includes('reception') || email.includes('nurse')) {
        navigate('/queue');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email & password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Clinic Brand Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white shadow-lg shadow-teal/25">
            <Eye size={28} className="stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Selihome Eye Care
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Integrated Ophthalmic Clinical Management & Triage System
          </p>
        </div>

        {/* Quick Role Fill Strip */}
        <div className="rounded-2xl border border-line bg-panel p-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('doctor')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                selectedRole === 'doctor'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Stethoscope size={15} />
              <span>Doctor Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('receptionist')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                selectedRole === 'receptionist'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HeartPulse size={15} />
              <span>Nurse / Reception</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Staff Email Address" required>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </div>
                <Input
                  type="email"
                  placeholder="name@selihome.et"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold shadow-md shadow-teal/20"
                loading={loading}
              >
                <span>Sign in to Workspace</span>
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </form>

          {/* Quick Credential Helper Note */}
          <div className="mt-5 rounded-xl border border-line bg-slate-500/[0.04] p-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <ShieldCheck size={14} className="text-teal" />
              Quick Fill Credentials:
            </div>
            <div className="space-y-0.5 text-[11.5px]">
              <div><strong>Doctor:</strong> doctor@selihome.et · Doctor@2026</div>
              <div><strong>Nurse/Reception:</strong> reception@selihome.et · Nurse@2026</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          Selihome Ophthalmic Clinic · Addis Ababa, Ethiopia · HIPAA & MoH Compliant
        </p>
      </div>
    </div>
  );
}
