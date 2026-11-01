import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Eye,
  Edit2,
  Calendar,
  Clock,
  FolderTree,
  FolderGit2,
  Scissors,
  IndianRupee,
  Copy,
  Check,
  Globe,
  Tag,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Camera,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductStatus } from '../../../types/product.types';
import { ProductCategory } from '../../../types/productCategory.types';
import { ProductSubCategory } from '../../../types/productSubCategory.types';
import { ProductImage } from '../../../types/productImage.types';
import { productImageService } from '../../../services/productImage.service';

export interface GalleryPhotoItem {
  id: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
  isCover?: boolean;
  source: 'product-images-api' | 'product-cover' | 'product-gallery';
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (product: Product) => void;
  categoryMap?: Map<string, ProductCategory>;
  subCategoryMap?: Map<string, ProductSubCategory>;
  initialImages?: ProductImage[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  isLoading = false,
  error = null,
  onEdit,
  categoryMap,
  subCategoryMap,
  initialImages,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Photo Gallery States
  const [apiImages, setApiImages] = useState<ProductImage[]>(initialImages || []);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [imagesFromApi, setImagesFromApi] = useState<boolean>(false);

  // Fetch product images from GET /api/v1/product-images?productId=:id
  const loadGalleryImages = useCallback(async (targetProduct: Product) => {
    const targetId =
      targetProduct.id ||
      targetProduct.productId ||
      targetProduct.uniqueId ||
      '';
    if (!targetId) return;

    setIsLoadingImages(true);
    try {
      const res = await productImageService.getByProductId(targetId);
      setApiImages(res.data);
      setImagesFromApi(res.fromApi);
      setActivePhotoIndex(0);
    } catch (err) {
      console.error('Failed to fetch product images from API:', err);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && product) {
      loadGalleryImages(product);
    } else {
      setApiImages([]);
      setActivePhotoIndex(0);
      setIsLightboxOpen(false);
    }
  }, [isOpen, product, loadGalleryImages]);

  // Aggregate all unique gallery photos (from /product-images, product.imageUrl, and product.images)
  const allGalleryPhotos = useMemo<GalleryPhotoItem[]>(() => {
    const items: GalleryPhotoItem[] = [];
    const seenUrls = new Set<string>();

    // 1. Add images from /api/v1/product-images (sorted by displayOrder)
    apiImages.forEach((img) => {
      const url = (img.imageUrl || '').trim();
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({
          id: img.id,
          imageUrl: url,
          altText: img.altText || product?.name || 'Garment photograph',
          displayOrder: img.displayOrder,
          isPrimary: Boolean(img.isPrimary),
          source: 'product-images-api',
        });
      }
    });

    // 2. Add product.imageUrl as cover image if not already included
    if (product?.imageUrl && !seenUrls.has(product.imageUrl)) {
      seenUrls.add(product.imageUrl);
      items.unshift({
        id: 'cover-image',
        imageUrl: product.imageUrl,
        altText: `${product.name} (Primary Cover)`,
        displayOrder: 0,
        isPrimary: true,
        isCover: true,
        source: 'product-cover',
      });
    }

    // 3. Add any images in product.images if provided
    if (Array.isArray(product?.images)) {
      product.images.forEach((img: any, idx: number) => {
        const url = (img.imageUrl || img.url || '').trim();
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          items.push({
            id: img.id || `extra-${idx}`,
            imageUrl: url,
            altText: img.altText || product.name,
            displayOrder: Number(img.displayOrder ?? idx + 1),
            isPrimary: Boolean(img.isPrimary),
            source: 'product-gallery',
          });
        }
      });
    }

    // Sort: primary first, then displayOrder
    return items.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.displayOrder - b.displayOrder;
    });
  }, [apiImages, product?.imageUrl, product?.images, product?.name]);

  // Keep activePhotoIndex within bounds
  const currentPhotoIndex =
    allGalleryPhotos.length > 0
      ? Math.min(activePhotoIndex, allGalleryPhotos.length - 1)
      : 0;

  const currentPhoto = allGalleryPhotos[currentPhotoIndex] || null;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allGalleryPhotos.length <= 1) return;
    setActivePhotoIndex((prev) =>
      prev <= 0 ? allGalleryPhotos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allGalleryPhotos.length <= 1) return;
    setActivePhotoIndex((prev) =>
      prev >= allGalleryPhotos.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldKey ? null : curr));
    }, 2000);
  };

  const statusColors: Record<ProductStatus, { bg: string; text: string; dot: string }> = {
    ACTIVE: {
      bg: 'bg-emerald-950/70 border-emerald-700/60',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
    },
    DRAFT: {
      bg: 'bg-amber-950/70 border-amber-700/60',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
    },
    INACTIVE: {
      bg: 'bg-neutral-900 border-neutral-700',
      text: 'text-neutral-400',
      dot: 'bg-neutral-500',
    },
  };

  const cat =
    product?.category ||
    (product?.categoryId && categoryMap ? categoryMap.get(product.categoryId) : undefined);
  const sub =
    product?.subCategory ||
    (product?.subCategoryId && subCategoryMap ? subCategoryMap.get(product.subCategoryId) : undefined);

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

  const displayId = product?.uniqueId || product?.productId || product?.id || '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#141414] border border-[#2e2a27] rounded-lg shadow-2xl overflow-hidden text-neutral-100 animate-scaleIn">
          {/* Header Ribbon */}
          <div className="px-5 sm:px-6 py-4 border-b border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
                <Eye size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg tracking-wide text-neutral-100">
                    Product Details & Photo Gallery
                  </h3>
                  {displayId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(displayId, 'header-id')}
                      title="Click to copy Product ID"
                      className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2] hover:border-[#c9a87c] transition-colors"
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
                  Garment specifications, live photo gallery from /api/v1/product-images, and category taxonomy.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && product && !isLoading && (
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25201b] hover:bg-[#342a22] text-[#e0cfba] border border-[#483727] rounded text-xs transition-colors"
                  title="Edit this product"
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
            {isLoading && !product && (
              <div className="py-16 text-center text-neutral-400">
                <div className="w-9 h-9 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs tracking-wider uppercase font-mono text-[#c9a87c]">
                  Loading garment specifications...
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Fetching details from <code className="font-mono text-neutral-400">/api/v1/products/:id</code>
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-rose-300">Notice:</p>
                  <p className="mt-0.5 text-neutral-300">{error}</p>
                </div>
              </div>
            )}

            {product && (
              <>
                {/* Product Hero Card */}
                <div className="p-5 rounded-lg bg-[#181615] border border-[#2b2723] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Garment Image using product.imageUrl or first gallery photo */}
                      {(product.imageUrl || currentPhoto?.imageUrl) && (
                        <div
                          onClick={() => {
                            if (allGalleryPhotos.length > 0) {
                              setIsLightboxOpen(true);
                            }
                          }}
                          className="w-24 sm:w-28 h-32 sm:h-36 rounded-md overflow-hidden border border-[#3a3026] shadow-xl shrink-0 bg-[#121110] relative group cursor-pointer"
                          title="Click to view full photo in gallery"
                        >
                          <img
                            src={product.imageUrl || currentPhoto?.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 size={16} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                              statusColors[product.status]?.bg || 'bg-neutral-900 border-neutral-700'
                            } ${statusColors[product.status]?.text || 'text-neutral-300'}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                statusColors[product.status]?.dot || 'bg-neutral-400'
                              }`}
                            />
                            {product.status}
                          </span>

                          <span className="inline-block font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#251e18] text-[#c9a87c] border border-[#483727]">
                            {product.gender}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#201d1a] text-neutral-300 border border-[#352f2a]">
                            <Scissors size={11} className="text-[#c9a87c]" />
                            {product.fit}
                          </span>
                        </div>

                        <h2 className="font-serif text-xl sm:text-2xl text-neutral-100 font-normal tracking-tight break-words">
                          {product.name}
                        </h2>

                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          <span className="text-[11px] text-neutral-500 font-mono">Slug:</span>
                          <code className="font-mono text-[11px] text-[#d6c7b2] bg-[#121110] px-2 py-0.5 rounded border border-[#2a241e]">
                            {product.slug}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(product.slug, 'slug')}
                            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                            title="Copy slug"
                          >
                            {copiedField === 'slug' ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Base Price Callout */}
                    <div className="sm:text-right shrink-0 p-3 sm:p-4 rounded-lg bg-[#201c18] border border-[#3a3026]">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#c9a87c] block mb-0.5">
                        Base Retail Price
                      </span>
                      <div className="flex items-center sm:justify-end gap-1 font-mono text-xl sm:text-2xl text-[#f3e7d6] font-medium">
                        <IndianRupee size={18} className="text-[#c9a87c]" />
                        <span>{product.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block mt-0.5 font-sans">
                        INR • Excl. Taxes
                      </span>
                    </div>
                  </div>

                  {product.shortDescription && (
                    <p className="text-xs text-neutral-300 italic border-l-2 border-[#c9a87c] pl-3 py-1 font-serif">
                      "{product.shortDescription}"
                    </p>
                  )}
                </div>

                {/* ==========================================================================
                    HAUTE-COUTURE PHOTO GALLERY (Powered by /api/v1/product-images)
                    ========================================================================== */}
                <div className="p-4 sm:p-5 rounded-lg bg-[#181615] border border-[#2b2723] space-y-4">
                  {/* Photo Gallery Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#26221f]">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded bg-[#2a221b] text-[#c9a87c] border border-[#4a3a2c]">
                        <Camera size={15} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm tracking-wide text-neutral-100 font-medium">
                            Garment Photo Gallery
                          </h4>
                          {imagesFromApi && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-950/70 text-[9px] font-mono uppercase text-emerald-300 border border-emerald-700/60">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              API Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Endpoint: <code className="text-[#c9a87c]">GET /api/v1/product-images?productId={displayId}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[#201d1a] border border-[#352f2a] text-[#d6c7b2]">
                        {allGalleryPhotos.length}{' '}
                        {allGalleryPhotos.length === 1 ? 'Photograph' : 'Photographs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => product && loadGalleryImages(product)}
                        disabled={isLoadingImages}
                        className="p-1.5 text-neutral-400 hover:text-[#c9a87c] hover:bg-[#25201b] rounded transition-colors border border-[#352f2a]"
                        title="Reload images from /product-images API"
                      >
                        <RefreshCw
                          size={13}
                          className={isLoadingImages ? 'animate-spin text-[#c9a87c]' : ''}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Photo Gallery Body */}
                  {isLoadingImages && allGalleryPhotos.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                      <div className="w-7 h-7 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-[11px] font-mono tracking-wider uppercase text-[#c9a87c]">
                        Fetching photographs from /api/v1/product-images...
                      </p>
                    </div>
                  ) : allGalleryPhotos.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#332f2c] rounded-lg bg-[#141312]">
                      <div className="w-10 h-10 rounded-full bg-[#241e19] text-[#c9a87c] border border-[#44372c] flex items-center justify-center mx-auto mb-2">
                        <ImageIcon size={18} />
                      </div>
                      <p className="font-serif text-sm text-neutral-300">No Photographs Attached</p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto font-sans">
                        No product images found for ID <code className="font-mono text-neutral-400">{displayId}</code> via <code className="font-mono text-neutral-400">/api/v1/product-images</code>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Active Showcase Stage */}
                      <div className="relative rounded-lg overflow-hidden border border-[#3a3026] bg-[#0c0b0a] aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group shadow-2xl">
                        {currentPhoto ? (
                          <img
                            src={currentPhoto.imageUrl}
                            alt={currentPhoto.altText || product.name}
                            className="w-full h-full object-contain sm:object-cover transition-transform duration-500"
                          />
                        ) : null}

                        {/* Top Badges & Controls Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            {currentPhoto?.isPrimary && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/85 text-[#c9a87c] text-[10px] font-mono uppercase tracking-wider border border-[#c9a87c]/40 shadow-lg backdrop-blur-sm font-medium">
                                <Star size={10} className="fill-[#c9a87c]" />
                                Primary Photo
                              </span>
                            )}
                            {currentPhoto?.isCover && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/85 text-emerald-300 text-[10px] font-mono uppercase tracking-wider border border-emerald-600/40 shadow-lg backdrop-blur-sm">
                                Cover Image
                              </span>
                            )}
                            <span className="px-2 py-1 rounded bg-black/75 text-neutral-300 text-[10px] font-mono border border-neutral-700/60 shadow-lg backdrop-blur-sm">
                              Order #{currentPhoto?.displayOrder ?? currentPhotoIndex + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <span className="px-2 py-1 rounded bg-black/75 text-neutral-300 text-[10px] font-mono border border-neutral-700/60 shadow-lg backdrop-blur-sm">
                              {currentPhotoIndex + 1} / {allGalleryPhotos.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsLightboxOpen(true)}
                              className="p-1.5 rounded bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700/60 hover:border-[#c9a87c] transition-colors shadow-lg backdrop-blur-sm"
                              title="Expand in High-Res Lightbox"
                            >
                              <Maximize2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        {allGalleryPhotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePrevPhoto}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700/60 hover:border-[#c9a87c] transition-all shadow-xl backdrop-blur-sm"
                              title="Previous photograph"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={handleNextPhoto}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-neutral-300 hover:text-white border border-neutral-700/60 hover:border-[#c9a87c] transition-all shadow-xl backdrop-blur-sm"
                              title="Next photograph"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}

                        {/* Bottom Caption Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-baseline justify-between gap-3 text-xs">
                          <p className="text-neutral-200 font-sans text-xs truncate drop-shadow-md">
                            {currentPhoto?.altText || product.name}
                          </p>
                          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                            Source:{' '}
                            <span className="text-[#c9a87c]">
                              {currentPhoto?.source === 'product-images-api'
                                ? '/product-images'
                                : 'Cover Photo'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Interactive Thumbnails Filmstrip */}
                      {allGalleryPhotos.length > 1 && (
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                          {allGalleryPhotos.map((photo, idx) => {
                            const isSelected = idx === currentPhotoIndex;
                            return (
                              <button
                                key={photo.id || idx}
                                type="button"
                                onClick={() => setActivePhotoIndex(idx)}
                                className={`relative shrink-0 w-16 sm:w-20 h-20 sm:h-24 rounded-md overflow-hidden border transition-all ${
                                  isSelected
                                    ? 'border-[#c9a87c] ring-2 ring-[#c9a87c]/50 scale-105 shadow-lg'
                                    : 'border-[#2e2a27] hover:border-[#4d3a2b] opacity-75 hover:opacity-100'
                                }`}
                                title={photo.altText || `Photograph ${idx + 1}`}
                              >
                                <img
                                  src={photo.imageUrl}
                                  alt={photo.altText || `Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {photo.isPrimary && (
                                  <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#c9a87c] ring-1 ring-black" />
                                )}
                                <span className="absolute bottom-0.5 right-0.5 font-mono text-[8px] px-1 rounded bg-black/80 text-neutral-300">
                                  #{photo.displayOrder ?? idx + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Taxonomy & Hierarchy Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Card */}
                  <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                      <FolderTree size={13} />
                      <span>Primary Collection / Category</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      {cat?.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.title}
                          className="w-10 h-10 rounded object-cover border border-[#352f2a]"
                        />
                      )}
                      <div>
                        <p className="font-serif text-sm text-neutral-100 font-medium">
                          {cat?.title || 'Uncategorized'}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          ID: {product.categoryId || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Category Card */}
                  <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                      <FolderGit2 size={13} />
                      <span>Sub-Category / Silhouette Line</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      {sub?.imageUrl && (
                        <img
                          src={sub.imageUrl}
                          alt={sub.name}
                          className="w-10 h-10 rounded object-cover border border-[#352f2a]"
                        />
                      )}
                      <div>
                        <p className="font-serif text-sm text-neutral-100 font-medium">
                          {sub?.name || 'No Sub-Category Assigned'}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          Slug: {sub?.slug || product.subCategoryId || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Editorial Description */}
                {product.description && (
                  <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                      <Sparkles size={13} />
                      <span>Craftsmanship & Editorial Description</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-line pt-1">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* SEO Specifications & Search Preview */}
                <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                    <Globe size={13} />
                    <span>Search Engine Optimization (SEO) Meta</span>
                  </div>

                  {/* Google Search Snippet Simulation */}
                  <div className="p-3.5 rounded bg-[#100f0e] border border-[#292420] space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                      Google SERP Preview
                    </span>
                    <div className="text-[11px] font-mono text-emerald-400 truncate">
                      https://adwika.com/products/{product.slug}
                    </div>
                    <h4 className="text-sm text-[#8ab4f8] hover:underline cursor-pointer font-sans truncate">
                      {product.metaTitle || `${product.name} | Adwika Haute Couture`}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-2 font-sans pt-0.5">
                      {product.metaDescription ||
                        product.shortDescription ||
                        'Discover luxury handcrafted Indian couture, tailored silhouettes, and artisanal textiles at Adwika.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                        Meta Title
                      </span>
                      <p className="text-neutral-200 bg-[#121110] p-2 rounded border border-[#292420] text-xs">
                        {product.metaTitle || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                        Meta Description
                      </span>
                      <p className="text-neutral-200 bg-[#121110] p-2 rounded border border-[#292420] text-xs">
                        {product.metaDescription || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optional Variants Table (if provided by API) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="p-4 rounded-lg bg-[#181615] border border-[#2b2723] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#c9a87c]">
                        <Tag size={13} />
                        <span>Garment Variants & Stock</span>
                      </div>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {product.variants.length} variant(s)
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#292420] rounded bg-[#100f0e]">
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-[#191715] text-[10px] uppercase font-mono text-[#c9a87c] border-b border-[#292420]">
                          <tr>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Size / Fit</th>
                            <th className="py-2 px-3">Color</th>
                            <th className="py-2 px-3">Price</th>
                            <th className="py-2 px-3">Stock</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#221f1c] font-sans text-xs">
                          {product.variants.map((v: any, idx: number) => (
                            <tr key={v.id || v.sku || idx} className="hover:bg-[#181513]">
                              <td className="py-2 px-3 font-mono text-[11px] text-neutral-200">
                                {v.sku || '—'}
                              </td>
                              <td className="py-2 px-3">
                                {v.fitSize?.name || v.size || '—'}
                              </td>
                              <td className="py-2 px-3">
                                {v.productColor?.name || v.color || '—'}
                              </td>
                              <td className="py-2 px-3 font-mono text-[#e0cfba]">
                                ₹{(v.price ?? product.basePrice).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 font-mono">
                                {v.stockQuantity ?? v.stock ?? '—'}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                                    v.isActive !== false
                                      ? 'bg-emerald-950/60 text-emerald-400'
                                      : 'bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  {v.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* System Audit Timestamps */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded bg-[#100f0e] border border-[#24201c] text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#c9a87c]" />
                    <span>Created: {formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#c9a87c]" />
                    <span>Updated: {formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-[#2e2a27] flex items-center justify-between bg-[#191817] shrink-0">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
              <span>Endpoints:</span>
              <code className="text-[#c9a87c]">/products/:id</code>
              <span className="text-neutral-600">•</span>
              <code className="text-[#c9a87c]">/product-images</code>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#38332d] hover:bg-[#25201b] text-neutral-200 rounded text-xs font-sans transition-colors"
              >
                Close
              </button>
              {onEdit && product && (
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="px-4 py-2 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-colors flex items-center gap-1.5"
                >
                  <Edit2 size={13} />
                  <span>Edit Garment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Lightbox Modal for High-Resolution Inspection */}
      {isLightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between py-3 text-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm text-neutral-100">
                {product?.name}
              </span>
              <span className="font-mono text-xs text-[#c9a87c]">
                ({currentPhotoIndex + 1} / {allGalleryPhotos.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Large Image Showcase */}
          <div
            className="relative max-w-5xl max-h-[82vh] flex items-center justify-center overflow-hidden rounded-lg border border-[#352f2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.imageUrl}
              alt={currentPhoto.altText || product?.name}
              className="max-h-[80vh] max-w-full object-contain"
            />

            {allGalleryPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-neutral-700 transition-colors"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-neutral-700 transition-colors"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Caption */}
          <div
            className="mt-3 text-center text-xs text-neutral-300 max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-sans">{currentPhoto.altText || product?.name}</p>
          </div>
        </div>
      )}
    </>
  );
};
