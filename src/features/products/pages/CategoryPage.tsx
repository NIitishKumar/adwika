import React, { useState, useMemo } from 'react';
import { ProductCard } from '../ProductCard';
import { PRODUCTS } from '@/data/products';
import { Product, CurrencyConfig, CategoryType } from '@/types';
import { SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
  category: CategoryType;
  title: string;
  subtitle: string;
  heroImage: string;
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  title,
  subtitle,
  heroImage,
  currency,
  onQuickView,
}) => {
  const [selectedFabric, setSelectedFabric] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const categoryProducts = useMemo(() => {
    let list = PRODUCTS.filter((p) => category === 'ALL' || p.category === category);

    if (selectedFabric !== 'ALL') {
      list = list.filter((p) => p.fabric.toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.priceINR - b.priceINR);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.priceINR - a.priceINR);
    }

    return list;
  }, [category, selectedFabric, sortBy]);

  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      {/* Editorial Header */}
      <div className="relative h-[420px] md:h-[480px] overflow-hidden flex items-center justify-center text-center px-6">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-40 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-black/40 to-black/70" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center animate-fadeIn">
          <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-3 font-mono">
            COLLECTION / {category}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[0.2em] uppercase font-normal text-white">
            {title}
          </h1>
          <p className="font-serif text-sm md:text-base text-neutral-300 mt-4 leading-relaxed max-w-lg font-light">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-8 border-b border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Fabric filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-neutral-500 mr-2">
            <SlidersHorizontal size={13} />
            <span>Fabric:</span>
          </span>
          {['ALL', 'Chanderi', 'Raw Silk', 'Velvet', 'Zari'].map((fabric) => (
            <button
              key={fabric}
              onClick={() => setSelectedFabric(fabric)}
              className={`text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                selectedFabric === fabric
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
              }`}
            >
              {fabric}
            </button>
          ))}
        </div>

        {/* Counter and Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-neutral-400">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500">
            {categoryProducts.length} Heirlooms
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs px-3 py-1.5 uppercase tracking-wider outline-none focus:border-adwika-sand"
          >
            <option value="featured">Sort: Curated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-16">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="font-serif text-lg text-neutral-300">No heirlooms found with this filter</p>
            <button
              onClick={() => setSelectedFabric('ALL')}
              className="mt-4 text-xs tracking-widest uppercase text-adwika-sand underline"
            >
              Reset Fabric Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
