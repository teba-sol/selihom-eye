import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListOrdered,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Eye,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { todayEatDate, formatTime } from '../lib/format';
import type { Appointment, Patient, PatientListResponse } from '../lib/types';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Field, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PatientPicker } from '../components/PatientPicker';
import { PatientForm } from '../components/forms/PatientForm';

export function QueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState(todayEatDate());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [selectedWalkinPatient, setSelectedWalkinPatient] = useState<Patient | null>(null);
  const [walkinReason, setWalkinReason] = useState('General Eye Consultation');
  const [submittingWalkin, setSubmittingWalkin] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isDoctor = user?.role === 'doctor';

  const { data: appointments, loading, refetch } = useFetch<Appointment[]>(
    `/appointments?date=${date}`,
  );

  const filteredAppointments = useMemo(() => {
    let list = appointments ?? [];
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.queueNo != null && String(a.queueNo).includes(q)) ||
          (a.reason && a.reason.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [appointments, statusFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const list = appointments ?? [];
    return {
      total: list.length,
      waiting: list.filter((a) => a.status === 'booked').length,
      checkedIn: list.filter((a) => a.status === 'checked_in').length,
      inProgress: list.filter((a) => a.status === 'in_progress').length,
      completed: list.filter((a) => a.status === 'completed').length,
    };
  }, [appointments]);

  const handleStatusChange = async (appointmentId: string, nextStatus: string) => {
    setActionLoadingId(appointmentId);
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: nextStatus });
      toast(`Queue ticket updated to ${nextStatus}`, 'success');
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update queue ticket', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalkinPatient) {
      toast('Please select a registered patient', 'warning');
      return;
    }

    setSubmittingWalkin(true);
    try {
      await api.post('/appointments', {
        patientId: selectedWalkinPatient.id,
        type: 'walkin',
        reason: walkinReason,
        notes: 'Walk-in ticket added at reception desk',
      });
      toast(`Queue ticket issued for ${selectedWalkinPatient.firstName} ${selectedWalkinPatient.fatherName}`, 'success');
      setShowWalkinModal(false);
      setSelectedWalkinPatient(null);
      setWalkinReason('General Eye Consultation');
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create walkin ticket', 'error');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <Badge variant="neutral">Booked / Arrived</Badge>;
      case 'checked_in':
        return <Badge variant="teal">Triaged / Ready</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Consultation</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal/15 text-teal">
            <ListOrdered size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Live Patient Queue & Reception
            </h1>
            <p className="text-xs text-slate-500">
              Manage patient flow, nurse triaging, doctor calling, and daily clinic throughput.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={loading}>
            <RefreshCw size={14} className="mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewPatientModal(true)}
          >
            <UserPlus size={14} className="mr-1.5" />
            Register Patient
          </Button>

          <Button
            size="sm"
            onClick={() => setShowWalkinModal(true)}
            className="shadow-sm shadow-teal/20"
          >
            <Plus size={14} className="mr-1.5" />
            Issue Walk-In Ticket
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Scheduled Today</div>
          <div className="mt-1.5 text-2xl font-black text-navy">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Waiting for Triage</div>
          <div className="mt-1.5 text-2xl font-black text-slate-700">{stats.waiting}</div>
        </div>
        <div className="rounded-2xl border border-teal/30 bg-teal/[0.04] p-4 shadow-sm">
          <div className="text-xs font-semibold text-teal">Triaged / Ready for Doc</div>
          <div className="mt-1.5 text-2xl font-black text-teal">{stats.checkedIn}</div>
        </div>
        <div className="rounded-2xl border border-warning/30 bg-warning/[0.04] p-4 shadow-sm">
          <div className="text-xs font-semibold text-warning">In Exam Room</div>
          <div className="mt-1.5 text-2xl font-black text-warning">{stats.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success/[0.04] p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-success">Finished / Discharged</div>
          <div className="mt-1.5 text-2xl font-black text-success">{stats.completed}</div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, queue #, reason..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <Input
              type="date"
              className="w-auto"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'booked', 'checked_in', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all whitespace-nowrap',
                statusFilter === status
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-500/10',
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List Table */}
      <Card className="border-line bg-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-slate-500/[0.04] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Queue #</th>
                <th className="px-3 py-3.5">Patient Details</th>
                <th className="px-3 py-3.5">Visit Type & Reason</th>
                <th className="px-3 py-3.5">Time / Check-In</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
                      <ListOrdered size={20} />
                    </div>
                    No patients matching this queue filter for {date}.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-500/[0.02] transition">
                    <td className="py-4 pl-6 pr-3 font-mono font-bold text-teal text-sm">
                      #{appt.queueNo || '—'}
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-bold text-navy text-[13px]">
                        {appt.patientName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Patient ID: {appt.patientId.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-700">
                        {appt.reason || 'Ophthalmic Consultation'}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        Type: {appt.type}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      <div>{appt.appointmentTime ? formatTime(appt.appointmentTime) : 'Walk-in Today'}</div>
                      <div className="text-[11px] text-slate-400">{appt.appointmentDate}</div>
                    </td>
                    <td className="px-3 py-4">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="py-4 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nurse Triage Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/triage/${appt.patientId}`)}
                          className="border-teal/30 text-teal hover:bg-teal/10"
                        >
                          <HeartPulse size={13} className="mr-1 text-teal" />
                          Triage & Vitals
                        </Button>

                        {/* Doctor Exam Button */}
                        {isDoctor ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              handleStatusChange(appt.id, 'in_progress');
                              navigate(`/workspace/${appt.patientId}`);
                            }}
                            className="bg-navy text-white hover:bg-navy/90"
                          >
                            <Stethoscope size={13} className="mr-1" />
                            Doctor Exam
                          </Button>
                        ) : null}

                        {/* Status update quick buttons */}
                        {appt.status === 'booked' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(appt.id, 'checked_in')}
                            disabled={actionLoadingId === appt.id}
                            title="Mark Triaged & Ready for Doctor"
                          >
                            <UserCheck size={14} className="text-teal" />
                          </Button>
                        ) : appt.status === 'checked_in' || appt.status === 'in_progress' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(appt.id, 'completed')}
                            disabled={actionLoadingId === appt.id}
                            title="Mark Consultation Completed"
                          >
                            <CheckCircle2 size={14} className="text-success" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Walk-in Ticket Modal */}
      <Modal
        open={showWalkinModal}
        onClose={() => setShowWalkinModal(false)}
        title="Issue Walk-In Queue Ticket"
        subtitle="Select a patient from records to assign an instant daily queue number"
        size="md"
      >
        <form onSubmit={handleCreateWalkin} className="space-y-4 pt-1">
          <Field label="1. Select Registered Patient" required>
            <PatientPicker
              selectedPatient={selectedWalkinPatient}
              onSelect={setSelectedWalkinPatient}
            />
          </Field>

          <Field label="2. Chief Complaint / Visit Reason" required>
            <Input
              placeholder="e.g. Red eye, acute pain, vision drop, routine checkup"
              value={walkinReason}
              onChange={(e) => setWalkinReason(e.target.value)}
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalkinModal(false)}
              disabled={submittingWalkin}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submittingWalkin} disabled={!selectedWalkinPatient}>
              Generate Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Register New Patient Modal */}
      <Modal
        open={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        title="Register New Patient"
        subtitle="Quick registration for walk-in or new arrivals"
        size="md"
      >
        <PatientForm
          onDone={(newPatient) => {
            setShowNewPatientModal(false);
            setSelectedWalkinPatient(newPatient);
            setShowWalkinModal(true);
            refetch();
          }}
          onCancel={() => setShowNewPatientModal(false)}
        />
      </Modal>
    </div>
  );
}
