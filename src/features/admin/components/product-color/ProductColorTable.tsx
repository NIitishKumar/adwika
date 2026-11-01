import React from 'react';
import { Edit2, Trash2, Palette } from 'lucide-react';
import { ProductColor } from '../../types/productColor.types';
import { StatusBadge } from '../common/StatusBadge';
import { getColorHex } from '../../utils/colorHelper';

interface ProductColorTableProps {
  productColors: ProductColor[];
  onEdit: (color: ProductColor) => void;
  onDelete: (color: ProductColor) => void;
  onToggleActive: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const ProductColorTable: React.FC<ProductColorTableProps> = ({
  productColors,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase font-mono">Loading artisanal swatches...</p>
      </div>
    );
  }

  if (productColors.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Palette size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Product Colors Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No color shades match your current query or filter. Add a new product color or reset filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#2e2a27] rounded-lg bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-200 divide-y divide-[#262320]">
        <thead className="bg-[#1a1817] text-[11px] uppercase tracking-wider font-mono text-[#c9a87c]">
          <tr>
            <th scope="col" className="py-3.5 px-4">
              Color Name & Swatch
            </th>
            <th scope="col" className="py-3.5 px-4 w-40">
              Color Code
            </th>
            <th scope="col" className="py-3.5 px-4 w-36">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {productColors.map((color) => {
            const swatchHex = getColorHex(color.name, color.code);

            return (
              <tr
                key={color.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Color Swatch & Name */}
                <td className="py-3.5 px-4 font-medium text-neutral-100">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: swatchHex }}
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-serif tracking-wide block truncate">
                        {color.name}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Color Code */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs tracking-wider px-2.5 py-1 rounded bg-[#211d19] border border-[#3a3229] text-[#e0cfba] font-medium">
                    {color.code}
                  </span>
                </td>

                {/* Status Toggle & Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleActive(color.id)}
                    className="cursor-pointer group/toggle focus:outline-none"
                    title="Click to toggle status"
                  >
                    <StatusBadge
                      isActive={color.isActive}
                      size="sm"
                      className="group-hover/toggle:border-neutral-400 transition-colors"
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(color)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Product Color"
                      aria-label={`Edit ${color.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(color)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Product Color"
                      aria-label={`Delete ${color.name}`}
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
