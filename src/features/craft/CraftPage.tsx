import React from 'react';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/features/products';
import { CurrencyConfig, Product } from '@/types';
import { Sparkles, Compass, Feather } from 'lucide-react';

interface CraftPageProps {
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

export const CraftPage: React.FC<CraftPageProps> = ({
  currency,
  onQuickView,
}) => {
  const craftProducts = PRODUCTS.filter((p) => p.category === 'CRAFT & DETAIL');

  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      {/* Hero Header */}
      <div className="relative h-[440px] md:h-[500px] overflow-hidden flex items-center justify-center text-center px-6">
        <img
          src="/images/craft-detail-collection.jpg"
          alt="Craft & Detail Archive"
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-black/50 to-black/70" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center animate-fadeIn">
          <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-3 font-mono">
            ARCHIVE NO. 03
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-[0.2em] uppercase font-normal text-white">
            Craft & Detail
          </h1>
          <p className="font-serif text-sm md:text-base text-neutral-300 mt-4 leading-relaxed max-w-xl font-light">
            Every stitch, every weave, every bullion metallic thread is an unbroken continuation of centuries of Indian artisan mastery.
          </p>
        </div>
      </div>

      {/* Craft Pillars */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-20 border-b border-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 bg-[#0e0e12] border border-neutral-800 flex flex-col gap-4">
            <Feather size={24} className="text-adwika-sand" />
            <h3 className="font-serif text-xl uppercase tracking-wider text-white">Pit Loom Chanderi</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Woven in Madhya Pradesh on four-pedal pit looms using unbleached wild mulberry and cotton warp. Celebrated for its transparent texture and celestial weightlessness.
            </p>
          </div>

          <div className="p-8 bg-[#0e0e12] border border-neutral-800 flex flex-col gap-4">
            <Sparkles size={24} className="text-adwika-sand" />
            <h3 className="font-serif text-xl uppercase tracking-wider text-white">Real Zari & Marodi</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Fine silver electroplated wires twisted around silk core threads. Hand-couched without piercing the fabric to create raised sculptural flora motifs.
            </p>
          </div>

          <div className="p-8 bg-[#0e0e12] border border-neutral-800 flex flex-col gap-4">
            <Compass size={24} className="text-adwika-sand" />
            <h3 className="font-serif text-xl uppercase tracking-wider text-white">Ethical Guilds</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              We eliminate intermediaries. Over 60% of all garment value flows directly into our weaver collectives across Uttar Pradesh, Kashmir, and Madhya Pradesh.
            </p>
          </div>
        </div>
      </div>

      {/* Collection Gallery */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-20">
        <h2 className="font-serif text-3xl uppercase tracking-wider text-white mb-2">
          The Craft Archive Pieces
        </h2>
        <p className="text-xs text-neutral-400 mb-12">
          Limited editions crafted in batches of no more than twelve pieces.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {craftProducts.map((p) => (
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
  );
};
