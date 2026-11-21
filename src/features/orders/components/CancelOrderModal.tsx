import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { Order } from '../types/order.types';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  'Ordered by mistake',
  'Need different size or garment silhouette',
  'Incorrect delivery address details',
  'Want to change payment method',
  'Other personal reason',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === 'Other personal reason' && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirmCancel(order.id || order.uniqueId || order.orderNumber, finalReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="text-left space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base uppercase tracking-wider text-neutral-100">
              Cancel Consignment
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Order #{order.orderNumber}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Are you sure you wish to cancel this bespoke consignment? The allocated inventory will be immediately released back to the atelier collection.
        </p>

        {/* Reason Selection */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2 font-sans">
            Please Select a Reason <span className="text-rose-400">*</span>
          </label>
          <div className="space-y-2">
            {COMMON_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 p-2.5 border cursor-pointer text-xs transition-colors ${
                  selectedReason === r
                    ? 'border-[#c9a87c] bg-[#1a1714] text-neutral-100'
                    : 'border-neutral-800 bg-[#0d0d0f] text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="cancellationReason"
                  value={r}
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-[#c9a87c]"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedReason === 'Other personal reason' && (
          <div>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please provide additional feedback for our atelier..."
              className="w-full bg-[#0a0a0c] border border-neutral-800 focus:border-[#c9a87c] p-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-600 transition-colors"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Order
          </Button>
          <Button
            type="submit"
            variant="filled"
            size="sm"
            isLoading={isSubmitting}
            className="bg-rose-700 hover:bg-rose-600 text-white border-rose-600"
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
