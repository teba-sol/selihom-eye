import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <h3 className="text-lg font-semibold text-[#0F2038]">{title}</h3>
      <div className="text-sm text-slate-600 mt-2 leading-relaxed">{message}</div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);