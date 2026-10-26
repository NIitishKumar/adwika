import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { CartItem, CurrencyConfig } from '@/types';
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyConfig;
  onUpdateQuantity: (productId: string, size: CartItem['size'], delta: number) => void;
  onRemoveItem: (productId: string, size: CartItem['size']) => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onExplore,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const subtotalINR = items.reduce(
    (sum, item) => sum + item.product.priceINR * item.quantity,
    0
  );

  const formatPrice = (inr: number) => {
    if (currency.code === 'INR') {
      return `₹${inr.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(inr * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
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
        <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-sans">
          YOUR SHOPPING BAG
        </span>
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
          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex gap-4 pb-5 border-b border-neutral-800"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-26 object-cover bg-neutral-900 border border-neutral-800"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-serif tracking-wide text-neutral-100">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.size)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
                      Size: <span className="text-neutral-200">{item.size}</span> · Fabric:{' '}
                      <span className="text-neutral-300">{item.product.fabric.split('&')[0]}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-neutral-800 bg-neutral-900/60">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, -1)}
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-3 text-xs text-neutral-200 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.size, 1)}
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <span className="text-xs font-medium text-neutral-200">
                      {formatPrice(item.product.priceINR * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer calculation & checkout */}
          <div className="pt-6 border-t border-neutral-800 flex flex-col gap-4 bg-[#0d0d0f]">
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-widest bg-white/[0.02] p-2.5 border border-neutral-800/80">
              <ShieldCheck size={14} className="text-adwika-sand" />
              <span>Complimentary insured shipping & heirloom wooden keepsake packaging</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-widest text-neutral-400">Subtotal</span>
              <span className="text-lg font-serif text-white">{formatPrice(subtotalINR)}</span>
            </div>

            <Button
              variant="filled"
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
              className="w-full flex items-center justify-center gap-2"
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
