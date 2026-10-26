import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'modal' | 'drawer-right';
  className?: string;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'modal',
  className,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (variant === 'drawer-right') {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full max-w-md bg-[#0d0d0f] text-neutral-100 h-full shadow-2xl flex flex-col z-10 border-l border-neutral-800 animate-fadeIn',
            className
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-serif text-lg tracking-wider uppercase text-neutral-200">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-[#0e0e11] text-neutral-100 rounded-none shadow-2xl z-10 border border-neutral-800 p-6 md:p-8 animate-fadeIn',
          maxWidth,
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {title && (
          <h2 className="font-serif text-xl tracking-wider uppercase text-neutral-100 mb-6 text-center">
            {title}
          </h2>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
