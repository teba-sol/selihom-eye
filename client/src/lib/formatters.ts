// Ethiopian calendar conversion helpers
const ETHIOPIC_JDN_OFFSET = 1724220;

function gregorianToJDN(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopic(jdn: number) {
  const r0 = jdn - ETHIOPIC_JDN_OFFSET - 1;
  const cycleIndex = Math.floor(r0 / 1461);
  const rc = r0 - cycleIndex * 1461;
  let yOffset: number, diy: number;
  if (rc < 365) { yOffset = 0; diy = rc; }
  else if (rc < 730) { yOffset = 1; diy = rc - 365; }
  else if (rc < 1096) { yOffset = 2; diy = rc - 730; }
  else { yOffset = 3; diy = rc - 1096; }
  const year = cycleIndex * 4 + yOffset + 1;
  const month = Math.floor(diy / 30) + 1;
  const day = (diy % 30) + 1;
  return { year, month, day };
}

function gregorianToEthiopian(year: number, month: number, day: number) {
  return jdnToEthiopic(gregorianToJDN(year, month, day));
}

// DOB can be ISO (YYYY-MM-DD) or the pre-formatted Ethiopian date string (DD/MM/YYYY).
function parseDate(iso: string): Date {
  if (!iso) return new Date(NaN);
  const isoMatch = iso.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  const ethMatch = iso.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (ethMatch) return new Date(Number(ethMatch[3]), Number(ethMatch[2]) - 1, Number(ethMatch[1]));
  return new Date(iso + 'T00:00:00');
}

function isEthiopianDob(iso: string): boolean {
  return /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(iso || '');
}

export function formatDob(iso: string): string {
  if (isEthiopianDob(iso)) return iso;
  const d = parseDate(iso);
  if (Number.isNaN(d.getTime())) return iso || '-';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function calcAge(dob: string): number {
  const birth = parseDate(dob);
  const today = new Date();
  if (Number.isNaN(birth.getTime())) return 0;
  if (isEthiopianDob(dob)) {
    const t = gregorianToEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    let age = t.year - birth.getFullYear();
    const bm = birth.getMonth() + 1;
    const bd = birth.getDate();
    if (t.month < bm || (t.month === bm && t.day < bd)) age--;
    return Math.max(age, 0);
  }
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(age, 0);
}

export function formatDisplayDate(iso: string): string {
  if (isEthiopianDob(iso)) return iso;
  const d = parseDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// DOB is stored as a pre-formatted Ethiopian date string (DD/MM/YYYY).
export function formatDobEthiopian(iso: string): string {
  if (!iso) return '-';
  return iso;
}