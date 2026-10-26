import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '@/data/products';
import { CurrencyConfig, CartItem, Product } from '@/types';
import { Button } from '@/components/ui';
import { ProductCard } from '../ProductCard';
import { Heart, Sparkles, ShieldCheck, ChevronDown, Check, ArrowLeft } from 'lucide-react';

interface ProductDetailPageProps {
  currency: CurrencyConfig;
  onAddToCart: (product: Product, size: CartItem['size']) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  currency,
  onAddToCart,
  onQuickView,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  const [selectedSize, setSelectedSize] = useState<CartItem['size']>('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('craft');

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
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

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
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden border border-neutral-800">
              <img
                src={product.image}
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
          </div>

          {/* Right Product Information (5 columns) */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-[10px] uppercase tracking-wide-luxury text-adwika-sand mb-2 font-mono">
              {product.category} · ARCHIVE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-white mb-3">
              {product.name}
            </h1>
            <p className="font-serif text-2xl text-neutral-100 mb-6 font-light">
              {formatPrice()}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-8">
              {product.description}
            </p>

            {/* Sizing */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="uppercase tracking-widest text-neutral-300 text-[10px]">Select Size</span>
                <span className="text-neutral-500 underline text-[10px] cursor-pointer">Fit Consultation</span>
              </div>
              <div className="flex gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`flex-1 py-3 text-xs uppercase tracking-wider border transition-all ${
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

            {/* CTA */}
            <Button
              variant="filled"
              size="lg"
              onClick={handleAdd}
              disabled={addedSuccess}
              className="w-full py-4 mb-8 flex items-center justify-center gap-2"
            >
              {addedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Reserved In Your Bag</span>
                </>
              ) : (
                <span>Add To Bag — {formatPrice()}</span>
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
      </div>
    </div>
  );
};
