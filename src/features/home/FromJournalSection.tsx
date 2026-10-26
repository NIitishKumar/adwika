import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface JournalCard {
  category: string;
  title: string;
  image: string;
  slug: string;
}

const JOURNAL_CARDS: JournalCard[] = [
  {
    category: 'STYLING NOTES',
    title: 'How to wear heirloom pieces',
    image: '/images/women-collection.jpg',
    slug: 'how-to-wear-heirloom-pieces',
  },
  {
    category: 'OUR MAKERS',
    title: 'The hands behind the craft',
    image: '/images/craft-detail-collection.jpg',
    slug: 'the-hands-behind-the-craft',
  },
  {
    category: 'THE STUDIO',
    title: 'A study in texture and colour',
    image: '/images/editorial-details-rust.jpg',
    slug: 'a-study-in-texture-and-colour',
  },
];

export const FromJournalSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f5f4ef] text-neutral-900 py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-neutral-200">
      <div className="max-w-[1560px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[10px] md:text-[11px] tracking-widest-xl uppercase text-neutral-500 font-sans mb-3">
            NOTES ON CRAFT & CULTURE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-light">
            From the journal.
          </h2>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 lg:gap-10">
          {JOURNAL_CARDS.map((card, idx) => (
            <article
              key={idx}
              onClick={() => navigate('/journal')}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image Frame with subtle warm tone */}
                <div className="aspect-[16/10] bg-[#e6e2d8] overflow-hidden mb-5">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Category */}
                <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-sans mb-2">
                  {card.category}
                </p>

                {/* Title */}
                <h3 className="font-serif text-lg md:text-xl text-neutral-900 font-normal leading-snug group-hover:underline decoration-neutral-400 underline-offset-4 mb-4">
                  {card.title}
                </h3>
              </div>

              {/* Read link */}
              <div className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-sans font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                <span>READ THE STORY</span>
                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </article>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/journal')}
            className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase font-sans font-medium text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white px-8 py-3.5 transition-all duration-200"
          >
            DISCOVER ALL OUR STORIES
          </button>
        </div>
      </div>
    </section>
  );
};
