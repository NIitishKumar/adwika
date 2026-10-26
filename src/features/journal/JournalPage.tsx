import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'SILHOUETTE' | 'ATELIER' | 'HERITAGE';
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: 'art-01',
    title: 'The Art of Modern Draping: Historic Cuts For Contemporary Living',
    category: 'SILHOUETTE',
    date: 'OCTOBER 2026',
    readTime: '4 MIN READ',
    author: 'Adwika Design Guild',
    excerpt: 'Exploring how the fluid architecture of Indian garments creates effortless ease without rigid structural tailoring.',
    content: 'For centuries, traditional Indian clothing was defined not by rigid tailored seams, but by unstitched drapes of continuous handwoven yardage. From the architectural pleats of the Antariya to the fluid drape of the Chanderi sari, geometry adapted to the living human body. At Adwika, we honor this principle: our coats, angrakhas, and overlays are constructed to flow with the wearer rather than constrict.',
    image: '/images/women-collection.jpg',
  },
  {
    id: 'art-02',
    title: 'Gossamer Threads: Breathing Life into Chanderi Pit Looms',
    category: 'ATELIER',
    date: 'SEPTEMBER 2026',
    readTime: '6 MIN READ',
    author: 'Veda Narayanan, Textile Historian',
    excerpt: 'A journey along the Betwa river, documenting fifth-generation master weavers who count threads by intuition and memory.',
    content: 'Chanderi is more than a fabric; it is a microclimate. Spun in high summer when humidity allows the gossamer raw silk yarns to withstand loom tension without snapping, its sheer luster resembles morning mist over sandstone temples.',
    image: '/images/craft-detail-collection.jpg',
  },
  {
    id: 'art-03',
    title: 'Quiet Splendor: Subdued Champagne Palettes in Indian Occasionwear',
    category: 'HERITAGE',
    date: 'AUGUST 2026',
    readTime: '5 MIN READ',
    author: 'Ananya Roy',
    excerpt: 'Moving past saturated neon wedding palettes towards earthen tones, ivory raw silk, and whisper-soft hammered textures.',
    content: 'The modern Indian woman seeks garments that reflect inner gravitas rather than loud external decoration. Our occasionwear collection replaces screaming reds with sand, ecru, oyster greige, and soft moss — punctuated with authentic aged gold zari.',
    image: '/images/occasionwear-collection.jpg',
  },
];

export const JournalPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filtered = ARTICLES.filter(
    (a) => activeFilter === 'ALL' || a.category === activeFilter
  );

  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      {/* Header */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-16 border-b border-neutral-900">
        <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-2 block font-mono">
          THE ADWIKA EDITORIAL
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl uppercase tracking-[0.2em] font-normal text-white">
          The Journal
        </h1>
        <p className="font-serif text-sm md:text-base text-neutral-400 mt-4 max-w-xl font-light leading-relaxed">
          Essays on textile archaeology, contemporary draping, sustainable craft communities, and the philosophy of quiet luxury.
        </p>

        {/* Filters */}
        <div className="flex gap-2.5 mt-8 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'SILHOUETTE', 'ATELIER', 'HERITAGE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-[10px] uppercase tracking-wider px-4 py-2 border transition-all ${
                activeFilter === filter
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="bg-[#0c0c10] border border-neutral-800/80 p-6 flex flex-col justify-between group hover:border-neutral-600 transition-all"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 mb-5">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-[9px] uppercase tracking-widest text-adwika-sand">
                    {art.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-mono">
                  <span>{art.date}</span>
                  <span>·</span>
                  <span>{art.readTime}</span>
                </div>

                <h3 className="font-serif text-xl text-neutral-100 group-hover:text-adwika-sand transition-colors mb-3 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-4">
                  {expandedArticle === art.id ? art.content : art.excerpt}
                </p>
              </div>

              <button
                onClick={() => setExpandedArticle(expandedArticle === art.id ? null : art.id)}
                className="mt-4 pt-3 border-t border-neutral-800/80 inline-flex items-center justify-between text-xs uppercase tracking-widest text-adwika-sand hover:text-white transition-colors"
              >
                <span>{expandedArticle === art.id ? 'Close Essay' : 'Read Full Essay'}</span>
                <ArrowUpRight size={14} className={expandedArticle === art.id ? 'rotate-90' : ''} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
