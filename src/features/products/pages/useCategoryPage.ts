import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PRODUCTS } from '@/data/products';
import { Product, CategoryType } from '@/types';
import { productService } from '@/features/admin/services/product.service';
import { productSubCategoryService } from '@/features/admin/services/productSubCategory.service';
import { ProductSubCategory } from '@/features/admin/types/productSubCategory.types';
import { useCategoryStore } from '@/stores';

export type CategorySortOption = 'featured' | 'price-asc' | 'price-desc';

export interface UseCategoryPageOptions {
  category?: CategoryType;
  title?: string;
  subtitle?: string;
  heroImage?: string;
}

export function useCategoryPage({
  category,
  title,
  subtitle,
  heroImage,
}: UseCategoryPageOptions = {}) {
  const { slug } = useParams<{ slug?: string }>();
  const rawCat = slug || category || 'ALL';
  const activeCategory = (category || (slug ? slug.toUpperCase() : 'ALL')) as CategoryType;

  // Resolve category info & database ID from global Zustand store
  const matchedCategory = useCategoryStore.getState().getCategoryByIdOrSlug(rawCat);
  const categoryId = matchedCategory?.id || rawCat;

  const pageTitle =
    title ||
    matchedCategory?.title ||
    (slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Collection');

  const pageSubtitle =
    subtitle ||
    matchedCategory?.description ||
    'Curated luxury collection in artisanal Indian textiles.';

  const pageHeroImage =
    heroImage ||
    matchedCategory?.bannerImageUrl ||
    matchedCategory?.imageUrl ||
    '/images/women-editorial.jpg';

  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [currentCategoryId, setCurrentCategoryId] = useState<string>(categoryId);
  const [selectedFabric, setSelectedFabric] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<CategorySortOption>('featured');
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronously reset sub-category selection if category changed
  if (currentCategoryId !== categoryId) {
    setCurrentCategoryId(categoryId);
    setSelectedSubCategory('ALL');
  }

  // 1. Fetch sub-categories once for selected category: GET /api/v1/product-sub-categories/:categoryId
  useEffect(() => {
    if (!categoryId || categoryId === 'ALL') return;

    productSubCategoryService
      .getByCategoryId(categoryId)
      .then((res) => setSubCategories(res.data || []))
      .catch(() => setSubCategories([]));
  }, [categoryId]);

  // 2. Fetch products:
  // When a sub-category is clicked -> GET /api/v1/products/sub-category/:subCategorySlug
  // When 'ALL' is selected -> GET /api/v1/products?categoryId=:categoryId&status=ACTIVE
  useEffect(() => {
    if (!categoryId || categoryId === 'ALL') return;

    const mapProducts = (list: any[]): Product[] =>
      list.map((p) => ({
        id: p.slug || p.id,
        name: p.name,
        subtitle: p.shortDescription || p.category?.title || 'Heirloom Collection',
        category: (p.category?.title?.toUpperCase() || activeCategory) as CategoryType,
        priceINR: p.basePrice || 0,
        priceUSD: Math.round((p.basePrice || 0) / 85),
        image: p.imageUrl || '/images/default.jpg',
        description: p.description || p.shortDescription || '',
        craftDetails: [`Silhouette Fit: ${p.fit}`],
        fabric: p.fit || 'Silk & Chanderi',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        categoryId: p.categoryId || p.category?.id,
        subCategoryId: p.subCategoryId || p.subCategory?.id,
      }));

    setIsLoading(true);

    if (selectedSubCategory && selectedSubCategory !== 'ALL') {
      productService
        .getBySubCategory(selectedSubCategory)
        .then((res) => {
          setLiveProducts(mapProducts(res.data || []));
          setIsLoaded(true);
        })
        .catch(() => {
          setLiveProducts([]);
          setIsLoaded(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      productService
        .getAll({ categoryId, status: 'ACTIVE' })
        .then((res) => {
          setLiveProducts(mapProducts(res.data || []));
          setIsLoaded(true);
        })
        .catch(() => {
          setLiveProducts([]);
          setIsLoaded(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [categoryId, selectedSubCategory, activeCategory]);

  const categoryProducts = useMemo(() => {
    let list = isLoaded
      ? liveProducts
      : PRODUCTS.filter((p) => {
          if (activeCategory === 'ALL') return true;
          const pCat = p.category?.toString().toUpperCase();
          const targetCat = activeCategory.toString().toUpperCase();
          return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
        });

    if (selectedFabric !== 'ALL') {
      list = list.filter((p) => p.fabric?.toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.priceINR - b.priceINR);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.priceINR - a.priceINR);
    }

    return list;
  }, [activeCategory, isLoaded, liveProducts, selectedFabric, sortBy]);

  const resetFilters = () => {
    setSelectedSubCategory('ALL');
    setSelectedFabric('ALL');
  };

  return {
    activeCategory,
    pageTitle,
    pageSubtitle,
    pageHeroImage,
    subCategories,
    selectedSubCategory,
    setSelectedSubCategory,
    selectedFabric,
    setSelectedFabric,
    sortBy,
    setSortBy,
    categoryProducts,
    isLoading,
    resetFilters,
  };
}
