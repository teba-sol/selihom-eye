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
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Optical Prescription - SELIHOME</title>
  <style>
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    @page {
      size: A5 portrait;
      margin: 10mm;
    }
    
    body { 
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .prescription-container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
    }
    
    /* Header with Gradient */
    .prescription-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: white;
      padding: 18px 20px;
      text-align: center;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 16px;
    }
    
    .clinic-name {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    
    .clinic-tagline {
      font-size: 9pt;
      opacity: 0.95;
      font-weight: 500;
    }
    
    /* Document Type Badge */
    .doc-type {
      background: #dbeafe;
      color: #1e40af;
      text-align: center;
      padding: 8px;
      font-weight: 700;
      font-size: 10pt;
      letter-spacing: 0.5px;
      border-left: 4px solid #2563eb;
      margin-bottom: 16px;
    }
    
    /* Patient Info Section */
    .patient-info {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
    }
    
    .info-block {
      flex: 1;
    }
    
    .info-label {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    
    .info-value {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }
    
    .info-sub {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 1px;
    }
    
    /* Prescription Table */
    #optical-rx-card table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    #optical-rx-card thead tr {
      background: #1e3a8a;
      color: white;
    }
    
    #optical-rx-card th {
      padding: 10px 12px;
      font-size: 9.5pt;
      font-weight: 600;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    #optical-rx-card tbody tr {
      border-bottom: 1px solid #e2e8f0;
    }
    
    #optical-rx-card tbody tr:nth-child(odd) {
      background: #f8fafc;
    }
    
    #optical-rx-card td {
      padding: 10px 12px;
      font-size: 10.5pt;
      color: #334155;
    }
    
    #optical-rx-card td:first-child {
      font-weight: 700;
      color: #1e3a8a;
      background: #eff6ff;
    }
    
    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 16px 0;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .detail-item {
      padding: 8px;
    }
    
    .detail-label {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .detail-value {
      font-size: 10pt;
      font-weight: 600;
      color: #0f172a;
    }
    
    /* Notes Section */
    .notes-section {
      margin: 16px 0;
      padding: 12px;
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      border-radius: 4px;
    }
    
    .notes-label {
      font-size: 8.5pt;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .notes-text {
      font-size: 9.5pt;
      color: #78350f;
      line-height: 1.4;
    }
    
    /* Signature Section */
    .signature-section {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 12px;
      border-top: 2px solid #e2e8f0;
    }
    
    .signature-block {
      flex: 1;
    }
    
    .signature-label {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 20px;
    }
    
    .signature-line {
      width: 140px;
      border-top: 1.5px solid #475569;
      padding-top: 2px;
    }
    
    .status-badge {
      background: #d1fae5;
      color: #065f46;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 600;
      border: 1px solid #a7f3d0;
    }
    
    /* Footer */
    .prescription-footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .footer-clinic {
      font-size: 8.5pt;
      color: #475569;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .footer-timestamp {
      font-size: 7.5pt;
      color: #94a3b8;
    }
    
    .confidential {
      display: inline-block;
      background: #fee2e2;
      color: #991b1b;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 600;
      margin-left: 6px;
    }
    
    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .prescription-container {
        max-width: 100%;
      }
      
      button {
        display: none !important;
      }
    }
    
    /* Screen Preview */
    @media screen {
      body {
        background: #f1f5f9;
        padding: 20px;
      }
      
      .prescription-container {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        border-radius: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="prescription-container">
    ${content.outerHTML}
    
    <div class="prescription-footer">
      <div class="footer-clinic">
        SELIHOME Ophthalmic Medium Clinic
        <span class="confidential">CONFIDENTIAL</span>
      </div>
      <div class="footer-timestamp">Printed: ${today} at ${time}</div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => win.print());
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
