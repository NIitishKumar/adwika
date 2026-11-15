import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, WifiOff } from 'lucide-react';

interface ApiErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  retryLabel?: string;
  isRetrying?: boolean;
  compact?: boolean;
  className?: string;
}

export const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({
  title = 'Atelier Connection Disrupted',
  message = 'We are currently unable to reach our collection database. Please check your network connection and try again.',
  onRetry,
  onBack,
  backLabel = 'Return to Archive',
  retryLabel = 'Retry Connection',
  isRetrying = false,
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <div
        className={`p-6 rounded-md bg-[#131110] border border-[#2e2620] text-center flex flex-col items-center justify-center gap-3 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-[#1e1916] border border-[#3b3028] flex items-center justify-center text-amber-400">
          <WifiOff size={18} />
        </div>
        <div>
          <h4 className="font-serif text-sm uppercase tracking-wider text-neutral-100">
            {title}
          </h4>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-sm">
            {message}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1f1a16] hover:bg-[#2c241e] border border-[#44362b] text-[#c9a87c] hover:text-[#e4cfb3] text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Reconnecting...' : retryLabel}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}
    >
      {/* Decorative Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-[#181513] border border-[#352c25] flex items-center justify-center text-[#c9a87c] shadow-lg">
          <AlertCircle size={28} />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
        </span>
      </div>

      {/* Luxury Badging */}
      <span className="text-[10px] uppercase font-mono tracking-wide-luxury text-adwika-sand mb-2">
        Archive System Notice
      </span>

      {/* Title */}
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.15em] text-white font-light mb-3">
        {title}
      </h2>

      {/* Message */}
      <p className="font-sans text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed mb-8 font-light">
        {message}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-widest font-medium transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Connecting to Atelier...' : retryLabel}</span>
          </button>
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 bg-neutral-900/60 text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

