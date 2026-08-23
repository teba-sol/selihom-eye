import React, { useEffect, useState } from 'react';
import './index.css';
import {
  Eye,
  Calendar,
  User,
  MapPin,
  FileText,
  Phone,
  Building2,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Activity,
  Stethoscope,
  LogOut
} from 'lucide-react';
import { REGION_DATA, SW_REGION_KEY, SW_KEBELE_DATA } from './data.ts';
import { TriageTab } from './components/TriageTab.tsx';
import { ReportsTab } from './components/ReportsTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import type { RegisteredPatient, NurseTriageRecord } from './types.ts';

const INITIAL_DEMO_PATIENTS: RegisteredPatient[] = [
  {
    id: 'pat-1',
    meta: {
      facility: 'Selihome Ophthalmic Medium Clinic',
      mrn: '1132/18',
      registrationDate: { ethiopian: '10/06/2018', gregorian: '17/02/2026' },
      referral: { referred: false, source: null }
    },
    personalInfo: {
      firstName: 'Abebe',
      fatherName: 'Bekele',
      grandFatherName: 'Kebede',
      sex: 'M'
    },
    dob: { ethiopian: '15/04/1980', gregorian: '23/12/1987' },
    age: '38',
    address: {
      region: 'South West Ethiopia',
      zone: 'Bench Sheko',
      woreda: 'Mizan Aman',
      kebele: '01',
      ketena: 'Ketena 02',
      houseNumber: '104'
    },
    contact: { phone: '0911223344' },
    status: 'Waiting for Nurse Triage',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pat-2',
    meta: {
      facility: 'Selihome Ophthalmic Medium Clinic',
      mrn: '1133/18',
      registrationDate: { ethiopian: '10/06/2018', gregorian: '17/02/2026' },
      referral: { referred: true, source: 'Mizan Health Center' }
    },
    personalInfo: {
      firstName: 'Aster',
      fatherName: 'Tadesse',
      grandFatherName: 'Alemu',
      sex: 'F'
    },
    dob: { ethiopian: '20/08/1972', gregorian: '28/04/1980' },
    age: '45',
    address: {
      region: 'South West Ethiopia',
      zone: 'Keffa',
      woreda: 'Bonga',
      kebele: '02',
      ketena: 'Ketena 01',
      houseNumber: '45'
    },
    contact: { phone: '0922334455' },
    triageData: {
      triageDateEth: '10/06/2018',
      triageDateEuro: '17/02/2026',
      triageTime: '09:30 AM',
      nurseName: 'Sister Selamawit (Nurse & Receptionist)',
      urgencyLevel: 'urgent',
      assignedDoctor: 'Dr. Eyasu (Ophthalmic Specialist - Clinic Doctor)',
      examinationRoom: 'Consultation Room',
      vitals: {
        bloodPressureSys: '135',
        bloodPressureDia: '88',
        bpClassification: 'Hypertension Stage 1',
        pulseRate: '78',
        respiratoryRate: '18',
        temperature: '36.8',
        spo2: '97',
        weightKg: '64',
        heightCm: '162',
        bmi: '24.4'
      },
      diabeticScreening: {
        isDiabetic: 'type2',
        bloodSugarType: 'RBS',
        bloodSugarValue: '186',
        hba1c: '7.8',
        onMedicationOrInsulin: true,
        medicationDetails: 'Metformin 500mg BID',
        diabetesDurationYears: '4',
        diabeticRetinopathySuspected: true
      },
      ocularAssessment: {
        chiefComplaintTags: ['Gradual Blurry Vision', 'Photophobia (Light Sensitivity)'],
        chiefComplaintDetails: 'Patient complains of worsening distance blurriness in left eye for 3 months.',
        affectedEye: 'OS',
        durationOfSymptoms: '3 months',
        painScale: 2,
        vaUnaidedOD: '6/9',
        vaUnaidedOS: '6/24',
        vaPinholeOD: '6/6',
        vaPinholeOS: '6/12',
        vaWithGlassesOD: '',
        vaWithGlassesOS: '',
        iopOD: '17',
        iopOS: '19',
        iopMethod: 'Non-Contact Tonometry',
        eyeDischarge: 'none',
        pupilReaction: 'normal',
        corneaCondition: 'clear'
      },
      historyAndMeds: {
        currentEyeDrops: 'Artificial Tears PRN',
        systemicMedications: 'Metformin 500mg, Enalapril 5mg',
        knownAllergies: 'NKDA',
        pastOcularSurgeries: 'None',
        pastMedicalHistory: ['Type 2 Diabetes', 'Hypertension']
      },
      nurseNotes: 'Patient known diabetic for 4 years. RBS 186 mg/dL. Dilated fundus examination recommended for diabetic retinopathy screening.',
      interventionsPerformed: [
        'Visual Acuity Assessed (OD/OS)',
        'Random Blood Glucose (RBS) Tested',
        'Blood Pressure & Vitals Monitored'
      ],
      sentToDoctor: true,
      sentAt: '17/02/2026 at 09:40 AM'
    },
    status: 'Triage Completed - Sent to Doctor',
    createdAt: new Date().toISOString()
  }
];

