import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../types/productCategory.types';
import {
  API_BASE_URL,
  authFetch,
  extractApiDataList,
  extractApiDataObject,
} from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_product_categories_v1';

function normalizeCategory(raw: any): ProductCategory {
  const id = raw.id || raw.uniqueId || raw._id || raw.categoryId || `cat-${Date.now()}`;
  const categoryId = raw.categoryId || raw.id || 'category';
  return {
    id: String(id),
    uniqueId: raw.uniqueId ? String(raw.uniqueId) : String(id),
    categoryId: String(categoryId),
    title: raw.title || '',
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image_url || '',
    bannerImageUrl: raw.bannerImageUrl || raw.banner_image_url || '',
    orderBy: Number(raw.orderBy ?? raw.order_by ?? 1),
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

function getStoredCategories(): ProductCategory[] {
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

function saveStoredCategories(items: ProductCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

export const productCategoryService = {
  /**
   * 3.1 Get All Categories
   * GET /api/v1/product-categories (also accessible as /categories)
   * Query Params: isActive=true
   */
  async getAll(params?: { isActive?: boolean }): Promise<{ data: ProductCategory[]; fromApi: boolean }> {
    try {
      const qs = params?.isActive !== undefined ? `?isActive=${params.isActive}` : '';
      let response = await authFetch(`${API_BASE_URL}/product-categories${qs}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 404) {
        response = await authFetch(`${API_BASE_URL}/categories${qs}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
      }

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeCategory);
        saveStoredCategories(list);
        return { data: list, fromApi: true };
      }
    } catch {
      // Backend offline; fallback to cached items
    }

    return { data: getStoredCategories(), fromApi: false };
  },

  /**
   * 3.2 Get Single Category
   * GET /api/v1/product-categories/:id (Accepts Mongo _id or slug kurtis, suits, co-ords, etc.)
   */
  async getById(id: string): Promise<{ data: ProductCategory; fromApi: boolean }> {
    try {
      let response = await authFetch(`${API_BASE_URL}/product-categories/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 404) {
        response = await authFetch(`${API_BASE_URL}/categories/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
      }

      if (response.ok) {
        const json = await response.json();
        const raw = extractApiDataObject(json);
        if (raw) {
          return { data: normalizeCategory(raw), fromApi: true };
        }
      }
    } catch {
      // offline fallback
    }

    const stored = getStoredCategories();
    const found = stored.find(
      (c) => c.id === id || c.categoryId === id || c.uniqueId === id
    );
    if (found) {
      return { data: found, fromApi: false };
    }

    throw new Error(`Category with ID or slug "${id}" was not found.`);
  },

  /**
   * POST /api/v1/product-categories
   * Payload: { id, title, description, image_url, banner_image_url, order_by, is_active }
   */
  async create(dto: CreateProductCategoryDto): Promise<{ data: ProductCategory; message: string }> {
    const payload = {
      id: dto.id.toLowerCase().trim(),
      title: dto.title.trim(),
      description: (dto.description || '').trim(),
      image_url: (dto.image_url || '').trim(),
      banner_image_url: (dto.banner_image_url || '').trim(),
      order_by: Number(dto.order_by),
      is_active: Boolean(dto.is_active),
    };

    try {
      const response = await authFetch(`${API_BASE_URL}/product-categories`, {
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
          'Failed to create product category. Please verify your inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeCategory(rawData);
      const message = json?.message || 'Product category created successfully';

      const stored = getStoredCategories();
      stored.push(createdItem);
      saveStoredCategories(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: ProductCategory = {
        id: `cat-${Date.now()}`,
        uniqueId: `cat-${Date.now()}`,
        categoryId: payload.id,
        title: payload.title,
        description: payload.description,
        imageUrl: payload.image_url,
        bannerImageUrl: payload.banner_image_url,
        orderBy: payload.order_by,
        isActive: payload.is_active,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const stored = getStoredCategories();
      stored.push(localItem);
      saveStoredCategories(stored);

      return { data: localItem, message: 'Product category created successfully' };
    }
  },

  /**
   * PATCH /api/v1/product-categories/:id
   */
  async update(
    id: string,
    dto: UpdateProductCategoryDto
  ): Promise<{ data: ProductCategory; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.id !== undefined) payload.id = dto.id.toLowerCase().trim();
    if (dto.title !== undefined) payload.title = dto.title.trim();
    if (dto.description !== undefined) payload.description = dto.description.trim();
    if (dto.image_url !== undefined) payload.image_url = dto.image_url.trim();
    if (dto.banner_image_url !== undefined) payload.banner_image_url = dto.banner_image_url.trim();
    if (dto.order_by !== undefined) payload.order_by = Number(dto.order_by);
    if (dto.is_active !== undefined) payload.is_active = Boolean(dto.is_active);

    // Also include camelCase versions for backend compatibility
    if (dto.image_url !== undefined) payload.imageUrl = dto.image_url.trim();
    if (dto.banner_image_url !== undefined) payload.bannerImageUrl = dto.banner_image_url.trim();
    if (dto.order_by !== undefined) payload.orderBy = Number(dto.order_by);
    if (dto.is_active !== undefined) payload.isActive = Boolean(dto.is_active);

    try {
      let response = await authFetch(`${API_BASE_URL}/product-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await authFetch(`${API_BASE_URL}/product-categories/${id}`, {
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
          'Failed to update category.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const updatedItem = normalizeCategory(rawData);
      const message = json?.message || 'Product category updated successfully';

      const stored = getStoredCategories().map((c) =>
        c.id === id || c.categoryId === id ? updatedItem : c
      );
      saveStoredCategories(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredCategories();
      const index = stored.findIndex((c) => c.id === id || c.categoryId === id);
      if (index === -1) {
        throw new Error(`Category with ID ${id} not found.`);
      }

      const current = stored[index];
      const updatedItem: ProductCategory = {
        ...current,
        categoryId: payload.id ?? current.categoryId,
        title: payload.title ?? current.title,
        description: payload.description ?? current.description,
        imageUrl: payload.image_url ?? current.imageUrl,
        bannerImageUrl: payload.banner_image_url ?? current.bannerImageUrl,
        orderBy: payload.order_by ?? current.orderBy,
        isActive: payload.is_active ?? current.isActive,
        updatedAt: new Date().toISOString(),
      };
      stored[index] = updatedItem;
      saveStoredCategories(stored);

      return { data: updatedItem, message: 'Product category updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/product-categories/:id
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await authFetch(`${API_BASE_URL}/product-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete category.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Product category deleted successfully';

      const stored = getStoredCategories().filter((c) => c.id !== id && c.categoryId !== id);
      saveStoredCategories(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredCategories().filter((c) => c.id !== id && c.categoryId !== id);
      saveStoredCategories(stored);

      return { message: 'Product category deleted successfully' };
    }
  },

  /**
   * Toggle category active status
   */
  async toggleActive(
    id: string,
    currentStatus: boolean
  ): Promise<{ data: ProductCategory; message: string }> {
    return this.update(id, { is_active: !currentStatus });
  },
};
