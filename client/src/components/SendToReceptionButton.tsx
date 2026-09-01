import React, { useCallback, useEffect, useState } from 'react';
import { useEncounterStore } from '../store/useEncounterStore';
import { getOrderForEncounter, sendOrderToReception, type OpticalOrderPayload } from '../lib/opticalOrders';

interface Props {
  buildPayload: () => OpticalOrderPayload;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export const SendToReceptionButton: React.FC<Props> = ({ buildPayload }) => {
  const encounterId = useEncounterStore((s) => s.encounterId);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encounterId) return;
    let active = true;
    getOrderForEncounter(encounterId)
      .then((order) => {
        if (active && order) setStatus(order.status === 'DELIVERED' ? 'sent' : 'sent');
      })
      .catch(() => {
        /* leave idle */
      });
    return () => {
      active = false;
    };
  }, [encounterId]);

  const handleSend = useCallback(async () => {
    if (status === 'sending' || status === 'sent' || !encounterId) return;
    setError(null);
    try {
      const payload = buildPayload();
      if (!payload.encounterId) {
        setError('No active encounter to send.');
        return;
      }
      setStatus('sending');
      await sendOrderToReception(payload);
      setStatus('sent');
    } catch (e: any) {
      setStatus('idle');
      setError(e?.message || 'Failed to send to reception.');
    }
  }, [status, encounterId, buildPayload]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSend}
        disabled={status === 'sending' || status === 'sent' || !encounterId}
        title="Snapshot the current Rx and send it to the reception desk for dispensing"
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
          status === 'sent'
            ? 'bg-emerald-100 text-emerald-700 cursor-default'
            : status === 'sending'
            ? 'bg-emerald-500 text-white opacity-70 cursor-wait'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {status === 'sent' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Sent to Reception
          </>
        ) : status === 'sending' ? (
          'Sending…'
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            Send to Reception
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};
