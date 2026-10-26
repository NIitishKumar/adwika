import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * FestiveEditBanner — matches the dark charcoal banner from the prototype:
 * "THE FESTIVE EDIT / LIMITED COLLECTION"
 * "A season to remember."
 * Button: SHOP THE EDIT →
 * Bottom-right: DESIGNED IN INDIA / MADE TO BE KEPT
 */
export const FestiveEditBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#3e3c38] text-neutral-100 px-8 md:px-16 py-16 md:py-20 mx-4 md:mx-8 lg:mx-12 relative">
      {/* Eyebrow */}
      <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-neutral-400 font-sans mb-5">
        THE FESTIVE EDIT &nbsp;/&nbsp; LIMITED COLLECTION
      </p>

      {/* Main Heading */}
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-100 font-light italic leading-tight mb-4 max-w-lg">
        A season to remember.
      </h2>

      {/* Subtitle */}
      <p className="text-xs md:text-sm text-neutral-300 font-sans font-light max-w-md mb-8 leading-relaxed">
        Thoughtful occasionwear, expressive colour and the beauty of considered craft.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/occasionwear')}
        className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase font-sans font-medium text-neutral-900 bg-neutral-100 hover:bg-white px-6 py-3 transition-all duration-200 group"
      >
        <span>SHOP THE EDIT</span>
        <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>

      {/* Bottom-right tagline */}
      <div className="absolute bottom-8 right-8 md:bottom-10 md:right-16 text-right hidden sm:block">
        <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-sans leading-relaxed">
          DESIGNED IN INDIA
        </p>
        <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-sans">
          MADE TO BE KEPT
        </p>
      </div>
    </section>
  );
};
