import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CurrencyConfig, CartItem, Product } from '@/types';
import { ProductCard } from '../ProductCard';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Check,
  ArrowLeft,
  Bell,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ShoppingBag,
  Award,
  Truck,
  Box,
  Loader2,
} from 'lucide-react';
import { productService } from '@/features/admin/services/product.service';
import { productImageService } from '@/features/admin/services/productImage.service';
import { productVariantService } from '@/features/admin/services/productVariant.service';
import { ProductVariant } from '@/features/admin/types/productVariant.types';
import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';
import { useCartStore } from '@/stores';
import { isLoggedIn, getCurrentUser } from '@/config/auth.config';
import { showToast } from '@/config/toast.config';
import { NotifyMeModal } from '@/features/stock-notifications';
import { ProductReviewsSection, RatingStars } from '@/features/reviews';

interface ProductDetailPageProps {
  currency: CurrencyConfig;
  onAddToCart?: (product: Product, size: CartItem['size'], variantId?: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  currency,
  onAddToCart: _onAddToCart,
  onQuickView,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [liveRelated, setLiveRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState<boolean>(false);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('craft');
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsRetrying(true);
    setError(null);
    try {
      const res = await productService.getById(id);
      if (!res.data) {
        throw new Error('Garment details not found in database.');
      }

      const p = res.data;
      let images: string[] = p.imageUrl ? [p.imageUrl] : [];

      if (Array.isArray((p as any).images)) {
        (p as any).images.forEach((img: any) => {
          const url = typeof img === 'string' ? img : img?.imageUrl || img?.url;
          if (url && !images.includes(url)) {
            images.push(url);
          }
        });
      }

      // 1. Fetch gallery images
      const possibleIds = [p.productId, p.id, p.uniqueId, id].filter(Boolean) as string[];
      for (const pid of Array.from(new Set(possibleIds))) {
        try {
          const galleryRes = await productImageService.getByProductId(pid);
          if (galleryRes.data && galleryRes.data.length > 0) {
            const apiUrls = galleryRes.data.map((img) => img.imageUrl).filter(Boolean);
            if (apiUrls.length > 0) {
              images = Array.from(new Set([...images, ...apiUrls]));
            }
          }
        } catch {
          // Optional gallery fetch
        }
      }

      // 2. Fetch product variants from API: GET /api/v1/product-variants?productId=:id
      const targetProductId = p.id || p.productId || p.uniqueId || id;
      setIsLoadingVariants(true);
      try {
        const variantRes = await productVariantService.getAll(targetProductId);
        if (variantRes.data && variantRes.data.length > 0) {
          setVariants(variantRes.data);

          // Auto-select initial variant's color and size
          const firstActive = variantRes.data.find((v) => v.isActive) || variantRes.data[0];
          if (firstActive) {
            const colId = firstActive.productColorId || firstActive.productColor?.id;
            if (colId) setSelectedColorId(colId);
            const sz = firstActive.fitSize?.fitCode || firstActive.fitSize?.name;
            if (sz) setSelectedSize(sz);
          }
        } else {
          setVariants([]);
        }
      } catch (err) {
        console.error('Failed to fetch product variants:', err);
        setVariants([]);
      } finally {
        setIsLoadingVariants(false);
      }

      const primaryImg = images[0] || p.imageUrl || '/images/default-garment.jpg';
      setGalleryImages(images);
      setActiveImage(primaryImg);

      const fabricDescription =
        (p as any).fabric || 'Handloom Tussar & Mulberry Silk';
      const craftDetailsList = [
        p.fit ? `Silhouette: ${p.fit}` : null,
        p.subCategory?.name ? `Atelier Collection: ${p.subCategory.name}` : null,
        p.category?.title ? `Master Archive: ${p.category.title}` : null,
        'Hand-spun and woven on traditional pit looms',
        'Natural AZO-free botanical dye bath & fine needlework',
      ].filter(Boolean) as string[];

      setProduct({
        id: p.slug || p.id,
        name: p.name,
        subtitle: p.shortDescription || p.category?.title || 'Heirloom Garment',
        category: (p.category?.title?.toUpperCase() || 'KURTIS') as any,
        priceINR: p.basePrice || 0,
        priceUSD: Math.round((p.basePrice || 0) / 85),
        image: primaryImg,
        secondaryImage: images[1] || primaryImg,
        description: p.description || p.shortDescription || '',
        craftDetails: craftDetailsList,
        fabric: fabricDescription,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
      });

      // 3. Fetch live related products
      try {
        const relatedRes = await productService.getAll({ status: 'ACTIVE' });
        if (relatedRes.data && relatedRes.data.length > 0) {
          const mappedRelated: Product[] = relatedRes.data
            .filter((item) => (item.slug || item.id) !== id && item.id !== id)
            .slice(0, 3)
            .map((rp) => ({
              id: rp.slug || rp.id,
              name: rp.name,
              subtitle: rp.shortDescription || rp.category?.title || 'Heirloom Piece',
              category: (rp.category?.title?.toUpperCase() || 'KURTIS') as any,
              priceINR: rp.basePrice || 0,
              priceUSD: Math.round((rp.basePrice || 0) / 85),
              image: rp.imageUrl || '/images/default.jpg',
              description: rp.description || rp.shortDescription || '',
              craftDetails: [`Fit: ${rp.fit}`],
              fabric: rp.fit || 'Mulberry Silk',
              sizes: ['XS', 'S', 'M', 'L', 'XL'],
            }));
          setLiveRelated(mappedRelated);
        } else {
          setLiveRelated([]);
        }
      } catch {
        setLiveRelated([]);
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'We were unable to locate this garment in the archive. The piece may have been removed or the connection failed.'
      );
      setProduct(null);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Derived unique colors from variants API
  const availableColors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    variants.forEach((v) => {
      const colId = v.productColorId || v.productColor?.id;
      if (colId && !map.has(colId)) {
        map.set(colId, {
          id: colId,
          name: v.productColor?.name || 'Artisanal Hue',
          code: v.productColor?.code || '#1A1A1A',
        });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  // Derived available fit sizes strictly for the currently selected colorway
  const availableSizes = useMemo(() => {
    if (variants.length === 0) {
      return [];
    }

    // Filter variants that belong strictly to the currently selected color
    const variantsForColor = selectedColorId
      ? variants.filter(
          (v) =>
            v.productColorId === selectedColorId ||
            v.productColor?.id === selectedColorId ||
            v.productColor?.uniqueId === selectedColorId
        )
      : variants;

    const source = variantsForColor.length > 0 ? variantsForColor : variants;

    const sizeMap = new Map<string, { size: string; displayOrder: number }>();
    source.forEach((v) => {
      const sz = v.fitSize?.fitCode || v.fitSize?.name;
      if (sz && !sizeMap.has(sz)) {
        sizeMap.set(sz, {
          size: sz,
          displayOrder: v.fitSize?.displayOrder ?? 0,
        });
      }
    });

    if (sizeMap.size > 0) {
      return Array.from(sizeMap.values())
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((x) => x.size);
    }

    return [];
  }, [variants, selectedColorId]);

  // Active variant matching selected color & size
  const activeVariant = useMemo(() => {
    if (variants.length === 0) return null;

    const variantsForColor = selectedColorId
      ? variants.filter(
          (v) =>
            v.productColorId === selectedColorId ||
            v.productColor?.id === selectedColorId ||
            v.productColor?.uniqueId === selectedColorId
        )
      : variants;

    const pool = variantsForColor.length > 0 ? variantsForColor : variants;

    return (
      pool.find(
        (v) => v.fitSize?.fitCode === selectedSize || v.fitSize?.name === selectedSize
      ) ||
      pool.find((v) => v.stockQuantity > 0) ||
      pool[0]
    );
  }, [variants, selectedColorId, selectedSize]);

  // Active Color derived from selection or active variant
  const activeColor = useMemo(() => {
    return (
      availableColors.find((c) => c.id === selectedColorId) ||
      (activeVariant?.productColor
        ? {
            id: activeVariant.productColorId || activeVariant.productColor.id,
            name: activeVariant.productColor.name,
            code: activeVariant.productColor.code,
          }
        : availableColors[0])
    );
  }, [availableColors, selectedColorId, activeVariant]);

  // Current active image index in gallery
  const currentImageIndex = useMemo(() => {
    const current = activeImage || product?.image;
    const idx = galleryImages.findIndex((img) => img === current);
    return idx >= 0 ? idx : 0;
  }, [galleryImages, activeImage, product?.image]);

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    const nextIdx = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    const nextIdx = (currentImageIndex + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  // When clicking on a color swatch, switch to that color, show only its available fit sizes, and update price
  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);

    const variantsForColor = variants.filter(
      (v) =>
        v.productColorId === colorId ||
        v.productColor?.id === colorId ||
        v.productColor?.uniqueId === colorId
    );

    if (variantsForColor.length > 0) {
      // Find matching size variant in new color, or pick the first available size in this new color
      const matchingVariant = variantsForColor.find(
        (v) => v.fitSize?.fitCode === selectedSize || v.fitSize?.name === selectedSize
      );

      const targetVariant =
        matchingVariant ||
        variantsForColor.find((v) => v.stockQuantity > 0) ||
        variantsForColor[0];

      const newSize = targetVariant.fitSize?.fitCode || targetVariant.fitSize?.name;
      if (newSize) {
        setSelectedSize(newSize);
      }
    }
  };

  // When clicking on a size within the selected colorway
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  // Pricing & Stock resolved dynamically from selected variant or base product
  const hasVariants = variants.length > 0;
  const currentPriceINR = activeVariant?.price != null ? activeVariant.price : (product?.priceINR ?? 0);
  const compareAtPriceINR = activeVariant?.compareAtPrice;
  const isOutOfStock = !isLoadingVariants && (!hasVariants || (activeVariant ? activeVariant.stockQuantity <= 0 : true));

  const formatPrice = (amountINR: number) => {
    if (currency.code === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(amountINR * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleAdd = async () => {
    if (!product || !hasVariants || isOutOfStock) return;

    if (!isLoggedIn()) {
      showToast({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please sign in to add pieces to your shopping bag.',
      });
      window.dispatchEvent(new CustomEvent('adwika:open-account-modal'));
      return;
    }

    const targetVariantId = activeVariant?.id || activeVariant?.uniqueId;
    if (!targetVariantId) {
      showToast({
        type: 'error',
        title: 'Variant Unavailable',
        message: 'Please select an available color and size variant.',
      });
      return;
    }

    setIsAdding(true);
    try {
      const success = await addItemToCart(targetVariantId, 1);
      if (success) {
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const related = liveRelated;

  // Fallback UI when initial product is loading
  if (isLoading && !product) {
    return (
      <div className="pt-24 min-h-screen bg-[#080809] flex flex-col items-center justify-center text-center px-6">
        <div className="w-8 h-8 border-2 border-adwika-sand border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-serif text-xs uppercase tracking-widest text-neutral-400">
          Accessing Atelier Garment Archive...
        </span>
      </div>
    );
  }

  // Fallback UI if API breaks or product not found
  if (error || !product) {
    return (
      <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-6 py-16 w-full">
          <ApiErrorFallback
            title="Garment Unavailable"
            message={
              error ||
              'The requested heirloom piece could not be located in our active database or the server connection failed.'
            }
            onRetry={fetchProduct}
            onBack={() => navigate(-1)}
            backLabel="Return to Collection"
            isRetrying={isRetrying}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center justify-between py-3 mb-8 border-b border-neutral-900 text-xs">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-[#c9a87c] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Collection</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
            <span>Atelier</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-400">{product.category}</span>
            <span className="text-neutral-700">/</span>
            <span className="text-[#c9a87c] truncate max-w-[240px]">{product.name}</span>
          </div>
        </div>

        {/* Product Main Showcase - Balanced 6 / 6 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Gallery (6 columns on desktop, centered luxury presentation) */}
          <div className="lg:col-span-6 flex flex-col items-center w-full">
            {/* Main Showcase Image Card - Resized to Small / Compact */}
            <div className="relative w-full max-w-[460px] aspect-[3/4] bg-neutral-900 overflow-hidden border border-neutral-800 rounded-sm shadow-2xl group select-none">
              <img
                src={activeImage || product.image}
                alt={product.name}
                onClick={() => setIsZoomOpen(true)}
                className="w-full h-full object-cover object-top cursor-zoom-in transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Wishlist Button (top right) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-red-400 transition-colors z-10 cursor-pointer border border-white/10"
                aria-label="Save to wishlist"
                title={isWishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#f43f5e' : 'none'}
                  className={isWishlisted ? 'text-red-500' : ''}
                />
              </button>

              {/* Zoom Trigger Button (bottom right) */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3.5 right-3.5 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 z-10 cursor-pointer border border-white/10"
                title="Expand high-res preview"
                aria-label="Expand preview"
              >
                <Maximize2 size={15} />
              </button>

              {/* Angle Index Badge (bottom left) */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3.5 left-3.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 uppercase tracking-widest border border-white/15 z-10 pointer-events-none">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              )}

              {/* Prev / Next Overlay Buttons on Hover */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer border border-white/10"
                    title="Previous angle"
                    aria-label="Previous angle"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer border border-white/10"
                    title="Next angle"
                    aria-label="Next angle"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* List of Product Images (Thumbnails Gallery below main image) - Rendered when multiple angles available */}
            {galleryImages.length > 1 && (
              <div className="w-full max-w-[460px] mt-4">
                <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-neutral-900 text-xs">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a87c] flex items-center gap-1.5">
                    <span>Perspectives & Details</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400">
                      {galleryImages.length}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      title="Previous angle"
                      aria-label="Previous angle"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      title="Next angle"
                      aria-label="Next angle"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Thumbnails Strip */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {galleryImages.map((imgUrl, idx) => {
                    const isActive = (activeImage || product.image) === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(imgUrl)}
                        className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-sm overflow-hidden shrink-0 transition-all cursor-pointer group/thumb ${
                          isActive
                            ? 'border-2 border-[#c9a87c] ring-2 ring-[#c9a87c]/30 opacity-100 shadow-md scale-100'
                            : 'border border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                        }`}
                        aria-label={`View angle ${idx + 1}`}
                        title={`View angle ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 rounded bg-black/75 text-neutral-300">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atelier Trust Markers Strip */}
            <div className="w-full max-w-[460px] mt-4 pt-4 border-t border-neutral-900 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center p-2.5 rounded bg-[#0f0e0d] border border-neutral-900/80">
                <Award size={15} className="text-[#c9a87c] mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-300 font-medium">Pure Handloom</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">Certified Authentic</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded bg-[#0f0e0d] border border-neutral-900/80">
                <Truck size={15} className="text-[#c9a87c] mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-300 font-medium">Insured Courier</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">Complimentary</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded bg-[#0f0e0d] border border-neutral-900/80">
                <Box size={15} className="text-[#c9a87c] mb-1.5" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-300 font-medium">Keepsake Box</span>
                <span className="text-[9px] text-neutral-500 mt-0.5">Sheesham Wood</span>
              </div>
            </div>
          </div>

          {/* Right Product Information (6 columns, sticky on desktop) */}
          <div className="lg:col-span-6 flex flex-col w-full lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wide-luxury text-adwika-sand font-mono">
                {product.category} · ARCHIVE
              </span>
              {activeVariant?.sku && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#181615] border border-[#2e2a27] text-[#c9a87c]">
                  SKU: {activeVariant.sku}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-white mb-2">
              {product.name}
            </h1>

            {/* Quick Star Rating Link to Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('patron-reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs text-[#c9a87c] hover:underline cursor-pointer group"
              >
                <RatingStars rating={5} size={13} />
                <span className="font-mono text-[11px] text-neutral-400 group-hover:text-neutral-200">
                  Patron Appraisals
                </span>
              </button>
            </div>

            {/* Price with compareAtPrice & discount if available from API response */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-serif text-2xl sm:text-3xl text-neutral-100 font-light">
                {formatPrice(currentPriceINR)}
              </span>
              {compareAtPriceINR && compareAtPriceINR > currentPriceINR && (
                <>
                  <span className="font-serif text-lg text-neutral-500 line-through">
                    {formatPrice(compareAtPriceINR)}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    Save {Math.round(((compareAtPriceINR - currentPriceINR) / compareAtPriceINR) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Live Inventory Status from API Variant Response */}
            {!isLoadingVariants && (
              <div className="flex items-center gap-2 mb-6">
                {hasVariants && activeVariant && activeVariant.stockQuantity > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span className="text-xs text-neutral-300 font-sans">
                      {activeVariant.stockQuantity <= 5 ? (
                        <span className="text-amber-300 font-medium">
                          Only {activeVariant.stockQuantity} remaining in artisanal archive — order soon
                        </span>
                      ) : (
                        `In Stock (${activeVariant.stockQuantity} units) · Handcrafted & Ready to Dispatch`
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs text-rose-400 font-medium">
                      Out of Stock · Bespoke Production on Request
                    </span>
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-7">
              {product.description}
            </p>

            {/* Color Swatch Selection from API Variants */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs mb-2.5">
                  <span className="uppercase tracking-widest text-neutral-300 text-[10px]">
                    Artisanal Hue:{' '}
                    <span className="text-white font-medium uppercase">
                      {activeColor?.name || 'Selected'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {availableColors.map((col) => {
                    const isSelected = (selectedColorId || activeColor?.id) === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleColorChange(col.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#c9a87c] bg-[#1f1c19] text-white shadow-md ring-1 ring-[#c9a87c]/50'
                            : 'border-neutral-800 bg-[#121110] text-neutral-400 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/50 shrink-0 shadow-inner"
                          style={{ backgroundColor: col.code }}
                        />
                        <span className="text-xs font-sans tracking-wide">{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizing from API Variants — Hidden when product has no variants/out of stock */}
            {hasVariants && availableSizes.length > 0 ? (
              <div className="mb-7">
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="uppercase tracking-widest text-neutral-300 text-[10px] font-mono">
                    Select Size {selectedSize && <span className="text-[#c9a87c] font-semibold">({selectedSize})</span>}
                  </span>
                  <span className="text-neutral-500 hover:text-neutral-300 transition-colors underline text-[10px] cursor-pointer">
                    Fit Consultation
                  </span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {availableSizes.map((sz) => {
                    const matchingVariant = variants.find(
                      (v) =>
                        (selectedColorId
                          ? v.productColorId === selectedColorId || v.productColor?.id === selectedColorId
                          : true) &&
                        (v.fitSize?.fitCode === sz || v.fitSize?.name === sz)
                    );
                    const isAvailableInColor = Boolean(matchingVariant);
                    const isSzOut = matchingVariant ? matchingVariant.stockQuantity <= 0 : false;
                    const isSelected = selectedSize === sz;

                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={isSzOut}
                        onClick={() => handleSizeChange(sz)}
                        className={`min-w-[56px] px-3.5 h-11 flex items-center justify-center text-xs uppercase tracking-wider font-mono rounded-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#c9a87c] bg-[#1a1714] text-[#c9a87c] ring-1 ring-[#c9a87c]/60 font-semibold shadow-md'
                            : isSzOut
                            ? 'border-neutral-900 bg-neutral-900/40 text-neutral-600 line-through cursor-not-allowed'
                            : !isAvailableInColor
                            ? 'border-neutral-800/60 bg-neutral-900/20 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                            : 'border-neutral-800 bg-[#121110] text-neutral-300 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !isLoadingVariants && !hasVariants ? (
              <div className="mb-7 p-4 rounded border border-neutral-800/80 bg-[#121110] text-center">
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  This piece is currently out of stock. No size or color variants are presently available in the atelier archive.
                </p>
              </div>
            ) : null}

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={addedSuccess || isOutOfStock || isAdding || !hasVariants}
              className={`w-full py-4 px-6 rounded-sm uppercase tracking-[0.2em] font-serif text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg select-none cursor-pointer ${
                isOutOfStock || !hasVariants ? 'mb-3' : 'mb-8'
              } ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-900/30 border border-emerald-500'
                  : isOutOfStock || !hasVariants
                  ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                  : 'bg-[#c9a87c] hover:bg-[#d6b589] active:bg-[#ba9667] text-neutral-950 shadow-[#c9a87c]/20 hover:shadow-[#c9a87c]/30 hover:scale-[1.005]'
              }`}
            >
              {isAdding ? (
                <>
                  <Loader2 size={16} className="animate-spin text-neutral-950" />
                  <span>Reserving Garment...</span>
                </>
              ) : addedSuccess ? (
                <>
                  <Check size={16} className="text-white" />
                  <span>Reserved In Your Bag</span>
                </>
              ) : isOutOfStock || !hasVariants ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag size={17} className="text-neutral-950" />
                  <span>Add To Bag — {formatPrice(currentPriceINR)}</span>
                </>
              )}
            </button>

            {/* Notify Me When Available Button (shown when piece or variant is out of stock) */}
            {(isOutOfStock || !hasVariants) && (
              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(true)}
                className="w-full py-3.5 mb-8 flex items-center justify-center gap-2 border border-[#c9a87c]/60 bg-[#191614] text-[#e8d5b5] hover:bg-[#26211d] hover:border-[#c9a87c] transition-all text-xs tracking-luxury uppercase font-medium cursor-pointer"
              >
                <Bell size={14} className="text-[#c9a87c]" />
                <span>Notify Me When Available</span>
              </button>
            )}

            {/* Accordions */}
            <div className="border-t border-neutral-800 divide-y divide-neutral-800 text-xs">
              {/* Craft & Origin */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'craft' ? null : 'craft')}
                  className="w-full py-4 flex items-center justify-between text-neutral-200 uppercase tracking-widest text-left font-serif"
                >
                  <span>Artisanal Craft & Fabrication</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'craft' ? 'rotate-180 text-adwika-sand' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'craft' && (
                  <div className="pb-5 space-y-2.5 text-neutral-400 animate-fadeIn font-sans leading-relaxed">
                    <p className="text-neutral-200 font-serif text-sm tracking-wide">{product.fabric}</p>
                    <ul className="space-y-2 mt-2">
                      {product.craftDetails.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs">
                          <Sparkles size={13} className="text-[#c9a87c] shrink-0 mt-0.5" />
                          <span className="text-neutral-300">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Delivery & Kept Packaging */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full py-4 flex items-center justify-between text-neutral-200 uppercase tracking-widest text-left font-serif"
                >
                  <span>Heirloom Packaging & Global Dispatch</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'shipping' ? 'rotate-180 text-adwika-sand' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-5 text-neutral-400 space-y-2 animate-fadeIn font-sans leading-relaxed">
                    <div className="flex items-center gap-2 text-adwika-sand mb-2">
                      <ShieldCheck size={15} />
                      <span className="text-[11px] uppercase tracking-wider">Fully Insured Worldwide Delivery</span>
                    </div>
                    <p>
                      Each order is housed in a carved seasoned Sheesham wooden keepsake box with fragrant vetiver root sachet and mulberry silk protective wrap.
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Dispatched within 3-5 business days. Express international courier tracked to your door.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patron Reviews & Appraisals Section */}
        <ProductReviewsSection
          productId={product?.id || id || ''}
          productName={product?.name}
          className="mt-20 pt-16 border-t border-neutral-900"
        />

        {/* Related Pieces */}
        {related.length > 0 && (
          <div className="mt-28 pt-16 border-t border-neutral-900">
            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-wider text-neutral-100 mb-8">
              Complements & Companion Pieces
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Restock Notification Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        productId={product?.id || id || ''}
        variantId={activeVariant?.id || activeVariant?.uniqueId}
        productName={product?.name || 'Heirloom Garment'}
        variantDetails={{
          color: activeColor?.name,
          size: hasVariants ? selectedSize : undefined,
        }}
        userEmail={getCurrentUser()?.email}
      />

      {/* High-Resolution Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white z-20 cursor-pointer"
            aria-label="Close zoom"
          >
            <X size={20} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 border border-neutral-700 text-white hover:bg-neutral-800 transition-colors z-20 cursor-pointer"
                title="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 border border-neutral-700 text-white hover:bg-neutral-800 transition-colors z-20 cursor-pointer"
                title="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="max-w-full max-h-[82vh] object-contain rounded border border-neutral-800 shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="uppercase text-neutral-200">{product.name}</span>
              <span>·</span>
              <span className="text-[#c9a87c]">
                Angle {currentImageIndex + 1} of {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
