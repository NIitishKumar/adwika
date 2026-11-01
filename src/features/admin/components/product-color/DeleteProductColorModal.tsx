import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ProductColor } from '../../types/productColor.types';
import { getColorHex } from '../../utils/colorHelper';

interface DeleteProductColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productColor: ProductColor | null;
  isDeleting?: boolean;
}

export const DeleteProductColorModal: React.FC<DeleteProductColorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productColor,
  isDeleting = false,
}) => {
  if (!isOpen || !productColor) return null;

  const colorHex = getColorHex(productColor.name, productColor.code);

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-neutral-100">Delete Product Color</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2.5 my-3 p-2 rounded bg-[#201d1a] border border-[#332c25]">
              <span
                className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
              <span className="text-sm font-serif text-white truncate">{productColor.name}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#2a241e] text-[#c9a87c] border border-[#443729]">
                {productColor.code}
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete this colorway? Garment listings mapped to this shade will need to be reassigned.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#2e2a27] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-100 rounded border border-neutral-700 hover:border-neutral-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs uppercase tracking-wider bg-red-800 hover:bg-red-700 text-white rounded font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
