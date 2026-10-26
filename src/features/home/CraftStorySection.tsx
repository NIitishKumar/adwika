import React from 'react';
import { Compass, Feather, Sparkles } from 'lucide-react';

export const CraftStorySection: React.FC = () => {
  return (
    <section id="brand-about" className="bg-[#080809] text-neutral-100 py-24 px-6 md:px-12 border-t border-neutral-900 relative overflow-hidden">
      {/* Subtle background ornamentation */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-800/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text / Philosophy */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-adwika-bindi" />
              <span className="text-[10px] tracking-wide-luxury uppercase text-adwika-sand">
                OUR PHILOSOPHY
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider font-normal leading-tight text-neutral-100">
              Modern heirlooms, rooted in the soul of India.
            </h2>

            <p className="text-sm md:text-base text-neutral-400 font-serif leading-relaxed font-light">
              &ldquo;Adwika was founded on a singular vision: to honor age-old Indian textile craft while paring back ornamental noise. We create pieces with weight, fluidity, and quiet poise — made not merely to be worn for a season, but passed down as heirlooms.&rdquo;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-800/80">
              <div className="flex flex-col gap-2">
                <Feather size={18} className="text-adwika-sand" />
                <h4 className="text-xs uppercase tracking-wider text-neutral-200 font-medium">Pure Handloom</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Direct artisan collaborations in Chanderi, Maheshwar, and Bhagalpur.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Sparkles size={18} className="text-adwika-sand" />
                <h4 className="text-xs uppercase tracking-wider text-neutral-200 font-medium">Heirloom Zari</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Electroplated silver and antique gold wires hand-couched by master kaarigars.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Compass size={18} className="text-adwika-sand" />
                <h4 className="text-xs uppercase tracking-wider text-neutral-200 font-medium">Considered Cut</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Sculptural comfort designed for ease of movement and versatile layering.
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800">
              <img
                src="/images/craft-detail-collection.jpg"
                alt="Adwika Zari Embroidery Detail"
                className="w-full h-full object-cover filter contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-adwika-sand font-mono">
                    ATELIER ARCHIVE NO. 408
                  </span>
                  <p className="font-serif text-lg text-white">Marodi & Bullion Needlework on Wild Tussar</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 bg-black/60 px-2.5 py-1 backdrop-blur-sm border border-neutral-700">
                  Certified Handcrafted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
