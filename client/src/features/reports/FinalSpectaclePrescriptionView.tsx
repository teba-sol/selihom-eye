import React from 'react';

export const FinalSpectaclePrescriptionView: React.FC = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Final Spectacle Prescription</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">
              Download PDF
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm font-medium">
              Share
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

        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-700"></th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"></th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">SPHERE</th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">CYL</th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">AXIS</th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">PRISM</th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">BASE</th>
                  <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">VA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-teal-50/30">
                  <td rowSpan={3} className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 bg-teal-50">
                    RIGHT EYE (O.D)
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">DISTANCE</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-1</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-12</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">70</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">6/12</td>
                </tr>
                <tr className="bg-teal-50/30">
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">NEAR</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">1.25</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-12</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">70</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">N12</td>
                </tr>
                <tr className="bg-teal-50/30">
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">INTERMEDIATE</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                </tr>
                <tr>
                  <td rowSpan={3} className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 bg-teal-50">
                    LEFT EYE (O.S)
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">DISTANCE</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">2</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-5.5</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">90</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">6/6</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">NEAR</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">4.25</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-5.5</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">90</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">N6</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">INTERMEDIATE</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">-</td>
                </tr>
                <tr className="bg-teal-50/30">
                  <td colSpan={2} className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 bg-teal-50">
                    IPD
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-sm">64</td>
                  <td colSpan={2} className="border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 bg-teal-50">
                    BVD
                  </td>
                  <td colSpan={3} className="border border-slate-300 px-4 py-2 text-center text-sm">11</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Any remarks?</label>
            <textarea
              className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={4}
              placeholder="Add any remarks..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
            <label className="text-sm text-slate-700">Show in Discharge Summary</label>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm font-medium">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
