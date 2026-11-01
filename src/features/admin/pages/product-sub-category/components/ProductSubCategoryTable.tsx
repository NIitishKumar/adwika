import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Image as ImageIcon,
  FolderTree,
  Tag,
} from 'lucide-react';
import { ProductSubCategory } from '../../../types/productSubCategory.types';
import { ProductCategory } from '../../../types/productCategory.types';
import { StatusBadge } from '../../../components/common/StatusBadge';

interface ProductSubCategoryTableProps {
  subCategories: ProductSubCategory[];
  categoryMap: Map<string, ProductCategory>;
  onEdit: (subCategory: ProductSubCategory) => void;
  onDelete: (subCategory: ProductSubCategory) => void;
  onToggleActive: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const ProductSubCategoryTable: React.FC<ProductSubCategoryTableProps> = ({
  subCategories,
  categoryMap,
  onEdit,
  onDelete,
  onToggleActive,
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
        <p className="text-xs tracking-wider uppercase font-mono">Loading sub-categories...</p>
      </div>
    );
  }

  if (subCategories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Tag size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Sub-Categories Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No product sub-categories match your filters. Create a new sub-category or adjust your query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#2e2a27] rounded-lg bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-200 divide-y divide-[#262320]">
        <thead className="bg-[#1a1817] text-[11px] uppercase tracking-wider font-mono text-[#c9a87c]">
          <tr>
            <th scope="col" className="py-3.5 px-4 w-20">
              Media
            </th>
            <th scope="col" className="py-3.5 px-4">
              Sub-Category & Slug
            </th>
            <th scope="col" className="py-3.5 px-4 w-52">
              Parent Category
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
          {subCategories.map((sub) => {
            const hasValidImage = sub.imageUrl && !imageErrors[sub.id];

            // Resolve parent category
            const parentCat =
              sub.category || categoryMap.get(sub.categoryId);
            const parentTitle = parentCat?.title || 'Unassigned';

            return (
              <tr
                key={sub.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Media Thumbnail */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="w-11 h-11 rounded-md overflow-hidden bg-[#1c1a18] border border-[#38322c] flex items-center justify-center shrink-0 shadow-inner">
                    {hasValidImage ? (
                      <img
                        src={sub.imageUrl}
                        alt={sub.name}
                        onError={() => handleImageError(sub.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-neutral-500" />
                    )}
                  </div>
                </td>

                {/* Sub-Category Name & Slug */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                      <span className="text-sm font-serif tracking-wide text-neutral-100 font-medium">
                        {sub.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                        {sub.slug}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Parent Category Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1e1b18] border border-[#3a3229]">
                    <FolderTree size={12} className="text-[#c9a87c]" />
                    <span className="font-serif text-xs text-neutral-200">
                      {parentTitle}
                    </span>
                  </div>
                </td>

                {/* Status Toggle & Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleActive(sub.id)}
                    className="cursor-pointer group/toggle focus:outline-none"
                    title="Click to toggle status"
                  >
                    <StatusBadge
                      isActive={sub.isActive}
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
                      onClick={() => onEdit(sub)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Sub-Category"
                      aria-label={`Edit ${sub.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Sub-Category"
                      aria-label={`Delete ${sub.name}`}
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
