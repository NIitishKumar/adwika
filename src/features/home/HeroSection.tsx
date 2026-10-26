import React from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  return (
    <section className="relative min-h-screen w-full text-neutral-100 flex flex-col justify-between pt-28 pb-8 px-6 md:px-12 overflow-hidden">
      {/* Full-bleed, full-height and full-width background image with the user's ivory handloom saree */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <picture>
          <source srcSet="/images/hero-ivory-saree.jpg" type="image/jpeg" />
          <img
            src="/images/hero-user.jpg"
            alt="Adwika Handloom Ivory Saree Collection"
            className="w-full h-full object-cover object-top sm:object-center scale-100 sm:scale-105 animate-fadeIn transition-transform duration-1000 ease-out"
          />
        </picture>
        {/* Layered cinematic gradient overlay for perfect readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Spacer to balance navbar */}
      <div className="relative z-10 w-full" />

      {/* Hero Center Content - Perfectly replicating prototype */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto px-4 animate-fadeIn">
        {/* Eyebrow subtitle */}
        <p className="text-[11px] md:text-xs tracking-wide-luxury uppercase text-neutral-200/90 font-sans mb-4 md:mb-6 font-medium drop-shadow-md">
          CONTEMPORARY INDIAN DESIGN
        </p>

        {/* Main Brand Title - Majestic Serif Headline matching prototype */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.22em] font-normal uppercase text-white my-2 select-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
          ADWIKA
        </h1>

        {/* Bilingual Devanagari signature with red bindi dot */}
        <div className="flex items-center justify-center gap-2.5 -mt-1 mb-5">
          <span className="font-serif text-xs sm:text-sm tracking-[0.35em] text-neutral-200 uppercase drop-shadow">
            अद्विका
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-adwika-bindi inline-block shadow-md shadow-red-500/80" />
          <span className="text-[9px] tracking-[0.35em] text-neutral-300 uppercase font-sans">
            HEIRLOOMS
          </span>
        </div>

        {/* Tagline matching prototype verbatim */}
        <div className="max-w-xl mx-auto mt-2 md:mt-4 space-y-2">
          <p className="text-sm md:text-base font-serif text-neutral-200 tracking-wide font-light drop-shadow-md">
            Modern heirlooms, rooted in India.
          </p>
          <p className="text-xs md:text-sm font-sans text-neutral-300 font-light leading-relaxed drop-shadow-md">
            Considered silhouettes, expressive craft, and pieces made to feel like you.
          </p>
        </div>

        {/* CTA Button matching prototype: EXPLORE THE COLLECTION ↗ */}
        <div className="mt-8 md:mt-10">
          <Button
            variant="outline"
            size="lg"
            onClick={onExplore}
            className="border-white/40 hover:border-white text-white hover:text-black hover:bg-white bg-black/25 backdrop-blur-md transition-all duration-300 py-3.5 px-8 group text-xs tracking-[0.25em] shadow-lg"
          >
            <span className="flex items-center gap-2">
              <span>EXPLORE THE COLLECTION</span>
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </Button>
        </div>
      </div>

      {/* Bottom Bar matching prototype */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto flex items-center justify-between text-[11px] tracking-luxury uppercase text-neutral-300 pt-8 border-t border-white/15 drop-shadow-md">
        <span className="font-sans font-medium text-neutral-300 hover:text-white transition-colors">
          NEW COLLECTION / 01
        </span>

        <button
          onClick={onExplore}
          className="flex items-center gap-2 text-neutral-300 hover:text-white transition-all group font-sans font-medium"
        >
          <span>SCROLL TO DISCOVER</span>
          <ArrowDown
            size={13}
            className="animate-bounce transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </button>
      </div>
    </section>
  );
};
