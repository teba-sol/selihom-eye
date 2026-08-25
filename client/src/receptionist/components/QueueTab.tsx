import React, { useMemo, useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Stethoscope } from 'lucide-react';
import type { RegisteredPatient } from '../types';
import type { Appointment, Patient } from '../../data/mockData';

interface QueueTabProps {
  patients: RegisteredPatient[];
  onGoToTriage: (patientId: string) => void;
}

// Ethiopian calendar helpers
const ETHIOPIC_JDN_OFFSET = 1724220;
function _gToJ(y: number, m: number, d: number) {
  const a = Math.floor((14-m)/12), yy = y+4800-a, mm = m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
function gregToEth(y: number, m: number, d: number) {
  const jdn = _gToJ(y, m, d);
  const r0 = jdn - ETHIOPIC_JDN_OFFSET - 1;
  const ci = Math.floor(r0/1461), rc = r0 - ci*1461;
  let yo = 0, diy = rc;
  if (rc >= 365 && rc < 730) { yo=1; diy=rc-365; }
  else if (rc >= 730 && rc < 1096) { yo=2; diy=rc-730; }
  else if (rc >= 1096) { yo=3; diy=rc-1096; }
  return { year: ci*4+yo+1, month: Math.floor(diy/30)+1, day: (diy%30)+1 };
}
const ETH_MONTHS = ['Meskerem','Tikimt','Hidar','Tahsas','Tir','Yekatit','Megabit','Miazia','Ginbot','Sene','Hamle','Nehase','Pagume'];
function fmtEthDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const e = gregToEth(y, m, d);
  return `${String(e.day).padStart(2,'0')} ${ETH_MONTHS[e.month-1]} ${e.year}`;
}
function fmtEthTime(t24: string) {
  if (!t24) return '';
  const [hh, mm] = t24.split(':').map(Number);
  const ethH = ((hh-6+12)%12)||12;
  const label = hh<6||hh>=18 ? 'Lelit' : 'Gena';
  return `${ethH}:${String(mm).padStart(2,'0')} (${label})`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'Waiting for Nurse Triage': {
    label: 'Waiting – Triage',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-4 h-4 text-amber-500" />,
  },
  'Triage Completed - Sent to Doctor': {
    label: 'Sent to Doctor',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <Stethoscope className="w-4 h-4 text-blue-500" />,
  },
  'Waiting for Doctor Review': {
    label: 'Awaiting Doctor',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    icon: <AlertCircle className="w-4 h-4 text-indigo-500" />,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    icon: <Clock className="w-4 h-4 text-slate-400" />,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
    icon: <CheckCircle2 className="w-4 h-4 text-teal-500" />,
  },
  in_exam: {
    label: 'In Exam',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    icon: <Stethoscope className="w-4 h-4 text-purple-500" />,
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  },
};

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? {
    label: status,
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    icon: <Clock className="w-4 h-4 text-slate-400" />,
  };
}

