import React, { useState } from 'react';
import { X, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';

interface AddCorrectionModalProps {
  encounterId: string;
  patientName: string;
  onClose: () => void;
  onSaved: () => void;
}

export const AddCorrectionModal: React.FC<AddCorrectionModalProps> = ({
  encounterId,
  patientName,
  onClose,
  onSaved,
}) => {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.post(`/clinical/encounter/${encounterId}/addendum`, {
        addendumNotes: text.trim(),
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to record correction.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Add correction
            </h2>
            <p className="text-xs text-slate-500">
              {patientName} — the finalized examination stays unchanged; this adds an append-only note.
            </p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Describe the correction / addendum…"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Record correction
          </button>
        </div>
      </div>
    </div>
  );
};