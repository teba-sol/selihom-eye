import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);
  const [ReceptionistApp, setReceptionistApp] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the receptionist app
    import('../receptionist/ReceptionistApp')
      .then((module) => {
        setReceptionistApp(() => module.default);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load receptionist app:', error);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Receptionist Portal...</p>
        </div>
      </div>
    );
  }

  if (!ReceptionistApp) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Failed to Load</h1>
          <p className="text-slate-600 mb-4">The receptionist portal could not be loaded.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <ReceptionistApp />;
};
