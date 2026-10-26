import React from 'react';

/**
 * ManifestoBanner — matches the rich dark maroon banner from prototype:
 * Authentic bilingual brand logo (English + Hindi with red dot)
 * Eyebrow: CONTEMPORARY INDIAN DESIGN
 * Main quote in italic serif:
 *   "Твоя нежность — твоя сила."
 *   "Оставайся собой."
 * Bottom tagline: CRAFTED WITH INTENTION · WORN YOUR WAY
 */
export const ManifestoBanner: React.FC = () => {
  return (
    <section className="bg-[#481a24] text-neutral-100 py-24 md:py-36 px-6 md:px-12 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Authentic bilingual brand logo with red dot */}
        <div className="mb-6">
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-rose-200/60 font-sans mb-10 md:mb-12">
          CONTEMPORARY INDIAN DESIGN
        </p>

        {/* Central Poetic Statement */}
        <div className="space-y-3 md:space-y-4 mb-12 md:mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-neutral-100 font-light italic tracking-tight leading-tight">
            Твоя нежность — твоя сила.
          </h2>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-neutral-100 font-light italic tracking-tight leading-tight">
            Оставайся собой.
          </h2>
        </div>

        {/* Bottom Tagline */}
        <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-rose-200/60 font-sans">
          CRAFTED WITH INTENTION &nbsp;·&nbsp; WORN YOUR WAY
        </p>
      </div>
    </section>
  );
};
