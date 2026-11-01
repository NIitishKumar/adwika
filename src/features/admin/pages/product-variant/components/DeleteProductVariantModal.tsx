import React from 'react';
import { AlertTriangle, Trash2, X, Boxes } from 'lucide-react';
import { ProductVariant } from '../../../types/productVariant.types';
import { Product } from '../../../types/product.types';
import { FitSize } from '../../../types/fitSize.types';
import { ProductColor } from '../../../types/productColor.types';
import { getColorHex } from '../../../utils/colorHelper';

interface DeleteProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  variant: ProductVariant | null;
  product?: Product;
  fitSize?: FitSize;
  productColor?: ProductColor;
  isDeleting?: boolean;
}

export const DeleteProductVariantModal: React.FC<DeleteProductVariantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  variant,
  product,
  fitSize,
  productColor,
  isDeleting = false,
}) => {
  if (!isOpen || !variant) return null;

  const garmentName = variant.product?.name || product?.name || 'Garment';
  const fitName = variant.fitSize?.name || fitSize?.name || 'Fit';
  const colorName = variant.productColor?.name || productColor?.name || 'Color';
  const colorHex = getColorHex(
    colorName,
    variant.productColor?.code || productColor?.code || ''
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-[#161413] border border-red-900/40 rounded-lg shadow-2xl p-6 text-neutral-100 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-neutral-100">Delete Product Variant</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded transition-colors"
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Target Variant Card Preview */}
            <div className="mt-3 p-3 bg-[#1e1b18] border border-[#332b26] rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xs text-neutral-100 font-medium">
                  {garmentName}
                </span>
                <span className="font-mono text-[10px] text-[#c9a87c] bg-[#292019] px-2 py-0.5 rounded border border-[#483727]">
                  {variant.sku}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-sans">
                <span>Fit: {fitName}</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-neutral-600 inline-block"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span>{colorName}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#292420] text-[11px] font-mono">
                <span className="text-neutral-300">₹{variant.price.toLocaleString('en-IN')}</span>
                <span className="text-neutral-400">{variant.stockQuantity} units in stock</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
              Are you sure you want to permanently delete SKU <strong className="text-white font-mono">{variant.sku}</strong>?
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              This SKU variation will be removed from inventory and clients will not be able to order this combination.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#2e2a27] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white rounded border border-[#332e29] hover:bg-[#201d1a] transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs uppercase tracking-wider bg-red-900/80 hover:bg-red-800 text-red-100 rounded font-sans font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 size={13} className={isDeleting ? 'animate-spin' : ''} />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
