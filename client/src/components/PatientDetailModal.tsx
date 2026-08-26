import React from 'react';
import { X } from 'lucide-react';
import { formatDobEthiopian, extractRegionZone } from '../data/mockData';
import type { Patient, Appointment } from '../store/useAppStore';

interface PatientDetailModalProps {
  patient: Patient;
  appointments: Appointment[];
  onClose: () => void;
}

const STATUS_STYLES: Record<Appointment['status'], string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  in_exam: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  appointments,
  onClose,
}) => {
  const { region, zone } = extractRegionZone(patient.address);

  const sorted = [...appointments].sort((a, b) => {
    const da = a.date + a.startTime;
    const db = b.date + b.startTime;
    return db.localeCompare(da);
  });

  const infoItems = [
    { label: 'MRN', value: patient.mrn || '—' },
    { label: 'Gender', value: patient.gender },
    { label: 'Grandfather Name', value: patient.grandfatherName || '—' },
    { label: 'Date of Birth', value: formatDobEthiopian(patient.dateOfBirth) },
    { label: 'Phone', value: patient.phone },
    { label: 'Email', value: patient.email },
    { label: 'Address', value: patient.address || '—' },
    { label: 'Region', value: region || '—' },
    { label: 'Zone', value: zone || '—' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {patient.firstName} {patient.lastName} {patient.grandfatherName || ''}
            </h2>
            {patient.mrn && (
              <span className="text-xs text-slate-500">MRN: {patient.mrn}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Registration Info */}
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Registration Info
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {infoItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-sm text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment History */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Appointment History
          </h3>
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No appointment history</p>
          ) : (
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                    <th className="px-3 py-2 text-left font-semibold">Time</th>
                    <th className="px-3 py-2 text-left font-semibold">Reason</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((apt) => (
                    <tr key={apt.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{apt.date}</td>
                      <td className="px-3 py-2 text-slate-600">{apt.startTime}</td>
                      <td className="px-3 py-2 text-slate-600">{apt.reason}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_STYLES[apt.status]
                          }`}
                        >
                          {apt.status === 'in_exam' ? 'In Exam' : apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
