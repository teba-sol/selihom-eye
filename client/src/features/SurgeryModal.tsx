import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { UnifiedSurgeryForm } from './UnifiedSurgeryForm';
import { formatEthiopianDate } from '../lib/formatters';
import {
  SURGERY_OPTIONS, SURGERY_STATUSES, SURGERY_STATUS_LABELS,
  newSurgeryEntry, freshUnifiedDetails,
  type SurgeryEntry, type SurgeryStatus,
} from '../lib/surgery';

interface Props {
  open: boolean;
  surgeries: SurgeryEntry[];
  onChange: (list: SurgeryEntry[]) => void;
  onClose: () => void;
  patientName?: string;
  patientMrn?: string;
  patientAge?: string;
  patientSex?: string;
}

export const SurgeryModal: React.FC<Props> = ({ 
  open, 
  surgeries, 
  onChange, 
  onClose,
  patientName,
  patientMrn,
  patientAge,
  patientSex
}) => {
  const [activeSurgeryId, setActiveSurgeryId] = useState<string | null>(
    surgeries.length > 0 ? surgeries[0].id : null
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (open) {
      setActiveSurgeryId(surgeries.length > 0 ? surgeries[0].id : null);
      setSaveStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const patchEntry = (id: string, p: Partial<SurgeryEntry>) => {
    onChange(
      surgeries.map((s) => {
        if (s.id === id) {
          if (p.unifiedDetails) {
            return {
              ...s,
              ...p,
              unifiedDetails: {
                ...(s.unifiedDetails || {}),
                ...p.unifiedDetails,
              },
              status: (p.status ?? s.status ?? 'PLANNED'),
            };
          }
          return { ...s, ...p, status: (p.status ?? s.status ?? 'PLANNED') };
        }
        return s;
      })
    );
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const changeType = (id: string, newType: string) => {
    onChange(
      surgeries.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          type: newType,
          unifiedDetails: s.unifiedDetails ?? freshUnifiedDetails(),
        };
      })
    );
  };

  const add = () => {
    const newSurgery = newSurgeryEntry();
    onChange([...surgeries, newSurgery]);
    setActiveSurgeryId(newSurgery.id);
  };

  const remove = (id: string) => {
    onChange(surgeries.filter((s) => s.id !== id));
    if (activeSurgeryId === id) {
      setActiveSurgeryId(surgeries.length > 1 ? surgeries[0].id : null);
    }
  };

  const status = (s: SurgeryEntry): SurgeryStatus => s.status ?? 'PLANNED';

  const getStatusColor = (status: SurgeryStatus) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActiveSurgery = () => {
    return surgeries.find(s => s.id === activeSurgeryId) || surgeries[0] || null;
  };

  const activeSurgery = getActiveSurgery();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">Surgery Form</h2>
              {patientName && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {patientName} · MRN: {patientMrn || 'N/A'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatEthiopianDate(new Date())}
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-emerald-500' : 
                  saveStatus === 'saving' ? 'bg-amber-500' : 'bg-slate-300'
                }`}></span>
                {saveStatus === 'saved' ? 'Saved locally' : 
                 saveStatus === 'saving' ? 'Saving...' : 'Ready'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Main Content - 2 Column Layout (simplified) */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Left Sidebar - Surgery List */}
          <div className="w-48 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surgeries</span>
              <button
                onClick={add}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add
              </button>
            </div>
            
            {surgeries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">No surgeries</p>
                <button
                  onClick={add}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Create one
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {surgeries.map((s, idx) => {
                  const isActive = activeSurgeryId === s.id;
                  const sStatus = status(s);
                  const statusColor = getStatusColor(sStatus);
                  
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSurgeryId(s.id)}
                      className={`w-full text-left p-2 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700 truncate">
                          #{idx + 1} {s.type !== 'None' ? s.type : 'Untitled'}
                        </span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {SURGERY_STATUS_LABELS[sStatus]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right - Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {activeSurgery ? (
              <>
                {/* Surgery Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <select
                      value={activeSurgery.type}
                      onChange={(e) => changeType(activeSurgery.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {SURGERY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt === 'None' ? '' : opt}>{opt}</option>
                      ))}
                    </select>
                    
                    <select
                      value={status(activeSurgery)}
                      onChange={(e) => patchEntry(activeSurgery.id, { status: e.target.value as SurgeryStatus })}
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {SURGERY_STATUSES.map((st) => (
                        <option key={st} value={st}>{SURGERY_STATUS_LABELS[st]}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => remove(activeSurgery.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Surgery Form */}
                {activeSurgery.type && activeSurgery.type !== 'None' ? (
                  <>
                    {activeSurgery.type === 'Other (Enter Manually)' && (
                      <input
                        type="text"
                        value={activeSurgery.otherName}
                        onChange={(e) => patchEntry(activeSurgery.id, { otherName: e.target.value })}
                        placeholder="Enter surgery name..."
                        className="w-full mb-4 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    )}
                    
                    <UnifiedSurgeryForm
                      surgeryType={activeSurgery.type === 'Other (Enter Manually)' 
                        ? activeSurgery.otherName.trim() || 'Custom Surgery' 
                        : activeSurgery.type}
                      data={{ ...freshUnifiedDetails(), ...(activeSurgery.unifiedDetails ?? {}) }}
                      onChange={(d) => patchEntry(activeSurgery.id, { unifiedDetails: d })}
                      patientInfo={{
                        name: patientName || '',
                        age: patientAge || '',
                        sex: patientSex || '',
                        mrn: patientMrn || ''
                      }}
                    />
                    
                    <textarea
                      rows={2}
                      value={activeSurgery.remarks}
                      onChange={(e) => patchEntry(activeSurgery.id, { remarks: e.target.value })}
                      placeholder="Surgery remarks / notes..."
                      className="w-full mt-4 p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">Select a surgery type to begin</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No surgery selected</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};