import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, X, Loader2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { EthiopianDatePicker } from '../components/EthiopianDatePicker';
import { useAppStore } from '../store/useAppStore';
import { useEncounterStore } from '../store/useEncounterStore';
import { formatAge, formatEthiopianDate, ethiopianParts, todayLocalStr, nowLocalTime, formatTime12 } from '../lib/formatters';
import { useToast } from '../lib/toast';
import { buildAppointmentTime } from '../lib/encounterDefaults';
import type { Appointment, Patient } from '../store/useAppStore';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { DraftResumeModal } from '../components/DraftResumeModal';
import { api } from '../lib/api';

type CalendarView = 'day' | 'week' | 'month';

const HOUR_HEIGHT = 64;
const CANCEL_REASONS = [
  'Patient requested',
  'Patient unavailable',
  'Doctor unavailable',
  'Rescheduled',
  'Other',
];

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

import { gregorianToEthiopian } from '../lib/formatters';

const ETH_MONTHS_SHORT = [
  'Mes', 'Tik', 'Hid', 'Tah', 'Tir', 'Yek',
  'Meg', 'Mia', 'Gin', 'Sen', 'Ham', 'Neh', 'Pag',
];

function toEthDay(d: Date): string {
  const eth = gregorianToEthiopian(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return String(eth.day);
}

function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const s = ethiopianParts(start);
  const e = ethiopianParts(end);
  if (s.year === e.year && s.month === e.month) {
    return `${s.day} – ${e.day} ${e.monthName} ${e.year}`;
  }
  if (s.year === e.year) {
    return `${s.day} ${s.monthName} – ${e.day} ${e.monthName} ${e.year}`;
  }
  return `${s.day} ${s.monthName} ${s.year} – ${e.day} ${e.monthName} ${e.year}`;
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

// ── Cancel Dialog ──────────────────────────────────────────────────────

function CancelDialog({ appointment, patientName, onConfirm, onCancel }: {
  appointment: Appointment;
  patientName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [customText, setCustomText] = useState('');

  const handleConfirm = () => {
    const final = reason === 'Other' ? customText.trim() : reason;
    if (!final) return;
    onConfirm(final);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cancel appointment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {patientName} — {formatEthiopianDate(appointment.date)} at {formatTime12(appointment.startTime)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Reason for cancellation *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
          >
            <option value="">Select reason…</option>
            {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {reason === 'Other' && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Specify reason *</label>
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter reason…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
            Keep appointment
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || (reason === 'Other' && !customText.trim())}
            className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40"
          >
            Confirm cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Appointment Detail Popup ───────────────────────────────────────────

function AppointmentDetailModal({ apt, patient, onClose, onStartExam, onOpenExam, onCancel }: {
  apt: Appointment;
  patient: Patient | undefined;
  onClose: () => void;
  onStartExam?: () => void;
  onOpenExam?: () => void;
  onCancel?: () => void;
}) {
  const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient';
  const initials = patient ? `${patient.firstName[0]}${patient.lastName[0]}` : '?';
  const statusPill: Record<Appointment['status'], string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_exam: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };
  const statusText: Record<Appointment['status'], string> = {
    scheduled: 'Scheduled',
    in_exam: 'In Exam',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const rows: { label: string; value: string }[] = [
    { label: 'MRN', value: patient?.mrn ?? '—' },
    { label: 'Age', value: patient ? formatAge(patient.dateOfBirth) : '—' },
    { label: 'Gender', value: patient?.gender ?? '—' },
    { label: 'Phone', value: patient?.phone || '—' },
    { label: 'Date', value: formatEthiopianDate(apt.date) },
    { label: 'Time', value: formatTime12(apt.startTime) },
    { label: 'Reason', value: apt.reason || '—' },
    ...(apt.notes ? [{ label: 'Notes', value: apt.notes }] : []),
    ...(apt.cancelledReason ? [{ label: 'Cancelled', value: apt.cancelledReason }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusPill[apt.status]}`}>
            {statusText[apt.status]}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Patient */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#0F2038] truncate">{name}</p>
              <p className="text-xs text-slate-500">Mrn: {patient?.mrn ?? '—'}</p>
            </div>
          </div>

          {/* Appointment details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {rows.map((r) => (
              <div key={r.label} className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{r.label}</p>
                <p className="text-sm text-slate-700 truncate">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          {apt.status === 'scheduled' && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Cancel appointment
              </button>
              <button
                onClick={onStartExam}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                Start examination
              </button>
            </>
          )}
          {apt.status === 'in_exam' && (
            <button
              onClick={onOpenExam}
              className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
            >
              Continue examination
            </button>
          )}
          {apt.status === 'completed' && (
            <button
              onClick={onOpenExam}
              className="px-4 py-2 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-colors"
            >
              View examination
            </button>
          )}
          {apt.status === 'cancelled' && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointments = useAppStore((s) => s.appointments);
  const patients = useAppStore((s) => s.patients);
  const patientsLoaded = useAppStore((s) => s.patientsLoaded);
  const appointmentsLoaded = useAppStore((s) => s.appointmentsLoaded);
  const fetchPatients = useAppStore((s) => s.fetchPatients);
  const fetchAppointments = useAppStore((s) => s.fetchAppointments);
  const getPatientById = useAppStore((s) => s.getPatientById);
  const getAppointmentsForRange = useAppStore((s) => s.getAppointmentsForRange);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const startExam = useEncounterStore((s) => s.startExam);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [loading, setLoading] = useState(() => !(patientsLoaded && appointmentsLoaded));
  const toast = useToast();

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState<Appointment | null>(null);
  const [infoApt, setInfoApt] = useState<Appointment | null>(null);
  const [starting, setStarting] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<{
    patient: Patient;
    encounter: Record<string, any>;
    appointmentId: string;
    appointmentTime: string;
    reason: string;
  } | null>(null);

  const preselectedPatientId = searchParams.get('patientId') || '';

  const [bookForm, setBookForm] = useState({
    patientId: preselectedPatientId,
    date: '',
    startTime: '10:00',
    reason: 'Routine Eye Examination',
    notes: '',
  });

  useEffect(() => {
    let active = true;
    if (!(patientsLoaded && appointmentsLoaded)) setLoading(true);
    Promise.all([fetchPatients(), fetchAppointments()]).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [fetchPatients, fetchAppointments, patientsLoaded, appointmentsLoaded]);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      setBookForm((f) => ({ ...f, patientId: preselectedPatientId, date: todayLocalStr() }));
      setShowBookModal(true);
    }
  }, [preselectedPatientId, patients.length]);

  // ── Start Exam ───────────────────────────────────────────────────────
  const handleStartExam = useCallback(async (apt: Appointment) => {
    const patient = getPatientById(apt.patientId);
    if (!patient) return;

    setStarting(true);
    try {
      // Check for existing draft encounter for this patient
      const history = await api.get<any[]>(`/clinical/patient/${patient.id}/history`);
      const draft = (history ?? []).find((h: any) => !h.isLocked && h.appointmentStatus !== 'COMPLETED');
      if (draft) {
        // Fetch the full encounter to pass to DraftResumeModal
        const encounter = await api.get<any>(`/clinical/encounter/${draft.id}`);
        if (encounter) {
          const appointmentTime = buildAppointmentTime(apt.date, apt.startTime);
          setResumeDraft({
            patient,
            encounter,
            appointmentId: apt.id,
            appointmentTime,
            reason: apt.reason || '',
          });
          return;
        }
      }

      // Create new encounter
      const encounter = await api.post<any>(
        '/clinical/encounter',
        {
          patientId: patient.id,
          appointmentId: apt.id,
          reasonForVisit: { selectedReason: apt.reason || '', remarks: '', showInDischarge: true },
        },
        { toast: false },
      );

      toast.success('Examination started.');
      startExam({
        encounterId: encounter.id,
        appointmentId: apt.id,
        consentObtained: false,
        reasonForVisit: apt.reason || '',
        patient: {
          id: patient.id,
          mrn: patient.mrn || patient.id,
          name: `${patient.firstName} ${patient.lastName}`,
          age: formatAge(patient.dateOfBirth),
          gender: patient.gender || '',
          appointmentTime: buildAppointmentTime(apt.date, apt.startTime),
          reasonForVisit: apt.reason || '',
        },
      });

      updateAppointment(apt.id, { status: 'in_exam' });
      navigate(`/exam/${encounter.id}`);
    } catch (e: any) {
      if (e?.code === 'DRAFT_EXISTS' || e?.payload?.code === 'DRAFT_EXISTS') {
        const draftId = e?.payload?.draftEncounterId ?? e?.draftEncounterId;
        try {
          const encounter = draftId ? await api.get<any>(`/clinical/encounter/${draftId}`) : null;
          if (encounter) {
            setResumeDraft({
              patient,
              encounter,
              appointmentId: apt.id,
              appointmentTime: buildAppointmentTime(apt.date, apt.startTime),
              reason: apt.reason || '',
            });
            return;
          }
        } catch {
          // fall through to toast if the draft can't be fetched
        }
        toast.error('Patient has an exam in progress. Finalize or delete it first.');
      } else {
        toast.error('Failed to start examination.');
      }
    } finally {
      setStarting(false);
    }
  }, [getPatientById, startExam, updateAppointment, navigate, toast]);

  // ── Cancel ───────────────────────────────────────────────────────────
  const openAppointmentExam = useCallback(async (apt: Appointment) => {
    if (apt.sourceEncounterId) {
      navigate(`/exam/${apt.sourceEncounterId}`);
      return;
    }
    // Fallback for appointments whose encounter link was never populated:
    // look up the encounter via the patient's exam history.
    try {
      const history = await api.get<any[]>(`/clinical/patient/${apt.patientId}/history`);
      const match = (history ?? []).find((h: any) => h.appointmentId === apt.id);
      if (match) {
        navigate(`/exam/${match.id}`);
        return;
      }
    } catch {
      // ignore network errors; fall through to toast
    }
    toast.error('Examination record not found for this appointment.');
  }, [navigate, toast]);
  const handleCancelConfirm = useCallback(async (reason: string) => {
    if (!showCancelDialog) return;
    await cancelAppointment(showCancelDialog.id, reason);
    toast.success('Appointment cancelled.');
    setShowCancelDialog(null);
  }, [showCancelDialog, cancelAppointment, toast]);

  // ── Book ─────────────────────────────────────────────────────────────
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.patientId || !bookForm.date || !bookForm.reason) return;

    // No past dates/times (local timezone)
    if (bookForm.date < todayLocalStr()) {
      toast.error('Cannot book an appointment in the past. Please choose today or a future date.');
      return;
    }
    if (bookForm.date === todayLocalStr() && bookForm.startTime && bookForm.startTime <= nowLocalTime()) {
      toast.error(
        `Cannot book an appointment in the past. Current time is ${formatTime12(nowLocalTime())}. Adjust your time please!`,
      );
      return;
    }

    try {
      await addAppointment({
        patientId: bookForm.patientId,
        date: bookForm.date,
        startTime: bookForm.startTime,
        reason: bookForm.reason,
        notes: bookForm.notes || undefined,
      });
      setShowBookModal(false);
      setBookForm({ patientId: '', date: '', startTime: '10:00', reason: 'Routine Eye Examination', notes: '' });
      toast.success('Appointment booked.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to book appointment.');
    }
  };

  // ── Calendar helpers ─────────────────────────────────────────────────
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const goToday = () => setWeekStart(getMonday(new Date()));
  const goPrev = () => setWeekStart((w) => addDays(w, calendarView === 'month' ? -28 : calendarView === 'day' ? -1 : -7));
  const goNext = () => setWeekStart((w) => addDays(w, calendarView === 'month' ? 28 : calendarView === 'day' ? 1 : 7));

  const visibleCalendarApts = useMemo(
    () => getAppointmentsForRange(weekStart, weekEnd),
    [appointments, weekStart, weekEnd, getAppointmentsForRange],
  );

  const aptHours = visibleCalendarApts.map((a) => parseTime(a.startTime));
  const hourRange = (() => {
    const first = aptHours.length ? Math.floor(Math.min(...aptHours)) - 1 : 10;
    const last = aptHours.length ? Math.ceil(Math.max(...aptHours)) + 1 : 17;
    const start = Math.max(0, Math.min(first, 10));
    const end = Math.min(23, Math.max(last, 17));
    const hours: number[] = [];
    for (let h = start; h <= end; h++) hours.push(h);
    return hours;
  })();

  const gridHeight = hourRange.length * HOUR_HEIGHT;
  const weekGrid = (
    <div className="flex-1 overflow-auto border border-slate-200 bg-white rounded-md relative">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-10 bg-white border-b border-slate-200">
        <div />
        {weekDays.map((day) => {
          const isTodayFlag = day.getTime() === today.getTime();
          return (
            <div
              key={day.toISOString()}
              className={`text-center py-2 text-sm font-medium border-l border-slate-200 ${
                isTodayFlag ? 'bg-[#2563eb] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {ethiopianParts(day).day} {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        <div className="relative" style={{ height: gridHeight }}>
          {hourRange.map((hour, i) => (
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
          const dayApts = visibleCalendarApts.filter((a) => a.date === dateStr);
          return (
            <div key={dateStr} className="relative border-l border-slate-200" style={{ height: gridHeight }}>
              {hourRange.map((hour, i) => (
                <div key={hour} className="absolute left-0 right-0 border-b border-slate-100" style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }} />
              ))}
              {dayApts.map((apt) => {
                const start = parseTime(apt.startTime);
                const end = parseTime(addMinutes(apt.startTime, 30));
                const top = (start - hourRange[0]) * HOUR_HEIGHT;
                const height = Math.max((end - start) * HOUR_HEIGHT, 28);
                const patient = getPatientById(apt.patientId);
                const name = patient ? `${patient.firstName} ${patient.lastName}`.toUpperCase() : 'Unknown';
                const colorClass = apt.status === 'completed'
                  ? 'bg-slate-100 border border-slate-300 text-slate-500'
                  : apt.status === 'cancelled'
                    ? 'bg-slate-50 border border-slate-200 text-slate-400 line-through'
                    : apt.status === 'in_exam'
                      ? 'bg-purple-100 border border-purple-300 text-purple-900'
                      : 'bg-emerald-100 border border-emerald-300 text-emerald-900';
                return (
                  <div
                    key={apt.id}
                    className={`absolute left-1 right-1 rounded px-2 py-1 text-left text-xs overflow-hidden cursor-pointer transition-opacity hover:opacity-90 z-20 group ${colorClass}`}
                    style={{ top, height }}
                  >
                    <button
                      onClick={() => setInfoApt(apt)}
                      className="block w-full h-full text-left"
                    >
                      <div className="flex items-center gap-1 font-semibold truncate">
                        <span className="truncate">{name.slice(0, 12)}</span>
                        <span className="ml-auto shrink-0">{formatTime12(apt.startTime)}</span>
                      </div>
                      <div className="truncate opacity-80 text-[10px]">{apt.reason}</div>
                    </button>
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCancelDialog(apt); }}
                        title="Cancel appointment"
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-white/70 text-slate-500 hover:text-red-600 hover:bg-white z-30"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#2563eb]" />
            <h1 className="text-2xl font-semibold text-[#2563eb]">Appointments</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBookForm({ patientId: preselectedPatientId || '', date: todayLocalStr(), startTime: '10:00', reason: 'Routine Eye Examination', notes: '' }); setShowBookModal(true); }}
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg"
            >
              + Book appointment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 border border-slate-200 rounded-md overflow-hidden">
            <TableSkeleton rows={7} cols={7} />
          </div>
        ) : (
          /* ── CALENDAR VIEW ────────────────────────────────────────── */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
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
                    onClick={() => setCalendarView(v)}
                    className={`px-4 py-1.5 text-sm capitalize ${
                      calendarView === v ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {calendarView === 'week' && weekGrid}

            {calendarView === 'day' && (
              <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-slate-500 text-sm">
                Day view — {weekStart.toLocaleDateString('en-US', { weekday: 'long' })}, {formatEthiopianDate(weekStart)}
                <div className="mt-4 space-y-2 max-w-md mx-auto">
                  {visibleCalendarApts.filter((a) => a.date === weekStart.toISOString().split('T')[0]).map((apt) => {
                    const p = getPatientById(apt.patientId);
                    return (
                      <div
                        key={apt.id}
                        className={`flex items-center gap-2 rounded-md ${
                          apt.status === 'completed' ? 'bg-slate-100 border border-slate-200 text-slate-500' :
                          apt.status === 'cancelled' ? 'bg-slate-50 border border-slate-200 text-slate-400 line-through' :
                          'bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <button
                          onClick={() => setInfoApt(apt)}
                          className="flex-1 p-3 text-left hover:bg-slate-50/50 transition-colors min-w-0"
                        >
                          <span className="font-medium">{p?.firstName} {p?.lastName}</span> — {formatTime12(apt.startTime)} — {apt.reason}
                        </button>
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => setShowCancelDialog(apt)}
                            title="Cancel appointment"
                            className="mr-3 p-1 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {calendarView === 'month' && (
              <div className="bg-white border border-slate-200 rounded-md p-4">
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.concat(Array.from({ length: 21 }, (_, i) => addDays(weekStart, 7 + i))).slice(0, 28).map((day) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const count = visibleCalendarApts.filter((a) => a.date === dateStr).length;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => { setWeekStart(getMonday(day)); setCalendarView('day'); }}
                        className={`p-2 min-h-[80px] border border-slate-100 rounded text-left hover:bg-slate-50 ${
                          day.getTime() === today.getTime() ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-700">{ethiopianParts(day).day}</div>
                        {count > 0 && <div className="mt-1 text-[10px] text-blue-600 font-medium">{count} apt{count > 1 ? 's' : ''}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cancel Dialog ─────────────────────────────────────────── */}
      {showCancelDialog && (
        <CancelDialog
          appointment={showCancelDialog}
          patientName={(() => {
            const p = getPatientById(showCancelDialog.patientId);
            return p ? `${p.firstName} ${p.lastName}` : 'Patient';
          })()}
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelDialog(null)}
        />
      )}

      {/* ── Appointment Detail Popup ───────────────────────────────── */}
      {infoApt && (
        <AppointmentDetailModal
          apt={infoApt}
          patient={getPatientById(infoApt.patientId)}
          onClose={() => setInfoApt(null)}
          onStartExam={() => { const a = infoApt; setInfoApt(null); handleStartExam(a); }}
          onOpenExam={() => { const a = infoApt; setInfoApt(null); openAppointmentExam(a); }}
          onCancel={() => { setInfoApt(null); setShowCancelDialog(infoApt); }}
        />
      )}

      {/* ── Resume Draft Modal ────────────────────────────────────── */}
      {resumeDraft && (
        <DraftResumeModal
          patientName={`${resumeDraft.patient.firstName} ${resumeDraft.patient.lastName}`.trim()}
          onCancel={() => setResumeDraft(null)}
          onContinue={() => {
            const rd = resumeDraft;
            startExam({
              encounterId: rd.encounter.id,
              appointmentId: rd.appointmentId,
              consentObtained: false,
              reasonForVisit: rd.reason,
              patient: {
                id: rd.patient.id,
                mrn: rd.patient.mrn || rd.patient.id,
                name: `${rd.patient.firstName} ${rd.patient.lastName}`,
                age: formatAge(rd.patient.dateOfBirth),
                gender: rd.patient.gender || '',
                appointmentTime: rd.appointmentTime,
                reasonForVisit: rd.reason,
              },
            });
            setResumeDraft(null);
            navigate(`/exam/${rd.encounter.id}`);
          }}
        />
      )}

      {/* ── Book Modal ────────────────────────────────────────────── */}
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <EthiopianDatePicker
                  value={bookForm.date}
                  onChange={(d) => setBookForm({ ...bookForm, date: d })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                <input required type="time" step="60" value={bookForm.startTime} onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" />
              </div>
              <input required placeholder="Reason for visit" value={bookForm.reason} onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
              <textarea placeholder="Notes (optional)" value={bookForm.notes} onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })} rows={2} className="w-full border border-slate-300 rounded px-3 py-2 text-sm resize-none" />
              <button type="submit" className="w-full py-2.5 bg-[#2563eb] text-white rounded-md text-sm font-medium">Confirm booking</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Loading overlay ───────────────────────────────────────── */}
      {starting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563eb]" />
            <span className="text-sm font-medium text-slate-700">Starting examination…</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};