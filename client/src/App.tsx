import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { SurgeriesPage } from './pages/SurgeriesPage';
import { ExamDashboard } from './pages/ExamDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

// Error boundary to catch runtime crashes and clear bad localStorage
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  handleReset = () => {
    // Clear all persisted state
    try {
      localStorage.removeItem('asira-auth');
      localStorage.removeItem('selihom_patients_v1');
      localStorage.removeItem('selihom_mrn_seq');
      localStorage.removeItem('selihom_kebele_data_v1');
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-1">The app encountered a runtime error.</p>
            <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded px-3 py-2 mb-6 break-all">{this.state.error}</p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Clear cache &amp; go to login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/surgeries" element={<SurgeriesPage />} />
            <Route path="/exam/:encounterId" element={<ExamDashboard />} />
            <Route path="/receptionist/*" element={<ReceptionistDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
