import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Boxes,
  Scissors,
  Palette,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { ProductVariant } from '../../../types/productVariant.types';
import { Product } from '../../../types/product.types';
import { FitSize } from '../../../types/fitSize.types';
import { ProductColor } from '../../../types/productColor.types';
import { getColorHex } from '../../../utils/colorHelper';

interface ProductVariantTableProps {
  variants: ProductVariant[];
  productMap: Map<string, Product>;
  fitSizeMap: Map<string, FitSize>;
  colorMap: Map<string, ProductColor>;
  onViewDetail: (variant: ProductVariant) => void;
  onEdit: (variant: ProductVariant) => void;
  onDelete: (variant: ProductVariant) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const ProductVariantTable: React.FC<ProductVariantTableProps> = ({
  variants,
  productMap,
  fitSizeMap,
  colorMap,
  onViewDetail,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase font-mono">Loading variants inventory...</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Boxes size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Product Variants Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No inventory SKU variants match your current filter selection. Add a new size/color variation or reset filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#2b2723] bg-[#141414] shadow-xl">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-[#26221f] bg-[#1a1715] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            <th className="py-3 px-4 font-medium">Garment & SKU</th>
            <th className="py-3 px-4 font-medium">Silhouette Fit</th>
            <th className="py-3 px-4 font-medium">Artisanal Color</th>
            <th className="py-3 px-4 font-medium">Pricing (INR)</th>
            <th className="py-3 px-4 font-medium">Stock Inventory</th>
            <th className="py-3 px-4 font-medium">Storefront</th>
            <th className="py-3 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#24201c] font-sans">
          {variants.map((v) => {
            const product = v.product || productMap.get(v.productId);
            const fit = v.fitSize || fitSizeMap.get(v.fitSizeId);
            const color = v.productColor || colorMap.get(v.productColorId);

            const colorHex = getColorHex(color?.name || '', color?.code || '');
            const hasDiscount =
              v.compareAtPrice != null && v.compareAtPrice > v.price;
            const discountPercent = hasDiscount
              ? Math.round(((v.compareAtPrice! - v.price) / v.compareAtPrice!) * 100)
              : 0;

            const isLowStock = v.stockQuantity > 0 && v.stockQuantity <= 5;
            const isOutOfStock = v.stockQuantity === 0;

            return (
              <tr
                key={v.id}
                className="hover:bg-[#191715] transition-colors group text-neutral-200"
              >
                {/* 1. Garment & SKU */}
                <td className="py-3.5 px-4 align-top">
                  <div className="space-y-1">
                    <span className="font-serif text-sm text-neutral-100 font-medium block leading-snug">
                      {product?.name || 'Unknown Product'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-wider text-[#c9a87c] bg-[#241c16] px-2 py-0.5 rounded border border-[#483727]">
                        {v.sku}
                      </span>
                      {product?.slug && (
                        <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[140px]">
                          {product.slug}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Silhouette Fit */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#211d19] text-[#c9a87c] border border-[#383028]">
                      <Scissors size={13} />
                    </span>
                    <div>
                      <span className="text-xs text-neutral-100 block font-medium">
                        {fit?.name || 'Unassigned Fit'}
                      </span>
                      {fit?.fitCode && (
                        <span className="font-mono text-[10px] uppercase text-neutral-400">
                          Code: {fit.fitCode}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 3. Artisanal Color */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-600 shrink-0 shadow-sm"
                      style={{ backgroundColor: colorHex }}
                      title={color?.name}
                    />
                    <div>
                      <span className="text-xs text-neutral-100 block font-medium">
                        {color?.name || 'Unassigned Color'}
                      </span>
                      {color?.code && (
                        <span className="font-mono text-[10px] uppercase text-neutral-400">
                          {color.code}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 4. Pricing (INR) */}
                <td className="py-3.5 px-4 align-top font-mono">
                  <div className="space-y-0.5">
                    <div className="text-sm text-neutral-100 font-medium">
                      ₹{v.price.toLocaleString('en-IN')}
                    </div>
                    {hasDiscount && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="line-through text-neutral-500">
                          ₹{v.compareAtPrice!.toLocaleString('en-IN')}
                        </span>
                        <span className="text-emerald-400 font-medium bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/40">
                          -{discountPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 5. Stock Inventory */}
                <td className="py-3.5 px-4 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-500'
                            : isLowStock
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isOutOfStock
                            ? 'text-rose-400'
                            : isLowStock
                            ? 'text-amber-300'
                            : 'text-neutral-200'
                        }`}
                      >
                        {v.stockQuantity} units
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/40">
                        In Stock
                      </span>
                    )}
                  </div>
                </td>

                {/* 6. Storefront Status */}
                <td className="py-3.5 px-4 align-top">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(v.id, v.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all ${
                      v.isActive
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/60'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:bg-neutral-800 hover:text-neutral-300'
                    }`}
                    title="Click to toggle variant storefront publication"
                  >
                    {v.isActive ? (
                      <>
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={11} className="text-neutral-500" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>
                </td>

                {/* 7. Actions */}
                <td className="py-3.5 px-4 align-top text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onViewDetail(v)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#26201b] rounded transition-colors"
                      title="View variant specifications"
                      aria-label={`View details of SKU ${v.sku}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(v)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#26201b] rounded transition-colors"
                      title="Edit variant SKU, stock, and price"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(v)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                      title="Delete variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
