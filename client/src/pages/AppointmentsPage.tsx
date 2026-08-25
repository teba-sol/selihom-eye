import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { DOCTORS, calcAge, formatDisplayDate } from '../data/mockData';
import { buildAppointmentTime } from '../lib/encounterDefaults';
import type { Appointment, Patient } from '../data/mockData';

// ── Ethiopian calendar helpers ───────────────────────────────────────────────
const ETHIOPIC_JDN_OFFSET = 1724220;
function _gregToJDN(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function gregToEthiopian(y: number, m: number, d: number) {
  const jdn = _gregToJDN(y, m, d);
  const r0 = jdn - ETHIOPIC_JDN_OFFSET - 1;
  const ci = Math.floor(r0 / 1461), rc = r0 - ci * 1461;
  let yo = 0, diy = rc;
  if (rc >= 365 && rc < 730) { yo = 1; diy = rc - 365; }
  else if (rc >= 730 && rc < 1096) { yo = 2; diy = rc - 730; }
  else if (rc >= 1096) { yo = 3; diy = rc - 1096; }
  return { year: ci * 4 + yo + 1, month: Math.floor(diy / 30) + 1, day: (diy % 30) + 1 };
}
function ethiopianToGregorian(ey: number, em: number, ed: number) {
  const jdn = ed + (em - 1) * 30 + (ey - 1) * 365 + Math.floor(ey / 4) + ETHIOPIC_JDN_OFFSET;
  const a = jdn + 32044, b = Math.floor((4*a+3)/146097), c = a - Math.floor(146097*b/4);
  const dd = Math.floor((4*c+3)/1461), ee = c - Math.floor(1461*dd/4);
  const mm = Math.floor((5*ee+2)/153);
  return {
    day: ee - Math.floor((153*mm+2)/5) + 1,
    month: mm + 3 - 12 * Math.floor(mm/10),
    year: 100*b + dd - 4800 + Math.floor(mm/10),
  };
}
const ETH_MONTHS = ['Meskerem','Tikimt','Hidar','Tahsas','Tir','Yekatit','Megabit','Miazia','Ginbot','Sene','Hamle','Nehase','Pagume'];
function formatEthDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const eth = gregToEthiopian(y, m, d);
  return `${String(eth.day).padStart(2,'0')} ${ETH_MONTHS[eth.month - 1] ?? ''} ${eth.year}`;
}
function formatEthTime(time24: string): string {
  if (!time24) return '';
  const [hh, mm] = time24.split(':').map(Number);
  // Ethiopian time offset: Ethiopian time = clock time - 6 (wraps at 12)
  const ethH = ((hh - 6 + 12) % 12) || 12;
  const ampm = hh < 6 || hh >= 18 ? 'Lelit' : 'Gena';
  return `${ethH}:${String(mm).padStart(2,'0')} (${ampm})`;
}
// ─────────────────────────────────────────────────────────────────────────────

type CalendarView = 'day' | 'week' | 'month';

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_HEIGHT = 64;

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = start.toLocaleDateString('en-US', opts);
  const e = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

