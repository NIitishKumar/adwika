import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from '@/components/ui';
import { CurrencyConfig } from '@/types';
import {
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Package,
  Clock,
  Award,
  MapPin,
} from 'lucide-react';
import { useCartStore } from '@/stores';
import { isLoggedIn } from '@/config/auth.config';
import { AddressSelector, UserAddress } from '@/features/address';
import { showToast } from '@/config/toast.config';

type CartStep = 'bag' | 'address' | 'confirmation';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  currency: CurrencyConfig;
  onExplore?: () => void;
  onOpenAccountModal?: () => void;
  isStandalonePage?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen = true,
  onClose,
  currency,
  onExplore,
  onOpenAccountModal,
  isStandalonePage = false,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<CartStep>('bag');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string>('');
  const [confirmedAddressSnapshot, setConfirmedAddressSnapshot] = useState<UserAddress | null>(null);

  const handleSelectAddress = useCallback((addr: UserAddress | null) => {
    setSelectedAddress(addr);
  }, []);

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

  const handleProceedToAddress = () => {
    if (items.length === 0) {
      showToast({
        type: 'error',
        title: 'Bag Empty',
        message: 'Your shopping bag contains no items to checkout.',
      });
      return;
    }
    setStep('address');
  };

  const handleConfirmReservation = async () => {
    if (!selectedAddress) {
      showToast({
        type: 'error',
        title: 'Address Required',
        message: 'Please choose or add a delivery address to complete your order.',
      });
      return;
    }

    setIsCheckingOut(true);
    // Emulate consignment booking & confirmation
    setTimeout(async () => {
      const generatedRef = `ADW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderRef(generatedRef);
      setConfirmedAddressSnapshot(selectedAddress);
      setIsCheckingOut(false);
      setStep('confirmation');
      await clearCart();
      showToast({
        type: 'success',
        title: 'Consignment Reserved',
        message: `Order #${generatedRef} has been booked successfully.`,
      });
    }, 900);
  };

  const handleHeaderBack = () => {
    if (step === 'address') {
      setStep('bag');
    } else if (step === 'confirmation') {
      setStep('bag');
      if (onClose) onClose();
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } else {
      // step === 'bag'
      if (onClose) onClose();
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const resetState = () => {
    setStep('bag');
    setIsCheckingOut(false);
    if (onClose) onClose();
    if (isStandalonePage) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const cartContent = (
    <>
      {/* Top Atelier Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-neutral-800/80 bg-[#0c0b0e] flex items-center justify-between shrink-0 z-20">
        {/* Left: Back Option & Brand Crest */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-600 bg-neutral-900/60 text-neutral-300 hover:text-white transition-colors text-xs font-sans group cursor-pointer"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform text-[#c9a87c]" />
            <span className="uppercase tracking-widest text-[11px] font-medium">Back</span>
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
            title="Adwika Atelier Sanctuary"
          >
            <img
              src="/images/adwika-logo.png"
              alt="Adwika | अद्विका"
              className="h-7 w-auto object-contain mix-blend-screen"
            />
            <span className="hidden md:inline-block font-serif text-[11px] uppercase tracking-widest text-[#c9a87c] border-l border-neutral-800 pl-3">
              Atelier Sanctuary
            </span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-sans">
          {/* Step 1: Bag */}
          <button
            type="button"
            disabled={step === 'confirmation'}
            onClick={() => setStep('bag')}
            className={`flex items-center gap-1.5 transition-colors ${
              step === 'bag'
                ? 'text-[#c9a87c] font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                step === 'bag'
                  ? 'border-[#c9a87c] bg-[#c9a87c]/10 text-[#c9a87c]'
                  : step === 'address' || step === 'confirmation'
                  ? 'border-neutral-700 bg-neutral-900 text-neutral-400'
                  : 'border-neutral-800 text-neutral-600'
              }`}
            >
              01
            </span>
            <span className="hidden md:inline uppercase tracking-widest text-[11px]">
              Shopping Bag
            </span>
          </button>

          <span className="text-neutral-700 text-xs">───</span>

          {/* Step 2: Address */}
          <button
            type="button"
            disabled={step === 'confirmation' || items.length === 0}
            onClick={() => items.length > 0 && setStep('address')}
            className={`flex items-center gap-1.5 transition-colors ${
              step === 'address'
                ? 'text-[#c9a87c] font-medium'
                : 'text-neutral-500 hover:text-neutral-300 disabled:opacity-50'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                step === 'address'
                  ? 'border-[#c9a87c] bg-[#c9a87c]/10 text-[#c9a87c]'
                  : step === 'confirmation'
                  ? 'border-neutral-700 bg-neutral-900 text-neutral-400'
                  : 'border-neutral-800 text-neutral-600'
              }`}
            >
              02
            </span>
            <span className="hidden md:inline uppercase tracking-widest text-[11px]">
              Delivery Address
            </span>
          </button>

          <span className="text-neutral-700 text-xs">───</span>

          {/* Step 3: Confirmation */}
          <div
            className={`flex items-center gap-1.5 ${
              step === 'confirmation' ? 'text-[#c9a87c] font-medium' : 'text-neutral-600'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                step === 'confirmation'
                  ? 'border-[#c9a87c] bg-[#c9a87c]/10 text-[#c9a87c]'
                  : 'border-neutral-800 text-neutral-600'
              }`}
            >
              03
            </span>
            <span className="hidden md:inline uppercase tracking-widest text-[11px]">
              Confirmation
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {items.length > 0 && step === 'bag' && (
            <button
              onClick={() => clearCart()}
              className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors px-2 py-1"
            >
              Clear Bag
            </button>
          )}

          <button
            onClick={resetState}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors text-xs font-mono"
            aria-label="Close cart"
          >
            <span className="hidden sm:inline uppercase text-[10px] tracking-widest">Close</span>
            <span className="text-[9px] text-neutral-500 hidden sm:inline">(ESC)</span>
            <X size={14} />
          </button>
        </div>
      </header>

      {/* Main Body Area */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
        {/* State: Not logged in */}
        {!loggedIn ? (
          <div className="max-w-md mx-auto py-24 px-6 text-center flex flex-col items-center gap-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#181513] border border-[#352c25] flex items-center justify-center text-[#c9a87c] mb-2 shadow-[0_0_20px_rgba(201,168,124,0.1)]">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-xl uppercase tracking-wider text-neutral-100">
              Atelier Authentication Required
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Please sign in to your personal atelier sanctuary account to view your reserved pieces, manage delivery addresses, and conclude your orders.
            </p>
            {onOpenAccountModal && (
              <Button
                variant="filled"
                size="lg"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenAccountModal();
                }}
                className="mt-4 px-8"
              >
                Sign In to Atelier
              </Button>
            )}
          </div>
        ) : step === 'confirmation' ? (
          /* STEP 3: CONFIRMATION */
          <div className="max-w-3xl mx-auto py-16 sm:py-24 px-6 text-center flex flex-col items-center gap-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#1c1815] border border-[#c9a87c]/40 flex items-center justify-center text-[#c9a87c] shadow-[0_0_40px_rgba(201,168,124,0.2)]">
              <CheckCircle2 size={44} className="stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#c9a87c]">
                Booking Reference: {confirmedOrderRef}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl uppercase tracking-widest text-neutral-100">
                Consignment Reserved
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
                Thank you for welcoming Adwika heirlooms into your collection. Our concierge will be in touch shortly to coordinate personal hand-packaging and insured dispatch.
              </p>
            </div>

            {/* Address Snapshot Card */}
            {confirmedAddressSnapshot && (
              <div className="w-full max-w-md bg-[#121113] border border-[#2d2621] p-5 text-left space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-900">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#c9a87c]" />
                    Delivery Destination
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#201c18] border border-[#3d332a] text-[#c9a87c]">
                    {confirmedAddressSnapshot.addressType}
                  </span>
                </div>
                <p className="text-xs font-serif uppercase tracking-wider text-neutral-100">
                  {confirmedAddressSnapshot.name}
                </p>
                <p className="text-xs text-neutral-400">
                  {confirmedAddressSnapshot.addressLine1}
                  {confirmedAddressSnapshot.addressLine2 ? `, ${confirmedAddressSnapshot.addressLine2}` : ''}
                </p>
                <p className="text-xs text-neutral-400">
                  {confirmedAddressSnapshot.city}, {confirmedAddressSnapshot.state} —{' '}
                  <span className="font-mono text-neutral-300">
                    {confirmedAddressSnapshot.postalCode}
                  </span>
                </p>
                <p className="text-xs font-mono text-neutral-400 pt-1">
                  Contact: +91 {confirmedAddressSnapshot.phone}
                </p>
              </div>
            )}

            {/* Atelier Assurance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl text-left mt-2">
              <div className="p-3.5 bg-[#121113]/60 border border-neutral-900 flex items-start gap-2.5">
                <Package size={16} className="text-[#c9a87c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-neutral-200 font-sans">
                    Heirloom Keepsake
                  </h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Signature wooden box packaging</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121113]/60 border border-neutral-900 flex items-start gap-2.5">
                <Clock size={16} className="text-[#c9a87c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-neutral-200 font-sans">
                    Insured Courier
                  </h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Dispatched within 48 hours</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#121113]/60 border border-neutral-900 flex items-start gap-2.5">
                <Award size={16} className="text-[#c9a87c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-neutral-200 font-sans">
                    Artisanal Pledge
                  </h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Certified pure handloom</p>
                </div>
              </div>
            </div>

            <Button
              variant="filled"
              size="lg"
              onClick={resetState}
              className="mt-6 px-10 py-3.5 text-xs uppercase tracking-widest"
            >
              Continue Exploring Atelier Collection
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Empty Bag */
          <div className="max-w-md mx-auto py-24 px-6 text-center flex flex-col items-center gap-4 animate-fadeIn">
            <p className="font-serif text-xl uppercase tracking-wider text-neutral-200">
              Your bag is presently empty
            </p>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Discover contemporary heirlooms shaped by Indian craft heritage and sculptural silhouettes.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                resetState();
                if (onExplore) onExplore();
                else navigate('/');
              }}
              className="mt-4 px-8 border-[#3d332a] text-[#c9a87c] hover:bg-[#1a1714]"
            >
              Explore The Collection ↗
            </Button>
          </div>
        ) : step === 'address' ? (
          /* STEP 2: SELECT TEMPORARY / SAVED ADDRESS */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('bag')}
              className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors mb-6 group cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-widest text-[11px]">Back to Shopping Bag</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Address Selection */}
              <div className="lg:col-span-7 xl:col-span-8">
                <AddressSelector
                  selectedAddressId={selectedAddress?.id}
                  onSelectAddress={handleSelectAddress}
                />
              </div>

              {/* Right Column: Consignment Review & Checkout */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 space-y-5">
                <div className="bg-[#121113] border border-neutral-800/90 p-5 sm:p-6 space-y-5">
                  <h3 className="font-serif text-sm uppercase tracking-wider text-neutral-100 pb-3 border-b border-neutral-900">
                    Consignment Review
                  </h3>

                  {/* Mini items strip */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const variant = item.variantId;
                      const product = variant?.productId;
                      const lineTotal = (variant?.price ?? 0) * (item.quantity || 1);
                      return (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 py-2 border-b border-neutral-900/60"
                        >
                          <img
                            src={product?.imageUrl || '/images/default.jpg'}
                            alt={product?.name || 'Garment'}
                            className="w-12 h-15 object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-serif text-neutral-100 uppercase truncate">
                              {product?.name || 'Adwika Piece'}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              Qty: {item.quantity} · {variant?.fitSizeId?.name || 'Free Size'}
                            </p>
                          </div>
                          <span className="text-xs font-serif text-neutral-200">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Delivery Destination Preview */}
                  <div className="p-3.5 bg-[#0a0a0c] border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-400">
                      <span className="flex items-center gap-1 text-[#c9a87c]">
                        <MapPin size={11} />
                        Deliver To
                      </span>
                      {selectedAddress && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
                          {selectedAddress.addressType}
                        </span>
                      )}
                    </div>
                    {selectedAddress ? (
                      <div>
                        <p className="text-xs text-neutral-100 font-medium font-serif uppercase">
                          {selectedAddress.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {selectedAddress.addressLine1}, {selectedAddress.city} -{' '}
                          {selectedAddress.postalCode}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          +91 {selectedAddress.phone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-400/90 italic">
                        Please select an address from the left to complete your reservation.
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2 text-xs pt-2 border-t border-neutral-900">
                    <div className="flex justify-between items-baseline text-neutral-400">
                      <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                      <span className="font-mono text-neutral-200">{formatPrice(subTotal)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between items-baseline text-emerald-400">
                        <span className="uppercase tracking-widest text-[11px]">
                          Artisanal Privilege Savings
                        </span>
                        <span className="font-mono">- {formatPrice(totalDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline text-neutral-400">
                      <span className="uppercase tracking-widest text-[11px]">Insured Courier</span>
                      <span className="text-[#c9a87c] uppercase tracking-widest text-[10px]">
                        Complimentary
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2.5 border-t border-neutral-900">
                      <span className="text-xs uppercase tracking-widest text-neutral-200 font-medium">
                        Grand Total
                      </span>
                      <span className="text-lg font-serif text-white font-medium">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm CTA */}
                  <Button
                    variant="filled"
                    size="lg"
                    onClick={handleConfirmReservation}
                    isLoading={isCheckingOut}
                    disabled={!selectedAddress}
                    className="w-full flex items-center justify-center gap-2 py-4 uppercase tracking-widest text-xs"
                  >
                    <span>Confirm & Reserve Consignment</span>
                    <ArrowRight size={14} />
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
                    <ShieldCheck size={13} className="text-[#c9a87c]" />
                    <span>Complimentary insured shipping & heirloom packaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 1: SHOPPING BAG */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <h2 className="font-serif text-base uppercase tracking-wider text-neutral-100">
                    Curated Selection ({totalItemCount} {totalItemCount === 1 ? 'Piece' : 'Pieces'})
                  </h2>
                  <span className="text-xs text-neutral-500 font-mono">
                    Prices in {currency.code}
                  </span>
                </div>

                <div className="space-y-4">
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
                        className="p-4 sm:p-5 bg-[#121113] border border-neutral-800/80 flex flex-col sm:flex-row gap-5 transition-opacity"
                        style={{ opacity: isItemBusy ? 0.6 : 1 }}
                      >
                        {/* Image */}
                        <div className="w-24 sm:w-28 h-32 sm:h-36 bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 relative">
                          <img
                            src={product?.imageUrl || '/images/default.jpg'}
                            alt={product?.name || 'Garment'}
                            className="w-full h-full object-cover"
                          />
                          {isItemBusy && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 size={18} className="animate-spin text-[#c9a87c]" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-serif tracking-wide text-neutral-100 uppercase">
                                {product?.name || 'Adwika Heirloom'}
                              </h3>
                              <button
                                type="button"
                                disabled={isItemBusy}
                                onClick={() => handleRemove(itemKey)}
                                className="text-neutral-500 hover:text-rose-400 transition-colors p-1 shrink-0 cursor-pointer disabled:opacity-40"
                                aria-label="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Attributes */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {color && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181513] border border-[#2d2621] text-[10px] text-neutral-300">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/50 shrink-0"
                                    style={{ backgroundColor: color.code || '#1A1A1A' }}
                                  />
                                  <span>{color.name}</span>
                                </div>
                              )}

                              {size && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#181513] border border-[#2d2621] text-[10px] font-mono text-neutral-300 uppercase">
                                  Fit: {size.fitCode || size.name}
                                </span>
                              )}

                              {variant?.sku && (
                                <span className="text-[10px] font-mono text-neutral-500">
                                  SKU: {variant.sku}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity & Line Total */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-900">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-neutral-800 bg-[#0a0a0c]">
                              <button
                                type="button"
                                disabled={isItemBusy || item.quantity <= 1}
                                onClick={() => handleUpdateQty(itemKey, item.quantity - 1)}
                                className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-xs text-neutral-200 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isItemBusy || isMaxQty}
                                onClick={() => handleUpdateQty(itemKey, item.quantity + 1)}
                                className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Line Price */}
                            <div className="text-right">
                              <div className="text-sm font-medium text-neutral-100 font-serif">
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

                {/* Atelier Pledges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-[#121113]/50 border border-neutral-900 flex items-start gap-3">
                    <Sparkles size={16} className="text-[#c9a87c] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <h4 className="font-serif uppercase tracking-wider text-neutral-200">
                        Pit-Loom Woven Authenticity
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        Each garment is woven with genuine zari and natural silk by master artisans in Varanasi and Kanchipuram.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#121113]/50 border border-neutral-900 flex items-start gap-3">
                    <Award size={16} className="text-[#c9a87c] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <h4 className="font-serif uppercase tracking-wider text-neutral-200">
                        Complimentary Bespoke Fitting
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        Includes personalized blouse cut and drape consultation by our atelier master tailors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 space-y-5">
                <div className="bg-[#121113] border border-neutral-800/90 p-6 sm:p-7 space-y-5">
                  <h3 className="font-serif text-sm uppercase tracking-wider text-neutral-100 pb-3 border-b border-neutral-900">
                    Investment Summary
                  </h3>

                  {/* Calculations */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-baseline text-neutral-400">
                      <span className="uppercase tracking-widest text-[11px]">Bag Subtotal</span>
                      <span className="font-mono text-neutral-200">{formatPrice(subTotal)}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between items-baseline text-emerald-400">
                        <span className="uppercase tracking-widest text-[11px]">
                          Artisanal Privilege Savings
                        </span>
                        <span className="font-mono">- {formatPrice(totalDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline text-neutral-400">
                      <span className="uppercase tracking-widest text-[11px]">
                        Insured Express Shipping
                      </span>
                      <span className="text-[#c9a87c] uppercase tracking-widest text-[10px]">
                        Complimentary
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-neutral-400">
                      <span className="uppercase tracking-widest text-[11px]">Duties & Taxes</span>
                      <span className="text-neutral-500 uppercase tracking-widest text-[10px]">
                        Included
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-neutral-900">
                      <span className="text-xs uppercase tracking-widest text-neutral-200 font-medium">
                        Grand Total
                      </span>
                      <span className="text-xl font-serif text-white font-medium">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Privilege Badge */}
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 bg-white/[0.02] p-3 border border-neutral-800/80">
                    <ShieldCheck size={16} className="text-[#c9a87c] shrink-0" />
                    <span>Signature wooden box packaging & insured delivery</span>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <Button
                    variant="filled"
                    size="lg"
                    onClick={handleProceedToAddress}
                    className="w-full flex items-center justify-center gap-2 py-4 uppercase tracking-widest text-xs"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={14} />
                  </Button>

                  <p className="text-[10px] text-center text-neutral-500 uppercase tracking-widest">
                    Next: Select delivery address & review reservation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isStandalonePage) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0c] text-neutral-100 overflow-hidden animate-fadeIn">
        {cartContent}
      </div>
    );
  }

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={resetState} title="" variant="fullscreen">
      {cartContent}
    </Modal>
  );
};
