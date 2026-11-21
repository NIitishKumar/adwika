import React, { useState } from 'react';
import { ProductVariant } from '../../../types/productVariant.types';
import { PackagePlus, AlertCircle, Sparkles, X } from 'lucide-react';
import { stockNotificationApi } from '@/services/stockNotification';

interface RestockVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  onSuccess: (updatedVariant: ProductVariant, message: string) => void;
}

export const RestockVariantModal: React.FC<RestockVariantModalProps> = ({
  isOpen,
  onClose,
  variant,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMessage('Replenishment quantity must be at least 1 unit.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await stockNotificationApi.restockVariant(variant.id, quantity);
      const updatedVariant: ProductVariant = {
        ...variant,
        stockQuantity: res.data?.stockQuantity ?? quantity,
      };

      onSuccess(
        updatedVariant,
        res.message || `Variant SKU ${variant.sku} restocked successfully. Notification emails dispatched.`
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to restock variant inventory. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#181615] border border-[#2e2a27] text-neutral-100 shadow-2xl p-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#241f1b] border border-[#c9a87c]/40 flex items-center justify-center text-[#c9a87c] shrink-0">
            <PackagePlus size={20} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c9a87c]">
              Inventory Management
            </span>
            <h3 className="font-serif text-lg text-white tracking-wide">
              Restock & Notify Subscribers
            </h3>
          </div>
        </div>

        {/* Variant Info Summary */}
        <div className="bg-[#121110] border border-[#262320] p-4 mb-5 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-500">SKU:</span>
            <span className="text-white font-medium">{variant.sku}</span>
          </div>
          {variant.product?.name && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Product:</span>
              <span className="text-neutral-200 truncate max-w-[220px]">
                {variant.product.name}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-500">Color / Fit:</span>
            <span className="text-neutral-300">
              {variant.productColor?.name || 'Standard'} · {variant.fitSize?.name || variant.fitSize?.fitCode || 'Standard'}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#262320]">
            <span className="text-neutral-500">Current Stock:</span>
            <span
              className={`font-semibold ${
                variant.stockQuantity <= 0 ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {variant.stockQuantity} units
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-1.5">
              Replenish Units to Add
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-[#121110] border border-[#38332e] focus:border-[#c9a87c] text-white text-sm font-mono px-3.5 py-2.5 outline-none transition-colors"
            />
            <p className="text-[10px] text-neutral-500 font-sans mt-1">
              New total stock will be {variant.stockQuantity + quantity} units.
            </p>
          </div>

          <div className="p-3 bg-[#1e1a17] border border-[#3d332a] rounded text-[11px] text-[#e8d5b5] flex items-start gap-2">
            <Sparkles size={14} className="shrink-0 text-[#c9a87c] mt-0.5" />
            <span className="leading-relaxed font-sans">
              Replenishing will automatically trigger email alerts to all customers with pending restock notifications for this variant.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#c9a87c] hover:bg-[#d9b88c] text-black text-xs font-mono uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Replenishing...' : 'Restock & Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
