import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Layers,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { ProductImage } from '../../../types/productImage.types';
import { Product } from '../../../types/product.types';

interface ProductImageTableProps {
  images: ProductImage[];
  productMap: Map<string, Product>;
  onEdit: (image: ProductImage) => void;
  onDelete: (image: ProductImage) => void;
  onTogglePrimary: (id: string, productId: string) => Promise<void>;
  onMoveOrder?: (id: string, direction: 'up' | 'down') => void;
  isLoading?: boolean;
}

export const ProductImageTable: React.FC<ProductImageTableProps> = ({
  images,
  productMap,
  onEdit,
  onDelete,
  onTogglePrimary,
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
        <p className="text-xs tracking-wider uppercase font-mono">Loading product gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
        <div className="w-12 h-12 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-3">
          <ImageIcon size={20} />
        </div>
        <h4 className="font-serif text-base text-neutral-200">No Product Images Found</h4>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          No garment images match your filters. Add a high-resolution image or reset filters.
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
            <th scope="col" className="py-3.5 px-4 w-24">
              Preview
            </th>
            <th scope="col" className="py-3.5 px-4">
              Alt Text & URL
            </th>
            <th scope="col" className="py-3.5 px-4 w-60">
              Garment / Product
            </th>
            <th scope="col" className="py-3.5 px-4 w-36 text-center">
              Cover Status
            </th>
            <th scope="col" className="py-3.5 px-4 text-right w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#22201d] font-sans text-xs">
          {images.map((image, index) => {
            const hasValidImage = image.imageUrl && !imageErrors[image.id];
            const prod = image.product || productMap.get(image.productId);
            const prodName = prod?.name || 'Unassigned Garment';
            const prodSlug = prod?.slug || '';

            return (
              <tr
                key={image.id}
                className="hover:bg-[#1c1a18] transition-colors group"
              >
                {/* Display Order */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                      #{image.displayOrder}
                    </span>
                    {onMoveOrder && (
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onMoveOrder(image.id, 'up')}
                          disabled={index === 0}
                          title="Move Priority Up"
                          className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveOrder(image.id, 'down')}
                          disabled={index === images.length - 1}
                          title="Move Priority Down"
                          className="text-neutral-400 hover:text-white disabled:opacity-20 p-0.5"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* Media Preview */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="relative w-14 h-16 rounded-md overflow-hidden bg-[#1c1a18] border border-[#38322c] flex items-center justify-center shrink-0 shadow-inner group/img">
                    {hasValidImage ? (
                      <>
                        <img
                          src={image.imageUrl}
                          alt={image.altText || 'Garment preview'}
                          onError={() => handleImageError(image.id)}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                        />
                        <a
                          href={image.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white"
                          title="Open original image"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </>
                    ) : (
                      <ImageIcon size={18} className="text-neutral-500" />
                    )}
                  </div>
                </td>

                {/* Alt Text & URL */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-100 font-medium font-sans line-clamp-1">
                      {image.altText || 'No descriptive alt text provided'}
                    </p>
                    <p className="font-mono text-[10px] text-neutral-400 truncate max-w-md">
                      {image.imageUrl}
                    </p>
                  </div>
                </td>

                {/* Target Garment Product */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-200">
                      <Layers size={13} className="text-[#c9a87c] shrink-0" />
                      <span className="font-serif line-clamp-1">{prodName}</span>
                    </div>
                    {prodSlug && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2] inline-block">
                        {prodSlug}
                      </span>
                    )}
                  </div>
                </td>

                {/* Primary Cover Status */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => onTogglePrimary(image.id, image.productId)}
                    className="cursor-pointer focus:outline-none"
                    title={image.isPrimary ? 'Primary Cover Photo' : 'Click to set as primary cover'}
                  >
                    {image.isPrimary ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-950/80 border border-amber-600/70 text-amber-300 shadow-sm">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#1c1a18] border border-[#38322c] text-neutral-400 hover:text-white hover:border-[#c9a87c] transition-colors">
                        <Star size={11} className="opacity-40" />
                        <span>Set Cover</span>
                      </span>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(image)}
                      className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors"
                      title="Edit Image"
                      aria-label="Edit image details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(image)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete Image"
                      aria-label="Delete image"
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
