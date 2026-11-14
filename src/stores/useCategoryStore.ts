import { create } from 'zustand';
import { ProductCategory } from '@/features/admin/types/productCategory.types';
import { productCategoryService } from '@/features/admin/services/productCategory.service';

interface CategoryState {
  categories: ProductCategory[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  fetchCategories: (force?: boolean) => Promise<ProductCategory[]>;
  getCategoryByIdOrSlug: (idOrSlug: string) => ProductCategory | undefined;
  getCategoryId: (idOrSlug: string) => string;
}

function getStoredCategories(): ProductCategory[] {
  try {
    const raw = localStorage.getItem('adwika_admin_product_categories_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: getStoredCategories(),
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchCategories: async (force = false) => {
    const { hasFetched, categories } = get();
    if (hasFetched && !force && categories.length > 0) {
      return categories;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await productCategoryService.getAll({ isActive: true });
      const sorted = [...(res.data || [])].sort((a, b) => (a.orderBy ?? 1) - (b.orderBy ?? 1));
      set({ categories: sorted, isLoading: false, hasFetched: true });
      return sorted;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch categories', isLoading: false });
      return [];
    }
  },

  getCategoryByIdOrSlug: (idOrSlug: string) => {
    if (!idOrSlug) return undefined;
    const clean = idOrSlug.trim().toLowerCase();
    const categories = get().categories;
    return categories.find(
      (c) =>
        c.id?.toLowerCase() === clean ||
        c.categoryId?.toLowerCase() === clean ||
        c.title?.toLowerCase() === clean
    );
  },

  getCategoryId: (idOrSlug: string) => {
    if (!idOrSlug) return '';
    const cat = get().getCategoryByIdOrSlug(idOrSlug);
    // Return MongoDB database _id / id if found, else return the original identifier
    return cat ? cat.id : idOrSlug.trim();
  },
}));
