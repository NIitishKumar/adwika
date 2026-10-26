import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'filled' | 'ghost' | 'light-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outline',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans uppercase tracking-widest text-xs transition-all duration-300 relative group overflow-hidden select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-xs tracking-[0.2em]',
  };

  const variantStyles = {
    outline: 'border border-neutral-700 hover:border-neutral-200 text-neutral-200 hover:text-black bg-transparent hover:bg-neutral-100',
    filled: 'border border-neutral-100 bg-neutral-100 text-neutral-900 hover:bg-transparent hover:text-neutral-100 hover:border-neutral-300',
    ghost: 'text-neutral-300 hover:text-white bg-transparent hover:bg-neutral-900/60',
    'light-outline': 'border border-neutral-400 hover:border-black text-neutral-800 hover:text-white bg-transparent hover:bg-black',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
