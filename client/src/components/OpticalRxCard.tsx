import React from 'react';
import type { OpticalOrder } from '../lib/opticalOrders';
import { patientFullName } from '../lib/formatters';

export function formatRxNumber(v?: string | number | null): string {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)).replace('-0', '0');
}

export const OpticalRxCard: React.FC<{ order: OpticalOrder }> = ({ order }) => {
  const p = order.patient;
  const name = p ? patientFullName(p) || 'Patient' : 'Patient';
  const today = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const lensSummary = [order.lensType, order.lensMaterial]
    .filter(Boolean)
    .join(' · ') || 'Spectacle Lens';

  return (
    <div id="optical-rx-card" className="bg-white p-8 max-w-md mx-auto border rounded-xl shadow-sm">
      <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h2 className="text-xl font-black tracking-wide text-[#0F2038]">SELIHOME OPTICAL</h2>
        <p className="text-xs text-slate-500">Ophthalmic Medium Clinic · Prescription &amp; Dispensing Card</p>
      </div>

      <div className="flex justify-between text-sm mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Patient</p>
          <p className="font-bold text-slate-900">{name}</p>
          {p?.mrn && <p className="text-xs text-slate-500">MRN: {p.mrn}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
          <p className="font-bold text-slate-900">{today}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-slate-300 text-xs uppercase text-slate-600">
            <th className="text-left py-1"></th>
            <th className="text-left py-1">Sphere</th>
            <th className="text-left py-1">Cylinder</th>
            <th className="text-left py-1">Axis</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Right (OD)', e: order.rx.od },
            { label: 'Left  (OS)', e: order.rx.os },
          ].map((r) => (
            <tr key={r.label} className="border-b border-slate-100">
              <td className="py-1.5 font-semibold text-slate-800">{r.label}</td>
              <td className="py-1.5">{formatRxNumber(r.e.sph)}</td>
              <td className="py-1.5">{formatRxNumber(r.e.cyl)}</td>
              <td className="py-1.5">{formatRxNumber(r.e.axis)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
        {[
          { label: 'Lens', value: lensSummary },
          { label: 'Coating', value: order.coatings?.length ? order.coatings.join(', ') : '-' },
          { label: 'Frame', value: [order.frameType, order.frameRef].filter(Boolean).join(' · ') || '-' },
          { label: 'Collection', value: order.collectionMethod || '-' },
          { label: 'PD (mm)', value: order.pdMm || '-' },
          { label: 'Order Ref', value: order.orderRef || '-' },
        ].map((row) => (
          <div key={row.label}>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">{row.label}</p>
            <p className="font-semibold text-slate-800">{row.value}</p>
          </div>
        ))}
      </div>

      {order.notes ? (
        <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 mb-2">Notes: {order.notes}</p>
      ) : null}

      <div className="mt-6 flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-400">Dispensed by</p>
          <div className="mt-8 w-32 border-t border-slate-400" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{order.status === 'DELIVERED' ? 'Delivered' : 'Ready to deliver'}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-center mt-4">SELIHOME Ophthalmic Medium Clinic</p>
    </div>
  );
};

export function printOpticalRx(_order: OpticalOrder) {
  const node = document.getElementById('optical-rx-card');
  if (!node) return;

  const content = node.cloneNode(true) as HTMLElement;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Optical Prescription</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #fff; }
    #optical-rx-card { max-width: 500px; margin: 24px auto; }
    table { width: 100%; border-collapse: collapse; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>${content.outerHTML}</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => win.print());
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
