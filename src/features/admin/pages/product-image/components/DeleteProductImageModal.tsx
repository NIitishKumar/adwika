import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { ProductImage } from '../../../types/productImage.types';
import { Product } from '../../../types/product.types';

interface DeleteProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  image: ProductImage | null;
  product?: Product;
  isDeleting?: boolean;
}

export const DeleteProductImageModal: React.FC<DeleteProductImageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  image,
  product,
  isDeleting = false,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !image) return null;

  const garmentName = image.product?.name || product?.name || 'Garment';

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
              <h3 className="font-serif text-lg text-neutral-100">Delete Product Visual</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded transition-colors"
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Target Visual Preview Card */}
            <div className="mt-3 p-3 bg-[#1e1b18] border border-[#332b26] rounded-md flex items-center gap-3">
              <div className="w-14 h-16 rounded overflow-hidden bg-[#121110] border border-[#3d332a] shrink-0 flex items-center justify-center">
                {!imageError ? (
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon size={18} className="text-neutral-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase text-[#c9a87c] block truncate">
                  {garmentName}
                </span>
                <p className="text-xs text-neutral-200 font-sans font-medium line-clamp-2 mt-0.5">
                  "{image.altText || 'Untitled visual'}"
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">
                    Seq: #{image.displayOrder}
                  </span>
                  {image.isPrimary && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-700/60 text-amber-300">
                      Primary Cover
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
              Are you sure you want to permanently remove this visual from{' '}
              <strong className="text-white">{garmentName}</strong>?
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              This image link will be purged from the product gallery and storefront gallery showcase.
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
