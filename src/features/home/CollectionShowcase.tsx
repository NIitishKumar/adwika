import React, { useState } from 'react';
import { ProductCard } from '@/features/products';
import { PRODUCTS } from '@/data/products';
import { Product, CurrencyConfig, CategoryType } from '@/types';
import { Filter, Sparkles } from 'lucide-react';

interface CollectionShowcaseProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

interface CategoryTab {
  label: string;
  value: CategoryType;
  badge?: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'KURTIS', value: 'KURTIS' },
  { label: 'SUITS', value: 'SUITS' },
  { label: 'CO-ORDS', value: 'CO-ORDS' },
  { label: 'SHIRTS', value: 'SHIRTS' },
  { label: 'SAREES', value: 'SAREES', badge: 'COMING SOON' },
];

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  selectedCategory,
  onSelectCategory,
  currency,
  onQuickView,
}) => {
  const [filterMode, setFilterMode] = useState<CategoryType>(selectedCategory);

  const filteredProducts = PRODUCTS.filter((p) => {
    if (filterMode === 'ALL') return true;
    return p.category === filterMode;
  });

  return (
    <section id="collection-showcase" className="bg-[#0b0b0d] text-neutral-100 py-20 px-6 md:px-12 border-t border-neutral-900">
      <div className="max-w-[1560px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-adwika-bindi" />
              <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand">
                CURATED CATEGORIES
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-wider text-neutral-100 font-normal">
              Explore Our Collection
            </h2>
          </div>

          {/* Filter Pills with KURTIS, SUITS, CO-ORDS, SHIRTS, SAREES (COMING SOON) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-wider uppercase text-neutral-500 mr-2">
              <Filter size={12} />
              <span>Category:</span>
            </span>
            {CATEGORY_TABS.map((tab) => {
              const isActive = filterMode === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setFilterMode(tab.value);
                    onSelectCategory(tab.value);
                  }}
                  className={`text-[11px] tracking-widest uppercase px-4 py-2 border transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'border-neutral-200 bg-neutral-100 text-neutral-900 font-semibold shadow-md'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white bg-black/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[8px] tracking-wider px-1.5 py-0.5 uppercase font-mono ${
                        isActive
                          ? 'bg-neutral-900 text-amber-200'
                          : 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Announcement Banner for Sarees */}
        {filterMode === 'SAREES' && (
          <div className="mb-10 p-6 bg-gradient-to-r from-neutral-900 via-[#18181f] to-neutral-900 border border-adwika-sand/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-adwika-sand shrink-0" size={20} />
              <div>
                <h4 className="font-serif text-base text-neutral-100 tracking-wide">
                  The Saree Atelier Capsule — Arriving Winter 2026
                </h4>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Hand-painted Kalamkaris, Banarasi katan silks, and whisper-light Chanderis woven on antique pit looms. Preview the inaugural archives below.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('You have been added to the Priority Saree Dispatch list.')}
              className="px-5 py-2 text-[10px] tracking-widest uppercase bg-adwika-sand text-neutral-950 font-medium hover:bg-white transition-colors shrink-0"
            >
              Request VIP Dispatch
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                currency={currency}
                onQuickView={onQuickView}
              />
              {product.comingSoon && (
                <div className="absolute top-3 right-3 bg-amber-900/90 text-amber-200 border border-amber-600/40 px-2.5 py-1 text-[9px] tracking-widest uppercase font-mono backdrop-blur-sm pointer-events-none">
                  COMING SOON
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
