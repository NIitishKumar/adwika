import React, { useEffect } from 'react';
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
import { useCategoryStore } from '@/stores';

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

  useEffect(() => {
    useCategoryStore.getState().fetchCategories();
  }, []);

  const handleScrollToExplore = () => {
    const el = document.getElementById('categories-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryFromGrid = (category: CategoryType) => {
    const raw = String(category);
    const norm = raw.toUpperCase().replace(/[\s_-]+/g, '');
    if (norm === 'KURTIS' || norm === 'KURTI') {
      navigate('/kurtis');
    } else if (norm === 'SUITS' || norm === 'SUIT') {
      navigate('/suits');
    } else if (norm === 'COORDS' || norm === 'COORD') {
      navigate('/coords');
    } else if (norm === 'SHIRTS' || norm === 'SHIRT') {
      navigate('/shirts');
    } else if (norm === 'SAREES' || norm === 'SAREE') {
      navigate('/sarees');
    } else {
      const slug = raw.toLowerCase().replace(/[\s_]+/g, '-');
      navigate(`/category/${slug}`);
    }
  };

  return (
    <>
      {/* 1. Hero Section matching initial prototype */}
      <HeroSection onExplore={handleScrollToExplore} />

      {/* 2. 2-Column Curated Pillars Grid matching initial prototype */}
      <CategoryGridSection onSelectCategory={handleSelectCategoryFromGrid} />

      {/* 3. Festive Edit Banner matching prototype */}
      {/* <div className="py-8 bg-[#f5f4ef]">
        <FestiveEditBanner />
      </div> */}

      {/* 4. Tradition Section (A closer look at Adwika) matching prototype */}
      <TraditionSection />

      {/* 5. The Current Collection (Pieces to return to — 4-column product grid) */}
      <CurrentCollectionSection
        currency={currency}
        onQuickView={onQuickView}
      />

      {/* 6. Beauty in the details (Editorial duo section) */}
      {/* <EditorialDetailsSection /> */}

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
