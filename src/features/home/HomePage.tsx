import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeroSection,
  CategoryGridSection,
  FestiveEditBanner,
  TraditionSection,
  CurrentCollectionSection,
  EditorialDetailsSection,
  FromJournalSection,
  ManifestoBanner,
  CollectionShowcase,
  CraftStorySection,
  NewsletterSection,
} from './';
import { Product, CurrencyConfig, CategoryType } from '@/types';

interface HomePageProps {
  currency: CurrencyConfig;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currency,
  onQuickView,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryType>('ALL');

  const handleScrollToExplore = () => {
    const el = document.getElementById('categories-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryFromGrid = (category: CategoryType) => {
    if (category === 'KURTIS') {
      navigate('/kurtis');
    } else if (category === 'SUITS') {
      navigate('/suits');
    } else if (category === 'CO-ORDS') {
      navigate('/coords');
    } else if (category === 'SHIRTS') {
      navigate('/shirts');
    } else if (category === 'SAREES') {
      navigate('/sarees');
    } else {
      setSelectedCategory(category);
      document.getElementById('collection-showcase')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Hero Section matching initial prototype */}
      <HeroSection onExplore={handleScrollToExplore} />

      {/* 2. 2-Column Curated Pillars Grid matching initial prototype */}
      <CategoryGridSection onSelectCategory={handleSelectCategoryFromGrid} />

      {/* 3. Festive Edit Banner matching prototype */}
      <div className="py-8 bg-[#f5f4ef]">
        <FestiveEditBanner />
      </div>

      {/* 4. Tradition Section (A closer look at Adwika) matching prototype */}
      <TraditionSection />

      {/* 5. The Current Collection (Pieces to return to — 4-column product grid) */}
      <CurrentCollectionSection
        currency={currency}
        onQuickView={onQuickView}
      />

      {/* 6. Beauty in the details (Editorial duo section) */}
      <EditorialDetailsSection />

      {/* 7. Notes on Craft & Culture (From the journal — 3 stories) */}
      <FromJournalSection />

      {/* 8. Manifesto Banner (Dark maroon poetic statement) */}
      <ManifestoBanner />

      {/* 9. Comprehensive Catalog Showcase with filter tabs */}
      <CollectionShowcase
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        currency={currency}
        onQuickView={onQuickView}
      />

      {/* 10. Atelier Craft Story */}
      <CraftStorySection />

      {/* 11. Patrons Circle Newsletter (Formik + Zod validation) */}
      <NewsletterSection />
    </>
  );
};
