import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, X } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { EthiopianDatePicker } from '../components/EthiopianDatePicker';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { calcAge, formatDisplayDate } from '../lib/formatters';
import { buildAppointmentTime } from '../lib/encounterDefaults';
import type { Appointment, Patient } from '../store/useAppStore';

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

function addMinutes(t: string, mins: number): string {
  const [h, m] = t.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointments = useAppStore((s) => s.appointments);
  const patients = useAppStore((s) => s.patients);
  const fetchPatients = useAppStore((s) => s.fetchPatients);
  const fetchAppointments = useAppStore((s) => s.fetchAppointments);
  const getPatientById = useAppStore((s) => s.getPatientById);
  const getAppointmentsForRange = useAppStore((s) => s.getAppointmentsForRange);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const startExam = useEncounterStore((s) => s.startExam);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [view, setView] = useState<CalendarView>('week');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [showBookModal, setShowBookModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const preselectedPatientId = searchParams.get('patientId') || '';

  const [bookForm, setBookForm] = useState({
    patientId: preselectedPatientId,
    date: '',
    startTime: '10:00',
    reason: 'Routine Eye Examination',
  });

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, [fetchPatients, fetchAppointments]);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      setBookForm((f) => ({
        ...f,
        patientId: preselectedPatientId,
        date: weekStart.toISOString().split('T')[0],
      }));
      setShowBookModal(true);
    }
  }, [preselectedPatientId, patients.length]);

  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleAppointments = useMemo(
    () => getAppointmentsForRange(weekStart, weekEnd),
    [appointments, weekStart, weekEnd, getAppointmentsForRange],
  );

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

  const handleStartTest = async () => {
    if (!selectedApt) return;
    const patient = getPatientById(selectedApt.patientId);
    if (!patient) return;

    updateAppointment(selectedApt.id, { consentObtained: consentChecked, status: 'in_exam' });

    try {
      const { api } = await import('../lib/api');
      const encounter = await api.post<any>('/clinical/encounter', {
        patientId: patient.id,
        appointmentId: selectedApt.id,
        reasonForVisit: { selectedReason: selectedApt.reason || '', remarks: '', showInDischarge: false },
      });

      startExam({
        encounterId: encounter.id,
        appointmentId: selectedApt.id,
        consentObtained: consentChecked,
        reasonForVisit: selectedApt.reason || '',
        patient: {
          id: patient.id,
          mrn: patient.mrn || patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
          age: calcAge(patient.dateOfBirth),
          gender: patient.gender || '',
          appointmentTime: buildAppointmentTime(selectedApt.date, selectedApt.startTime),
          reasonForVisit: selectedApt.reason || '',
        },
      });

      setSelectedApt(null);
      navigate(`/exam/${encounter.id}`);
    } catch {
      setSelectedApt(null);
    }
  };

  const handleReschedule = () => {
    if (!selectedApt) return;
    setBookForm({
      patientId: selectedApt.patientId,
      date: selectedApt.date,
      startTime: selectedApt.startTime,
      reason: selectedApt.reason,
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

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.patientId || !bookForm.date) return;
    try {
      await addAppointment({
        patientId: bookForm.patientId,
        date: bookForm.date,
        startTime: bookForm.startTime,
        reason: bookForm.reason,
        consentObtained: false,
      });
      setShowBookModal(false);
      showToast('Appointment booked.');
    } catch {
      showToast('Failed to book appointment.');
    }
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
                  const end = parseTime(addMinutes(apt.startTime, 30));
                  const top = (start - HOURS[0]) * HOUR_HEIGHT;
                  const height = Math.max((end - start) * HOUR_HEIGHT, 28);
                  const patient = getPatientById(apt.patientId);
                  const name = patient ? `${patient.firstName} ${patient.lastName}`.toUpperCase() : 'Unknown';
                  const isFollowUp = apt.reason.toLowerCase().includes('follow');
                  const colorClass = isFollowUp
                    ? 'bg-[#2563eb] text-white'
                    : apt.status === 'completed'
                      ? 'bg-slate-100 border border-slate-300 text-slate-500'
                      : apt.status === 'cancelled'
                        ? 'bg-slate-50 border border-slate-200 text-slate-400 line-through'
                        : 'bg-emerald-100 border border-emerald-300 text-emerald-900';
                  return (
                    <button
                      key={apt.id}
                      onClick={(e) => handleAptClick(apt, e)}
                      className={`absolute left-1 right-1 rounded px-2 py-1 text-left text-xs overflow-hidden cursor-pointer transition-opacity hover:opacity-90 z-20 ${colorClass}`}
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

          <button
            onClick={() => { setBookForm({ patientId: preselectedPatientId || '', date: weekStart.toISOString().split('T')[0], startTime: '10:00', reason: 'Routine Eye Examination' }); setShowBookModal(true); }}
            className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md"
          >
            Book appointment
          </button>
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
                const isDone = apt.status === 'completed' || apt.status === 'cancelled';
                return (
                  <button key={apt.id} onClick={(e) => handleAptClick(apt, e)} className={`block w-full max-w-md mx-auto p-3 rounded-md text-left hover:bg-slate-50 transition-colors ${isDone ? 'bg-slate-100 border border-slate-200 text-slate-500' : 'bg-emerald-50 border border-emerald-200'}`}>
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
            <form onSubmit={handleBook} className="space-y-3">
              <select
                required
                value={bookForm.patientId}
                onChange={(e) => setBookForm({ ...bookForm, patientId: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date (Ethiopian)</label>
                <EthiopianDatePicker
                  value={bookForm.date}
                  onChange={(d) => setBookForm({ ...bookForm, date: d })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Time (EAT, 24h)</label>
                <input required type="time" step="60" value={bookForm.startTime} onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" />
              </div>
              <input required placeholder="Reason for visit" value={bookForm.reason} onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2.5 bg-[#2563eb] text-white rounded-md text-sm font-medium">Confirm booking</button>
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
