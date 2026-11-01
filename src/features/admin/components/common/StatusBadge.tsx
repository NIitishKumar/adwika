import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  className,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        isActive
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
          : 'bg-neutral-800/60 text-neutral-400 border-neutral-700/60',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          isActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
        )}
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  );
};
