import React, { useState } from 'react';

type VisionTab = 'Distance Vision' | 'Intermediate Vision' | 'Near Vision';

interface DistanceData {
  testType: 'Cover test' | 'Maddox Rod / Maddox wing';
  deviation: string;
  eye: string;
  prismDiopter: string;
  baseDirection: string;
  recovery: string;
}

const DEFAULT_STATE: DistanceData = {
  testType: 'Cover test',
  deviation: '',
  eye: '',
  prismDiopter: '0',
  baseDirection: '',
  recovery: '',
};

export const OcularMotorBalanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VisionTab>('Distance Vision');

  const [data, setData] = useState<Record<VisionTab, DistanceData>>({
    'Distance Vision': { ...DEFAULT_STATE, deviation: 'Exophoria', prismDiopter: '10', recovery: 'Good' },
    'Intermediate Vision': { ...DEFAULT_STATE },
    'Near Vision': { ...DEFAULT_STATE, deviation: 'Orthophoric' },
  });

  const [remarks, setRemarks] = useState('');
  const [showInDischarge, setShowInDischarge] = useState(false);

  const current = data[activeTab];

  const updateCurrent = (fields: Partial<DistanceData>) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...fields },
    }));
  };

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full">
      <h1 className="text-xl font-bold text-[#1E3A8A] mb-4">Ocular Motor Balance</h1>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {(['Distance Vision', 'Intermediate Vision', 'Near Vision'] as VisionTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === tab
                ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Fields Grid */}
      <div className="space-y-4 max-w-3xl mb-8">
        {/* Testing distance radio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Testing distance</label>
          <div className="md:col-span-2 flex items-center gap-6 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="testType"
                value="Cover test"
                checked={current.testType === 'Cover test'}
                onChange={() => updateCurrent({ testType: 'Cover test' })}
                className="text-blue-600 focus:ring-0"
              />
              <span>Cover test</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="testType"
                value="Maddox Rod / Maddox wing"
                checked={current.testType === 'Maddox Rod / Maddox wing'}
                onChange={() => updateCurrent({ testType: 'Maddox Rod / Maddox wing' })}
                className="text-blue-600 focus:ring-0"
              />
              <span>Maddox Rod / Maddox wing</span>
            </label>
          </div>
        </div>

        {/* Deviation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Deviation</label>
          <div className="md:col-span-2">
            <select
              value={current.deviation}
              onChange={(e) => updateCurrent({ deviation: e.target.value })}
              className={`w-full px-3 py-2 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                current.deviation ? 'border-slate-300 text-slate-900 bg-white' : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <option value="">Select...</option>
              <option value="Orthophoric">Orthophoric</option>
              <option value="Exophoria">Exophoria</option>
              <option value="Esophoria">Esophoria</option>
              <option value="Exotropia">Exotropia</option>
              <option value="Esotropia">Esotropia</option>
              <option value="Hyperphoria">Hyperphoria</option>
              <option value="Hypophoria">Hypophoria</option>
            </select>
          </div>
        </div>

        {/* Eye */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Eye</label>
          <div className="md:col-span-2">
            <select
              value={current.eye}
              onChange={(e) => updateCurrent({ eye: e.target.value })}
              className={`w-full px-3 py-2 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                current.eye ? 'border-slate-300 text-slate-900 bg-white' : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <option value="">Select...</option>
              <option value="Right Eye">Right Eye</option>
              <option value="Left Eye">Left Eye</option>
              <option value="Both Eyes">Both Eyes</option>
              <option value="Alternating">Alternating</option>
            </select>
          </div>
        </div>

        {/* Prism Diopter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Prism Diopter</label>
          <div className="md:col-span-2">
            <input
              type="text"
              value={current.prismDiopter}
              onChange={(e) => updateCurrent({ prismDiopter: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-medium text-slate-800 focus:outline-none focus:border-blue-600 bg-white"
            />
          </div>
        </div>

        {/* Base Direction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Base Direction</label>
          <div className="md:col-span-2">
            <select
              value={current.baseDirection}
              onChange={(e) => updateCurrent({ baseDirection: e.target.value })}
              className={`w-full px-3 py-2 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                current.baseDirection ? 'border-slate-300 text-slate-900 bg-white' : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <option value="">Select...</option>
              <option value="Base In (BI)">Base In (BI)</option>
              <option value="Base Out (BO)">Base Out (BO)</option>
              <option value="Base Up (BU)">Base Up (BU)</option>
              <option value="Base Down (BD)">Base Down (BD)</option>
            </select>
          </div>
        </div>

        {/* Recovery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-xs font-bold text-slate-800">Recovery</label>
          <div className="md:col-span-2">
            <select
              value={current.recovery}
              onChange={(e) => updateCurrent({ recovery: e.target.value })}
              className={`w-full px-3 py-2 text-xs border rounded-md font-medium focus:outline-none focus:border-blue-600 ${
                current.recovery ? 'border-slate-300 text-slate-900 bg-white' : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              <option value="">Select...</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Nil">Nil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Any remarks? */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Any remarks?</label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add any remarks..."
          className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Show in Discharge Summary */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInDischarge}
            onChange={(e) => setShowInDischarge(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0"
          />
          <span>Show in Discharge Summary</span>
        </label>
      </div>
    </div>
  );
};
