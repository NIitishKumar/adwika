import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui';
import { Product, CurrencyConfig } from '@/types';
import { Search, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { productService } from '@/features/admin/services/product.service';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onSelectProduct: (product: Product) => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  currency,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getAll({
        search: query.trim() || undefined,
        status: 'ACTIVE',
      });
      if (res.data && res.data.length > 0) {
        const mapped: Product[] = res.data.map((p) => ({
          id: p.slug || p.id,
          name: p.name,
          subtitle: p.shortDescription || p.category?.title || 'Heirloom Garment',
          category: (p.category?.title?.toUpperCase() || 'KURTIS') as any,
          priceINR: p.basePrice || 0,
          priceUSD: Math.round((p.basePrice || 0) / 85),
          image: p.imageUrl || '/images/default.jpg',
          description: p.description || p.shortDescription || '',
          craftDetails: [`Fit: ${p.fit}`],
          fabric: p.fit || 'Mulberry Silk',
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
        }));
        setLiveProducts(mapped);
      } else {
        setLiveProducts([]);
      }
    } catch (err: any) {
      console.error('Search API error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to reach atelier search service.'
      );
      setLiveProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    performSearch(searchTerm);
  }, [isOpen, searchTerm, performSearch]);

  const sourceProducts = liveProducts;

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return sourceProducts.slice(0, 4);
    const q = searchTerm.toLowerCase();
    return sourceProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toString().toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q))
    );
  }, [searchTerm, sourceProducts]);

  const formatPrice = (p: Product) => {
    if (currency.code === 'INR') {
      return `₹${p.priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(p.priceINR * currency.rateFromINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" variant="drawer-right">
      <div className="flex flex-col h-full gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-7 w-auto object-contain mix-blend-screen"
          />
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-sans">
            SEARCH ARCHIVE
          </span>
        </div>
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by silhouette, craft, fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141418] border border-neutral-800 text-neutral-200 pl-10 pr-4 py-3 text-xs tracking-wider uppercase placeholder:text-neutral-600 focus:outline-none focus:border-adwika-sand"
            autoFocus
          />
        </div>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-2">
          {['Kurtis', 'Suits', 'Co-ords', 'Shirts', 'Sarees', 'Chanderi', 'Zari', 'Raw Silk'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-widest uppercase text-neutral-500">
              {searchTerm ? `Results (${filteredProducts.length})` : 'Curated Highlights'}
            </p>
            {isLoading && (
              <RefreshCw size={12} className="animate-spin text-[#c9a87c]" />
            )}
          </div>

          {error && (
            <div className="p-4 bg-[#181412] border border-[#382b22] text-center flex flex-col items-center gap-2 rounded">
              <AlertCircle size={16} className="text-amber-400" />
              <p className="text-xs text-neutral-300 font-sans">{error}</p>
              <button
                type="button"
                onClick={() => performSearch(searchTerm)}
                className="text-[10px] uppercase font-mono tracking-wider text-[#c9a87c] hover:underline"
              >
                Retry Search
              </button>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No heirlooms found matching &ldquo;{searchTerm}&rdquo;. Try another term.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="group flex gap-4 p-2.5 border border-neutral-900 hover:border-neutral-800 hover:bg-white/[0.02] cursor-pointer transition-all"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-20 object-cover bg-neutral-800"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <span className="text-[9px] tracking-widest text-adwika-sand uppercase">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-serif text-neutral-100 group-hover:text-adwika-sand transition-colors mt-0.5">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-sans">
                      {formatPrice(product)}
                    </span>
                    <ArrowRight size={14} className="text-neutral-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
