import React, { useState } from 'react';

export const BinocularVisionView: React.FC = () => {
  const [w4dDist, setW4dDist] = useState('4 Dots (Fusion Present)');
  const [w4dNear, setW4dNear] = useState('4 Dots (Fusion Present)');

  const [coverTestDistance, setCoverTestDistance] = useState('Exophoria');
  const [prismDist, setPrismDist] = useState('10');
  const [coverTestNear, setCoverTestNear] = useState('Orthophoric');
  const [prismNear, setPrismNear] = useState('0');
  const [recoveryQuality, setRecoveryQuality] = useState('Good / Rapid');

  const [npcBreak, setNpcBreak] = useState('6');
  const [npcRecovery, setNpcRecovery] = useState('8');

  const [aoaOd, setAoaOd] = useState('8.50');
  const [aoaOs, setAoaOs] = useState('8.50');
  const [aoaOu, setAoaOu] = useState('9.50');

  const [motilityResult, setMotilityResult] = useState('Full & Smooth in all 9 gazes');
  const [motilityNotes, setMotilityNotes] = useState('');

  const [directReflex, setDirectReflex] = useState('Brisk Direct & Consensual OU');
  const [rapdStatus, setRapdStatus] = useState('Negative (No RAPD)');

  const [stereopsisTest, setStereopsisTest] = useState('Titmus / Wirt Rings');
  const [stereoSeconds, setStereoSeconds] = useState('40');

  const [remarks, setRemarks] = useState('Mild exophoria distance with good fusion control. No suppression.');
  const [showInDischarge, setShowInDischarge] = useState(true);

  return (
    <div className="p-8 max-w-5xl bg-white min-h-full space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-[#1E3A8A]">Binocular Vision Assessment</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive motor balance, convergence, accommodation, and binocular fusion diagnostics.
        </p>
      </div>

      {/* 1. WORTH 4 DOT TEST */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          1. Worth 4 Dot Test (Suppression &amp; Diplopia)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Distance (6m)</label>
            <select
              value={w4dDist}
              onChange={(e) => setW4dDist(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="4 Dots (Fusion Present)">4 Dots (Fusion Present)</option>
              <option value="2 Red Dots (OD Suppression of OS)">2 Red Dots (OD Dominant / OS Suppressed)</option>
              <option value="3 Green Dots (OS Dominant / OD Suppressed)">3 Green Dots (OS Dominant / OD Suppressed)</option>
              <option value="5 Dots (Uncrossed Diplopia / Esotropia)">5 Dots (Uncrossed Diplopia)</option>
              <option value="5 Dots (Crossed Diplopia / Exotropia)">5 Dots (Crossed Diplopia)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Near (33cm)</label>
            <select
              value={w4dNear}
              onChange={(e) => setW4dNear(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="4 Dots (Fusion Present)">4 Dots (Fusion Present)</option>
              <option value="2 Red Dots (OD Dominant)">2 Red Dots (OD Dominant)</option>
              <option value="3 Green Dots (OS Dominant)">3 Green Dots (OS Dominant)</option>
              <option value="5 Dots (Diplopia)">5 Dots (Diplopia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. OCULAR MOTOR BALANCE / COVER TEST */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          2. Ocular Motor Balance &amp; Cover Test
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-1">Distance (6m)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phoria / Tropia</label>
                <select
                  value={coverTestDistance}
                  onChange={(e) => setCoverTestDistance(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-bold"
                >
                  <option value="Orthophoric">Orthophoric</option>
                  <option value="Exophoria">Exophoria (X)</option>
                  <option value="Esophoria">Esophoria (E)</option>
                  <option value="Exotropia">Exotropia (XT)</option>
                  <option value="Esotropia">Esotropia (ET)</option>
                  <option value="Hyperphoria">Hyperphoria</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Magnitude (\u0394)</label>
                <input
                  type="number"
                  value={prismDist}
                  onChange={(e) => setPrismDist(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
                  placeholder="10"
                />
              </div>
            </div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-1">Near (33cm)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phoria / Tropia</label>
                <select
                  value={coverTestNear}
                  onChange={(e) => setCoverTestNear(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-bold"
                >
                  <option value="Orthophoric">Orthophoric</option>
                  <option value="Exophoria">Exophoria (X')</option>
                  <option value="Esophoria">Esophoria (E')</option>
                  <option value="Exotropia">Exotropia (XT')</option>
                  <option value="Esotropia">Esotropia (ET')</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Magnitude (\u0394)</label>
                <input
                  type="number"
                  value={prismNear}
                  onChange={(e) => setPrismNear(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Recovery Quality</label>
          <select
            value={recoveryQuality}
            onChange={(e) => setRecoveryQuality(e.target.value)}
            className="w-full max-w-xs px-3 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
          >
            <option value="Good / Rapid">Good / Rapid &amp; Smooth</option>
            <option value="Fair / Delayed">Fair / Delayed Recovery</option>
            <option value="Poor / Requires Blink">Poor / Requires Blink</option>
            <option value="No Recovery (Manifest Tropia)">No Recovery (Manifest Tropia)</option>
          </select>
        </div>
      </div>

      {/* 3. NPC &amp; 4. AoA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            3. Near Point of Convergence (NPC)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Break (cm)</label>
              <input
                type="number"
                value={npcBreak}
                onChange={(e) => setNpcBreak(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded text-center font-bold bg-white"
                placeholder="6"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Recovery (cm)</label>
              <input
                type="number"
                value={npcRecovery}
                onChange={(e) => setNpcRecovery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded text-center font-bold bg-white"
                placeholder="8"
              />
            </div>
          </div>
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            4. Amplitude of Accommodation (AoA - Diopters)
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">OD (D)</label>
              <input
                type="text"
                value={aoaOd}
                onChange={(e) => setAoaOd(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold bg-white"
                placeholder="8.50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">OS (D)</label>
              <input
                type="text"
                value={aoaOs}
                onChange={(e) => setAoaOs(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold bg-white"
                placeholder="8.50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">OU (D)</label>
              <input
                type="text"
                value={aoaOu}
                onChange={(e) => setAoaOu(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded text-center font-bold bg-white"
                placeholder="9.50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. OCULAR MOTILITY &amp; 6. PUPIL EVALUATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            5. Ocular Motility (9 Gazes)
          </h2>
          <div>
            <select
              value={motilityResult}
              onChange={(e) => setMotilityResult(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="Full & Smooth in all 9 gazes">Full &amp; Smooth in all 9 gazes</option>
              <option value="Underaction Right Superior Rectus">Underaction RSR</option>
              <option value="Underaction Left Lateral Rectus">Underaction LLR (CN VI)</option>
              <option value="Underaction Right Superior Oblique">Underaction RSO (CN IV)</option>
              <option value="Pain / Discomfort in extreme gaze">Pain / Discomfort in extreme gaze</option>
              <option value="Incomitant Nystagmus present">Nystagmus present</option>
            </select>
          </div>
          <input
            type="text"
            value={motilityNotes}
            onChange={(e) => setMotilityNotes(e.target.value)}
            placeholder="Additional motility notes..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
          />
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            6. Pupil Reflexes &amp; RAPD
          </h2>
          <div className="space-y-2">
            <select
              value={directReflex}
              onChange={(e) => setDirectReflex(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="Brisk Direct & Consensual OU">Brisk Direct &amp; Consensual OU (PERRL)</option>
              <option value="Sluggish Direct OD">Sluggish Direct OD</option>
              <option value="Sluggish Direct OS">Sluggish Direct OS</option>
            </select>
            <select
              value={rapdStatus}
              onChange={(e) => setRapdStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="Negative (No RAPD)">Negative (No RAPD)</option>
              <option value="Positive RAPD Grade 1+ (OD)">Positive RAPD Grade 1+ (OD)</option>
              <option value="Positive RAPD Grade 1+ (OS)">Positive RAPD Grade 1+ (OS)</option>
              <option value="Positive RAPD Severe (Marcus Gunn)">Positive RAPD Severe (Marcus Gunn)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7. STEREOPSIS */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          7. Stereopsis (Depth Perception)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <select
            value={stereopsisTest}
            onChange={(e) => setStereopsisTest(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white font-medium"
          >
            <option value="Titmus / Wirt Rings">Titmus / Wirt Stereo Rings</option>
            <option value="TNO Random Dot">TNO Random Dot Stereotest</option>
            <option value="Lang Stereotest">Lang Stereotest</option>
            <option value="Frisby Stereotest">Frisby Stereotest</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={stereoSeconds}
              onChange={(e) => setStereoSeconds(e.target.value)}
              className="w-24 px-3 py-1.5 text-xs text-center border border-slate-300 rounded font-bold bg-white"
              placeholder="40"
            />
            <span className="text-xs text-slate-500 font-medium">seconds of arc</span>
          </div>
        </div>
      </div>

      {/* Any remarks */}
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
