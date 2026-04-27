'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showChevron?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
}

const sizeClasses = {
  sm: 'py-2 px-3 text-sm pr-10',
  md: 'py-2.5 px-4 text-sm pr-10',
  lg: 'py-3 px-4 text-base pr-10',
};

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder,
  label,
  className = '',
  size = 'md',
  showChevron = true,
  disabled = false,
  id,
  name,
}: SelectDropdownProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full rounded-xl border-2 border-gray-200 bg-white appearance-none
          shadow-sm
          focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent focus:outline-none
          hover:border-gray-300 transition-all duration-200 cursor-pointer
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
          ${sizeClasses[size]}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showChevron && (
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          size={18}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// FormField wrapper component for common form use cases
export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export function FormField({
  label,
  children,
  className = '',
  required = false,
  helperText,
  error,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        {required && (
          <span className="text-red-500" aria-hidden="true">*</span>
        )}
      </div>
      {children}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
