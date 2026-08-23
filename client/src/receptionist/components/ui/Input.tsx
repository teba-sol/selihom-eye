import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 ${className}`}
      {...props}
    />
  );
};

export const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export const Field: React.FC<FieldProps> = ({ label, required, children }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};
