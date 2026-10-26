import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Eye } from 'lucide-react';
import { Product, CurrencyConfig } from '@/types';
import { PRODUCTS } from '@/data/products';
import { formatPrice } from '@/utils';

interface CurrentCollectionSectionProps {
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

export const CurrentCollectionSection: React.FC<CurrentCollectionSectionProps> = ({
  currency,
  onQuickView,
}) => {
  const navigate = useNavigate();

  // The 4 headline products from prototype
  const prototypeProducts = PRODUCTS.slice(0, 4);

  return (
    <section className="bg-[#f5f4ef] text-neutral-900 py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-neutral-200">
      <div className="max-w-[1560px] mx-auto">
        {/* Section Header matching prototype */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-neutral-500 font-sans mb-3">
            THE CURRENT COLLECTION
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-light mb-4">
            Pieces to return to.
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 font-sans font-light max-w-xl mx-auto">
            A considered wardrobe of modern heirlooms — expressive in detail, effortless in spirit.
          </p>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
          {prototypeProducts.map((product) => (
            <div key={product.id} className="group flex flex-col justify-between">
              <div>
                {/* Product Image Frame */}
                <div className="relative aspect-[3/4] bg-[#eae7df] overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => onQuickView(product)}
                      className="bg-white/95 text-neutral-900 px-4 py-2 text-[10px] uppercase tracking-widest font-sans font-medium shadow-md hover:bg-neutral-900 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Eye size={12} />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                {/* Name & Price */}
                <div className="flex items-baseline justify-between mb-1">
                  <h3
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="font-serif text-base md:text-lg text-neutral-900 cursor-pointer hover:underline decoration-neutral-400 underline-offset-4"
                  >
                    {product.name}
                  </h3>
                  <span className="text-xs md:text-sm font-sans font-light text-neutral-800">
                    {formatPrice(product.priceINR, currency)}
                  </span>
                </div>

                {/* Subtitle / Fabric info */}
                <p className="text-[10px] tracking-wider uppercase text-neutral-500 font-sans mb-3">
                  {product.subtitle}
                </p>
              </div>

              {/* View Piece Link with Arrow */}
              <div className="pt-2 border-t border-neutral-200">
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase font-sans font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span>VIEW PIECE</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All CTA Button */}
        <div className="mt-16 md:mt-20 text-center">
          <button
            onClick={() => navigate('/women')}
            className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase font-sans font-medium text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white px-8 py-3.5 transition-all duration-200"
          >
            <span>EXPLORE ALL PIECES</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
};
