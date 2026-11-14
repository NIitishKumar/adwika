import React from 'react';
import { ProductCard } from '../ProductCard';
import { Product, CurrencyConfig, CategoryType } from '@/types';
import { SlidersHorizontal } from 'lucide-react';
import { useCategoryPage, CategorySortOption } from './useCategoryPage';

interface CategoryPageProps {
  category?: CategoryType;
  title?: string;
  subtitle?: string;
  heroImage?: string;
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
  const {
    activeCategory,
    pageTitle,
    pageSubtitle,
    pageHeroImage,
    subCategories,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedFabric,
    setSelectedFabric,
    sortBy,
    setSortBy,
    categoryProducts,
    isLoading,
    resetFilters,
  } = useCategoryPage({ category, title, subtitle, heroImage });

  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      {/* Editorial Header */}
      <div className="relative h-[420px] md:h-[480px] overflow-hidden flex items-center justify-center text-center px-6">
        <img
          src={pageHeroImage}
          alt={pageTitle}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/images/women-editorial.jpg')) {
              target.src = '/images/women-editorial.jpg';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-40 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-black/40 to-black/70" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center animate-fadeIn">
          <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-3 font-mono">
            COLLECTION / {activeCategory}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[0.2em] uppercase font-normal text-white">
            {pageTitle}
          </h1>
          <p className="font-serif text-sm md:text-base text-neutral-300 mt-4 leading-relaxed max-w-lg font-light">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-8 border-b border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sub-Category Pills (from API product-sub-categories/:categoryId) */}
        {subCategories.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-neutral-500 mr-2 shrink-0">
              <SlidersHorizontal size={13} />
              <span>Sub-Category:</span>
            </span>
            <button
              onClick={() => setSelectedSubCategory('ALL')}
              className={`text-[10px] uppercase tracking-wider px-3.5 py-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                selectedSubCategory === 'ALL'
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
              }`}
            >
              ALL
            </button>
            {subCategories.map((sub) => {
              const subKey = sub.slug || sub.id;
              const isSelected = selectedSubCategory === subKey;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(isSelected ? 'ALL' : subKey)}
                  className={`text-[10px] uppercase tracking-wider px-3.5 py-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        ) : (
          /* Fallback Fabric filters if no sub-categories */
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-neutral-500 mr-2 shrink-0">
              <SlidersHorizontal size={13} />
              <span>Fabric:</span>
            </span>
            {['ALL', 'Chanderi', 'Raw Silk', 'Velvet', 'Zari'].map((fabric) => (
              <button
                key={fabric}
                onClick={() => setSelectedFabric(fabric)}
                className={`text-[10px] uppercase tracking-wider px-3.5 py-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                  selectedFabric === fabric
                    ? 'border-white bg-white text-black font-semibold'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {fabric}
              </button>
            ))}
          </div>
        )}

        {/* Counter and Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-neutral-400">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 whitespace-nowrap">
            {categoryProducts.length} Heirlooms
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CategorySortOption)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs px-3 py-1.5 uppercase tracking-wider outline-none focus:border-adwika-sand cursor-pointer"
          >
            <option value="featured">Sort: Curated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
            <div className="w-6 h-6 border-2 border-adwika-sand border-t-transparent rounded-full animate-spin" />
            <span className="font-serif text-xs tracking-widest uppercase text-neutral-400">Loading heirlooms...</span>
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="font-serif text-lg text-neutral-300">No heirlooms found with this filter</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-xs tracking-widest uppercase text-adwika-sand underline cursor-pointer"
            >
              Reset Filter
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
