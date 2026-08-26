import React, { useEffect, useState } from 'react';
import { X, Calendar, User, FileText, Phone, Building2, ShieldCheck, ChevronDown, UserCheck } from 'lucide-react';
import type { Patient } from '../store/useAppStore';
import { REGION_DATA, SW_REGION_KEY, SW_KEBELE_DATA } from '../receptionist/data';
import '../receptionist/index.css';

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, 'id' | 'isNew' | 'lastVisit'>) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ open, onClose, onSave }) => {
  const [statusMsg, setStatusMsg] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });

  useEffect(() => {
    if (!open) return;

    // Ethiopian calendar conversion functions
    const ETHIOPIC_JDN_OFFSET = 1724220;

    function gregorianToJDN(year: number, month: number, day: number) {
      const a = Math.floor((14 - month) / 12);
      const y = year + 4800 - a;
      const m = month + 12 * a - 3;
      return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }

    function jdnToGregorian(jdn: number) {
      const a = jdn + 32044;
      const b = Math.floor((4 * a + 3) / 146097);
      const c = a - Math.floor((146097 * b) / 4);
      const d = Math.floor((4 * c + 3) / 1461);
      const e = c - Math.floor((1461 * d) / 4);
      const m = Math.floor((5 * e + 2) / 153);
      const day = e - Math.floor((153 * m + 2) / 5) + 1;
      const month = m + 3 - 12 * Math.floor(m / 10);
      const year = 100 * b + d - 4800 + Math.floor(m / 10);
      return { year, month, day };
    }

    function ethiopicToJDN(year: number, month: number, day: number) {
      return day + (month - 1) * 30 + (year - 1) * 365 + Math.floor(year / 4) + ETHIOPIC_JDN_OFFSET;
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

    function ethiopianToGregorian(year: number, month: number, day: number) {
      return jdnToGregorian(ethiopicToJDN(year, month, day));
    }

    function isEthiopianLeap(year: number) {
      return (year % 4) === 3;
    }

    function daysInGregorianMonth(year: number, month: number) {
      return new Date(year, month, 0).getDate();
    }

    function isValidDate(d: number, m: number, y: number) {
      if (!d || !m || !y) return false;
      if (m < 1 || m > 12) return false;
      if (y < 1900 || y > 2100) return false;
      if (d < 1 || d > daysInGregorianMonth(y, m)) return false;
      return true;
    }

    function isValidEthDate(d: number, m: number, y: number) {
      if (!d || !m || !y) return false;
      if (m < 1 || m > 13) return false;
      if (y < 1892 || y > 2200) return false;
      const maxDay = (m === 13) ? (isEthiopianLeap(y) ? 6 : 5) : 30;
      if (d < 1 || d > maxDay) return false;
      return true;
    }

    function digitsOnly(str: string | null) { return (str || '').replace(/\D/g, ''); }

    function readGroup(dId: string, mId: string, yId: string) {
      const dEl = document.getElementById(dId) as HTMLInputElement;
      const mEl = document.getElementById(mId) as HTMLInputElement;
      const yEl = document.getElementById(yId) as HTMLInputElement;
      if (!dEl || !mEl || !yEl) return null;
      const d = digitsOnly(dEl.value);
      const m = digitsOnly(mEl.value);
      const y = digitsOnly(yEl.value);
      if (!d || !m || y.length !== 4) return null;
      return { day: parseInt(d, 10), month: parseInt(m, 10), year: parseInt(y, 10) };
    }

    function writeGroup(dId: string, mId: string, yId: string, day: number | null, month: number | null, year: number | null) {
      const dEl = document.getElementById(dId) as HTMLInputElement;
      const mEl = document.getElementById(mId) as HTMLInputElement;
      const yEl = document.getElementById(yId) as HTMLInputElement;
      if (dEl) dEl.value = (day != null) ? String(day).padStart(2, '0') : '';
      if (mEl) mEl.value = (month != null) ? String(month).padStart(2, '0') : '';
      if (yEl) yEl.value = (year != null) ? String(year) : '';
    }


    function setupDateGroup(groupId: string, dId: string, mId: string, yId: string) {
      const group = document.getElementById(groupId);
      const dEl = document.getElementById(dId) as HTMLInputElement;
      const mEl = document.getElementById(mId) as HTMLInputElement;
      const yEl = document.getElementById(yId) as HTMLInputElement;
      if (!group || !dEl || !mEl || !yEl) return;
      const segs = [dEl, mEl, yEl];

      segs.forEach((el, idx) => {
        const maxLen = el.getAttribute('maxlength') === '4' ? 4 : 2;

        el.addEventListener('input', function() {
          let val = digitsOnly(this.value).slice(0, maxLen);
          this.value = val;
          group.classList.remove('invalid');

          if (val.length === maxLen && idx < segs.length - 1) {
            segs[idx + 1].focus();
            segs[idx + 1].select();
          }

          if (groupId === 'ethDobGroup') {
            const eth = readGroup('ethDobD', 'ethDobM', 'ethDobY');
            if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
              const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
              calculateAge(greg.year, greg.month, greg.day);
            }
          } else if (groupId === 'regEthGroup') {
            syncMrnYearWithRegDate();
          }
        });

        el.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && this.value.length === 0 && idx > 0) {
            e.preventDefault();
            segs[idx - 1].focus();
            const prevVal = segs[idx - 1].value;
            segs[idx - 1].value = prevVal.slice(0, -1);
          }
          if (e.key === 'ArrowLeft' && this.selectionStart === 0 && idx > 0) {
            e.preventDefault();
            segs[idx - 1].focus();
          }
          if (e.key === 'ArrowRight' && this.selectionStart === this.value.length && idx < segs.length - 1) {
            e.preventDefault();
            segs[idx + 1].focus();
          }
          const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
          if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
          }
        });

        el.addEventListener('focus', function() { this.select(); });
      });

      group.addEventListener('paste', function(e: ClipboardEvent) {
        const text = (e.clipboardData || (window as any).clipboardData).getData('text');
        const nums = digitsOnly(text);
        if (nums.length >= 6) {
          e.preventDefault();
          const dd = nums.slice(0, 2);
          const mm = nums.slice(2, 4);
          const yyyy = nums.slice(4, 8);
          dEl.value = dd;
          mEl.value = mm;
          yEl.value = yyyy;
          yEl.focus();
        }
      });
    }

    let authoritativeToday: Date | null = null;

    function getAddisParts(d: Date) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Addis_Ababa',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
        const parts = formatter.formatToParts(d);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        for (const p of parts) {
          if (p.type === 'year') year = parseInt(p.value, 10);
          if (p.type === 'month') month = parseInt(p.value, 10);
          if (p.type === 'day') day = parseInt(p.value, 10);
        }
        return { year, month, day };
      } catch (e) {
        return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      }
    }

    async function fetchOnlineCurrentDate(): Promise<Date | null> {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const response = await fetch('https://worldtimeapi.org/api/timezone/Africa/Addis_Ababa', {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (response.ok) {
          const data = await response.json();
          if (data.datetime) {
            const online = new Date(data.datetime);
            if (!Number.isNaN(online.getTime())) return online;
          }
        }
      } catch (e) {}
      return null;
    }

    async function calculateAge(year: number, month: number, day: number) {
      if (!year || !month || !day) return;

      if (!authoritativeToday) {
        const online = await fetchOnlineCurrentDate();
        authoritativeToday = online || new Date();
      }

      const todayParts = getAddisParts(authoritativeToday);
      let age = todayParts.year - year;
      if (todayParts.month < month || (todayParts.month === month && todayParts.day < day)) {
        age--;
      }
      const ageEl = document.getElementById('age') as HTMLInputElement;
      if (ageEl) ageEl.value = (age >= 0) ? String(age) : '0';
      updateAgeDateStatus();
    }

    function updateAgeDateStatus() {
      const el = document.getElementById('ageDateStatus');
      if (!el) return;
      if (authoritativeToday) {
        const p = getAddisParts(authoritativeToday);
        const dStr = `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`;
        el.textContent = `Online current date: ${dStr} (Addis Ababa)`;
        el.style.color = '#0f766e';
      } else {
        el.textContent = 'Checking online date…';
        el.style.color = '#64748b';
      }
    }


    // Combobox logic
    const KEBELE_STORAGE_KEY = "selihom_kebele_data_v1";
    const comboOptions: Record<string, string[]> = { region: [], zone: [], woreda: [], kebele: [], ketena: [] };

    function setComboOptions(fieldId: string, options: string[]) {
      comboOptions[fieldId] = options || [];
    }

    function showOtherInput(fieldId: string, show: boolean) {
      const wrap = document.getElementById(fieldId + 'OtherWrap');
      const other = document.getElementById(fieldId + 'Other') as HTMLInputElement;
      if (!wrap || !other) return;
      wrap.classList.toggle('show', show);
      if (show) { other.value = ''; other.focus(); }
    }

    function chooseComboOption(fieldId: string, optValue: string) {
      const input = document.getElementById(fieldId) as HTMLInputElement;
      if (!input) return;
      if (optValue === 'Other') {
        input.value = '';
        input.placeholder = 'Other — enter manually below';
        showOtherInput(fieldId, true);
        return;
      }
      showOtherInput(fieldId, false);
      input.value = optValue;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function renderComboList(fieldId: string, filterText: string) {
      const listEl = document.getElementById(fieldId + 'List');
      const wrapper = document.getElementById(fieldId + 'Wrapper');
      if (!listEl) return;
      if (wrapper) wrapper.classList.add('open-active');
      const options = comboOptions[fieldId] || [];
      const filter = (filterText || '').toLowerCase();
      const filtered = filter ? options.filter(o => o.toLowerCase().includes(filter)) : options;
      listEl.innerHTML = '';
      filtered.forEach(optValue => {
        const li = document.createElement('li');
        li.textContent = optValue;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          listEl.classList.remove('open');
          if (wrapper) wrapper.classList.remove('open-active');
          chooseComboOption(fieldId, optValue);
        });
        listEl.appendChild(li);
      });
      const otherLi = document.createElement('li');
      otherLi.textContent = 'Other (Enter manually)';
      otherLi.addEventListener('mousedown', e => {
        e.preventDefault();
        listEl.classList.remove('open');
        if (wrapper) wrapper.classList.remove('open-active');
        chooseComboOption(fieldId, 'Other');
      });
      listEl.appendChild(otherLi);
      listEl.classList.add('open');
    }

    function closeComboList(fieldId: string) {
      document.getElementById(fieldId + 'List')?.classList.remove('open');
      document.getElementById(fieldId + 'Wrapper')?.classList.remove('open-active');
    }

    function setupCombobox(fieldId: string) {
      const input = document.getElementById(fieldId) as HTMLInputElement;
      const arrow = document.getElementById(fieldId + 'Arrow');
      const wrapper = document.getElementById(fieldId + 'Wrapper');
      if (!input || !arrow || !wrapper) return;

      input.addEventListener('input', () => renderComboList(fieldId, input.value));
      input.addEventListener('focus', () => renderComboList(fieldId, input.value));
      input.addEventListener('click', () => renderComboList(fieldId, input.value));
      const other = document.getElementById(fieldId + 'Other') as HTMLInputElement;
      if (other) {
        other.addEventListener('input', () => {
          input.value = other.value;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      arrow.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.focus();
        renderComboList(fieldId, '');
      });
      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target as Node)) {
          closeComboList(fieldId);
        }
      });
    }

    function currentRegionName() {
      return (document.getElementById('region') as HTMLInputElement)?.value.trim() || '';
    }
    function currentZoneName() {
      return (document.getElementById('zone') as HTMLInputElement)?.value.trim() || '';
    }
    function currentWoredaName() {
      return (document.getElementById('woreda') as HTMLInputElement)?.value.trim() || '';
    }

    function populateZonesForRegion(regionName: string) {
      const zones = REGION_DATA[regionName] ? Object.keys(REGION_DATA[regionName]) : [];
      setComboOptions('zone', zones);
    }

    function populateWoredasForZone(regionName: string, zoneName: string) {
      const woredas = (REGION_DATA[regionName] && REGION_DATA[regionName][zoneName]) ? REGION_DATA[regionName][zoneName] : [];
      setComboOptions('woreda', woredas);
    }

    function loadStoredKebeleNames(woreda: string) {
      if (!woreda) return [];
      try {
        const stored = JSON.parse(localStorage.getItem(KEBELE_STORAGE_KEY) || "{}");
        return stored[woreda] || [];
      } catch (e) { return []; }
    }

    function saveKebeleName(woreda: string, kebeleName: string) {
      if (!woreda || !kebeleName) return;
      let stored: Record<string, string[]> = {};
      try {
        stored = JSON.parse(localStorage.getItem(KEBELE_STORAGE_KEY) || "{}");
      } catch (e) { stored = {}; }
      if (!stored[woreda]) stored[woreda] = [];
      if (!stored[woreda].includes(kebeleName)) {
        stored[woreda].push(kebeleName);
        localStorage.setItem(KEBELE_STORAGE_KEY, JSON.stringify(stored));
      }
    }

    function resolveKebeleBaseList(woredaName: string) {
      if (!woredaName) return [];
      const key = Object.keys(SW_KEBELE_DATA).find(k => k.toLowerCase() === woredaName.toLowerCase());
      if (key && SW_KEBELE_DATA[key]) {
        return SW_KEBELE_DATA[key].map(k => k.name);
      }
      return ["Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", `${woredaName} Zuria`];
    }

    function populateKebeleSuggestionsForWoreda() {
      const woredaName = currentWoredaName();
      const hint = document.getElementById('kebeleHint');

      const baseNames = resolveKebeleBaseList(woredaName);
      const storedNames = loadStoredKebeleNames(woredaName);
      const names = Array.from(new Set([...baseNames, ...storedNames])).sort();
      setComboOptions('kebele', names);

      if (hint) {
        if (!woredaName) {
          hint.textContent = 'Select a region, zone and woreda first.';
        } else if (names.length) {
          hint.textContent = 'Known kebeles for ' + woredaName + ': ' + names.slice(0, 5).join(', ') + (names.length > 5 ? '...' : '');
        } else {
          hint.textContent = 'No kebeles saved yet for ' + woredaName + ' — type the real kebele name.';
        }
      }

      const ketenaInput = document.getElementById('ketena') as HTMLInputElement;
      if (ketenaInput) ketenaInput.value = '';
      populateKetenaSuggestionsForKebele();
    }

    function populateKetenaSuggestionsForKebele() {
      const woredaName = currentWoredaName();
      const kebeleName = (document.getElementById('kebele') as HTMLInputElement)?.value.trim();
      const key = Object.keys(SW_KEBELE_DATA).find(k => k.toLowerCase() === woredaName.toLowerCase());
      const entry = key ? SW_KEBELE_DATA[key] : null;
      let ketenas: string[] = [];
      if (entry) {
        const match = entry.find(k => k.name.toLowerCase() === kebeleName.toLowerCase());
        if (match) ketenas = match.ketenas;
      }
      if (!ketenas.length) {
        ketenas = ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"];
      }
      setComboOptions('ketena', ketenas);
    }


    function initAddressDropdowns() {
      const regionInput = document.getElementById('region') as HTMLInputElement;
      const zoneInput = document.getElementById('zone') as HTMLInputElement;
      const woredaInput = document.getElementById('woreda') as HTMLInputElement;
      const kebeleInput = document.getElementById('kebele') as HTMLInputElement;

      ['region', 'zone', 'woreda', 'kebele', 'ketena'].forEach(setupCombobox);

      setComboOptions('region', Object.keys(REGION_DATA));

      if (regionInput) {
        regionInput.value = SW_REGION_KEY;
        populateZonesForRegion(regionInput.value);
        populateKebeleSuggestionsForWoreda();

        regionInput.addEventListener('change', () => {
          populateZonesForRegion(currentRegionName());
          if (zoneInput) zoneInput.value = '';
          if (woredaInput) woredaInput.value = '';
          setComboOptions('woreda', []);
          populateKebeleSuggestionsForWoreda();
        });
      }

      if (zoneInput) {
        zoneInput.addEventListener('change', () => {
          populateWoredasForZone(currentRegionName(), currentZoneName());
          if (woredaInput) woredaInput.value = '';
          populateKebeleSuggestionsForWoreda();
        });
      }

      if (woredaInput) {
        woredaInput.addEventListener('change', () => {
          populateKebeleSuggestionsForWoreda();
        });
      }

      if (kebeleInput) {
        kebeleInput.addEventListener('change', (e: Event) => {
          const val = (e.target as HTMLInputElement).value.trim();
          saveKebeleName(currentWoredaName(), val);
          populateKetenaSuggestionsForKebele();
        });
      }
    }

    // MRN Generation
    function getSeqForYear(yy: string): number {
      const yearKey = `selihom_mrn_seq_${yy}`;
      const storedYearSeq = localStorage.getItem(yearKey);
      if (storedYearSeq !== null) {
        const val = parseInt(storedYearSeq, 10);
        return isNaN(val) ? 1 : val;
      }
      return yy === '18' ? 8614 : 1;
    }

    function setSeqForYear(yy: string, seq: number) {
      localStorage.setItem(`selihom_mrn_seq_${yy}`, String(seq));
      localStorage.setItem('selihom_mrn_seq', String(seq));
    }

    function formatMRN(seq: number, yy: string): string {
      const paddedSeq = String(seq).padStart(4, '0');
      return `${paddedSeq}/${yy}`;
    }

    function currentRegEthYY(): string {
      const yEl = document.getElementById('regEthY') as HTMLInputElement;
      const y = digitsOnly(yEl?.value);
      if (y.length >= 3 && y.length <= 4) return y.slice(-2).padStart(2, '0');
      const today = new Date();
      const eth = gregorianToEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
      return String(eth.year).slice(-2);
    }

    function generateMRN() {
      const yy = currentRegEthYY();
      const seqNum = getSeqForYear(yy);
      const mrnEl = document.getElementById('mrn') as HTMLInputElement;
      if (mrnEl) mrnEl.value = formatMRN(seqNum, yy);
    }

    function syncMrnYearWithRegDate() {
      const mrnEl = document.getElementById('mrn') as HTMLInputElement;
      if (!mrnEl) return;
      const newYY = currentRegEthYY();
      const current = mrnEl.value.trim();

      if (!current) {
        generateMRN();
        return;
      }

      const slashIdx = current.indexOf('/');
      const rawSeqStr = slashIdx >= 0 ? current.slice(0, slashIdx).trim() : current;
      const oldYY = slashIdx >= 0 ? current.slice(slashIdx + 1).trim() : '';

      if (oldYY && oldYY !== newYY) {
        const seqNum = getSeqForYear(newYY);
        mrnEl.value = formatMRN(seqNum, newYY);
      } else if (rawSeqStr) {
        const parsedSeq = parseInt(digitsOnly(rawSeqStr), 10);
        const seqNum = !isNaN(parsedSeq) && parsedSeq > 0 ? parsedSeq : getSeqForYear(newYY);
        mrnEl.value = formatMRN(seqNum, newYY);
      } else {
        generateMRN();
      }
    }

    function setRegistrationDatePlaceholders(gregorianDate: Date) {
      if (!gregorianDate || Number.isNaN(gregorianDate.getTime())) return;
      const gd = gregorianDate.getDate();
      const gm = gregorianDate.getMonth() + 1;
      const gy = gregorianDate.getFullYear();
      const eth = gregorianToEthiopian(gy, gm, gd);
      writeGroup('regEthD', 'regEthM', 'regEthY', eth.day, eth.month, eth.year);
    }

    (window as any).toggleReferralField = function() {
      const checked = (document.getElementById('isReferred') as HTMLInputElement)?.checked;
      const container = document.getElementById('referralSourceContainer');
      if (container) container.style.display = checked ? 'block' : 'none';
      if (!checked) {
        const sourceInput = document.getElementById('referralSource') as HTMLInputElement;
        if (sourceInput) sourceInput.value = '';
      }
    };

    // Initialize all components
    setupDateGroup('regEthGroup', 'regEthD', 'regEthM', 'regEthY');
    setupDateGroup('ethDobGroup', 'ethDobD', 'ethDobM', 'ethDobY');

    setRegistrationDatePlaceholders(new Date());
    generateMRN();
    (window as any).toggleReferralField();
    initAddressDropdowns();

    // Load online date
    fetchOnlineCurrentDate().then(online => {
      if (online) {
        authoritativeToday = online;
        setRegistrationDatePlaceholders(online);
      }
    });


    // Form submission
    const form = document.getElementById('patientForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const isReferred = (document.getElementById('isReferred') as HTMLInputElement)?.checked;
        const referralSourceVal = (document.getElementById('referralSource') as HTMLInputElement)?.value;

        const regEth = readGroup('regEthD', 'regEthM', 'regEthY');
        const dobEth = readGroup('ethDobD', 'ethDobM', 'ethDobY');

        saveKebeleName(currentWoredaName(), (document.getElementById('kebele') as HTMLInputElement)?.value.trim() || '');

        const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
        const grandfatherName = (document.getElementById('grandfatherName') as HTMLInputElement)?.value.trim();
        const fatherName = (document.getElementById('fatherName') as HTMLInputElement)?.value;
        const sex = (document.getElementById('sex') as HTMLSelectElement)?.value;
        const age = (document.getElementById('age') as HTMLInputElement)?.value;
        const phone = (document.getElementById('phoneNumber') as HTMLInputElement)?.value;
        const mrn = (document.getElementById('mrn') as HTMLInputElement)?.value;

        const region = currentRegionName();
        const zone = currentZoneName();
        const woreda = currentWoredaName();
        const kebele = (document.getElementById('kebele') as HTMLInputElement)?.value.trim() || '';
        const ketena = (document.getElementById('ketena') as HTMLInputElement)?.value.trim() || '';
        const houseNumber = (document.getElementById('houseNumber') as HTMLInputElement)?.value || '';

        // Build address string
        const addressParts = [kebele, ketena, woreda, zone, region].filter(Boolean);
        const address = addressParts.join(', ');

        // Format Ethiopian DOB as DD/MM/YYYY string for storage
        let dateOfBirth = '';
        if (dobEth && isValidEthDate(dobEth.day, dobEth.month, dobEth.year)) {
          dateOfBirth = `${String(dobEth.day).padStart(2, '0')}/${String(dobEth.month).padStart(2, '0')}/${dobEth.year}`;
        }

        const patientData: Omit<Patient, 'id' | 'isNew' | 'lastVisit'> = {
          mrn: mrn || '',
          firstName: firstName || '',
          lastName: fatherName || '',
          grandfatherName: grandfatherName || undefined,
          gender: sex === 'F' ? 'Female' : 'Male',
          dateOfBirth,
          phone: phone || '',
          email: '',
          address,
        };

        // Increment MRN for next patient
        const yy = currentRegEthYY();
        const currentSeq = getSeqForYear(yy);
        setSeqForYear(yy, currentSeq + 1);

        onSave(patientData);
        onClose();
      });
    }

  }, [open, onSave, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Patient Registration</h2>
            <p className="text-xs text-blue-200 mt-0.5">የታካሚ ምዝገባ - Complete patient information form</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>


        <form id="patientForm" className="p-5 space-y-5">
          {/* Registration Date */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Calendar className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Registration Date <span className="text-sm font-normal text-blue-700">(የምዝገባ ቀን)</span></h3>
                <p className="text-xs text-slate-500">Auto-defaults to current date in Ethiopian calendar</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">ETHIOPIAN DATE (የኢትዮጵያ ቀን)</label>
                <div className="date-input-group" id="regEthGroup">
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEthD" placeholder="DD" maxLength={2} />
                  <span className="date-sep">/</span>
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEthM" placeholder="MM" maxLength={2} />
                  <span className="date-sep">/</span>
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="regEthY" placeholder="YYYY" maxLength={4} />
                </div>
              </div>
            </div>
          </section>

          {/* MRN */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><FileText className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Identification & Medical Facility</h3>
                <p className="text-xs text-slate-500">Auto-incrementing MRN synced with Ethiopian year</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">MRN (Medical Record Number)</label>
                <input type="text" id="mrn" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm font-extrabold" placeholder="e.g. 0001/18" />
                <p className="text-[11px] text-slate-500 mt-1">4-digit sequence / last 2 digits of Ethiopian year</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Facility Name</label>
                <div className="relative">
                  <input type="text" id="facility" defaultValue="Selihome Ophthalmic Medium Clinic" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm font-bold" />
                  <Building2 className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700"><User className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Personal Information <span className="text-sm font-normal text-emerald-700">(የግል መረጃ)</span></h3>
                <p className="text-xs text-slate-500">Patient name details and gender</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">First Name (ስም) <span className="text-red-500">*</span></label>
                <input type="text" id="firstName" required placeholder="e.g. Abebe" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">ስም አባት / Grandfather Name <span className="text-red-500">*</span></label>
                <input type="text" id="grandfatherName" required placeholder="e.g. Kebede" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Father's Name (የአባት ስም) <span className="text-red-500">*</span></label>
                <input type="text" id="fatherName" required placeholder="e.g. Bekele" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="mt-4 max-w-[200px]">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Sex (ፆታ)</label>
              <select id="sex" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                <option value="M">Male (ወንድ)</option>
                <option value="F">Female (ሴት)</option>
              </select>
            </div>
          </section>


          {/* DOB & Age */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Calendar className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Date of Birth & Age <span className="text-sm font-normal text-blue-700">(የልደት ቀን እና ዕድሜ)</span></h3>
                <p className="text-xs text-slate-500">Auto age calculation from Ethiopian DOB</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">ETHIOPIAN DOB</label>
                <div className="date-input-group" id="ethDobGroup">
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="ethDobD" placeholder="DD" maxLength={2} />
                  <span className="date-sep">/</span>
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="ethDobM" placeholder="MM" maxLength={2} />
                  <span className="date-sep">/</span>
                  <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="ethDobY" placeholder="YYYY" maxLength={4} />
                </div>
              </div>
            </div>
            <div className="conversion-feedback mt-2" id="dobFeedback"></div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">CALCULATED AGE (ዕድሜ)</label>
                <input type="number" id="age" placeholder="0" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-lg font-extrabold text-center text-blue-900 bg-white" />
              </div>
              <div className="md:col-span-2 text-xs text-slate-500">
                <span id="ageDateStatus" className="font-semibold text-slate-600">Checking online date…</span>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-center mb-5">
              <h3 className="text-lg font-extrabold text-blue-700">Address / አድራሻ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Region (ክልል)</label>
                <div className="combo-wrapper" id="regionWrapper">
                  <input type="text" id="region" placeholder="Select region" autoComplete="off" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                  <button type="button" className="combo-arrow" id="regionArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                  <ul className="combo-list" id="regionList"></ul>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Zone (ዞን)</label>
                <div className="combo-wrapper" id="zoneWrapper">
                  <input type="text" id="zone" placeholder="Select zone" autoComplete="off" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                  <button type="button" className="combo-arrow" id="zoneArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                  <ul className="combo-list" id="zoneList"></ul>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Woreda (ወረዳ)</label>
                <div className="combo-wrapper" id="woredaWrapper">
                  <input type="text" id="woreda" placeholder="Select woreda" autoComplete="off" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                  <button type="button" className="combo-arrow" id="woredaArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                  <ul className="combo-list" id="woredaList"></ul>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kebele (ቀበሌ)</label>
                <div className="combo-wrapper" id="kebeleWrapper">
                  <input type="text" id="kebele" placeholder="Select kebele" autoComplete="off" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                  <button type="button" className="combo-arrow" id="kebeleArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                  <ul className="combo-list" id="kebeleList"></ul>
                </div>
                <span className="text-[11px] text-blue-700 block pt-1" id="kebeleHint">Select region, zone, woreda first</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Ketena (ቀጠና)</label>
                <div className="combo-wrapper" id="ketenaWrapper">
                  <input type="text" id="ketena" placeholder="e.g. Ketena 01" autoComplete="off" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
                  <button type="button" className="combo-arrow" id="ketenaArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                  <ul className="combo-list" id="ketenaList"></ul>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">House Number</label>
                <input type="text" id="houseNumber" placeholder="e.g. 104" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="mt-4 max-w-md">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Phone Number (ስልክ) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="text" id="phoneNumber" required placeholder="09XXXXXXXX" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm" />
                <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </section>

          {/* Referral */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-700"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Referral Information <span className="text-xs font-normal text-slate-500">(Optional)</span></h3>
                <p className="text-xs text-slate-500">Track patients referred from other facilities</p>
              </div>
            </div>
            <label className="inline-flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-all">
              <input type="checkbox" id="isReferred" className="w-4 h-4 rounded text-blue-700 cursor-pointer" onChange={() => (window as any).toggleReferralField()} />
              <span className="text-sm font-semibold text-slate-800">Referred from another Health Center?</span>
            </label>
            <div id="referralSourceContainer" className="hidden mt-4 max-w-md">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Referring Facility Name</label>
              <input type="text" id="referralSource" placeholder="Enter facility name" className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm" />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4">
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-base font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-md flex items-center justify-center gap-2">
              <UserCheck className="w-5 h-5" />
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
