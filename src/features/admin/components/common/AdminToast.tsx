import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface AdminToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const AdminToastContainer: React.FC<AdminToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <AdminToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const AdminToastItem: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#c9a87c] shrink-0" />,
  };

  const styleMap = {
    success: 'bg-[#0d2217] border-emerald-600/60 text-emerald-100 shadow-emerald-950/50',
    error: 'bg-[#290d0d] border-rose-600/60 text-rose-100 shadow-rose-950/50',
    info: 'bg-[#1e1914] border-[#6b523b] text-[#ebdcc9] shadow-black/60',
  };

  const defaultTitles = {
    success: 'Success',
    error: 'Action Failed',
    info: 'Notification',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border p-4 shadow-2xl flex items-start gap-3 transform transition-all duration-300 animate-slideDown',
        styleMap[toast.type]
      )}
      role="alert"
    >
      <div className="pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase font-mono tracking-widest font-semibold">
          {toast.title || defaultTitles[toast.type]}
        </p>
        <p className="text-xs font-sans mt-0.5 leading-relaxed opacity-90 break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
};