export function QueueTab({ patients, onGoToTriage }: QueueTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);
  const [filterDate, setFilterDate] = useState<'today' | 'all'>('today');

  // Lazy-load the store to avoid circular import at module parse time
  useEffect(() => {
    import('../../store/useAppStore').then(({ useAppStore }) => {
      const state = useAppStore.getState();
      setAppointments(state.appointments);
      setDoctorPatients(state.patients);
      // Subscribe to changes
      const unsub = useAppStore.subscribe((s) => {
        setAppointments(s.appointments);
        setDoctorPatients(s.patients);
      });
      return unsub;
    });
  }, []);

  const todayIso = new Date().toISOString().split('T')[0];

  // Build queue: doctor appointments for today (or all), sorted by time
  const appointmentQueue = useMemo(() => {
    const apts = appointments
      .filter(a => a.status !== 'cancelled')
      .filter(a => filterDate === 'all' || a.date === todayIso)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    return apts.map((apt, idx) => {
      // Try to match doctor-side patient to receptionist patient by mrn or name
      const docPat = doctorPatients.find(p => p.id === apt.patientId);
      const regPat = docPat
        ? patients.find(p =>
            p.meta.mrn === docPat.mrn ||
            (p.personalInfo.firstName.toLowerCase() === docPat.firstName.toLowerCase() &&
             p.personalInfo.fatherName.toLowerCase() === docPat.lastName.toLowerCase())
          )
        : null;

      return { apt, docPat, regPat, position: idx + 1 };
    });
  }, [appointments, doctorPatients, patients, filterDate, todayIso]);

  // Also show registered patients not yet in doctor appointments (walk-ins)
  const walkIns = useMemo(() => {
    const aptPatientIds = new Set(appointmentQueue.map(q => q.apt.patientId));
    return patients
      .filter(p => p.status === 'Waiting for Nurse Triage' || p.status === 'Waiting for Doctor Review')
      .filter(p => {
        // Not already in appointment queue
        const docPat = doctorPatients.find(dp =>
          dp.mrn === p.meta.mrn ||
          (dp.firstName.toLowerCase() === p.personalInfo.firstName.toLowerCase())
        );
        return !docPat || !aptPatientIds.has(docPat.id);
      });
  }, [patients, doctorPatients, appointmentQueue]);

  const totalWaiting = appointmentQueue.filter(q =>
    q.apt.status === 'scheduled' || q.apt.status === 'confirmed'
  ).length + walkIns.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#102a43] flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Patient Queue
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Doctor appointment schedule — ordered by time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            <button
              onClick={() => setFilterDate('today')}
              className={`px-4 py-1.5 text-xs font-bold transition-colors ${filterDate === 'today' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterDate('all')}
              className={`px-4 py-1.5 text-xs font-bold transition-colors ${filterDate === 'all' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Waiting', value: totalWaiting, color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'In Exam', value: appointmentQueue.filter(q => q.apt.status === 'in_exam').length, color: 'bg-purple-50 border-purple-200 text-purple-800' },
          { label: 'Completed', value: appointmentQueue.filter(q => q.apt.status === 'completed').length, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
          { label: 'Total Today', value: appointmentQueue.length + walkIns.length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-3 ${s.color}`}>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Appointment queue */}
      {appointmentQueue.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#102a43] text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-300" />
            <span className="font-bold text-sm">Doctor's Appointment Schedule</span>
          </div>
          <div className="divide-y divide-slate-100">
            {appointmentQueue.map(({ apt, docPat, regPat, position }) => {
              const sm = getStatusMeta(apt.status);
              const patName = docPat
                ? `${docPat.firstName} ${docPat.lastName}`
                : regPat
                  ? `${regPat.personalInfo.firstName} ${regPat.personalInfo.fatherName}`
                  : 'Unknown Patient';
              const mrn = docPat?.mrn ?? regPat?.meta.mrn ?? '—';
              const ethDate = fmtEthDate(apt.date);
              const startEth = fmtEthTime(apt.startTime);

              return (
                <div key={apt.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors ${apt.status === 'in_exam' ? 'bg-purple-50/50' : apt.status === 'completed' ? 'opacity-60' : ''}`}>
                  {/* Position number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${
                    apt.status === 'in_exam' ? 'bg-purple-600 text-white' :
                    apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {position}
                  </div>

                  {/* Time */}
                  <div className="shrink-0 w-24 text-center">
                    <div className="text-xs font-bold text-slate-700">{apt.startTime} – {apt.endTime}</div>
                    <div className="text-[10px] text-teal-600 font-medium">{startEth}</div>
                    <div className="text-[10px] text-slate-400">{ethDate}</div>
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{patName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-semibold text-blue-700">{mrn}</span>
                      <span className="text-slate-300">·</span>
                      <span className="truncate">{apt.reason}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sm.bg} ${sm.color}`}>
                    {sm.icon}
                    <span className="hidden sm:inline">{sm.label}</span>
                  </div>

                  {/* Action */}
                  {regPat && apt.status !== 'completed' && (
                    <button
                      onClick={() => onGoToTriage(regPat.id)}
                      className="shrink-0 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Triage
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Walk-in / registered patients not in appointment queue */}
      {walkIns.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-amber-600 text-white flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-bold text-sm">Walk-ins / Pending Triage</span>
            <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{walkIns.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {walkIns.map((p, idx) => {
              const sm = getStatusMeta(p.status);
              return (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-extrabold shrink-0">
                    W{idx + 1}
                  </div>
                  <div className="shrink-0 w-24 text-center">
                    <div className="text-xs text-slate-500">Walk-in</div>
                    <div className="text-[10px] text-slate-400">{p.meta.registrationDate.ethiopian}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">
                      {p.personalInfo.firstName} {p.personalInfo.fatherName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-semibold text-blue-700">{p.meta.mrn}</span>
                      <span className="text-slate-300">·</span>
                      <span>{p.personalInfo.sex === 'M' ? 'Male' : 'Female'} · {p.age} yrs</span>
                    </div>
                  </div>
                  <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sm.bg} ${sm.color}`}>
                    {sm.icon}
                    <span className="hidden sm:inline">{sm.label}</span>
                  </div>
                  <button
                    onClick={() => onGoToTriage(p.id)}
                    className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Triage
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appointmentQueue.length === 0 && walkIns.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">Queue is clear</h3>
          <p className="text-slate-400 text-sm mt-1">
            {filterDate === 'today' ? 'No appointments scheduled for today.' : 'No appointments found.'}
          </p>
        </div>
      )}
    </div>
  );
}
