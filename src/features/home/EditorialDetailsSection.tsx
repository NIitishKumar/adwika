import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EditorialDetailsSection — matches prototype:
 * Eyebrow: "THE ADWIKA POINT OF VIEW"
 * Title: "Beauty in the details."
 * Subtext: "From the first sketch to the final stitch, we believe the most meaningful pieces are the ones you make your own."
 * Button: "READ OUR JOURNAL"
 * Right side: Asymmetric pair of images (tall sandstone drapery, and square terracotta rust weave)
 */
export const EditorialDetailsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f5f4ef] text-neutral-900 py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-neutral-200">
      <div className="max-w-[1560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-5 pr-0 lg:pr-8">
            <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-neutral-500 font-sans mb-4">
              THE ADWIKA POINT OF VIEW
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-light leading-tight mb-6">
              Beauty in the details.
            </h2>

            <p className="text-xs md:text-sm text-neutral-600 font-sans font-light leading-relaxed mb-8 max-w-md">
              From the first sketch to the final stitch, we believe the most meaningful
              pieces are the ones you make your own.
            </p>

            <button
              onClick={() => navigate('/journal')}
              className="inline-flex items-center text-[10px] tracking-widest uppercase font-sans font-medium text-neutral-100 bg-neutral-900 hover:bg-neutral-800 px-6 py-3 transition-colors"
            >
              READ OUR JOURNAL
            </button>
          </div>

          {/* Right Column: Two Asymmetric Image Blocks */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-end gap-6 sm:gap-8 justify-end">
            {/* Tall Left Block (Beige / Raw Silk Stone) */}
            <div className="w-full sm:w-[50%] aspect-[3/4] bg-[#ded8ce] overflow-hidden shadow-sm">
              <img
                src="/images/editorial-details-tall.jpg"
                alt="Adwika draped silk on stone"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Square Right Block (Rich Terracotta Rust) */}
            <div className="w-full sm:w-[50%] aspect-square bg-[#9d5541] overflow-hidden shadow-sm">
              <img
                src="/images/editorial-details-rust.jpg"
                alt="Adwika terracotta handwoven textile weave"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
