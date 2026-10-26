import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, CurrencyConfig } from '@/types';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onQuickView,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  const formatPrice = () => {
    if (currency.code === 'INR') {
      return `₹${product.priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(product.priceINR * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const goToProduct = () => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="group flex flex-col text-left cursor-pointer">
      {/* Image container */}
      <div
        className="relative aspect-[3/4] bg-neutral-900 overflow-hidden"
        onClick={goToProduct}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/40 backdrop-blur-md text-neutral-300 hover:text-white transition-all opacity-80 group-hover:opacity-100 z-10"
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
        </button>

        {product.isNew && (
          <span className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[9px] tracking-widest uppercase font-medium px-2 py-0.5">
            New Arrival
          </span>
        )}

        {/* Hover quick view overlay action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="inline-flex items-center gap-1.5 text-[10px] tracking-luxury uppercase text-white bg-black/80 hover:bg-white hover:text-black transition-colors px-3 py-1.5 border border-white/30 backdrop-blur-sm"
          >
            <Eye size={12} />
            <span>Quick View</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToProduct();
            }}
            className="inline-flex items-center gap-1 text-[10px] tracking-luxury uppercase text-white bg-black/80 hover:bg-white hover:text-black transition-colors px-2.5 py-1.5 border border-white/30 backdrop-blur-sm"
          >
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col gap-1" onClick={goToProduct}>
        <span className="text-[9px] uppercase tracking-widest text-adwika-sand font-medium">
          {product.category}
        </span>
        <h3 className="font-serif text-sm tracking-wide text-neutral-200 group-hover:text-white transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[11px] text-neutral-400 font-sans line-clamp-1">
          {product.subtitle}
        </p>
        <span className="text-xs text-neutral-100 font-medium font-sans mt-1">
          {formatPrice()}
        </span>
      </div>
    </div>
  );
};
