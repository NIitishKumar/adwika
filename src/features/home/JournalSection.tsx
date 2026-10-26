import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface JournalEntry {
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
}

const ENTRIES: JournalEntry[] = [
  {
    title: 'The Art of Modern Draping: Historic Cuts For Contemporary Living',
    category: 'ESSAY · SILHOUETTE',
    date: 'OCTOBER 2026',
    readTime: '4 MIN READ',
    excerpt: 'Exploring how the fluid architecture of Indian garments creates effortless ease without rigid structural tailoring.',
    image: '/images/women-collection.jpg',
  },
  {
    title: 'Gossamer Threads: Breathing Life into Chanderi Pit Looms',
    category: 'ATELIER DISPATCH',
    date: 'SEPTEMBER 2026',
    readTime: '6 MIN READ',
    excerpt: 'A journey along the Betwa river, documenting fifth-generation master weavers who count threads by intuition and memory.',
    image: '/images/craft-detail-collection.jpg',
  },
  {
    title: 'Quiet Splendor: Subdued Champagne Palettes in Indian Occasionwear',
    category: 'EDITORIAL REFLECTION',
    date: 'AUGUST 2026',
    readTime: '5 MIN READ',
    excerpt: 'Moving past saturated neon wedding palettes towards earthen tones, ivory raw silk, and whisper-soft hammered textures.',
    image: '/images/occasionwear-collection.jpg',
  },
];

export const JournalSection: React.FC = () => {
  return (
    <section id="brand-journal" className="bg-[#0b0b0e] text-neutral-100 py-24 px-6 md:px-12 border-t border-neutral-900">
      <div className="max-w-[1560px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand block mb-2">
              ADWIKA CHRONICLES
            </span>
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-wider text-neutral-100 font-normal">
              The Journal
            </h2>
          </div>
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-sans">
            Stories of Textile, Heritage & Craft
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ENTRIES.map((entry, index) => (
            <article key={index} className="group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 mb-5">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 text-[9px] tracking-widest text-adwika-sand uppercase">
                    {entry.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-mono">
                  <span>{entry.date}</span>
                  <span>·</span>
                  <span>{entry.readTime}</span>
                </div>

                <h3 className="font-serif text-lg tracking-wide text-neutral-200 group-hover:text-adwika-sand transition-colors mb-2.5 leading-snug">
                  {entry.title}
                </h3>

                <p className="text-xs text-neutral-400 font-sans leading-relaxed line-clamp-2">
                  {entry.excerpt}
                </p>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors border-b border-neutral-800 pb-1 w-max">
                <span>Read Story</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
