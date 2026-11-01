import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  FolderTree,
  FolderGit2,
  Layers,
  Scissors,
  IndianRupee,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductStatus } from '../../../types/product.types';
import { ProductCategory } from '../../../types/productCategory.types';
import { ProductSubCategory } from '../../../types/productSubCategory.types';

interface ProductTableProps {
  products: Product[];
  categoryMap: Map<string, ProductCategory>;
  subCategoryMap: Map<string, ProductSubCategory>;
  onViewDetail: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, currentStatus: ProductStatus) => Promise<void>;
  isLoading?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categoryMap,
  subCategoryMap,
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
        <p className="text-xs tracking-wider uppercase font-mono">Loading garment catalog...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Layers size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Garments Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No products match your selected filters. Create a new garment or reset search terms.
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
              Garment / Product Name
            </th>
            <th scope="col" className="py-3.5 px-4 w-52">
              Category & Sub-Category
            </th>
            <th scope="col" className="py-3.5 px-4 w-36">
              Gender & Fit
            </th>
            <th scope="col" className="py-3.5 px-4 w-32">
              Base Price
            </th>
            <th scope="col" className="py-3.5 px-4 w-28">
              Status
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-36">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {products.map((product) => {
            const cat = product.category || categoryMap.get(product.categoryId);
            const sub =
              product.subCategory ||
              (product.subCategoryId ? subCategoryMap.get(product.subCategoryId) : undefined);

            const statusColors: Record<ProductStatus, string> = {
              ACTIVE: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300',
              DRAFT: 'bg-amber-950/70 border-amber-700/60 text-amber-300',
              INACTIVE: 'bg-neutral-900 border-neutral-700 text-neutral-400',
            };

            return (
              <tr
                key={product.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Product Image Thumbnail + Name & Short Description */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    {/* Garment Image using product.imageUrl */}
                    <div className="w-12 h-14 rounded overflow-hidden border border-[#352f2a] bg-[#191715] shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-[#161413]">
                          <ImageIcon size={16} className="text-[#c9a87c]/40" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] shrink-0" />
                        <span className="text-sm font-serif tracking-wide text-neutral-100 font-medium truncate">
                          {product.name}
                        </span>
                      </div>
                      {product.shortDescription && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-md font-sans">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category & Sub-Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-neutral-200">
                      <FolderTree size={12} className="text-[#c9a87c]" />
                      <span>{cat?.title || 'Uncategorized'}</span>
                    </div>
                    {sub && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <FolderGit2 size={11} className="text-neutral-500" />
                        <span>{sub.name}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Gender & Fit */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span className="inline-block font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#251e18] text-[#c9a87c] border border-[#483727]">
                      {product.gender}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-300">
                      <Scissors size={11} className="text-neutral-500" />
                      <span>{product.fit}</span>
                    </div>
                  </div>
                </td>

                {/* Base Price */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-mono text-sm text-[#e0cfba] font-medium">
                    <IndianRupee size={12} className="text-[#c9a87c]" />
                    <span>{product.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                </td>

                {/* Status Toggle & Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(product.id, product.status)}
                    className="cursor-pointer focus:outline-none"
                    title="Click to toggle status"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                        statusColors[product.status] || statusColors.ACTIVE
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {product.status}
                    </span>
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetail(product)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="View Product Details"
                      aria-label={`View details of ${product.name}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Product"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Product"
                      aria-label={`Delete ${product.name}`}
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
