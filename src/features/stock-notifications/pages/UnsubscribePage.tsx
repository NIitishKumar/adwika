import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { stockNotificationApi } from '@/services/stockNotification';
import { Button } from '@/components/ui';
import { BellOff, Check, AlertCircle, ArrowLeft, Mail } from 'lucide-react';

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';
  const productId = searchParams.get('productId') || searchParams.get('product_id') || undefined;
  const variantId = searchParams.get('variantId') || searchParams.get('variant_id') || undefined;

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cancelledCount, setCancelledCount] = useState<number | null>(null);

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await stockNotificationApi.unsubscribe({
        email: email.trim(),
        productId,
        variantId,
      });
      setCancelledCount(res.data?.cancelledCount ?? null);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message || 'Failed to cancel restock notifications. Please verify the email and try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#080809] text-neutral-100 pt-28 pb-20 px-4 sm:px-6 flex flex-col justify-between items-center selection:bg-adwika-sand selection:text-black">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Back Link */}
        <div className="w-full flex items-center justify-start mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Atelier Archive</span>
          </button>
        </div>

        {/* Card */}
        <div className="w-full bg-[#0e0e12] border border-neutral-800 p-8 sm:p-10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-[#1b1816] border border-[#c9a87c]/30 flex items-center justify-center text-[#c9a87c] mx-auto mb-5">
            <BellOff size={24} />
          </div>

          <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a87c] block mb-1">
            Notification Preferences
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-white tracking-wide mb-3">
            Cancel Restock Alerts
          </h1>

          {status === 'success' ? (
            <div className="space-y-6 pt-2 animate-fadeIn">
              <div className="p-4 rounded border border-emerald-800/60 bg-emerald-950/40 text-emerald-200 text-xs text-left flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-emerald-300">
                    Unsubscribed successfully
                  </p>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    <strong>{email}</strong> will no longer receive restock alerts
                    {productId ? ' for this garment' : ''}.
                    {cancelledCount !== null && cancelledCount > 0 && ` (${cancelledCount} alert${cancelledCount > 1 ? 's' : ''} removed)`}
                  </p>
                </div>
              </div>

              <Button
                variant="filled"
                size="md"
                onClick={() => navigate('/')}
                className="w-full py-3.5 text-xs tracking-luxury uppercase font-medium"
              >
                Explore Archive
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-5 pt-2 text-left">
              <p className="text-xs text-neutral-400 leading-relaxed text-center font-sans">
                {productId || variantId
                  ? 'Confirm cancellation of back-in-stock alerts for this specific garment.'
                  : 'Enter your email to unsubscribe from all pending back-in-stock notifications.'}
              </p>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@atelier.com"
                    className="w-full bg-[#141418] border border-neutral-800 focus:border-[#c9a87c] text-white text-xs px-3.5 py-3 pl-9 outline-none transition-colors"
                  />
                  <Mail size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                </div>
              </div>

              {status === 'error' && errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="filled"
                size="md"
                isLoading={status === 'loading'}
                disabled={status === 'loading' || !email.trim()}
                className="w-full py-3.5 text-xs tracking-luxury uppercase font-medium"
              >
                Confirm Unsubscribe
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Footer watermark */}
      <div className="pt-12 text-center text-[10px] tracking-widest uppercase text-neutral-500 font-mono">
        ADWIKA ATELIER · CONTEMPORARY INDIAN DESIGN & HEIRLOOMS
      </div>
    </div>
  );
};
