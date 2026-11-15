import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductCard } from '@/features/products';
import { Product, CurrencyConfig, CategoryType } from '@/types';
import { Filter } from 'lucide-react';
import { productService } from '@/features/admin/services/product.service';
import { useCategoryStore } from '@/stores';
import { ApiErrorFallback } from '@/components/common/ApiErrorFallback';

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

const DEFAULT_CATEGORY_TABS: CategoryTab[] = [
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
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const storeCategories = useCategoryStore((state) => state.categories);

  const categoryTabs = useMemo<CategoryTab[]>(() => {
    if (!storeCategories || storeCategories.length === 0) {
      return DEFAULT_CATEGORY_TABS;
    }
    return [
      { label: 'ALL', value: 'ALL' },
      ...storeCategories.map((c) => ({
        label: c.title.toUpperCase(),
        value: (c.id || c.categoryId?.toUpperCase() || c.title.toUpperCase()) as CategoryType,
        badge: c.title.toUpperCase().includes('SAREE') ? 'COMING SOON' : undefined,
      })),
    ];
  }, [storeCategories]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getAll({ status: 'ACTIVE' });
      if (res.data && res.data.length > 0) {
        const mapped: Product[] = res.data.map((p) => ({
          id: p.slug || p.id,
          name: p.name,
          subtitle: p.shortDescription || p.category?.title || 'Heirloom Garment',
          category: (p.category?.title?.toUpperCase() || 'KURTIS') as CategoryType,
          priceINR: p.basePrice || 0,
          priceUSD: Math.round((p.basePrice || 0) / 85),
          image: p.imageUrl || '/images/default.jpg',
          description: p.description || p.shortDescription || '',
          craftDetails: [`Fit: ${p.fit}`],
          fabric: p.fit || 'Mulberry Silk & Chanderi',
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          categoryId: p.categoryId || p.category?.id,
          subCategoryId: p.subCategoryId || p.subCategory?.id,
        }));
        setLiveProducts(mapped);
      } else {
        setLiveProducts([]);
      }
    } catch (err: any) {
      console.error('Error fetching showcase collection:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to connect to collection archive.'
      );
      setLiveProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const sourceProducts = liveProducts;

  const filteredProducts = useMemo(() => {
    if (filterMode === 'ALL') return sourceProducts;
    return sourceProducts.filter((p) => {
      const pCatId = (p as any).categoryId || (p as any).category?.id;
      const pCatTitle = p.category?.toString().toUpperCase();
      const target = filterMode.toString().toUpperCase();

      if (pCatId && pCatId === filterMode) return true;
      if (pCatTitle && (pCatTitle === target || pCatTitle.includes(target) || target.includes(pCatTitle))) return true;
      return false;
    });
  }, [filterMode, sourceProducts]);

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

          {/* Dynamic Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-wider uppercase text-neutral-500 mr-2">
              <Filter size={12} />
              <span>Category:</span>
            </span>
            {categoryTabs.map((tab) => {
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

        {/* Error Fallback */}
        {error && (
          <ApiErrorFallback
            compact
            title="Collection Archive Disrupted"
            message={error}
            onRetry={loadProducts}
            className="my-8"
          />
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[3/4] bg-neutral-900 border border-neutral-800" />
                <div className="h-4 bg-neutral-900 w-3/4" />
                <div className="h-3 bg-neutral-900 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Garment Grid */}
        {!isLoading && !error && (
          filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 font-serif">
              <p className="text-base text-neutral-400">No heirlooms currently in this category.</p>
              <button
                onClick={() => setFilterMode('ALL')}
                className="mt-3 text-xs uppercase tracking-wider text-adwika-sand underline cursor-pointer"
              >
                View All Pieces
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
};
