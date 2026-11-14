import {
  ProductSubCategory,
  CreateProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from '../types/productSubCategory.types';
import {
  API_BASE_URL,
  authFetch,
  extractApiDataList,
  extractApiDataObject,
} from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_product_sub_categories_v1';

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
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
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

  async getByCategoryId(
    categoryId: string
  ): Promise<{ data: ProductSubCategory[]; fromApi: boolean }> {
    if (!categoryId || categoryId === 'ALL') {
      return { data: [], fromApi: true };
    }

    const cleanCatId = categoryId.trim();

    try {
      let response = await authFetch(
        `${API_BASE_URL}/product-sub-categories?categoryId=${encodeURIComponent(cleanCatId)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeSubCategory);
        saveStoredSubCategories(list);
        return { data: list, fromApi: true };
      }

    } catch (err) {
      console.error('Failed to fetch sub-categories for categoryId:', cleanCatId, err);
    }

    const stored = getStoredSubCategories();
    return {
      data: stored.filter(
        (s) =>
          s.categoryId === cleanCatId ||
          s.category?.id === cleanCatId ||
          s.category?.uniqueId === cleanCatId
      ),
      fromApi: false,
    };
  },

  /**
   * 3.3 Get Sub-Categories
   * GET /api/v1/product-sub-categories (also accessible as /sub-categories)
   * Query Params: categoryId=<id_or_slug>, isActive=true
   */
  async getAll(
    filter?: string | { categoryId?: string; isActive?: boolean }
  ): Promise<{ data: ProductSubCategory[]; fromApi: boolean }> {
    const catId = typeof filter === 'string' ? filter : filter?.categoryId;
    const isActive = typeof filter === 'object' ? filter?.isActive : undefined;

    if (catId) {
      return this.getByCategoryId(catId);
    }

    const params = new URLSearchParams();
    if (catId) params.append('categoryId', catId);
    if (isActive !== undefined) params.append('isActive', String(isActive));

    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
      let response = await authFetch(`${API_BASE_URL}/product-sub-categories${qs}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeSubCategory);
        saveStoredSubCategories(list);
        return { data: list, fromApi: true };
      }
    } catch {
      // Backend offline; fallback to cached items
    }

    const stored = getStoredSubCategories();
    if (catId) {
      return {
        data: stored.filter((s) => s.categoryId === catId || s.category?.id === catId),
        fromApi: false,
      };
    }
    return { data: stored, fromApi: false };
  },

  /**
   * Get Single Sub-Category
   * GET /api/v1/product-sub-categories/:id
   */
  async getById(id: string): Promise<{ data: ProductSubCategory; fromApi: boolean }> {
    try {
      let response = await authFetch(`${API_BASE_URL}/product-sub-categories/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 404) {
        response = await authFetch(`${API_BASE_URL}/sub-categories/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
      }

      if (response.ok) {
        const json = await response.json();
        const raw = extractApiDataObject(json);
        if (raw) {
          return { data: normalizeSubCategory(raw), fromApi: true };
        }
      }
    } catch {
      // offline fallback
    }

    const stored = getStoredSubCategories();
    const found = stored.find(
      (s) => s.id === id || s.slug === id || s.uniqueId === id
    );
    if (found) {
      return { data: found, fromApi: false };
    }

    throw new Error(`Sub-category with ID "${id}" was not found.`);
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
      const response = await authFetch(`${API_BASE_URL}/product-sub-categories`, {
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
      let response = await authFetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await authFetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
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
      const response = await authFetch(`${API_BASE_URL}/product-sub-categories/${id}`, {
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
