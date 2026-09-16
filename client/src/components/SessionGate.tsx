import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { PageLoader } from './LoadingSkeleton';

export function SessionGate() {
  const restoring = useAuthStore((s) => s.restoring);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  if (restoring) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <PageLoader label="Restoring session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}