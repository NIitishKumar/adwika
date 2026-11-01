import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { ProductCategory } from '../../types/productCategory.types';
import { StatusBadge } from '../../components/common/StatusBadge';

interface ProductCategoryTableProps {
  categories: ProductCategory[];
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onToggleActive: (id: string) => Promise<void>;
  onMoveOrder?: (id: string, direction: 'up' | 'down') => void;
  isLoading?: boolean;
}

export const ProductCategoryTable: React.FC<ProductCategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveOrder,
  isLoading = false,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase font-mono">Loading product categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Layers size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Product Categories Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No categories match your search or filter criteria. Create a new collection or reset filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#2e2a27] rounded-lg bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-200 divide-y divide-[#262320]">
        <thead className="bg-[#1a1817] text-[11px] uppercase tracking-wider font-mono text-[#c9a87c]">
          <tr>
            <th scope="col" className="py-3.5 px-4 w-28">
              Order
            </th>
            <th scope="col" className="py-3.5 px-4 w-20">
              Media
            </th>
            <th scope="col" className="py-3.5 px-4">
              Category & Description
            </th>
            <th scope="col" className="py-3.5 px-4 w-40">
              Slug / ID
            </th>
            <th scope="col" className="py-3.5 px-4 w-32">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {categories.map((cat, index) => {
            const hasValidImage = cat.imageUrl && !imageErrors[cat.id];

            return (
              <tr
                key={cat.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Order with reorder arrows */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                      #{cat.orderBy}
                    </span>
                    {onMoveOrder && (
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onMoveOrder(cat.id, 'up')}
                          disabled={index === 0}
                          title="Move Priority Up"
                          className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveOrder(cat.id, 'down')}
                          disabled={index === categories.length - 1}
                          title="Move Priority Down"
                          className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* Media Thumbnail */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="w-11 h-11 rounded-md overflow-hidden bg-[#1c1a18] border border-[#38322c] flex items-center justify-center shrink-0 shadow-inner">
                    {hasValidImage ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.title}
                        onError={() => handleImageError(cat.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-neutral-500" />
                    )}
                  </div>
                </td>

                {/* Title & Description */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                      <span className="text-sm font-serif tracking-wide text-neutral-100 font-medium">
                        {cat.title}
                      </span>
                      {cat.bannerImageUrl && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#483727]">
                          Banner Set
                        </span>
                      )}
                    </div>
                    {cat.description ? (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-md font-sans">
                        {cat.description}
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-600 italic">No description provided</p>
                    )}
                  </div>
                </td>

                {/* Slug / ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#201d1a] border border-[#3a3229] text-[#e0cfba] font-medium">
                    {cat.categoryId}
                  </span>
                </td>

                {/* Status Toggle & Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleActive(cat.id)}
                    className="cursor-pointer group/toggle focus:outline-none"
                    title="Click to toggle status"
                  >
                    <StatusBadge
                      isActive={cat.isActive}
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
                      onClick={() => onEdit(cat)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Category"
                      aria-label={`Edit ${cat.title}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(cat)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Category"
                      aria-label={`Delete ${cat.title}`}
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
