import React, { useState } from 'react';
import {
  X,
  Eye,
  Edit2,
  Calendar,
  Clock,
  Boxes,
  Scissors,
  IndianRupee,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tag,
  Package,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { ProductVariant } from '../../../types/productVariant.types';
import { Product } from '../../../types/product.types';
import { FitSize } from '../../../types/fitSize.types';
import { ProductColor } from '../../../types/productColor.types';
import { getColorHex } from '../../../utils/colorHelper';

interface ProductVariantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
  product?: Product;
  fitSize?: FitSize;
  productColor?: ProductColor;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (variant: ProductVariant) => void;
}

export const ProductVariantDetailModal: React.FC<ProductVariantDetailModalProps> = ({
  isOpen,
  onClose,
  variant,
  product: productProp,
  fitSize: fitSizeProp,
  productColor: productColorProp,
  isLoading = false,
  error = null,
  onEdit,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldKey ? null : curr));
    }, 2000);
  };

  const product = variant?.product || productProp;
  const fit = variant?.fitSize || fitSizeProp;
  const color = variant?.productColor || productColorProp;

  const colorHex = getColorHex(color?.name || '', color?.code || '');
  const hasDiscount =
    variant?.compareAtPrice != null && variant.compareAtPrice > (variant.price || 0);
  const discountPercent =
    hasDiscount && variant?.compareAtPrice
      ? Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100)
      : 0;

  const isLowStock =
    (variant?.stockQuantity ?? 0) > 0 && (variant?.stockQuantity ?? 0) <= 5;
  const isOutOfStock = (variant?.stockQuantity ?? 0) === 0;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const displayId = variant?.uniqueId || variant?.variantId || variant?.id || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn">
        {/* Header Ribbon */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
              <Eye size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                  Product Variant Details
                </h3>
                {variant?.sku && (
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#241c16] text-[#c9a87c] border border-[#483727] font-medium">
                    {variant.sku}
                  </span>
                )}
                {displayId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(displayId, 'header-id')}
                    title="Click to copy Variant ID"
                    className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2] hover:border-[#c9a87c] transition-colors"
                  >
                    <span>ID: {displayId}</span>
                    {copiedField === 'header-id' ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} className="text-neutral-500" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                SKU variation specifications, silhouette sizing, artisanal color, and warehouse inventory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && variant && !isLoading && (
              <button
                type="button"
                onClick={() => onEdit(variant)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25201b] hover:bg-[#342a22] text-[#e0cfba] border border-[#483727] rounded text-xs transition-colors"
                title="Edit this variant"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-100 p-1.5 rounded hover:bg-neutral-800/60 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {isLoading && !variant && (
            <div className="py-16 text-center text-neutral-400">
              <div className="w-9 h-9 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs tracking-wider uppercase font-mono text-[#c9a87c]">
                Loading variant specifications...
              </p>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                Fetching details from <code className="text-neutral-400">/api/v1/product-variants/:id</code>
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-rose-300">Notice:</p>
                <p className="mt-0.5 text-neutral-300">{error}</p>
              </div>
            </div>
          )}

          {variant && (
            <>
              {/* Variant Hero Overview Card */}
              <div className="p-5 rounded-lg bg-[#181615] border border-[#2b2723] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Garment Image or Color Swatch Tile */}
                    {productProp?.imageUrl ? (
                      <div className="w-20 sm:w-24 h-24 sm:h-28 rounded-md overflow-hidden border border-[#3a3026] shadow-xl shrink-0 bg-[#121110]">
                        <img
                          src={productProp.imageUrl}
                          alt={product?.name || variant.sku}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-20 sm:w-24 h-24 sm:h-28 rounded-md border border-[#3a3026] shadow-xl shrink-0 flex flex-col items-center justify-center p-2 text-center"
                        style={{ backgroundColor: colorHex ? `${colorHex}25` : '#201d1a' }}
                      >
                        <span
                          className="w-8 h-8 rounded-full border border-neutral-600 shadow-md mb-1.5"
                          style={{ backgroundColor: colorHex || '#44372c' }}
                        />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-300 truncate max-w-full">
                          {color?.code || 'SKU'}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                            variant.isActive
                              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                              : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              variant.isActive ? 'bg-emerald-400' : 'bg-neutral-500'
                            }`}
                          />
                          {variant.isActive ? 'Active Storefront' : 'Draft / Inactive'}
                        </span>

                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            Low Stock ({variant.stockQuantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            In Stock ({variant.stockQuantity})
                          </span>
                        )}
                      </div>

                      {/* Parent Product Title */}
                      <h2 className="font-serif text-xl sm:text-2xl text-neutral-100 font-normal tracking-tight break-words">
                        {product?.name || 'Garment Product'}
                      </h2>

                      {/* SKU Identifier */}
                      <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                        <span className="text-[11px] text-neutral-500 font-mono">SKU:</span>
                        <code className="font-mono text-[11px] text-[#c9a87c] bg-[#241c16] px-2 py-0.5 rounded border border-[#483727] font-semibold">
                          {variant.sku}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(variant.sku, 'sku')}
                          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                          title="Copy SKU"
                        >
                          {copiedField === 'sku' ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Callout Card */}
                  <div className="sm:text-right shrink-0 p-3.5 sm:p-4 rounded-lg bg-[#201c18] border border-[#3a3026]">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#c9a87c] block mb-0.5">
                      Variant Retail Price
                    </span>
                    <div className="flex items-center sm:justify-end gap-1 font-mono text-xl sm:text-2xl text-[#f3e7d6] font-medium">
                      <IndianRupee size={18} className="text-[#c9a87c]" />
                      <span>{variant.price.toLocaleString('en-IN')}</span>
                    </div>

                    {hasDiscount && (
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs font-mono mt-1">
                        <span className="line-through text-neutral-500">
                          ₹{variant.compareAtPrice!.toLocaleString('en-IN')}
                        </span>
                        <span className="text-emerald-400 font-semibold bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800/40 text-[10px]">
                          -{discountPercent}% OFF
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-sans">
                      INR • Excl. Taxes
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant Specification Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Silhouette & Fit Size Card */}
                <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                    <Scissors size={13} />
                    <span>Silhouette Fit & Sizing</span>
                  </div>
                  <div className="pt-1 space-y-1">
                    <p className="font-serif text-base text-neutral-100 font-medium">
                      {fit?.name || 'Unassigned Fit'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#d6c7b2] bg-[#201d1a] px-2 py-0.5 rounded border border-[#352f2a]">
                        Code: {fit?.fitCode || '—'}
                      </span>
                      {fit?.displayOrder != null && (
                        <span className="text-[11px] font-mono text-neutral-500">
                          Order #{fit.displayOrder}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500 pt-0.5">
                      Fit ID: {variant.fitSizeId}
                    </p>
                  </div>
                </div>

                {/* 2. Artisanal Color Card */}
                <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-600 inline-block"
                      style={{ backgroundColor: colorHex || '#c9a87c' }}
                    />
                    <span>Artisanal Colorway</span>
                  </div>
                  <div className="pt-1 flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-full border border-neutral-600 shrink-0 shadow-md"
                      style={{ backgroundColor: colorHex }}
                    />
                    <div className="space-y-0.5">
                      <p className="font-serif text-base text-neutral-100 font-medium">
                        {color?.name || 'Unassigned Color'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#d6c7b2] bg-[#201d1a] px-2 py-0.5 rounded border border-[#352f2a]">
                          Code: {color?.code || '—'}
                        </span>
                        {colorHex && (
                          <span className="font-mono text-[11px] text-neutral-400">
                            {colorHex}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-neutral-500 pt-0.5">
                        Color ID: {variant.productColorId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Stock & Warehouse Inventory Card */}
                <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                    <Package size={13} />
                    <span>Warehouse Inventory & Stock</span>
                  </div>
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="font-serif text-2xl text-neutral-100 font-medium font-mono">
                      {variant.stockQuantity}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans">
                      units available for fulfilment
                    </span>
                  </div>
                  <div className="pt-1">
                    {isOutOfStock ? (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5 font-sans">
                        <AlertTriangle size={13} />
                        Item is out of stock. Storefront ordering should be replenished.
                      </p>
                    ) : isLowStock ? (
                      <p className="text-xs text-amber-300 flex items-center gap-1.5 font-sans">
                        <AlertTriangle size={13} />
                        Low stock threshold reached (5 or fewer garments left).
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-sans">
                        <CheckCircle2 size={13} />
                        Healthy inventory level in warehouse.
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Parent Garment Product Details */}
                <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                    <Layers size={13} />
                    <span>Parent Product Hierarchy</span>
                  </div>
                  <div className="pt-1 space-y-1">
                    <p className="font-serif text-sm text-neutral-100 font-medium">
                      {product?.name || 'Garment Product'}
                    </p>
                    {product?.slug && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                        <span>Slug:</span>
                        <code className="text-[#d6c7b2] bg-[#121110] px-1.5 py-0.2 rounded border border-[#2a241e]">
                          {product.slug}
                        </code>
                      </div>
                    )}
                    <p className="text-[11px] font-mono text-neutral-500 pt-0.5">
                      Product ID: {variant.productId}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Audit Timestamps */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded bg-[#100f0e] border border-[#24201c] text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#c9a87c]" />
                  <span>Created: {formatDate(variant.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#c9a87c]" />
                  <span>Updated: {formatDate(variant.updatedAt)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
          <div className="text-[11px] font-mono text-neutral-400">
            API Endpoint: <code className="text-[#c9a87c]">GET /api/v1/product-variants/:id</code>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#38332d] hover:bg-[#25201b] text-neutral-200 rounded text-xs font-sans transition-colors"
            >
              Close
            </button>
            {onEdit && variant && (
              <button
                type="button"
                onClick={() => onEdit(variant)}
                className="px-4 py-2 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-colors flex items-center gap-1.5"
              >
                <Edit2 size={13} />
                <span>Edit Variant</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
