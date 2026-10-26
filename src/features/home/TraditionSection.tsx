import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TraditionSection — matches the prototype:
 * Left: "A CLOSER LOOK AT ADWIKA", "Tradition, seen through a new lens."
 * Right: Asymmetric overlapping image collage (sandstone, beige, terracotta)
 * Bottom-right label: "THE ART OF MAKING"
 */
export const TraditionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f5f4ef] text-neutral-900 py-20 md:py-28 px-6 md:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-[1560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left: Text Content */}
          <div className="lg:col-span-4 pt-4 lg:pt-12">
            <p className="text-[10px] tracking-widest-xl uppercase text-neutral-500 font-sans mb-4">
              A CLOSER LOOK AT ADWIKA
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] text-neutral-900 font-light leading-snug mb-6">
              Tradition, seen<br />
              through a new lens.
            </h2>

            <p className="text-xs md:text-sm text-neutral-500 font-sans font-light leading-relaxed max-w-sm mb-8">
              We bring Indian craft into a contemporary wardrobe through
              tactile fabrics, considered silhouettes and the hands that
              make each piece.
            </p>

            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center text-[10px] tracking-widest uppercase font-sans font-medium text-neutral-100 bg-neutral-900 hover:bg-neutral-800 px-6 py-3 transition-colors"
            >
              DISCOVER OUR STORY
            </button>
          </div>

          {/* Right: Asymmetric Image Collage */}
          <div className="lg:col-span-8 relative min-h-[500px] md:min-h-[600px]">
            {/* Image 1: Tall sandstone tone — center-left */}
            <div className="absolute left-[10%] md:left-[15%] top-0 w-[38%] md:w-[34%] h-[75%] z-10">
              <img
                src="/images/women-collection.jpg"
                alt="Adwika drape silhouette"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 2: Large beige/cream tone — top-right */}
            <div className="absolute right-0 top-0 w-[48%] md:w-[44%] h-[68%] z-0">
              <img
                src="/images/occasionwear-collection.jpg"
                alt="Adwika occasionwear"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 3: Terracotta/rust tone — bottom-right */}
            <div className="absolute right-[5%] md:right-[10%] bottom-0 w-[35%] md:w-[30%] h-[35%] z-20">
              <img
                src="/images/craft-detail-collection.jpg"
                alt="Adwika artisan craft"
                className="w-full h-full object-cover"
                style={{ filter: 'sepia(0.2) saturate(1.1)' }}
              />
              {/* Label */}
              <p className="absolute -right-4 md:-right-8 bottom-2 text-[10px] tracking-widest uppercase text-neutral-500 font-sans whitespace-nowrap">
                THE ART OF MAKING
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
