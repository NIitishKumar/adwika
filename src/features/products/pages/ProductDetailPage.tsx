import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CurrencyConfig, CartItem, Product } from '@/types';
import { Button } from '@/components/ui';
import { ProductCard } from '../ProductCard';
import { Heart, Sparkles, ShieldCheck, ChevronDown, Check, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { productService } from '@/features/admin/services/product.service';
import { productImageService } from '@/features/admin/services/productImage.service';
import { productVariantService } from '@/features/admin/services/productVariant.service';
import { ProductVariant } from '@/features/admin/types/productVariant.types';
import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';
import { useCartStore } from '@/stores';
import { isLoggedIn } from '@/config/auth.config';
import { showToast } from '@/config/toast.config';

interface ProductDetailPageProps {
  currency: CurrencyConfig;
  onAddToCart?: (product: Product, size: CartItem['size'], variantId?: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  currency,
  onAddToCart,
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
  const [openAccordion, setOpenAccordion] = useState<string | null>('craft');

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

      // 1. Fetch gallery images
      try {
        const galleryRes = await productImageService.getByProductId(p.id || id);
        if (galleryRes.data && galleryRes.data.length > 0) {
          const apiUrls = galleryRes.data.map((img) => img.imageUrl).filter(Boolean);
          if (apiUrls.length > 0) {
            images = Array.from(new Set([...images, ...apiUrls]));
          }
        }
      } catch {
        // Optional gallery fetch
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
        craftDetails: [
          `Fit: ${p.fit}`,
          p.subCategory?.name ? `Collection: ${p.subCategory.name}` : 'Handcrafted Luxury',
          p.category?.title ? `Master Category: ${p.category.title}` : 'Pure Mulberry Silk',
        ],
        fabric: p.fit || 'Mulberry Silk & Chanderi',
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
      return product?.sizes || ['XS', 'S', 'M', 'L', 'XL'];
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

    return ['XS', 'S', 'M', 'L', 'XL'];
  }, [variants, selectedColorId, product?.sizes]);

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
  const currentPriceINR = activeVariant?.price != null ? activeVariant.price : (product?.priceINR ?? 0);
  const compareAtPriceINR = activeVariant?.compareAtPrice;
  const isOutOfStock = activeVariant ? activeVariant.stockQuantity <= 0 : false;

  const formatPrice = (amountINR: number) => {
    if (currency.code === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(amountINR * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleAdd = async () => {
    if (!product) return;

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
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Collection</span>
        </button>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Gallery (7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden border border-neutral-800">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-5 right-5 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-red-400 transition-colors"
                aria-label="Save to wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
              </button>
            </div>

            {/* Product Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-24 rounded border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      (activeImage || product.image) === imgUrl
                        ? 'border-[#c9a87c] ring-1 ring-[#c9a87c]'
                        : 'border-[#332f2b] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Information (5 columns) */}
          <div className="lg:col-span-5 flex flex-col">
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

            <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-white mb-3">
              {product.name}
            </h1>

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
            {activeVariant && (
              <div className="flex items-center gap-2 mb-6">
                {activeVariant.stockQuantity > 0 ? (
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
                      Sold Out · Bespoke Production on Request
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

            {/* Sizing from API Variants */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="uppercase tracking-widest text-neutral-300 text-[10px]">
                  Select Size {selectedSize && <span className="text-white font-semibold">({selectedSize})</span>}
                </span>
                <span className="text-neutral-500 underline text-[10px] cursor-pointer">Fit Consultation</span>
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
                      className={`min-w-[48px] flex-1 py-3 text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white bg-white text-black font-semibold shadow-md'
                          : isSzOut
                          ? 'border-neutral-900 bg-neutral-900/40 text-neutral-600 line-through cursor-not-allowed'
                          : !isAvailableInColor
                          ? 'border-neutral-800/60 bg-neutral-900/20 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <Button
              variant="filled"
              size="lg"
              onClick={handleAdd}
              disabled={addedSuccess || isOutOfStock || isAdding}
              isLoading={isAdding}
              className="w-full py-4 mb-8 flex items-center justify-center gap-2"
            >
              {addedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Reserved In Your Bag</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <span>Add To Bag — {formatPrice(currentPriceINR)}</span>
              )}
            </Button>

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
                  <div className="pb-5 space-y-2 text-neutral-400 animate-fadeIn font-sans leading-relaxed">
                    <p className="text-neutral-300 font-medium">{product.fabric}</p>
                    <ul className="space-y-1.5 mt-2">
                      {product.craftDetails.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles size={12} className="text-adwika-sand shrink-0 mt-0.5" />
                          <span>{detail}</span>
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
    </div>
  );
};
