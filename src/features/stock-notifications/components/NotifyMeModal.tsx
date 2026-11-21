import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { Bell, Check, AlertCircle, Sparkles, Mail, Phone } from 'lucide-react';
import { stockNotificationApi } from '@/services/stockNotification';

interface NotifyModalProps {
  productId: string;
  variantId?: string;
  productName: string;
  variantDetails?: {
    color?: string;
    size?: string;
  };
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyMeModal: React.FC<NotifyModalProps> = ({
  productId,
  variantId,
  productName,
  variantDetails,
  userEmail = '',
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize initial email when modal opens or userEmail changes
  useEffect(() => {
    if (isOpen) {
      setEmail(userEmail || '');
      setPhone('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide a valid email address.');
      setStatus('error');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await stockNotificationApi.subscribe({
        productId: productId || undefined,
        variantId: variantId || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message || 'Failed to subscribe to restock alerts. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-8 text-neutral-100 bg-[#0d0d10] border border-neutral-800 rounded-none text-left">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#1f1c19] border border-[#c9a87c]/40 flex items-center justify-center text-[#c9a87c] shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a87c]">
              Restock Alert
            </span>
            <h3 className="font-serif text-xl text-white tracking-wide">
              Notify Me When Available
            </h3>
          </div>
        </div>

        {/* Product & Variant Context Card */}
        <div className="bg-[#141418] border border-neutral-800/80 p-3.5 mb-5 flex flex-col gap-1.5">
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-mono">
            Selected Piece
          </span>
          <span className="text-white text-sm font-serif tracking-wide">{productName}</span>
          {(variantDetails?.color || variantDetails?.size) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {variantDetails.color && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f1c19] border border-[#3b342e] text-[#e8d5b5]">
                  Color: {variantDetails.color}
                </span>
              )}
              {variantDetails.size && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Size: {variantDetails.size}
                </span>
              )}
            </div>
          )}
        </div>

        {status === 'success' ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded border border-emerald-800/60 bg-emerald-950/40 text-emerald-200 text-xs leading-relaxed flex items-start gap-3">
              <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-300 mb-1">
                  You are subscribed to restock alerts!
                </p>
                <p className="text-neutral-300 text-[11px]">
                  We will send a notification to <strong className="text-white">{email}</strong> as soon as this piece is back in stock.
                </p>
              </div>
            </div>

            <Button
              variant="filled"
              size="md"
              onClick={onClose}
              className="w-full py-3 text-xs tracking-luxury uppercase font-medium mt-2"
            >
              Back to Collection
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Enter your email below and we will notify you the moment this heirloom piece is replenished in our atelier.
            </p>

            {/* Email Field */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@atelier.com"
                  className="w-full bg-[#16161b] border border-neutral-800 focus:border-[#c9a87c] text-white text-xs px-3.5 py-3 pl-9 outline-none transition-colors"
                />
                <Mail size={14} className="absolute left-3 top-3.5 text-neutral-500" />
              </div>
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-1.5">
                Mobile Number <span className="text-neutral-600 font-sans">(Optional for SMS alerts)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#16161b] border border-neutral-800 focus:border-[#c9a87c] text-white text-xs px-3.5 py-3 pl-9 outline-none transition-colors"
                />
                <Phone size={14} className="absolute left-3 top-3.5 text-neutral-500" />
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-xs tracking-wider uppercase text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="filled"
                size="md"
                isLoading={loading}
                disabled={loading || !email.trim()}
                className="py-2.5 px-6 text-xs tracking-luxury uppercase font-medium flex items-center gap-2"
              >
                <Sparkles size={13} />
                <span>Notify Me</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
