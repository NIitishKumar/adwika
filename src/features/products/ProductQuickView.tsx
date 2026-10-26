import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { Product, CurrencyConfig, CartItem } from '@/types';
import { Sparkles, Check, Heart } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onAddToCart: (product: Product, size: CartItem['size']) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<CartItem['size']>('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const formatPrice = () => {
    if (currency.code === 'INR') {
      return `₹${product.priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(product.priceINR * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
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
            <span className="text-[10px] uppercase tracking-[0.25em] text-adwika-sand">
              {product.category}
            </span>
            <h2 className="font-serif text-2xl tracking-wide text-neutral-100 mt-1 mb-2">
              {product.name}
            </h2>
            <p className="text-xl font-serif text-white mb-4">{formatPrice()}</p>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Fabric & Origin */}
            <div className="bg-[#121215] p-3.5 border border-neutral-800/80 mb-6 text-xs flex flex-col gap-1.5">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Fabrication & Origin</span>
              <span className="text-neutral-200 font-medium">{product.fabric}</span>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-2.5">
                <span className="uppercase tracking-widest text-neutral-400 text-[10px]">Select Size</span>
                <span className="text-neutral-500 underline text-[10px] cursor-pointer">Bespoke Fit Guide</span>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`flex-1 py-2 text-xs uppercase tracking-wider border transition-all ${
                      selectedSize === sz
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

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
          <div className="pt-6 mt-6 border-t border-neutral-800">
            <Button
              variant="filled"
              size="lg"
              onClick={handleAdd}
              disabled={addedSuccess}
              className="w-full flex items-center justify-center gap-2"
            >
              {addedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Added To Bag</span>
                </>
              ) : (
                <span>Add To Bag — {formatPrice()}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
