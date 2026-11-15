import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { CurrencyConfig } from '@/types';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useCartStore } from '@/stores';
import { isLoggedIn } from '@/config/auth.config';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onExplore: () => void;
  onOpenAccountModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  currency,
  onExplore,
  onOpenAccountModal,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const { cart, isMutating, updateQuantity, removeItem, clearCart } = useCartStore();
  const items = cart?.items || [];
  const loggedIn = isLoggedIn();

  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const subTotal = items.reduce((sum, item) => {
    const price = item.variantId?.price ?? 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const compare = item.variantId?.compareAtPrice ?? 0;
    const price = item.variantId?.price ?? 0;
    const diff = compare - price;
    return sum + (diff > 0 ? diff * (item.quantity || 1) : 0);
  }, 0);

  const grandTotal = subTotal;

  const formatPrice = (inr: number) => {
    if (currency.code === 'INR') {
      return `₹${inr.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(inr * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    setUpdatingItemId(itemId);
    try {
      await updateQuantity(itemId, newQty);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 1200);
  };

  const resetState = () => {
    setCheckoutComplete(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetState} title="" variant="drawer-right">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-900">
        <img
          src="/images/adwika-logo.png"
          alt="Adwika | अद्विका"
          className="h-7 w-auto object-contain mix-blend-screen"
        />
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-sans">
            YOUR SHOPPING BAG {totalItemCount > 0 ? `(${totalItemCount})` : ''}
          </span>
          {items.length > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-[9px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {checkoutComplete ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-4 animate-fadeIn">
          <CheckCircle2 size={56} className="text-adwika-sand" />
          <h3 className="font-serif text-2xl uppercase tracking-wider text-neutral-100">
            Order Reserved
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Thank you for welcoming Adwika heirlooms into your sanctuary. Our concierge will be in touch shortly with hand-packaging details.
          </p>
          <Button
            variant="filled"
            onClick={resetState}
            className="mt-6 w-full"
          >
            Continue Exploring
          </Button>
        </div>
      ) : !loggedIn ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full bg-[#181513] border border-[#352c25] flex items-center justify-center text-[#c9a87c] mb-1">
            <Sparkles size={20} />
          </div>
          <h3 className="font-serif text-lg uppercase tracking-wider text-neutral-200">
            Atelier Authentication Required
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Please sign in to your personal sanctuary account to view your reserved pieces and manage your shopping bag.
          </p>
          {onOpenAccountModal && (
            <Button
              variant="filled"
              onClick={() => {
                onClose();
                onOpenAccountModal();
              }}
              className="mt-3"
            >
              Sign In to Atelier
            </Button>
          )}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
          <p className="font-serif text-lg text-neutral-300">Your bag is presently empty</p>
          <p className="text-xs text-neutral-500 max-w-xs">
            Discover modern heirlooms shaped by Indian heritage and sculptural silhouettes.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onExplore();
            }}
            className="mt-4"
          >
            Explore The Collection ↗
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* List of items */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {items.map((item) => {
              const itemKey = item._id;
              const variant = item.variantId;
              const product = variant?.productId;
              const size = variant?.fitSizeId;
              const color = variant?.productColorId;
              const unitPrice = variant?.price ?? 0;
              const compareAtPrice = variant?.compareAtPrice;
              const lineTotal = unitPrice * (item.quantity || 1);
              const isItemBusy = isMutating && updatingItemId === itemKey;
              const maxStock = variant?.stockQuantity;
              const isMaxQty = maxStock != null && item.quantity >= maxStock;

              return (
                <div
                  key={itemKey}
                  className="flex gap-4 pb-4 border-b border-neutral-900 group transition-opacity duration-150"
                  style={{ opacity: isItemBusy ? 0.6 : 1 }}
                >
                  {/* Item Image */}
                  <div className="w-20 h-28 bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 relative">
                    <img
                      src={product?.imageUrl || '/images/default.jpg'}
                      alt={product?.name || 'Garment'}
                      className="w-full h-full object-cover"
                    />
                    {isItemBusy && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-[#c9a87c]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-serif tracking-wide text-neutral-100 uppercase line-clamp-2">
                          {product?.name || 'Adwika Heirloom'}
                        </h4>
                        <button
                          type="button"
                          disabled={isItemBusy}
                          onClick={() => handleRemove(itemKey)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1 shrink-0 cursor-pointer disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Variant Attributes: Color & Size */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {color && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161413] border border-[#2d2621] text-[10px] text-neutral-300">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/50 shrink-0"
                              style={{ backgroundColor: color.code || '#1A1A1A' }}
                            />
                            <span>{color.name}</span>
                          </div>
                        )}

                        {size && (
                          <span className="inline-block px-2 py-0.5 rounded bg-[#161413] border border-[#2d2621] text-[10px] font-mono text-neutral-300 uppercase">
                            Fit: {size.fitCode || size.name}
                          </span>
                        )}

                        {variant?.sku && (
                          <span className="text-[9px] font-mono text-neutral-500">
                            {variant.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Selector */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-800 bg-neutral-900/60">
                        <button
                          type="button"
                          disabled={isItemBusy}
                          onClick={() => handleUpdateQty(itemKey, item.quantity - 1)}
                          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-3 text-xs text-neutral-200 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isItemBusy || isMaxQty}
                          onClick={() => handleUpdateQty(itemKey, item.quantity + 1)}
                          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <div className="text-xs font-medium text-neutral-100 font-serif">
                          {formatPrice(lineTotal)}
                        </div>
                        {compareAtPrice && compareAtPrice > unitPrice && (
                          <div className="text-[10px] text-neutral-500 line-through">
                            {formatPrice(compareAtPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer calculation & checkout */}
          <div className="pt-4 border-t border-neutral-900 flex flex-col gap-3.5 bg-[#0d0d0f]">
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-widest bg-white/[0.02] p-2.5 border border-neutral-800/80">
              <ShieldCheck size={14} className="text-adwika-sand shrink-0" />
              <span>Complimentary insured shipping & heirloom wooden keepsake packaging</span>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline text-neutral-400">
                <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                <span className="font-mono text-neutral-200">{formatPrice(subTotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between items-baseline text-emerald-400">
                  <span className="uppercase tracking-widest text-[11px]">Artisanal Privilege Savings</span>
                  <span className="font-mono">- {formatPrice(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-neutral-900">
                <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">Grand Total</span>
                <span className="text-lg font-serif text-white font-medium">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="filled"
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-1"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </Button>

            <p className="text-[10px] text-center text-neutral-500 uppercase tracking-widest">
              Taxes calculated at dispatch · Worldwide delivery available
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