function timeToLabel(h: number): string {
  if (h === 12) return '12pm';
  if (h > 12) return `${h - 12}pm`;
  return `${h}am`;
}

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const appointments = useAppStore((s) => s.appointments);
  const patients = useAppStore((s) => s.patients);
  const getPatientById = useAppStore((s) => s.getPatientById);
  const getAppointmentsForRange = useAppStore((s) => s.getAppointmentsForRange);
  const selectedDoctorId = useAppStore((s) => s.selectedDoctorId);
  const setSelectedDoctor = useAppStore((s) => s.setSelectedDoctor);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const loadFromAppointment = useEncounterStore((s) => s.loadFromAppointment);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [view, setView] = useState<CalendarView>('week');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [bookForm, setBookForm] = useState({
    patientId: '',
    patientSearch: '',
    ethDay: '',
    ethMonth: '',
    ethYear: '',
    startHour: '10',
    startMin: '00',
    startAmPm: 'AM' as 'AM' | 'PM',
    endHour: '10',
    endMin: '30',
    endAmPm: 'AM' as 'AM' | 'PM',
    appointmentType: 'Routine Eye Examination',
    reason: 'Routine Eye Examination',
    date: '',
  });

  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleAppointments = useMemo(
    () => getAppointmentsForRange(weekStart, weekEnd, selectedDoctorId),
    [appointments, weekStart, weekEnd, selectedDoctorId, getAppointmentsForRange],
  );

  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const goToday = () => setWeekStart(getMonday(new Date()));
  const goPrev = () => setWeekStart((w) => addDays(w, view === 'month' ? -28 : view === 'day' ? -1 : -7));
  const goNext = () => setWeekStart((w) => addDays(w, view === 'month' ? 28 : view === 'day' ? 1 : 7));

  const handleAptClick = (apt: Appointment, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({ top: rect.top - 20, left: rect.left + rect.width + 8 });
    setSelectedApt(apt);
    setConsentChecked(apt.consentObtained);
  };

  const handleStartTest = () => {
    if (!selectedApt) return;
    const patient = getPatientById(selectedApt.patientId);
    if (!patient) return;

    updateAppointment(selectedApt.id, { consentObtained: consentChecked, status: 'in_exam' });

    loadFromAppointment({
      appointmentId: selectedApt.id,
      consentObtained: consentChecked,
      reasonForVisit: selectedApt.reason,
      patient: {
        id: patient.id,
        mrn: patient.mrn ?? `SEL-${patient.id}`,
        name: `${patient.firstName} ${patient.lastName}`,
        age: calcAge(patient.dateOfBirth),
        gender: patient.gender,
        appointmentTime: buildAppointmentTime(selectedApt.date, selectedApt.startTime),
        reasonForVisit: selectedApt.reason,
      },
    });

    setSelectedApt(null);
    navigate(`/exam/${selectedApt.id}`);
  };

  const handleReschedule = () => {
    if (!selectedApt) return;
    const [y, m, d] = selectedApt.date.split('-').map(Number);
    const eth = gregToEthiopian(y, m, d);
    const sh = parseInt(selectedApt.startTime.split(':')[0], 10);
    const sm = selectedApt.startTime.split(':')[1];
    const eh = parseInt(selectedApt.endTime.split(':')[0], 10);
    const em = selectedApt.endTime.split(':')[1];
    setBookForm({
      patientId: selectedApt.patientId,
      patientSearch: '',
      ethDay: String(eth.day).padStart(2, '0'),
      ethMonth: String(eth.month).padStart(2, '0'),
      ethYear: String(eth.year),
      startHour: String(sh > 12 ? sh - 12 : sh || 12),
      startMin: sm,
      startAmPm: sh >= 12 ? 'PM' : 'AM',
      endHour: String(eh > 12 ? eh - 12 : eh || 12),
      endMin: em,
      endAmPm: eh >= 12 ? 'PM' : 'AM',
      appointmentType: selectedApt.reason,
      reason: selectedApt.reason,
      date: selectedApt.date,
    });
    setShowBookModal(true);
    setSelectedApt(null);
  };

  const handleCancelBooking = () => {
    if (!selectedApt) return;
    if (window.confirm('Cancel this booking?')) {
      cancelAppointment(selectedApt.id);
      setSelectedApt(null);
      showToast('Appointment cancelled.');
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.patientId) return;
    const ed = parseInt(bookForm.ethDay, 10);
    const em = parseInt(bookForm.ethMonth, 10);
    const ey = parseInt(bookForm.ethYear, 10);
    if (!ed || !em || !ey) return;
    const greg = ethiopianToGregorian(ey, em, ed);
    const isoDate = `${greg.year}-${String(greg.month).padStart(2,'0')}-${String(greg.day).padStart(2,'0')}`;
    // Convert AM/PM to 24h
    const to24 = (h: string, ampm: 'AM'|'PM') => {
      let hh = parseInt(h, 10) % 12;
      if (ampm === 'PM') hh += 12;
      return String(hh).padStart(2,'0');
    };
    const startTime = `${to24(bookForm.startHour, bookForm.startAmPm)}:${bookForm.startMin.padStart(2,'0')}`;
    const endTime = `${to24(bookForm.endHour, bookForm.endAmPm)}:${bookForm.endMin.padStart(2,'0')}`;
    addAppointment({
      patientId: bookForm.patientId,
      date: isoDate,
      startTime,
      endTime,
      reason: bookForm.reason || bookForm.appointmentType,
      consentObtained: false,
      doctorId: selectedDoctorId ?? 'doc-1',
    });
    setShowBookModal(false);
    showToast('Appointment booked.');
  };

  const renderWeekGrid = () => {
    const gridHeight = HOURS.length * HOUR_HEIGHT;

    return (
      <div className="flex-1 overflow-auto border border-slate-200 bg-white rounded-md relative">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-10 bg-white border-b border-slate-200">
          <div />
          {weekDays.map((day) => {
            const isToday = day.getTime() === today.getTime();
            const isSunday = day.getDay() === 0;
            return (
              <div
                key={day.toISOString()}
                className={`text-center py-2 text-sm font-medium border-l border-slate-200 ${
                  isToday || isSunday ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {day.getDate()} {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="relative" style={{ height: gridHeight }}>
            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-0 text-xs text-slate-500 pr-2 text-right border-b border-slate-100"
                style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT, lineHeight: `${HOUR_HEIGHT}px` }}
              >
                {timeToLabel(hour)}
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayApts = visibleAppointments.filter((a) => a.date === dateStr);

            return (
              <div key={dateStr} className="relative border-l border-slate-200" style={{ height: gridHeight }}>
                {HOURS.map((hour, i) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-slate-100"
                    style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}

                {dayApts.map((apt) => {
                  const start = parseTime(apt.startTime);
                  const end = parseTime(apt.endTime);
                  const top = (start - HOURS[0]) * HOUR_HEIGHT;
                  const height = Math.max((end - start) * HOUR_HEIGHT, 28);
                  const patient = getPatientById(apt.patientId);
                  const name = patient ? `${patient.firstName} ${patient.lastName}`.toUpperCase() : 'Unknown';
                  const isFollowUp = apt.reason.toLowerCase().includes('follow');
                  return (
                    <button
                      key={apt.id}
                      onClick={(e) => handleAptClick(apt, e)}
                      className={`absolute left-1 right-1 rounded px-2 py-1 text-left text-xs overflow-hidden cursor-pointer transition-opacity hover:opacity-90 z-20 ${
                        isFollowUp
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                      }`}
                      style={{ top, height }}
                    >
                      <div className="flex items-center gap-1 font-semibold truncate">
                        {apt.consentObtained && !isFollowUp && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate">{name.slice(0, 12)}</span>
                        <span className="ml-auto shrink-0">{apt.startTime}</span>
                      </div>
                      <div className="truncate opacity-80 text-[10px]">{apt.reason}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const selectedPatient: Patient | undefined = selectedApt
    ? getPatientById(selectedApt.patientId)
    : undefined;

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#2563eb]" />
            <h1 className="text-2xl font-semibold text-[#2563eb]">Appointments</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                onKeyDown={(e) => e.key === 'Enter' && setShowDoctorDropdown(!showDoctorDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm min-w-[180px] cursor-pointer"
              >
                <span className="flex-1 text-left">{selectedDoctor?.name ?? 'All doctors'}</span>
                {selectedDoctorId && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setSelectedDoctor(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setSelectedDoctor(null); } }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              {showDoctorDropdown && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-md shadow-lg z-40 min-w-[180px]">
                  {DOCTORS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDoctor(d.id); setShowDoctorDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const today = new Date();
                const eth = gregToEthiopian(today.getFullYear(), today.getMonth()+1, today.getDate());
                setBookForm({ patientId: '', patientSearch: '', ethDay: String(eth.day).padStart(2,'0'), ethMonth: String(eth.month).padStart(2,'0'), ethYear: String(eth.year), startHour: '10', startMin: '00', startAmPm: 'AM', endHour: '10', endMin: '30', endAmPm: 'AM', appointmentType: 'Routine Eye Examination', reason: 'Routine Eye Examination', date: '' });
                setShowBookModal(true);
              }}
              className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md"
            >
              Book appointment
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="px-3 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-white bg-white">‹</button>
            <button onClick={goToday} className="px-4 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-white bg-white font-medium">Today</button>
            <button onClick={goNext} className="px-3 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-white bg-white">›</button>
            <span className="ml-3 text-sm font-medium text-slate-700">{formatWeekRange(weekStart)}</span>
          </div>

          <div className="flex rounded-md overflow-hidden border border-slate-300">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm capitalize ${
                  view === v ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'week' && renderWeekGrid()}

        {view === 'day' && (
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-slate-500 text-sm">
            Day view — showing appointments for {weekStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <div className="mt-4 space-y-2">
              {visibleAppointments.filter((a) => a.date === weekStart.toISOString().split('T')[0]).map((apt) => {
                const p = getPatientById(apt.patientId);
                return (
                  <button key={apt.id} onClick={(e) => handleAptClick(apt, e)} className="block w-full max-w-md mx-auto p-3 bg-emerald-50 border border-emerald-200 rounded-md text-left hover:bg-emerald-100">
                    <span className="font-medium">{p?.firstName} {p?.lastName}</span> — {apt.startTime} — {apt.reason}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <div className="grid grid-cols-7 gap-1">
              {weekDays.concat(Array.from({ length: 21 }, (_, i) => addDays(weekStart, 7 + i))).slice(0, 28).map((day) => {
                const dateStr = day.toISOString().split('T')[0];
                const count = visibleAppointments.filter((a) => a.date === dateStr).length;
                return (
                  <button
                    key={dateStr}
                    onClick={() => { setWeekStart(getMonday(day)); setView('day'); }}
                    className={`p-2 min-h-[80px] border border-slate-100 rounded text-left hover:bg-slate-50 ${
                      day.getTime() === today.getTime() ? 'bg-emerald-50 border-emerald-200' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-700">{day.getDate()}</div>
                    {count > 0 && (
                      <div className="mt-1 text-[10px] text-emerald-700 font-medium">{count} apt{count > 1 ? 's' : ''}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedApt && selectedPatient && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedApt(null)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-200 w-[320px] p-5"
            style={{ top: Math.min(popoverPos.top, window.innerHeight - 400), left: Math.min(popoverPos.left, window.innerWidth - 340) }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-[#2563eb]">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
              <button onClick={() => setSelectedApt(null)} className="text-sm text-slate-500 hover:text-slate-800">
                Close
              </button>
            </div>

            <div className="space-y-1 text-sm text-slate-600 mb-4">
              <p>Phone: {selectedPatient.phone}</p>
              {selectedPatient.lastVisit && (
                <p>Last visit: {formatDisplayDate(selectedPatient.lastVisit)}</p>
              )}
            </div>

            <div className="space-y-1 text-sm text-slate-700 mb-4 pb-4 border-b border-slate-100">
              <p><span className="text-slate-500">Appointment Date:</span> {formatDisplayDate(selectedApt.date)}</p>
              <p><span className="text-slate-500">Appointment Time:</span> {selectedApt.startTime}</p>
              <p><span className="text-slate-500">Reason for visit:</span> {selectedApt.reason}</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="rounded text-blue-600"
              />
              Patient has given consent to take test
            </label>

            <div className="space-y-2">
              <button
                onClick={handleStartTest}
                disabled={!consentChecked}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
              >
                Start test
              </button>
              <button
                onClick={handleReschedule}
                className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md"
              >
                Reschedule
              </button>
              <button
                onClick={handleCancelBooking}
                className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md"
              >
                Cancel booking
              </button>
            </div>
          </div>
        </>
      )}

      {showBookModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <button onClick={() => setShowBookModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">

              {/* Patient search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Patient</label>
                <input
                  type="text"
                  placeholder="Search by name or MRN…"
                  value={bookForm.patientSearch}
                  onChange={(e) => setBookForm({ ...bookForm, patientSearch: e.target.value, patientId: '' })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-1.5"
                />
                {bookForm.patientSearch.trim() && (
                  <div className="border border-slate-200 rounded max-h-36 overflow-y-auto bg-white shadow-sm">
                    {patients
                      .filter(p => {
                        const q = bookForm.patientSearch.toLowerCase();
                        return p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || (p.mrn ?? '').toLowerCase().includes(q);
                      })
                      .slice(0, 8)
                      .map(p => (
                        <button
                          key={p.id} type="button"
                          onClick={() => setBookForm({ ...bookForm, patientId: p.id, patientSearch: `${p.firstName} ${p.lastName} (${p.mrn ?? p.id})` })}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 transition-colors ${bookForm.patientId === p.id ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-700'}`}
                        >
                          <span className="font-medium">{p.firstName} {p.lastName}</span>
                          <span className="text-xs text-slate-400 ml-2">{p.mrn ?? p.id}</span>
                        </button>
                      ))}
                    {patients.filter(p => { const q = bookForm.patientSearch.toLowerCase(); return p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || (p.mrn ?? '').toLowerCase().includes(q); }).length === 0 && (
                      <p className="px-3 py-2 text-xs text-slate-400 italic">No patients found</p>
                    )}
                  </div>
                )}
                {bookForm.patientId && !bookForm.patientSearch.includes('(') && (
                  <p className="text-xs text-teal-700 mt-0.5">✓ Patient selected</p>
                )}
                {!bookForm.patientId && !bookForm.patientSearch && (
                  <select
                    required={!bookForm.patientId}
                    value={bookForm.patientId}
                    onChange={(e) => {
                      const p = patients.find(p => p.id === e.target.value);
                      setBookForm({ ...bookForm, patientId: e.target.value, patientSearch: p ? `${p.firstName} ${p.lastName} (${p.mrn ?? p.id})` : '' });
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="">— or select from list —</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.mrn ?? p.id}</option>)}
                  </select>
                )}
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Appointment Type</label>
                <select
                  value={bookForm.appointmentType}
                  onChange={(e) => setBookForm({ ...bookForm, appointmentType: e.target.value, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                >
                  <option>Routine Eye Examination</option>
                  <option>Follow-up Visit</option>
                  <option>Post-Operative Check</option>
                  <option>Pre-Operative Assessment</option>
                  <option>Emergency / Urgent Care</option>
                  <option>Contact Lens Fitting</option>
                  <option>Glasses Prescription Review</option>
                  <option>Diabetic Eye Screening</option>
                  <option>Paediatric Eye Exam</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Ethiopian Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  🇪🇹 Date (DD / MM / YYYY — Ethiopian Calendar)
                </label>
                <div className="flex items-center gap-1 border border-slate-300 rounded px-3 py-2 bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-200">
                  <input type="text" inputMode="numeric" maxLength={2} placeholder="DD" required
                    value={bookForm.ethDay}
                    onChange={(e) => setBookForm({ ...bookForm, ethDay: e.target.value.replace(/\D/g,'').slice(0,2) })}
                    className="w-10 text-center text-sm font-bold border-none outline-none bg-transparent"
                  />
                  <span className="text-teal-600 font-bold">/</span>
                  <input type="text" inputMode="numeric" maxLength={2} placeholder="MM" required
                    value={bookForm.ethMonth}
                    onChange={(e) => setBookForm({ ...bookForm, ethMonth: e.target.value.replace(/\D/g,'').slice(0,2) })}
                    className="w-10 text-center text-sm font-bold border-none outline-none bg-transparent"
                  />
                  <span className="text-teal-600 font-bold">/</span>
                  <input type="text" inputMode="numeric" maxLength={4} placeholder="YYYY" required
                    value={bookForm.ethYear}
                    onChange={(e) => setBookForm({ ...bookForm, ethYear: e.target.value.replace(/\D/g,'').slice(0,4) })}
                    className="w-16 text-center text-sm font-bold border-none outline-none bg-transparent"
                  />
                </div>
                {bookForm.ethDay && bookForm.ethMonth && bookForm.ethYear.length === 4 && (
                  <p className="text-xs text-teal-700 mt-1 font-medium">
                    📅 {ETH_MONTHS[(parseInt(bookForm.ethMonth,10)-1)] ?? ''} {bookForm.ethDay}, {bookForm.ethYear} E.C.
                  </p>
                )}
              </div>

              {/* Start & End Time with AM/PM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Start Time</label>
                  <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-2 bg-white focus-within:border-teal-500">
                    <input type="text" inputMode="numeric" maxLength={2} placeholder="HH" required
                      value={bookForm.startHour}
                      onChange={(e) => setBookForm({ ...bookForm, startHour: e.target.value.replace(/\D/g,'').slice(0,2) })}
                      className="w-9 text-center text-sm font-bold border-none outline-none bg-transparent"
                    />
                    <span className="font-bold text-slate-400">:</span>
                    <input type="text" inputMode="numeric" maxLength={2} placeholder="MM" required
                      value={bookForm.startMin}
                      onChange={(e) => setBookForm({ ...bookForm, startMin: e.target.value.replace(/\D/g,'').slice(0,2) })}
                      className="w-9 text-center text-sm font-bold border-none outline-none bg-transparent"
                    />
                    <select value={bookForm.startAmPm} onChange={(e) => setBookForm({ ...bookForm, startAmPm: e.target.value as 'AM'|'PM' })}
                      className="ml-1 text-xs font-bold border border-slate-200 rounded px-1 py-0.5 bg-slate-50 outline-none cursor-pointer">
                      <option>AM</option><option>PM</option>
                    </select>
                  </div>
                  {bookForm.startHour && (
                    <p className="text-xs text-teal-700 mt-0.5">
                      🕐 {formatEthTime(`${(() => { let h = parseInt(bookForm.startHour,10)%12; if(bookForm.startAmPm==='PM') h+=12; return String(h).padStart(2,'0'); })()}:${bookForm.startMin.padStart(2,'0')}`)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">End Time</label>
                  <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-2 bg-white focus-within:border-teal-500">
                    <input type="text" inputMode="numeric" maxLength={2} placeholder="HH" required
                      value={bookForm.endHour}
                      onChange={(e) => setBookForm({ ...bookForm, endHour: e.target.value.replace(/\D/g,'').slice(0,2) })}
                      className="w-9 text-center text-sm font-bold border-none outline-none bg-transparent"
                    />
                    <span className="font-bold text-slate-400">:</span>
                    <input type="text" inputMode="numeric" maxLength={2} placeholder="MM" required
                      value={bookForm.endMin}
                      onChange={(e) => setBookForm({ ...bookForm, endMin: e.target.value.replace(/\D/g,'').slice(0,2) })}
                      className="w-9 text-center text-sm font-bold border-none outline-none bg-transparent"
                    />
                    <select value={bookForm.endAmPm} onChange={(e) => setBookForm({ ...bookForm, endAmPm: e.target.value as 'AM'|'PM' })}
                      className="ml-1 text-xs font-bold border border-slate-200 rounded px-1 py-0.5 bg-slate-50 outline-none cursor-pointer">
                      <option>AM</option><option>PM</option>
                    </select>
                  </div>
                  {bookForm.endHour && (
                    <p className="text-xs text-teal-700 mt-0.5">
                      🕐 {formatEthTime(`${(() => { let h = parseInt(bookForm.endHour,10)%12; if(bookForm.endAmPm==='PM') h+=12; return String(h).padStart(2,'0'); })()}:${bookForm.endMin.padStart(2,'0')}`)}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes / Reason override */}
              {bookForm.appointmentType === 'Other' && (
                <input required placeholder="Describe reason for visit"
                  value={bookForm.reason === 'Other' ? '' : bookForm.reason}
                  onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                />
              )}

              <button
                type="submit"
                disabled={!bookForm.patientId}
                className="w-full py-2.5 bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                Confirm booking
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
};
