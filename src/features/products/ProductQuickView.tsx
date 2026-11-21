import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button } from '@/components/ui';
import { Product, CurrencyConfig, CartItem } from '@/types';
import { Sparkles, Check, Heart, Loader2, Bell } from 'lucide-react';
import { productVariantService } from '@/features/admin/services/productVariant.service';
import { ProductVariant } from '@/features/admin/types/productVariant.types';
import { useCartStore } from '@/stores';
import { isLoggedIn, getCurrentUser } from '@/config/auth.config';
import { showToast } from '@/config/toast.config';
import { NotifyMeModal } from '@/features/stock-notifications';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onAddToCart?: (product: Product, size: CartItem['size'], variantId?: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    let mounted = true;
    if (isOpen && product) {
      setIsLoadingVariants(true);
      const targetId = product.id || product.categoryId || '';
      productVariantService
        .getAll(targetId)
        .then((res) => {
          if (mounted && res.data && res.data.length > 0) {
            setVariants(res.data);
            const first = res.data.find((v) => v.isActive) || res.data[0];
            if (first) {
              const colId = first.productColorId || first.productColor?.id;
              if (colId) setSelectedColorId(colId);
              const sz = first.fitSize?.fitCode || first.fitSize?.name;
              if (sz) setSelectedSize(sz);
            }
          } else if (mounted) {
            setVariants([]);
          }
        })
        .catch(() => {
          if (mounted) setVariants([]);
        })
        .finally(() => {
          if (mounted) setIsLoadingVariants(false);
        });
    } else {
      setVariants([]);
      setIsLoadingVariants(false);
    }
    return () => {
      mounted = false;
    };
  }, [isOpen, product]);

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

    const variantsForColor = selectedColorId
      ? variants.filter(
          (v) =>
            v.productColorId === selectedColorId ||
            v.productColor?.id === selectedColorId ||
            v.productColor?.uniqueId === selectedColorId
        )
      : variants;

    const source = variantsForColor.length > 0 ? variantsForColor : variants;

    const sizeMap = new Map<string, number>();
    source.forEach((v) => {
      const sz = v.fitSize?.fitCode || v.fitSize?.name;
      if (sz && !sizeMap.has(sz)) {
        sizeMap.set(sz, v.fitSize?.displayOrder ?? 0);
      }
    });
    if (sizeMap.size > 0) {
      return Array.from(sizeMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map((x) => x[0]);
    }
    return [];
  }, [variants, selectedColorId]);

  const activeVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return (
      variants.find((v) => {
        const matchesCol = selectedColorId
          ? v.productColorId === selectedColorId || v.productColor?.id === selectedColorId
          : true;
        const matchesSz = selectedSize
          ? v.fitSize?.fitCode === selectedSize || v.fitSize?.name === selectedSize
          : true;
        return matchesCol && matchesSz;
      }) ||
      variants.find((v) =>
        selectedColorId
          ? v.productColorId === selectedColorId || v.productColor?.id === selectedColorId
          : true
      ) ||
      variants[0]
    );
  }, [variants, selectedColorId, selectedSize]);

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

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);

    const variantsForColor = variants.filter(
      (v) =>
        v.productColorId === colorId ||
        v.productColor?.id === colorId ||
        v.productColor?.uniqueId === colorId
    );

    if (variantsForColor.length > 0) {
      const matchingVariant = variantsForColor.find(
        (v) => v.fitSize?.fitCode === selectedSize || v.fitSize?.name === selectedSize
      );

      if (!matchingVariant) {
        const firstVariant =
          variantsForColor.find((v) => v.stockQuantity > 0) || variantsForColor[0];
        const newSize = firstVariant.fitSize?.fitCode || firstVariant.fitSize?.name;
        if (newSize) {
          setSelectedSize(newSize);
        }
      }
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);

    const hasSizeInCurrentColor = variants.some(
      (v) =>
        (v.productColorId === selectedColorId || v.productColor?.id === selectedColorId) &&
        (v.fitSize?.fitCode === size || v.fitSize?.name === size)
    );

    if (!hasSizeInCurrentColor) {
      const variantWithSize = variants.find(
        (v) => v.fitSize?.fitCode === size || v.fitSize?.name === size
      );
      if (variantWithSize) {
        const newColorId = variantWithSize.productColorId || variantWithSize.productColor?.id;
        if (newColorId) {
          setSelectedColorId(newColorId);
        }
      }
    }
  };

  if (!product) return null;

  const hasVariants = variants.length > 0;
  const currentPrice = activeVariant?.price != null ? activeVariant.price : product.priceINR;
  const comparePrice = activeVariant?.compareAtPrice;
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
        setTimeout(() => {
          setAddedSuccess(false);
          onClose();
        }, 900);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Image side */}
        <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-red-400 transition-colors"
            aria-label="Save to wishlist"
          >
            <Heart size={18} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
          </button>
          {product.isNew && (
            <span className="absolute top-4 left-4 bg-white/90 text-black text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1">
              New Season
            </span>
          )}
        </div>

        {/* Details side */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-adwika-sand">
                {product.category}
              </span>
              {activeVariant?.sku && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {activeVariant.sku}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl tracking-wide text-neutral-100 mt-1 mb-2">
              {product.name}
            </h2>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xl font-serif text-white">{formatPrice(currentPrice)}</span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-sm font-serif text-neutral-500 line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            {/* Availability */}
            {!isLoadingVariants && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasVariants && activeVariant && activeVariant.stockQuantity > 0
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] text-neutral-300">
                  {hasVariants && activeVariant && activeVariant.stockQuantity > 0
                    ? `In Stock (${activeVariant.stockQuantity} available)`
                    : 'Out of Stock'}
                </span>
              </div>
            )}

            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Fabric & Origin */}
            <div className="bg-[#121215] p-3.5 border border-neutral-800/80 mb-6 text-xs flex flex-col gap-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Fabrication & Origin</span>
              <span className="text-neutral-200 font-medium">{product.fabric}</span>
            </div>

            {/* Color Swatches */}
            {availableColors.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="uppercase tracking-widest text-neutral-400 text-[10px]">
                    Color: <span className="text-white font-medium uppercase">{activeColor?.name || 'Selected'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableColors.map((col) => {
                    const isSelected = (selectedColorId || activeColor?.id) === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleColorChange(col.id)}
                        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#c9a87c] bg-[#1f1c19] text-white ring-1 ring-[#c9a87c]/50'
                            : 'border-neutral-800 bg-[#121110] text-neutral-400 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/50 shrink-0"
                          style={{ backgroundColor: col.code }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector — Hidden when out of stock / no variants */}
            {hasVariants && availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs mb-2.5">
                  <span className="uppercase tracking-widest text-neutral-400 text-[10px]">
                    Select Size {selectedSize && <span className="text-white font-medium">({selectedSize})</span>}
                  </span>
                  <span className="text-neutral-500 underline text-[10px] cursor-pointer">Bespoke Fit Guide</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((sz) => {
                    const matchingVariant = variants.find(
                      (v) =>
                        (selectedColorId ? v.productColorId === selectedColorId || v.productColor?.id === selectedColorId : true) &&
                        (v.fitSize?.fitCode === sz || v.fitSize?.name === sz)
                    );
                    const isAvailableInColor = Boolean(matchingVariant);
                    const isSzOut = matchingVariant ? matchingVariant.stockQuantity <= 0 : false;
                    const isSelected = selectedSize === sz;

                    return (
                      <button
                        key={sz}
                        disabled={isSzOut}
                        onClick={() => handleSizeChange(sz)}
                        className={`flex-1 py-2 px-3 text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-white text-black font-semibold'
                            : isSzOut
                            ? 'border-neutral-900 bg-neutral-900/40 text-neutral-600 line-through cursor-not-allowed'
                            : !isAvailableInColor
                            ? 'border-neutral-800/60 bg-neutral-900/20 text-neutral-500 hover:border-neutral-700'
                            : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Craft details bullet list */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
                Artisanal Notes
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {product.craftDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Sparkles size={12} className="text-adwika-sand shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="pt-6 mt-6 border-t border-neutral-800 space-y-2.5">
            <Button
              variant="filled"
              size="lg"
              onClick={handleAdd}
              disabled={addedSuccess || isOutOfStock || isAdding || !hasVariants}
              isLoading={isAdding}
              className={`w-full flex items-center justify-center gap-2 ${
                isOutOfStock || !hasVariants
                  ? 'opacity-60 cursor-not-allowed bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-400'
                  : ''
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Added To Bag</span>
                </>
              ) : isOutOfStock || !hasVariants ? (
                <span>Out of Stock</span>
              ) : (
                <span>Add To Bag — {formatPrice(currentPrice)}</span>
              )}
            </Button>

            {/* Notify Me When Available Button (shown when out of stock) */}
            {(isOutOfStock || !hasVariants) && (
              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(true)}
                className="w-full py-3 flex items-center justify-center gap-2 border border-[#c9a87c]/60 bg-[#191614] text-[#e8d5b5] hover:bg-[#26211d] hover:border-[#c9a87c] transition-all text-xs tracking-luxury uppercase font-medium cursor-pointer"
              >
                <Bell size={14} className="text-[#c9a87c]" />
                <span>Notify Me When Available</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Restock Notification Modal */}
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        productId={product?.id || ''}
        variantId={activeVariant?.id || activeVariant?.uniqueId}
        productName={product?.name || 'Heirloom Garment'}
        variantDetails={{
          color: activeColor?.name,
          size: hasVariants ? selectedSize : undefined,
        }}
        userEmail={getCurrentUser()?.email}
      />
    </Modal>
  );
};
