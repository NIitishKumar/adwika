import React from 'react';
import {
  Edit2,
  Trash2,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProductAttribute } from '../../../types/productAttribute.types';
import { Product } from '../../../types/product.types';

interface ProductAttributeTableProps {
  attributes: ProductAttribute[];
  productMap: Map<string, Product>;
  onEdit: (attribute: ProductAttribute) => void;
  onDelete: (attribute: ProductAttribute) => void;
  isLoading?: boolean;
}

export const ProductAttributeTable: React.FC<ProductAttributeTableProps> = ({
  attributes,
  productMap,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs tracking-wider uppercase font-mono">Loading product attributes...</p>
      </div>
    );
  }

  if (attributes.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <Tag size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Product Attributes Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No garment specifications match your filters. Add a new attribute or reset search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#2e2a27] rounded-lg bg-[#141414] shadow-xl">
      <table className="w-full text-left text-sm text-neutral-200 divide-y divide-[#262320]">
        <thead className="bg-[#1a1817] text-[11px] uppercase tracking-wider font-mono text-[#c9a87c]">
          <tr>
            <th scope="col" className="py-3.5 px-4 w-72">
              Garment / Product
            </th>
            <th scope="col" className="py-3.5 px-4 w-48">
              Attribute Name
            </th>
            <th scope="col" className="py-3.5 px-4">
              Attribute Value / Specification
            </th>
            <th scope="col" className="py-3.5 px-4 w-32">
              Recorded
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {attributes.map((attr) => {
            const prod = attr.product || productMap.get(attr.productId);
            const prodName = prod?.name || 'Unassigned Product';
            const prodSlug = prod?.slug || '';

            return (
              <tr
                key={attr.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Product Reference */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers size={13} className="text-[#c9a87c] shrink-0" />
                      <span className="font-serif text-xs text-neutral-100 font-medium line-clamp-1">
                        {prodName}
                      </span>
                    </div>
                    {prodSlug && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2] inline-block">
                        {prodSlug}
                      </span>
                    )}
                  </div>
                </td>

                {/* Attribute Name / Key */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#271f18] border border-[#483727] text-[#e0cfba] font-mono text-xs font-medium">
                    <Sparkles size={11} className="text-[#c9a87c]" />
                    <span>{attr.name}</span>
                  </span>
                </td>

                {/* Attribute Value */}
                <td className="py-3.5 px-4">
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    {attr.value}
                  </p>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                  {attr.createdAt
                    ? new Date(attr.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(attr)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Attribute"
                      aria-label={`Edit ${attr.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(attr)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Attribute"
                      aria-label={`Delete ${attr.name}`}
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
