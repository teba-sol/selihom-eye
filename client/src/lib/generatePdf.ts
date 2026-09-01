// Generates a print-friendly page from the on-screen Discharge Summary so the
// printed PDF is identical to what the doctor sees. Reads the live DOM node
// `#discharge-summary-report` and prints it in a new window.
import type { useEncounterStore } from '../store/useEncounterStore';

type EncounterState = ReturnType<typeof useEncounterStore.getState>;

export function downloadEncounterPdf(_state: EncounterState) {
  const node = document.getElementById('discharge-summary-report');
  if (!node) return;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Africa/Addis_Ababa',
  });

  // Clone to avoid mutating/losing the live component's styles during print.
  const content = node.cloneNode(true) as HTMLElement;
  // The toolbar/buttons and the banner should not appear in the printed PDF.
  content.querySelectorAll('button').forEach((b) => b.remove());
  content.querySelectorAll('.bg-blue-50.border-blue-200').forEach((el) => el.remove());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Discharge Summary</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 24px; font-size: 13px; }
    #discharge-summary-report { max-width: 800px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; }
    @media print { body { padding: 8px; } button { display: none; } }
  </style>
</head>
<body>
  ${content.outerHTML}
  <div style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;">
    <span>SELIHOME Ophthalmic Medium Clinic · Confidential Medical Record</span>
    <span>Printed: ${today}</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      win.print();
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
