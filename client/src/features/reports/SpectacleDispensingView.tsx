import React from 'react';

export const SpectacleDispensingView: React.FC = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Spectacle Dispensing</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">
              Save
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            This eye exam can only be edited for another 23 hours. After this period, editing will be disabled.
          </p>
        </div>

        <div className="text-center py-12">
          <p className="text-slate-500">Spectacle dispensing information will appear here.</p>
        </div>
      </div>
    </div>
  );
};