export default function ReceptionistApp() {
  const [activeTab, setActiveTab] = useState<'registration' | 'triage' | 'reports' | 'settings'>('registration');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<RegisteredPatient[]>(() => {
    try {
      const saved = localStorage.getItem('selihom_patients_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_PATIENTS;
  });

  const [registeredPatientsCount, setRegisteredPatientsCount] = useState(() => {
    return patients.length;
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selihom_user');
      localStorage.removeItem('asira-auth');
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

  const handleSaveTriage = (patientId: string, triageData: NurseTriageRecord) => {
    setPatients(prev => {
      const updated = prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            triageData,
            status: 'Triage Completed - Sent to Doctor' as const
          };
        }
        return p;
      });
      try {
        localStorage.setItem('selihom_patients_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  useEffect(() => {
    (window as any).addNewPatientToState = (pData: any) => {
      const newPat: RegisteredPatient = {
        id: 'pat-' + Date.now(),
        meta: {
          facility: pData.meta.facility,
          mrn: pData.meta.mrn,
          registrationDate: { ...pData.meta.registrationDate },
          referral: { ...pData.meta.referral }
        },
        personalInfo: { ...pData.personalInfo },
        dob: { ...pData.dob },
        age: pData.age,
        address: { ...pData.address },
        contact: { ...pData.contact },
        status: 'Waiting for Nurse Triage',
        createdAt: new Date().toISOString()
      };

      setPatients(prev => {
        const updated = [newPat, ...prev];
        try {
          localStorage.setItem('selihom_patients_v1', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      setSelectedPatientId(newPat.id);
      setRegisteredPatientsCount(prev => prev + 1);
      return newPat.id;
    };

    (window as any).goToTriageForPatient = (id?: string) => {
      if (id) setSelectedPatientId(id);
      setActiveTab('triage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }, []);

  useEffect(() => {
    // =========================================================
    // Ethiopian <-> Gregorian date converter math
    // =========================================================
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

    function getDetailedDateError(source: 'eth' | 'euro', dId: string, mId: string, yId: string): string | null {
      const dEl = document.getElementById(dId) as HTMLInputElement;
      const mEl = document.getElementById(mId) as HTMLInputElement;
      const yEl = document.getElementById(yId) as HTMLInputElement;

      const dStr = digitsOnly(dEl?.value);
      const mStr = digitsOnly(mEl?.value);
      const yStr = digitsOnly(yEl?.value);

      if (!dStr && !mStr && !yStr) {
        return source === 'eth'
          ? '⚠ Please enter the Ethiopian date (DD, MM, YYYY) to convert.'
          : '⚠ Please enter the European date (DD, MM, YYYY) to convert.';
      }

      const missing: string[] = [];
      if (!dStr) missing.push('Day (DD)');
      if (!mStr) missing.push('Month (MM)');
      if (!yStr) missing.push('Year (YYYY)');
      if (missing.length > 0) {
        return `⚠ Incomplete date — please enter: ${missing.join(', ')}.`;
      }

      if (yStr.length !== 4) {
        return `⚠ Invalid year "${yStr}". Year must be a 4-digit number (e.g. 2016 for Ethio or 2024 for Euro).`;
      }

      const d = parseInt(dStr, 10);
      const m = parseInt(mStr, 10);
      const y = parseInt(yStr, 10);

      if (source === 'eth') {
        if (y < 1892 || y > 2200) {
          return `⚠ Ethiopian year ${y} is out of expected range (1892 – 2200).`;
        }
        if (m < 1 || m > 13) {
          return `⚠ Invalid Ethiopian month (${m}). Ethiopian calendar has only 13 months (1 to 12, and 13 for Pagume).`;
        }
        const maxDay = (m === 13) ? (isEthiopianLeap(y) ? 6 : 5) : 30;
        if (d < 1 || d > maxDay) {
          if (m === 13) {
            return `⚠ Invalid Pagume day (${d}). Month 13 (Pagume) in Ethiopian year ${y} has only ${maxDay} days.`;
          }
          return `⚠ Invalid Ethiopian day (${d}). Months 1–12 in Ethiopian calendar have exactly 30 days.`;
        }
      } else {
        if (y < 1800 || y > 2200) {
          return `⚠ European year ${y} is out of expected range (1800 – 2200).`;
        }
        if (m < 1 || m > 12) {
          return `⚠ Invalid European month (${m}). Months in European calendar must be between 1 and 12.`;
        }
        const maxDay = daysInGregorianMonth(y, m);
        if (d < 1 || d > maxDay) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mName = monthNames[m - 1] || `Month ${m}`;
          return `⚠ Invalid day (${d}) for ${mName} ${y}. This month has a maximum of ${maxDay} days.`;
        }
      }

      return null;
    }

    // =========================================================
    // Segmented date input handling (DD / MM / YYYY)
    // =========================================================
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

          const source = group.id === 'regEuroGroup' || group.id === 'euroDobGroup' ? 'euro' : 'eth';
          group.dataset.lastEdited = source;

          if (val.length === maxLen && idx < segs.length - 1) {
            segs[idx + 1].focus();
            segs[idx + 1].select();
          }

          if (groupId === 'euroDobGroup') {
            const euro = readGroup('euroDobD', 'euroDobM', 'euroDobY');
            if (euro && isValidDate(euro.day, euro.month, euro.year)) {
              const ethResult = gregorianToEthiopian(euro.year, euro.month, euro.day);
              writeGroup('ethDobD', 'ethDobM', 'ethDobY', ethResult.day, ethResult.month, ethResult.year);
              calculateAge(euro.year, euro.month, euro.day);
            }
          } else if (groupId === 'ethDobGroup') {
            const eth = readGroup('ethDobD', 'ethDobM', 'ethDobY');
            if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
              const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
              writeGroup('euroDobD', 'euroDobM', 'euroDobY', greg.day, greg.month, greg.year);
              calculateAge(greg.year, greg.month, greg.day);
            }
          } else if (groupId === 'regEthGroup') {
            const eth = readGroup('regEthD', 'regEthM', 'regEthY');
            if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
              const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
              writeGroup('regEuroD', 'regEuroM', 'regEuroY', greg.day, greg.month, greg.year);
              syncMrnYearWithRegDate();
            }
          } else if (groupId === 'regEuroGroup') {
            const euro = readGroup('regEuroD', 'regEuroM', 'regEuroY');
            if (euro && isValidDate(euro.day, euro.month, euro.year)) {
              const ethResult = gregorianToEthiopian(euro.year, euro.month, euro.day);
              writeGroup('regEthD', 'regEthM', 'regEthY', ethResult.day, ethResult.month, ethResult.year);
              syncMrnYearWithRegDate();
            }
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
          const source = group.id === 'regEuroGroup' || group.id === 'euroDobGroup' ? 'euro' : 'eth';
          group.dataset.lastEdited = source;
          group.classList.remove('invalid');
          yEl.focus();
        }
      });
    }

    function showFeedback(elId: string, message: string, ok: boolean) {
      const el = document.getElementById(elId);
      if (!el) return;
      el.textContent = message;
      el.className = 'conversion-feedback show ' + (ok ? 'ok' : 'err');
    }
    function clearFeedback(elId: string) {
      const el = document.getElementById(elId);
      if (!el) return;
      el.className = 'conversion-feedback';
    }

    let authoritativeToday: Date | null = null;
    let dateSource: 'online' | 'fetching' | 'fallback' | 'waiting' = 'waiting';

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

    function updateAgeDateStatus() {
      const el = document.getElementById('ageDateStatus');
      if (!el) return;
      if (authoritativeToday && dateSource === 'online') {
        const p = getAddisParts(authoritativeToday);
        const dStr = `${String(p.day).padStart(2,'0')}/${String(p.month).padStart(2,'0')}/${p.year}`;
        el.textContent = `🌐 Online current date: ${dStr} (Addis Ababa)`;
        el.style.color = '#0f766e';
      } else if (dateSource === 'fetching') {
        el.textContent = '🌐 Fetching online current date (Addis Ababa)…';
        el.style.color = '#0284c7';
      } else if (dateSource === 'fallback') {
        const d = authoritativeToday || new Date();
        const dStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        el.textContent = `⚠ Offline — Using server date: ${dStr}`;
        el.style.color = '#b45309';
      } else {
        el.textContent = '🌐 Getting online current date…';
        el.style.color = '#64748b';
      }
    }

    async function fetchOnlineCurrentDate(): Promise<Date | null> {
      // Provider 1: WorldTimeAPI
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
      } catch (e) {
        // try next provider
      }

      // Provider 2: TimeAPI.io
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const response = await fetch('https://timeapi.io/api/v1/time/current/zone?timeZone=Africa/Addis_Ababa', {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (response.ok) {
          const data = await response.json();
          if (data.dateTime) {
            const online = new Date(data.dateTime);
            if (!Number.isNaN(online.getTime())) return online;
          }
        }
      } catch (e) {
        // try next provider
      }

      // Provider 3: HTTP Server Header Date
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeout);
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const online = new Date(dateHeader);
          if (!Number.isNaN(online.getTime())) return online;
        }
      } catch (e) {
        // end fallback
      }

      return null;
    }

    async function loadOnlineCurrentDate() {
      dateSource = 'fetching';
      updateAgeDateStatus();

      const online = await fetchOnlineCurrentDate();
      if (online) {
        authoritativeToday = online;
        dateSource = 'online';
      } else {
        authoritativeToday = new Date();
        dateSource = 'fallback';
      }

      updateAgeDateStatus();
      setRegistrationDatePlaceholders(authoritativeToday);

      const eth = readGroup('ethDobD', 'ethDobM', 'ethDobY');
      const euro = readGroup('euroDobD', 'euroDobM', 'euroDobY');
      if (euro && isValidDate(euro.day, euro.month, euro.year)) {
        calculateAge(euro.year, euro.month, euro.day);
      } else if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
        const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
        calculateAge(greg.year, greg.month, greg.day);
      }
    }

    async function calculateAge(year: number, month: number, day: number) {
      if (!year || !month || !day) return;

      if (!authoritativeToday) {
        dateSource = 'fetching';
        updateAgeDateStatus();
        const online = await fetchOnlineCurrentDate();
        if (online) {
          authoritativeToday = online;
          dateSource = 'online';
        } else {
          authoritativeToday = new Date();
          dateSource = 'fallback';
        }
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

    // =========================================================
    // Global functions bound to window for onclick handlers
    // =========================================================
    (window as any).toggleConvertMenu = function(menuId: string) {
      const menu = document.getElementById(menuId);
      if (!menu) return;
      const wasOpen = menu.classList.contains('show');
      document.querySelectorAll('.convert-menu').forEach(m => m.classList.remove('show'));
      if (!wasOpen) menu.classList.add('show');
    };

    (window as any).convertRegDate = function(direction: string) {
      clearFeedback('regDateFeedback');
      document.getElementById('regEuroGroup')?.classList.remove('invalid');
      document.getElementById('regEthGroup')?.classList.remove('invalid');
      document.getElementById('regConvertMenu')?.classList.remove('show');

      if (direction === 'eth-to-euro') {
        const err = getDetailedDateError('eth', 'regEthD', 'regEthM', 'regEthY');
        if (err) {
          document.getElementById('regEthGroup')?.classList.add('invalid');
          showFeedback('regDateFeedback', err, false);
          return;
        }
        const eth = readGroup('regEthD', 'regEthM', 'regEthY');
        if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
          const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
          writeGroup('regEuroD', 'regEuroM', 'regEuroY', greg.day, greg.month, greg.year);
          showFeedback('regDateFeedback', '✓ Converted Ethiopian date to European date.', true);
          syncMrnYearWithRegDate();
          return;
        }
      } else if (direction === 'euro-to-eth') {
        const err = getDetailedDateError('euro', 'regEuroD', 'regEuroM', 'regEuroY');
        if (err) {
          document.getElementById('regEuroGroup')?.classList.add('invalid');
          showFeedback('regDateFeedback', err, false);
          return;
        }
        const euro = readGroup('regEuroD', 'regEuroM', 'regEuroY');
        if (euro && isValidDate(euro.day, euro.month, euro.year)) {
          const ethResult = gregorianToEthiopian(euro.year, euro.month, euro.day);
          writeGroup('regEthD', 'regEthM', 'regEthY', ethResult.day, ethResult.month, ethResult.year);
          showFeedback('regDateFeedback', '✓ Converted European date to Ethiopian date.', true);
          syncMrnYearWithRegDate();
          return;
        }
      }

      showFeedback('regDateFeedback', '⚠ Enter a complete, valid date in the selected calendar.', false);
    };

    (window as any).convertDobBoth = function(direction?: string) {
      clearFeedback('dobFeedback');
      document.getElementById('euroDobGroup')?.classList.remove('invalid');
      document.getElementById('ethDobGroup')?.classList.remove('invalid');
      document.getElementById('dobConvertMenu')?.classList.remove('show');

      const ethDEl = document.getElementById('ethDobD') as HTMLInputElement;
      const ethMEl = document.getElementById('ethDobM') as HTMLInputElement;
      const ethYEl = document.getElementById('ethDobY') as HTMLInputElement;
      const euroDEl = document.getElementById('euroDobD') as HTMLInputElement;
      const euroMEl = document.getElementById('euroDobM') as HTMLInputElement;
      const euroYEl = document.getElementById('euroDobY') as HTMLInputElement;

      const ethHasVal = ethDEl?.value || ethMEl?.value || ethYEl?.value;
      const euroHasVal = euroDEl?.value || euroMEl?.value || euroYEl?.value;

      let targetDir = direction;
      if (!targetDir || targetDir === 'auto') {
        if (ethHasVal && !euroHasVal) {
          targetDir = 'eth-to-euro';
        } else if (euroHasVal && !ethHasVal) {
          targetDir = 'euro-to-eth';
        } else if (ethHasVal) {
          targetDir = 'eth-to-euro';
        } else {
          targetDir = 'euro-to-eth';
        }
      }

      if (targetDir === 'eth-to-euro') {
        const err = getDetailedDateError('eth', 'ethDobD', 'ethDobM', 'ethDobY');
        if (err) {
          document.getElementById('ethDobGroup')?.classList.add('invalid');
          showFeedback('dobFeedback', err, false);
          return;
        }
        const eth = readGroup('ethDobD', 'ethDobM', 'ethDobY');
        if (eth && isValidEthDate(eth.day, eth.month, eth.year)) {
          const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
          writeGroup('euroDobD', 'euroDobM', 'euroDobY', greg.day, greg.month, greg.year);
          calculateAge(greg.year, greg.month, greg.day);
          showFeedback('dobFeedback', '✓ Converted Ethiopian DOB to European DOB and calculated age.', true);
          return;
        }
      } else if (targetDir === 'euro-to-eth') {
        const err = getDetailedDateError('euro', 'euroDobD', 'euroDobM', 'euroDobY');
        if (err) {
          document.getElementById('euroDobGroup')?.classList.add('invalid');
          showFeedback('dobFeedback', err, false);
          return;
        }
        const euro = readGroup('euroDobD', 'euroDobM', 'euroDobY');
        if (euro && isValidDate(euro.day, euro.month, euro.year)) {
          const ethResult = gregorianToEthiopian(euro.year, euro.month, euro.day);
          writeGroup('ethDobD', 'ethDobM', 'ethDobY', ethResult.day, ethResult.month, ethResult.year);
          calculateAge(euro.year, euro.month, euro.day);
          showFeedback('dobFeedback', '✓ Converted European DOB to Ethiopian DOB and calculated age.', true);
          return;
        }
      }

      document.getElementById('euroDobGroup')?.classList.add('invalid');
      document.getElementById('ethDobGroup')?.classList.add('invalid');
      showFeedback('dobFeedback', '⚠ Please enter a complete date in either Ethiopian or European DOB.', false);
    };

    // =========================================================
    // Combobox Widget logic
    // =========================================================
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
          hint.textContent = 'Known kebeles for ' + woredaName + ': ' + names.join(', ') + '. Keep typing to add a new one.';
        } else {
          hint.textContent = 'No kebeles saved yet for ' + woredaName + ' — type the real kebele name; it will be remembered for next time.';
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

    function initRegDate() {
      writeGroup('regEuroD', 'regEuroM', 'regEuroY', null, null, null);
      writeGroup('regEthD', 'regEthM', 'regEthY', null, null, null);
      const euroG = document.getElementById('regEuroGroup');
      const ethG = document.getElementById('regEthGroup');
      if (euroG) euroG.dataset.lastEdited = '';
      if (ethG) ethG.dataset.lastEdited = '';
      setRegistrationDatePlaceholders(new Date());
    }

    function setRegistrationDatePlaceholders(gregorianDate: Date) {
      if (!gregorianDate || Number.isNaN(gregorianDate.getTime())) return;

      const gd = gregorianDate.getDate();
      const gm = gregorianDate.getMonth() + 1;
      const gy = gregorianDate.getFullYear();
      const eth = gregorianToEthiopian(gy, gm, gd);

      const euroG = document.getElementById('regEuroGroup');
      const ethG = document.getElementById('regEthGroup');
      const regEuroEdited = euroG?.dataset.lastEdited === 'true';
      const regEthEdited = ethG?.dataset.lastEdited === 'true';

      if (!regEuroEdited && !regEthEdited) {
        writeGroup('regEuroD', 'regEuroM', 'regEuroY', gd, gm, gy);
        writeGroup('regEthD', 'regEthM', 'regEthY', eth.day, eth.month, eth.year);
      }
    }

    function getSeqForYear(yy: string): number {
      const yearKey = `selihom_mrn_seq_${yy}`;
      const storedYearSeq = localStorage.getItem(yearKey);
      if (storedYearSeq !== null) {
        const val = parseInt(storedYearSeq, 10);
        return isNaN(val) ? 1 : val;
      }
      // Legacy fallback for year 18 if previously saved under 'selihom_mrn_seq'
      const legacySeq = localStorage.getItem('selihom_mrn_seq');
      if (yy === '18' && legacySeq !== null) {
        const val = parseInt(legacySeq, 10);
        return isNaN(val) ? 8614 : val;
      }
      // Defaults: year 18 defaults to 8614; any new Ethiopian year resets sequence to 1 (0001)
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

    (window as any).incrementMRN = function() {
      const mrnEl = document.getElementById('mrn') as HTMLInputElement;
      const yy = currentRegEthYY();
      let currentSeq = getSeqForYear(yy);

      if (mrnEl && mrnEl.value) {
        const val = mrnEl.value.trim();
        const slashIdx = val.indexOf('/');
        const seqPart = slashIdx >= 0 ? val.slice(0, slashIdx) : val;
        const parsedNum = parseInt(digitsOnly(seqPart), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          currentSeq = parsedNum;
        }
      }

      const nextSeq = currentSeq + 1;
      setSeqForYear(yy, nextSeq);
      if (mrnEl) mrnEl.value = formatMRN(nextSeq, yy);
    };

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
        // Year changed! Reset sequence for the new Ethiopian year (or retrieve existing sequence for newYY)
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
    setupDateGroup('regEuroGroup', 'regEuroD', 'regEuroM', 'regEuroY');
    setupDateGroup('regEthGroup', 'regEthD', 'regEthM', 'regEthY');
    setupDateGroup('euroDobGroup', 'euroDobD', 'euroDobM', 'euroDobY');
    setupDateGroup('ethDobGroup', 'ethDobD', 'ethDobM', 'ethDobY');

    initRegDate();
    generateMRN();
    (window as any).toggleReferralField();
    initAddressDropdowns();
    updateAgeDateStatus();
    loadOnlineCurrentDate();

    const regEthYEl = document.getElementById('regEthY');
    const regEthMEl = document.getElementById('regEthM');
    const regEthDEl = document.getElementById('regEthD');
    if (regEthYEl) regEthYEl.addEventListener('input', syncMrnYearWithRegDate);
    if (regEthMEl) regEthMEl.addEventListener('input', syncMrnYearWithRegDate);
    if (regEthDEl) regEthDEl.addEventListener('input', syncMrnYearWithRegDate);

    // Auto-calculate year if age, day, and month are provided
    function tryCalculateYearFromAge() {
      const ageEl = document.getElementById('age') as HTMLInputElement;
      const ageVal = parseInt(digitsOnly(ageEl?.value), 10);
      if (isNaN(ageVal) || ageVal < 0) return;

      const todayRef = authoritativeToday || new Date();
      const todayEuroParts = getAddisParts(todayRef);
      const todayEthParts = gregorianToEthiopian(todayEuroParts.year, todayEuroParts.month, todayEuroParts.day);

      // Check European DOB (Day & Month present)
      const euroDEl = document.getElementById('euroDobD') as HTMLInputElement;
      const euroMEl = document.getElementById('euroDobM') as HTMLInputElement;
      const euroYEl = document.getElementById('euroDobY') as HTMLInputElement;
      const ed = parseInt(digitsOnly(euroDEl?.value), 10);
      const em = parseInt(digitsOnly(euroMEl?.value), 10);

      if (ed && em && em >= 1 && em <= 12 && ed >= 1 && ed <= 31) {
        let bYear = todayEuroParts.year - ageVal;
        if (todayEuroParts.month < em || (todayEuroParts.month === em && todayEuroParts.day < ed)) {
          bYear--;
        }
        if (bYear >= 1800 && bYear <= 2200) {
          euroYEl.value = String(bYear);
          const ethResult = gregorianToEthiopian(bYear, em, ed);
          writeGroup('ethDobD', 'ethDobM', 'ethDobY', ethResult.day, ethResult.month, ethResult.year);
          clearFeedback('dobFeedback');
          return;
        }
      }

      // Check Ethiopian DOB (Day & Month present)
      const ethDEl = document.getElementById('ethDobD') as HTMLInputElement;
      const ethMEl = document.getElementById('ethDobM') as HTMLInputElement;
      const ethYEl = document.getElementById('ethDobY') as HTMLInputElement;
      const etd = parseInt(digitsOnly(ethDEl?.value), 10);
      const etm = parseInt(digitsOnly(ethMEl?.value), 10);

      if (etd && etm && etm >= 1 && etm <= 13 && etd >= 1 && etd <= 30) {
        let bYear = todayEthParts.year - ageVal;
        if (todayEthParts.month < etm || (todayEthParts.month === etm && todayEthParts.day < etd)) {
          bYear--;
        }
        if (bYear >= 1892 && bYear <= 2200) {
          ethYEl.value = String(bYear);
          const greg = ethiopianToGregorian(bYear, etm, etd);
          writeGroup('euroDobD', 'euroDobM', 'euroDobY', greg.day, greg.month, greg.year);
          clearFeedback('dobFeedback');
          return;
        }
      }
    }

    const ageInputEl = document.getElementById('age');
    if (ageInputEl) ageInputEl.addEventListener('input', tryCalculateYearFromAge);
    ['ethDobD', 'ethDobM', 'euroDobD', 'euroDobM'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', tryCalculateYearFromAge);
    });

    const mrnEl = document.getElementById('mrn') as HTMLInputElement;
    if (mrnEl) {
      mrnEl.addEventListener('blur', function() {
        const val = this.value.trim();
        if (!val) return;
        const yy = currentRegEthYY();
        const slashIdx = val.indexOf('/');
        const rawSeq = slashIdx >= 0 ? val.slice(0, slashIdx).trim() : val;
        const specifiedYY = slashIdx >= 0 ? val.slice(slashIdx + 1).trim() : yy;
        const parsed = parseInt(digitsOnly(rawSeq), 10);
        if (!isNaN(parsed) && parsed > 0) {
          this.value = formatMRN(parsed, specifiedYY || yy);
        }
      });
    }

    // Form submit listener
    const form = document.getElementById('patientForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn') as HTMLButtonElement;
        const statusMsg = document.getElementById('statusMsg');
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving & Registering...</span>`;
        }
        if (statusMsg) statusMsg.style.display = 'none';

        const isReferred = (document.getElementById('isReferred') as HTMLInputElement)?.checked;
        const referralSourceVal = (document.getElementById('referralSource') as HTMLInputElement)?.value;
        const referralData = isReferred
          ? { referred: true, source: referralSourceVal || "Unknown Source" }
          : { referred: false, source: null };

        const regEuro = readGroup('regEuroD', 'regEuroM', 'regEuroY');
        const regEth = readGroup('regEthD', 'regEthM', 'regEthY');
        const dobEuro = readGroup('euroDobD', 'euroDobM', 'euroDobY');
        const dobEth = readGroup('ethDobD', 'ethDobM', 'ethDobY');

        saveKebeleName(currentWoredaName(), (document.getElementById('kebele') as HTMLInputElement)?.value.trim() || '');

        const patientData = {
          meta: {
            facility: (document.getElementById('facility') as HTMLInputElement)?.value,
            mrn: (document.getElementById('mrn') as HTMLInputElement)?.value,
            registrationDate: {
              ethiopian: regEth ? `${regEth.day}/${regEth.month}/${regEth.year}` : 'N/A',
              gregorian: regEuro ? `${regEuro.day}/${regEuro.month}/${regEuro.year}` : 'N/A'
            },
            referral: referralData
          },
          personalInfo: {
            firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
            fatherName: (document.getElementById('fatherName') as HTMLInputElement)?.value,
            grandFatherName: (document.getElementById('grandFatherName') as HTMLInputElement)?.value,
            sex: (document.getElementById('sex') as HTMLSelectElement)?.value
          },
          dob: {
            ethiopian: dobEth ? `${dobEth.day}/${dobEth.month}/${dobEth.year}` : 'N/A',
            gregorian: dobEuro ? `${dobEuro.day}/${dobEuro.month}/${dobEuro.year}` : 'N/A'
          },
          age: (document.getElementById('age') as HTMLInputElement)?.value,
          address: {
            region: currentRegionName(),
            zone: currentZoneName(),
            woreda: currentWoredaName(),
            kebele: (document.getElementById('kebele') as HTMLInputElement)?.value.trim() || '',
            ketena: (document.getElementById('ketena') as HTMLInputElement)?.value.trim() || '',
            houseNumber: (document.getElementById('houseNumber') as HTMLInputElement)?.value
          },
          contact: { phone: (document.getElementById('phoneNumber') as HTMLInputElement)?.value },
          clinicalData: null,
          status: "Waiting for Doctor Review"
        };

        setTimeout(() => {
          console.log("Saved Data:", patientData);
          let newPatientId = 'pat-' + Date.now();
          if (typeof (window as any).addNewPatientToState === 'function') {
            newPatientId = (window as any).addNewPatientToState(patientData);
          }

          if (statusMsg) {
            statusMsg.className = 'p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-lg animate-in fade-in slide-in-from-bottom-2';
            statusMsg.style.display = 'block';
            let refText = isReferred ? ` (Referred from: ${referralData.source})` : "";
            statusMsg.innerHTML = `
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-extrabold text-emerald-950 text-base">Patient Registered Successfully!</h4>
                    <p class="text-xs sm:text-sm mt-1 text-emerald-800">
                      <b>${patientData.personalInfo.firstName} ${patientData.personalInfo.fatherName}</b> (MRN: <span class="font-extrabold text-blue-700">${patientData.meta.mrn}</span>)${refText} is registered and added to the clinic queue.
                    </p>
                    <p class="text-xs text-emerald-700 mt-1">
                      As Receptionist/Nurse, you can now conduct the <b>Triage & Clinical Screening</b> (Blood pressure, Diabetic blood sugar test, Visual Acuity) for this patient.
                    </p>
                  </div>
                </div>
                <div class="shrink-0 flex flex-wrap sm:flex-col gap-2">
                  <button type="button" onclick="window.goToTriageForPatient('${newPatientId}')" class="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md inline-flex items-center gap-1.5 cursor-pointer transition-all">
                    <span>🩺 Open Nurse Triage for this Patient</span>
                  </button>
                </div>
              </div>
            `;
          }
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Register Patient & Send to Doctor</span>`;
          }
          if (typeof (window as any).incrementMRN === 'function') {
            (window as any).incrementMRN();
          }
        }, 1000);
      });
    }

  }, []);

  return (
    <div className="clinic-app min-h-screen bg-slate-100 text-slate-800">
      <style>{`
        .clinic-app {
          --navy: #0d2b55;
          --blue: #2563eb;
          --blue-soft: #eff6ff;
          --border: #dbe5f1;
          --muted: #64748b;
          --ink: #102a43;
        }
        .clinic-shell { min-height: 100vh; }
        .clinic-sidebar {
          background: linear-gradient(180deg, #08264d 0%, #123b72 100%);
          color: white;
        }
        .clinic-nav-item {
          display:flex; align-items:center; gap:.8rem; width:100%;
          padding:.72rem .9rem; border-radius:.7rem; color:#dbeafe;
          font-size:.86rem; font-weight:600; transition:.18s ease;
        }
        .clinic-nav-item:hover { background:rgba(255,255,255,.08); color:#fff; }
        .clinic-nav-item.active { background:linear-gradient(90deg,#3b82f6,#2563eb); color:#fff; box-shadow:0 8px 22px rgba(37,99,235,.25); }
        .clinic-card {
          background:rgba(255,255,255,.97);
          border:1px solid var(--border);
          border-radius:18px;
          box-shadow:0 8px 28px rgba(15,45,75,.06);
        }
        .clinic-section-head {
          display:flex; align-items:center; gap:.8rem;
          padding-bottom:.8rem; border-bottom:1px solid #e5edf6;
        }
        .clinic-section-icon {
          width:42px; height:42px; display:grid; place-items:center;
          border-radius:13px; background:#eff6ff; color:#2563eb;
          border:1px solid #dbeafe; flex:none;
        }
        .clinic-section-icon.green { background:#ecfdf5; color:#059669; border-color:#d1fae5; }
        .clinic-section-icon.purple { background:#f5f3ff; color:#7c3aed; border-color:#ede9fe; }
        .clinic-section-icon.orange { background:#fff7ed; color:#ea580c; border-color:#fed7aa; }
        .clinic-label {
          display:block; font-size:.68rem; font-weight:800; color:#334e68;
          letter-spacing:.055em; text-transform:uppercase; margin-bottom:.38rem;
        }
        .clinic-input, .clinic-select {
          width:100%; min-height:44px; padding:.7rem .85rem;
          border:1px solid #cbd8e7; border-radius:10px; background:#fff;
          color:#102a43; font-size:.88rem; font-weight:500; outline:none;
          transition:.16s ease;
        }
        .clinic-input:focus, .clinic-select:focus {
          border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.12);
        }
        .clinic-input::placeholder { color:#94a3b8; font-weight:400; }
        .clinic-date-panel {
          background:#f8fbff; border:1px solid #dbe7f5; border-radius:14px; padding:1rem;
        }
        .clinic-date-box {
          background:#fff; border:1px solid #cbd8e7; border-radius:10px;
          min-height:54px; display:flex; align-items:center; padding:.2rem .7rem;
        }
        .clinic-date-box:focus-within { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
        .clinic-date-box .date-seg {
          border:0 !important; box-shadow:none !important; background:transparent !important;
          color:#102a43 !important; font-weight:700 !important; width:42px !important;
          min-width:0 !important; padding:.45rem .15rem !important; text-align:center;
          outline:none !important;
        }
        .clinic-date-box .date-seg-yyyy { width:70px !important; }
        .clinic-date-box .date-sep { color:#60a5fa; font-weight:800; }
        .clinic-pill {
          display:inline-flex; align-items:center; gap:.35rem; padding:.2rem .48rem;
          border-radius:999px; font-size:.62rem; font-weight:800;
          color:#2563eb; background:#eff6ff; border:1px solid #dbeafe;
        }
        .clinic-button {
          display:inline-flex; align-items:center; justify-content:center; gap:.45rem;
          min-height:42px; padding:.7rem 1rem; border-radius:10px;
          font-size:.78rem; font-weight:800; transition:.16s ease; cursor:pointer;
        }
        .clinic-button-primary { color:white; background:#2563eb; box-shadow:0 8px 18px rgba(37,99,235,.2); }
        .clinic-button-primary:hover { background:#1d4ed8; transform:translateY(-1px); }
        .clinic-button-secondary { color:#1d4ed8; background:#fff; border:1px solid #bfdbfe; }
        .clinic-button-secondary:hover { background:#eff6ff; }
        .clinic-submit {
          width:100%; min-height:54px; border-radius:12px; border:0;
          background:linear-gradient(90deg,#123b72,#2563eb);
          color:#fff; font-weight:800; font-size:.95rem; letter-spacing:.01em;
          box-shadow:0 12px 28px rgba(13,43,85,.18); cursor:pointer;
        }
        .clinic-submit:hover { filter:brightness(1.06); transform:translateY(-1px); }
        .clinic-banner {
          min-height:220px; border-radius:18px; overflow:hidden; position:relative;
          background:linear-gradient(90deg, rgba(7,39,82,.99) 0%, rgba(17,62,112,.96) 43%, rgba(17,62,112,.42) 72%, rgba(17,62,112,.08) 100%);
          box-shadow:0 12px 30px rgba(13,43,85,.12);
        }
        .clinic-banner-eye {
          position:absolute; right:0; top:0; width:58%; height:100%; object-fit:cover; object-position:center;
          opacity:.94; mix-blend-mode:screen;
          -webkit-mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.28) 20%, #000 48%, #000 100%);
          mask-image:linear-gradient(90deg, transparent 0%, rgba(0,0,0,.28) 20%, #000 48%, #000 100%);
        }
        .clinic-banner-scan {
          position:absolute; right:7%; top:50%; width:250px; height:250px; transform:translateY(-50%);
          border:1px solid rgba(255,255,255,.28); border-radius:50%; box-shadow:0 0 0 24px rgba(255,255,255,.045),0 0 0 50px rgba(255,255,255,.025);
          pointer-events:none;
        }
        .clinic-banner-scan:before, .clinic-banner-scan:after {
          content:""; position:absolute; left:50%; top:50%; background:rgba(255,255,255,.24); transform:translate(-50%,-50%);
        }
        .clinic-banner-scan:before { width:100%; height:1px; }
        .clinic-banner-scan:after { width:1px; height:100%; }
        .clinic-banner:after {
          content:""; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(90deg, rgba(7,39,82,.18), transparent 55%);
        }
        .clinic-combo .combo-wrapper { position:relative; }
        .clinic-combo .combo-wrapper > input { padding-right:2.5rem; }
        .clinic-combo .combo-arrow {
          position:absolute; right:.55rem; top:50%; transform:translateY(-50%);
          border:0; background:transparent; color:#64748b; cursor:pointer; z-index:2;
        }
        .clinic-combo .combo-list {
          position:absolute; z-index:100; top:calc(100% + 5px); left:0; right:0;
          max-height:220px; overflow:auto; margin:0; padding:.35rem;
          list-style:none; background:#fff; border:1px solid #dbe5f1; border-radius:11px;
          box-shadow:0 18px 36px rgba(15,45,75,.16); display:none;
        }
        .clinic-combo .combo-list.open { display:block; }
        .clinic-combo .combo-list li { padding:.6rem .7rem; border-radius:7px; font-size:.82rem; cursor:pointer; color:#334e68; }
        .clinic-combo .combo-list li:hover { background:#eff6ff; color:#1d4ed8; }
        .clinic-combo .other-input-wrap { display:none; margin-top:.4rem; }
        .clinic-combo .other-input-wrap.show { display:block; }
        .clinic-combo .other-input { min-height:36px; }
        .clinic-combo .open-active { z-index:80; }
        .clinic-feedback { margin-top:.55rem; }
        .clinic-footer { color:#64748b; font-size:.72rem; text-align:center; padding:1.2rem 0 2rem; }
        @media (max-width: 1023px) {
          .clinic-sidebar { display:none; }
        }
      `}</style>

      <div className="clinic-shell flex">
        {/* Left navigation */}
        <aside className="clinic-sidebar hidden lg:flex w-[190px] xl:w-[205px] shrink-0 min-h-screen sticky top-0 self-start flex-col px-4 py-5">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-11 h-11 rounded-full bg-white grid place-items-center shadow-lg">
              <Eye className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Selihome</div>
              <div className="text-xs text-blue-100">Eye Clinic</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('registration')}
              className={`clinic-nav-item w-full text-left cursor-pointer transition-colors ${activeTab === 'registration' ? 'active' : ''}`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Patient Registration</span>
            </button>



            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`clinic-nav-item w-full text-left cursor-pointer transition-colors ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Reports</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`clinic-nav-item w-full text-left cursor-pointer transition-colors ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>

          <div className="mt-auto space-y-2.5">
            <div className="rounded-xl border border-blue-300/20 bg-white/5 p-3 text-xs text-blue-100">
              <div className="font-bold text-white mb-1">Role: Reception & Nurse</div>
              <div className="text-[11px] leading-relaxed">Register patients, screen vitals & diabetic markers, then route to the Doctor.</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/20 bg-white/10 hover:bg-rose-500/20 hover:border-rose-400/40 text-blue-100 hover:text-white px-3 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Sign out of Reception portal"
            >
              <LogOut className="w-4 h-4 text-blue-200" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* Top utility bar */}
          <div className="h-[70px] bg-white border-b border-slate-200 px-4 sm:px-7 flex items-center justify-between gap-3">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setActiveTab('registration')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === 'registration'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Reg
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === 'reports'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Reports
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Settings
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-4 h-4 text-blue-700" />
              <span className="font-semibold">Today (Online)</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {registeredPatientsCount > 0 && (
                <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {registeredPatientsCount} patients queued
                </div>
              )}
              <div className="hidden sm:block text-xs font-bold text-slate-700">
                {new Intl.DateTimeFormat('en-GB', {
                  timeZone: 'Africa/Addis_Ababa',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }).format(new Date())}
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 grid place-items-center">
                  <User className="w-5 h-5 text-blue-700" />
                </div>
                <div className="leading-tight text-left">
                  <div className="text-xs font-extrabold text-slate-800">Sister Selamawit</div>
                  <div className="text-[10px] text-blue-700 font-semibold">Receptionist & Nurse</div>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
                title="Sign out of Reception portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-5 sm:py-7">
            {/* Registration View */}
            <div className={activeTab === 'registration' ? 'block' : 'hidden'}>
              {/* Hero */}
              <section className="clinic-banner mb-5 sm:mb-6">
                <img
                  className="clinic-banner-eye"
                  src="https://static.ucraft.net/fs/ucraft/userFiles/bigfatima/images/60016137616511753-wsoheader.webp"
                  alt="Blue eye representing ophthalmology and eye care"
                />
                <div className="clinic-banner-scan" aria-hidden="true" />
                <div className="relative z-10 p-7 sm:p-9 max-w-[690px] text-white">
                  <div className="text-xs sm:text-sm font-bold tracking-wide text-blue-200 mb-2">
                    PATIENT REGISTRATION & TRIAGE SYSTEM
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] font-extrabold tracking-tight">
                    Selihome Ophthalmic<br className="hidden sm:block" /> Medium Clinic
                  </h1>
                  <div className="mt-4 h-1 w-12 bg-blue-400 rounded-full" />
                  <p className="mt-4 text-sm text-blue-50 max-w-md leading-relaxed">
                    Provide accurate patient information for better eye care and service.
                  </p>
                </div>
              </section>

            <form id="patientForm" className="space-y-5">

              {/* Registration Date */}
              <section className="clinic-card relative z-[60] p-5 sm:p-6">
                <div className="clinic-section-head mb-5">
                  <div className="clinic-section-icon"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#102a43]">
                      Registration Date <span className="text-sm font-normal text-blue-700">(የምዝገባ ቀን)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Auto-defaults to the current date in both Ethiopian and European calendars</p>
                  </div>
                </div>

                <div className="clinic-date-panel">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="clinic-label flex items-center justify-between">
                        <span>ETHIOPIAN DATE (የኢትዮጵያ ቀን)</span>
                        <span className="clinic-pill">DD/MM/YYYY</span>
                      </label>
                      <div className="date-input-group clinic-date-box" id="regEthGroup">
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEthD" placeholder="DD" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEthM" placeholder="MM" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="regEthY" placeholder="YYYY" maxLength={4} />
                      </div>
                    </div>
                    <div>
                      <label className="clinic-label flex items-center justify-between">
                        <span>EUROPEAN DATE (ፈረንጅ ቀን)</span>
                        <span className="clinic-pill">DD/MM/YYYY</span>
                      </label>
                      <div className="date-input-group clinic-date-box" id="regEuroGroup">
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEuroD" placeholder="DD" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="regEuroM" placeholder="MM" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="regEuroY" placeholder="YYYY" maxLength={4} />
                      </div>
                    </div>
                  </div>


                </div>
              </section>

              {/* MRN */}
              <section className="clinic-card relative z-[50] p-5 sm:p-6">
                <div className="clinic-section-head mb-5">
                  <div className="clinic-section-icon purple"><FileText className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#102a43]">Identification & Medical Facility</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Auto-incrementing MRN sequence synchronized with Ethiopian year</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="clinic-label">MEDICAL RECORD NUMBER (MRN)</label>
                    <div className="flex gap-2">
                      <input type="text" id="mrn" className="clinic-input font-extrabold" placeholder="e.g. 0001/18 or 8614/18" />
                      <button type="button" className="clinic-button bg-violet-600 text-white shadow-sm" onClick={() => (window as any).incrementMRN()}>Next #</button>
                    </div>
                    <p className="text-[11px] text-slate-500 italic leading-relaxed mt-2">
                      Editable — 4-digit sequence; year suffix syncs with Ethiopian Registration Date and resets to 0001 on a new Ethiopian year.
                    </p>
                  </div>

                  <div>
                    <label className="clinic-label">FACILITY NAME</label>
                    <div className="relative">
                      <input type="text" id="facility" defaultValue="Selihome Ophthalmic Medium Clinic" className="clinic-input font-bold pr-11" placeholder="Enter Medical Facility Name" />
                      <Building2 className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Personal */}
              <section className="clinic-card relative z-[40] p-5 sm:p-6">
                <div className="clinic-section-head mb-5">
                  <div className="clinic-section-icon green"><User className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#102a43]">
                      Personal Information <span className="text-sm font-normal text-emerald-700">(የግል መረጃ)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Patient full name details and gender selection</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="clinic-label">FIRST NAME (ስም) <span className="text-rose-500">*</span></label>
                    <input type="text" id="firstName" placeholder="e.g. Amore" required className="clinic-input" />
                  </div>
                  <div>
                    <label className="clinic-label">FATHER'S NAME (የአባት ስም) <span className="text-rose-500">*</span></label>
                    <input type="text" id="fatherName" placeholder="e.g. Shobera" required className="clinic-input" />
                  </div>
                  <div>
                    <label className="clinic-label">GRAND FATHER'S NAME (የአያት ስም) <span className="text-rose-500">*</span></label>
                    <input type="text" id="grandFatherName" placeholder="e.g. Shaka" required className="clinic-input" />
                  </div>
                </div>

                <div className="mt-4 max-w-[260px]">
                  <label className="clinic-label">SEX (ፆታ)</label>
                  <select id="sex" className="clinic-select cursor-pointer">
                    <option value="M">Male (ወንድ)</option>
                    <option value="F">Female (ሴት)</option>
                  </select>
                </div>
              </section>

              {/* DOB & Age */}
              <section className="clinic-card relative z-[30] p-5 sm:p-6">
                <div className="clinic-section-head mb-5">
                  <div className="clinic-section-icon"><Calendar className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#102a43]">
                      Date of Birth & Age <span className="text-sm font-normal text-blue-700">(የልደት ቀን እና ዕድሜ)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Calculate age automatically from Ethiopian or European birth dates</p>
                  </div>
                </div>

                <div className="clinic-date-panel">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="clinic-label flex items-center justify-between">
                        <span>ETHIOPIAN DOB (የኢትዮጵያ ልደት)</span><span className="clinic-pill">DD/MM/YYYY</span>
                      </label>
                      <div className="date-input-group clinic-date-box" id="ethDobGroup">
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="ethDobD" placeholder="DD" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="ethDobM" placeholder="MM" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="ethDobY" placeholder="YYYY" maxLength={4} />
                      </div>
                    </div>

                    <div>
                      <label className="clinic-label flex items-center justify-between">
                        <span>EUROPEAN DOB (ፈረንጅ ልደት)</span><span className="clinic-pill">DD/MM/YYYY</span>
                      </label>
                      <div className="date-input-group clinic-date-box" id="euroDobGroup">
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="euroDobD" placeholder="DD" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg" id="euroDobM" placeholder="MM" maxLength={2} />
                        <span className="date-sep">/</span>
                        <input type="text" inputMode="numeric" autoComplete="off" className="date-seg date-seg-yyyy" id="euroDobY" placeholder="YYYY" maxLength={4} />
                      </div>
                    </div>
                  </div>

                  <div className="conversion-feedback clinic-feedback" id="dobFeedback"></div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="clinic-label">CALCULATED AGE (ዕድሜ)</label>
                    <input type="number" id="age" placeholder="0" className="clinic-input bg-white text-blue-900 font-extrabold text-lg text-center" />
                  </div>
                  <div className="sm:col-span-2 text-xs text-slate-500">
                    <span id="ageDateStatus" className="font-semibold text-slate-600">Checking online date…</span>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section className="clinic-card clinic-combo relative z-[20] focus-within:z-[50] p-5 sm:p-6">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-3">
                    <span className="h-px w-12 bg-blue-300" />
                    <h2 className="text-lg font-extrabold text-blue-700">Address / አድራሻ</h2>
                    <span className="h-px w-12 bg-blue-300" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="clinic-label">REGION (ክልል)</label>
                    <div className="combo-wrapper" id="regionWrapper">
                      <input type="text" id="region" placeholder="Select region" autoComplete="off" className="clinic-input" />
                      <button type="button" className="combo-arrow" id="regionArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                      <ul className="combo-list" id="regionList"></ul>
                    </div>
                    <div className="other-input-wrap" id="regionOtherWrap"><input type="text" className="other-input clinic-input" id="regionOther" placeholder="Enter region manually" /></div>
                  </div>

                  <div>
                    <label className="clinic-label">ZONE (ዞን)</label>
                    <div className="combo-wrapper" id="zoneWrapper">
                      <input type="text" id="zone" placeholder="Select a region first" autoComplete="off" className="clinic-input" />
                      <button type="button" className="combo-arrow" id="zoneArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                      <ul className="combo-list" id="zoneList"></ul>
                    </div>
                    <div className="other-input-wrap" id="zoneOtherWrap"><input type="text" className="other-input clinic-input" id="zoneOther" placeholder="Enter zone manually" /></div>
                  </div>

                  <div>
                    <label className="clinic-label">WOREDA / SUBCITY (ወረዳ)</label>
                    <div className="combo-wrapper" id="woredaWrapper">
                      <input type="text" id="woreda" placeholder="Select a zone first" autoComplete="off" className="clinic-input" />
                      <button type="button" className="combo-arrow" id="woredaArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                      <ul className="combo-list" id="woredaList"></ul>
                    </div>
                    <div className="other-input-wrap" id="woredaOtherWrap"><input type="text" className="other-input clinic-input" id="woredaOther" placeholder="Enter woreda manually" /></div>
                  </div>

                  <div>
                    <label className="clinic-label">KEBELE (ቀበሌ)</label>
                    <div className="combo-wrapper" id="kebeleWrapper">
                      <input type="text" id="kebele" placeholder="Select a woreda first" autoComplete="off" className="clinic-input" />
                      <button type="button" className="combo-arrow" id="kebeleArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                      <ul className="combo-list" id="kebeleList"></ul>
                    </div>
                    <div className="other-input-wrap" id="kebeleOtherWrap"><input type="text" className="other-input clinic-input" id="kebeleOther" placeholder="Enter kebele manually" /></div>
                    <span className="text-[11px] text-blue-700 font-medium block pt-1 leading-tight" id="kebeleHint">Suggestions will appear here once known for this woreda.</span>
                  </div>

                  <div>
                    <label className="clinic-label">KETENA / GOTT (ቀጠና / ጎጥ)</label>
                    <div className="combo-wrapper" id="ketenaWrapper">
                      <input type="text" id="ketena" placeholder="e.g. Ketena 03 / Gott 1" autoComplete="off" className="clinic-input" />
                      <button type="button" className="combo-arrow" id="ketenaArrow" tabIndex={-1}><ChevronDown className="w-4 h-4" /></button>
                      <ul className="combo-list" id="ketenaList"></ul>
                    </div>
                    <div className="other-input-wrap" id="ketenaOtherWrap"><input type="text" className="other-input clinic-input" id="ketenaOther" placeholder="Enter ketena / gott manually" /></div>
                  </div>

                  <div>
                    <label className="clinic-label">HOUSE NUMBER (የቤት ቁጥር)</label>
                    <input type="text" id="houseNumber" placeholder="e.g. 123" className="clinic-input" />
                  </div>
                </div>

                <div className="mt-4 max-w-md">
                  <label className="clinic-label flex items-center justify-between">
                    <span>PHONE NUMBER (ስልክ ቁጥር) <span className="text-rose-500">*</span></span>
                    <Phone className="w-4 h-4 text-blue-700" />
                  </label>
                  <input type="text" id="phoneNumber" placeholder="09XXXXXXXX or 07XXXXXXXX" required className="clinic-input" />
                </div>
              </section>

              {/* Referral */}
              <section className="clinic-card relative z-[10] p-5 sm:p-6">
                <div className="clinic-section-head mb-5">
                  <div className="clinic-section-icon orange"><ShieldCheck className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#102a43]">
                      Referral Information <span className="text-xs font-normal text-slate-500">(Optional)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Track patients referred from secondary health facilities</p>
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-all">
                    <input type="checkbox" id="isReferred" className="w-4 h-4 rounded text-blue-700 focus:ring-blue-500 cursor-pointer" onChange={() => (window as any).toggleReferralField()} />
                    <span className="text-sm font-semibold text-slate-800">Referred from another Health Center or Hospital?</span>
                  </label>

                  <div id="referralSourceContainer" className="hidden mt-4 max-w-md">
                    <label className="clinic-label">REFERRING HEALTH FACILITY NAME</label>
                    <input type="text" id="referralSource" placeholder="Enter Health Center or Hospital name" className="clinic-input" />
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="pt-1">
                <button type="submit" id="submitBtn" className="clinic-submit">
                  <span className="inline-flex items-center gap-2">
                    <UserCheck className="w-5 h-5" /> Register Patient & Send to Doctor Queue
                  </span>
                </button>
              </div>

              <div id="statusMsg" className="hidden"></div>
            </form>
            </div>



            {/* Reports View */}
            {activeTab === 'reports' && (
              <ReportsTab patients={patients} />
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
              <SettingsTab />
            )}

            <footer className="clinic-footer">
              © Selihome Ophthalmic Medium Clinic · Patient Reception & Nurse Triage Portal · Professional Eye Care
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
