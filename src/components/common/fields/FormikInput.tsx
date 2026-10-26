import React from 'react';
import { useField } from 'formik';
import { cn } from '@/lib/utils';

export interface FormikInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  variant?: 'dark' | 'light';
}

export const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  helperText,
  variant = 'dark',
  className,
  id,
  required,
  ...props
}) => {
  const [field, meta] = useField(name);
  const inputId = id || `field-${name}`;
  const hasError = Boolean(meta.touched && meta.error);

  const isDark = variant === 'dark';

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-xs uppercase tracking-wider font-medium',
            isDark ? 'text-neutral-400' : 'text-neutral-600',
            hasError && 'text-red-400'
          )}
        >
          {label}
          {required && <span className="text-adwika-bindi ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...field}
          {...props}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-none text-sm transition-all duration-200 outline-none border',
            isDark
              ? 'bg-[#121214] text-neutral-100 border-neutral-800 focus:border-adwika-sand placeholder:text-neutral-600'
              : 'bg-white text-neutral-900 border-neutral-300 focus:border-adwika-black placeholder:text-neutral-400',
            hasError && 'border-red-500/80 focus:border-red-500',
            props.disabled && 'opacity-50 cursor-not-allowed bg-neutral-900',
            className
          )}
        />
      </div>

      {hasError ? (
        <p id={`${inputId}-error`} className="text-xs text-red-400 mt-0.5 animate-fadeIn">
          {meta.error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className={cn('text-xs mt-0.5', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
