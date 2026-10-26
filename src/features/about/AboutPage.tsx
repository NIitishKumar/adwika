import React from 'react';
import { Sparkles, MapPin, Shield, Feather } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#080809] text-neutral-100">
      {/* Hero */}
      <div className="relative py-20 px-6 md:px-12 border-b border-neutral-900 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Brand logo display */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain mix-blend-screen filter contrast-125 brightness-110 drop-shadow-[0_4px_24px_rgba(203,175,148,0.3)]"
          />
        </div>

        <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-3 font-mono">
          ATELIER PHILOSOPHY & MANIFESTO
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl uppercase tracking-[0.2em] font-normal text-white mb-6">
          Rooted in India
        </h1>
        <p className="font-serif text-base md:text-xl text-neutral-300 font-light leading-relaxed max-w-2xl">
          &ldquo;Adwika — Sanskrit for &lsquo;Unique&rsquo; and &lsquo;Without Equal&rsquo; — was conceived to redefine modern Indian couture. Not as nostalgic reenactment, but as living, breathing modern design.&rdquo;
        </p>
      </div>

      {/* Origin Story Grid */}
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand block mb-2 font-mono">
              THE SIGNATURE MARK
            </span>
            <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-wider text-white mb-6">
              The Crimson Bindi & The Sanskrit Root
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-neutral-400 font-sans leading-relaxed">
              <p>
                Our emblem combines classical Roman typography with the ancient Devanagari script (अद्विका). Crowned by the sacred crimson bindi above the letter &lsquo;i&rsquo;, it represents the third eye — intuition, heightened consciousness, and the poised sovereignty of the modern Indian woman.
              </p>
              <p>
                Every piece in our collections begins not on a digital sketchbook, but on wooden pit looms where generations of weaver families translate architectural geometry into pure warp and weft.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
              <div className="flex flex-col gap-1">
                <span className="font-serif text-2xl text-white">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                  Natural Plant Fibers & Silk
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-serif text-2xl text-white">400+</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                  Artisan Guild Members
                </span>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800">
            <img
              src="/images/women-collection.jpg"
              alt="Adwika Heritage Silhouette"
              className="w-full h-full object-cover filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-xs text-white/90 font-serif">
              Sandstone Drapes rooted in architectural Rajputana traditions
            </div>
          </div>
        </div>
      </div>

      {/* Sanctuaries & Showrooms */}
      <div className="bg-[#0c0c10] border-t border-neutral-900 py-20 px-6 md:px-12">
        <div className="max-w-[1560px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand mb-2 block font-mono">
              PRIVATE SANCTUARIES
            </span>
            <h2 className="font-serif text-3xl uppercase tracking-wider text-white">
              Visit The Ateliers
            </h2>
            <p className="text-xs text-neutral-400 font-sans mt-3">
              Experience the weight of handloom silk, explore custom fabric weaves, and consult with our master draper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-xs">
            <div className="p-8 border border-neutral-800 bg-neutral-950/60 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-adwika-sand">
                <MapPin size={16} />
                <span className="uppercase tracking-widest font-mono text-[10px]">NEW DELHI FLAGSHIP</span>
              </div>
              <h3 className="font-serif text-xl uppercase tracking-wider text-white">The Dhan Mill Atelier</h3>
              <p className="text-neutral-400 leading-relaxed">
                Compound 14, 100 Feet Road, Chhatarpur, New Delhi 110074.<br />
                Hours: Tuesday – Sunday, 11:00 AM – 8:00 PM.<br />
                Private consultations by prior appointment.
              </p>
            </div>

            <div className="p-8 border border-neutral-800 bg-neutral-950/60 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-adwika-sand">
                <MapPin size={16} />
                <span className="uppercase tracking-widest font-mono text-[10px]">MUMBAI SALON</span>
              </div>
              <h3 className="font-serif text-xl uppercase tracking-wider text-white">Kala Ghoda Heritage Suite</h3>
              <p className="text-neutral-400 leading-relaxed">
                Forbes Building, V.B. Gandhi Marg, Kala Ghoda, Fort, Mumbai 400001.<br />
                Hours: Monday – Saturday, 11:00 AM – 7:30 PM.<br />
                Curated trunkshows & bridal couture fittings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
