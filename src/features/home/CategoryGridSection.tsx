import React from 'react';
import { ArrowUpRight, Sparkles, Clock } from 'lucide-react';
import { CategoryType } from '@/types';

interface CategoryGridSectionProps {
  onSelectCategory: (category: CategoryType) => void;
}

interface CategoryCardItem {
  id: CategoryType;
  title: string;
  tagline: string;
  image: string;
  comingSoon?: boolean;
  cols: string;
  toneColor: string;
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    id: 'KURTIS',
    title: 'KURTIS',
    tagline: 'Architectural cuts, handspun Chanderis & effortless everyday drape',
    image: '/images/aangan-kurta.jpg',
    cols: 'lg:col-span-6',
    toneColor: 'bg-[#d8d5cb]',
  },
  {
    id: 'SUITS',
    title: 'SUITS',
    tagline: 'Kashmiri flora needlework, hammered silks & celebratory festive heirlooms',
    image: '/images/occasionwear-collection.jpg',
    cols: 'lg:col-span-6',
    toneColor: 'bg-[#c5b59f]',
  },
  {
    id: 'CO-ORDS',
    title: 'CO-ORDS',
    tagline: 'Fluid mulberry silk & Chanderi two-piece coordinates',
    image: '/images/gulab-set.jpg',
    cols: 'lg:col-span-4',
    toneColor: 'bg-[#e0d6cb]',
  },
  {
    id: 'SHIRTS',
    title: 'SHIRTS',
    tagline: 'Relaxed dropped-shoulder tailoring in pure handloom tussar & Maheshwari silk',
    image: '/images/craft-detail-collection.jpg',
    cols: 'lg:col-span-4',
    toneColor: 'bg-[#cfc8bc]',
  },
  {
    id: 'SAREES',
    title: 'SAREES',
    tagline: 'Hand-woven pit loom silks & hand-painted Kalamkaris — Arriving Winter 2026',
    image: '/images/hero-user.jpg',
    comingSoon: true,
    cols: 'lg:col-span-4',
    toneColor: 'bg-[#e4dcce]',
  },
];

export const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({
  onSelectCategory,
}) => {
  return (
    <section id="categories-grid" className="bg-[#f5f4ef] text-neutral-900 py-20 md:py-28 px-6 md:px-12 lg:px-16 transition-colors duration-500">
      <div className="max-w-[1560px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-neutral-300/60 gap-4">
          <div>
            <span className="text-[10px] tracking-widest-xl uppercase text-neutral-500 block mb-2">
              CURATED WARDROBE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-light">
              Explore By Category
            </h2>
          </div>

          <p className="text-xs md:text-sm text-neutral-500 font-sans max-w-md font-light">
            Rooted in Indian artisanal textile heritage, tailored for contemporary ease.
          </p>
        </div>

        {/* 5-Category Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          {CATEGORY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`${item.cols} relative group cursor-pointer overflow-hidden min-h-[380px] md:min-h-[460px] transition-all duration-700 shadow-sm hover:shadow-2xl ${item.toneColor}`}
            >
              {/* Background Photo */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700 ease-out"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 group-hover:via-black/15 transition-colors duration-500" />

              {/* Top Corner Badge for Sarees (Coming Soon) */}
              {item.comingSoon ? (
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-amber-900/90 text-amber-200 border border-amber-600/50 px-3 py-1 text-[9px] tracking-widest uppercase font-mono backdrop-blur-md shadow-lg">
                  <Clock size={11} />
                  <span>COMING SOON</span>
                </div>
              ) : (
                <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/90 text-neutral-900 px-3 py-1 text-[9px] tracking-widest uppercase font-sans font-semibold">
                    EXPLORE
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8 flex flex-col justify-end text-left select-none">
                <span className="text-[10px] tracking-widest-xl uppercase text-adwika-sand/90 font-mono mb-2">
                  ADWIKA COLLECTION
                </span>

                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-[0.12em] font-light uppercase text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  <div className="p-2 rounded-full border border-white/30 text-white group-hover:border-white group-hover:bg-white group-hover:text-neutral-950 transition-all duration-300">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-sans font-light mt-2 max-w-md line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 transition-opacity">
                  {item.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
