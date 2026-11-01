import {
  ProductSubCategory,
  CreateProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from '../types/productSubCategory.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const STORAGE_KEY = 'adwika_admin_product_sub_categories_v1';

const INITIAL_FALLBACK_SUBCATEGORIES: ProductSubCategory[] = [
  {
    id: 'sub-kurtas-suits',
    uniqueId: 'sub-kurtas-suits',
    categoryId: 'cat-kurtis',
    category: {
      id: 'cat-kurtis',
      title: 'Kurtis',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    },
    name: 'Kurtas & Suits',
    slug: 'kurtas-and-suits',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-anarkali-sets',
    uniqueId: 'sub-anarkali-sets',
    categoryId: 'cat-suits',
    category: {
      id: 'cat-suits',
      title: 'Suits',
      imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=600&q=80',
    },
    name: 'Anarkali Sets',
    slug: 'anarkali-sets',
    imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-chanderi-coords',
    uniqueId: 'sub-chanderi-coords',
    categoryId: 'cat-coords',
    category: {
      id: 'cat-coords',
      title: 'Co-ords',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    },
    name: 'Chanderi Lounge Sets',
    slug: 'chanderi-lounge-sets',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-festive-shirts',
    uniqueId: 'sub-festive-shirts',
    categoryId: 'cat-shirts',
    category: {
      id: 'cat-shirts',
      title: 'Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    name: 'Resort & Festive Shirts',
    slug: 'resort-and-festive-shirts',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeSubCategory(raw: any): ProductSubCategory {
  const id = raw.id || raw.uniqueId || raw._id || `subcat-${Date.now()}`;
  return {
    id: String(id),
    uniqueId: raw.uniqueId ? String(raw.uniqueId) : String(id),
    categoryId: String(raw.categoryId || raw.category?.id || ''),
    category: raw.category
      ? {
          id: String(raw.category.id || raw.category.uniqueId || raw.categoryId || ''),
          uniqueId: String(raw.category.uniqueId || raw.category.id || ''),
          title: raw.category.title || raw.category.name || '',
          imageUrl: raw.category.imageUrl || raw.category.image_url || '',
        }
      : undefined,
    name: raw.name || '',
    slug: raw.slug || '',
    imageUrl: raw.imageUrl || raw.image_url || '',
    isActive:
      typeof raw.isActive === 'boolean'
        ? raw.isActive
        : typeof raw.is_active === 'boolean'
        ? raw.is_active
        : true,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function getStoredSubCategories(): ProductSubCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_SUBCATEGORIES));
      return INITIAL_FALLBACK_SUBCATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_SUBCATEGORIES;
  }
}

function saveStoredSubCategories(items: ProductSubCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save subcategories to localStorage', e);
  }
}

export const productSubCategoryService = {
  /**
   * GET /api/v1/product-sub-categories
   */
  async getAll(categoryId?: string): Promise<{ data: ProductSubCategory[]; fromApi: boolean }> {
    try {
      const url = categoryId
        ? `${API_BASE_URL}/product-sub-categories?categoryId=${encodeURIComponent(categoryId)}`
        : `${API_BASE_URL}/product-sub-categories`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(rawList)) {
          const list = rawList.map(normalizeSubCategory);
          saveStoredSubCategories(list);
          return { data: list, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredSubCategories();
    if (categoryId) {
      return {
        data: stored.filter((s) => s.categoryId === categoryId),
        fromApi: false,
      };
    }
    return { data: stored, fromApi: false };
  },

  /**
   * POST /api/v1/product-sub-categories
   * Payload: { categoryId, name, slug, image_url, is_active }
   */
  async create(
    dto: CreateProductSubCategoryDto
  ): Promise<{ data: ProductSubCategory; message: string }> {
    const payload = {
      categoryId: dto.categoryId.trim(),
      name: dto.name.trim(),
      slug: dto.slug.toLowerCase().trim(),
      image_url: (dto.image_url || '').trim(),
      is_active: Boolean(dto.is_active),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/product-sub-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg =
          json?.message ||
          (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
          'Failed to create product sub-category. Please verify your inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeSubCategory(rawData);
      const message = json?.message || 'Product sub-category created successfully';

      const stored = getStoredSubCategories();
      stored.push(createdItem);
      saveStoredSubCategories(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: ProductSubCategory = {
        id: `sub-${Date.now()}`,
        uniqueId: `sub-${Date.now()}`,
        categoryId: payload.categoryId,
        name: payload.name,
        slug: payload.slug,
        imageUrl: payload.image_url,
        isActive: payload.is_active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const stored = getStoredSubCategories();
      stored.push(localItem);
      saveStoredSubCategories(stored);

      return { data: localItem, message: 'Product sub-category created successfully' };
    }
  },

  /**
   * PATCH /api/v1/product-sub-categories/:id
   */
  async update(
    id: string,
    dto: UpdateProductSubCategoryDto
  ): Promise<{ data: ProductSubCategory; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.categoryId !== undefined) payload.categoryId = dto.categoryId.trim();
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.slug !== undefined) payload.slug = dto.slug.toLowerCase().trim();
    if (dto.image_url !== undefined) {
      payload.image_url = dto.image_url.trim();
      payload.imageUrl = dto.image_url.trim();
    }
    if (dto.is_active !== undefined) {
      payload.is_active = Boolean(dto.is_active);
      payload.isActive = Boolean(dto.is_active);
    }

    try {
      let response = await fetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg =
          json?.message ||
          (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
          'Failed to update product sub-category.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const updatedItem = normalizeSubCategory(rawData);
      const message = json?.message || 'Product sub-category updated successfully';

      const stored = getStoredSubCategories().map((s) =>
        s.id === id || s.slug === id ? updatedItem : s
      );
      saveStoredSubCategories(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredSubCategories();
      const index = stored.findIndex((s) => s.id === id || s.slug === id);
      if (index === -1) {
        throw new Error(`Sub-category with ID ${id} not found.`);
      }

      const current = stored[index];
      const updatedItem: ProductSubCategory = {
        ...current,
        categoryId: payload.categoryId ?? current.categoryId,
        name: payload.name ?? current.name,
        slug: payload.slug ?? current.slug,
        imageUrl: payload.image_url ?? current.imageUrl,
        isActive: payload.is_active ?? current.isActive,
        updatedAt: new Date().toISOString(),
      };
      stored[index] = updatedItem;
      saveStoredSubCategories(stored);

      return { data: updatedItem, message: 'Product sub-category updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/product-sub-categories/:id
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete product sub-category.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Product sub-category deleted successfully';

      const stored = getStoredSubCategories().filter((s) => s.id !== id && s.slug !== id);
      saveStoredSubCategories(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredSubCategories().filter((s) => s.id !== id && s.slug !== id);
      saveStoredSubCategories(stored);

      return { message: 'Product sub-category deleted successfully' };
    }
  },

  /**
   * Toggle sub-category active status
   */
  async toggleActive(
    id: string,
    currentStatus: boolean
  ): Promise<{ data: ProductSubCategory; message: string }> {
    return this.update(id, { is_active: !currentStatus });
  },
};
