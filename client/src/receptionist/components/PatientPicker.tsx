import React from 'react';
import type { Patient } from '../lib/types';

interface PatientPickerProps {
  selectedPatient: Patient | null;
  onSelect: (patient: Patient | null) => void;
}

export const PatientPicker: React.FC<PatientPickerProps> = ({ selectedPatient, onSelect }) => {
  return (
    <div className="p-4 border border-slate-300 rounded-lg">
      <p className="text-sm text-slate-600">
        {selectedPatient ? `Selected: ${selectedPatient.firstName} ${selectedPatient.fatherName}` : 'No patient selected'}
      </p>
      <button
        onClick={() => onSelect({ id: '1', firstName: 'Test', fatherName: 'Patient' } as Patient)}
        className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
      >
        Select Test Patient
      </button>
    </div>
  );
};
