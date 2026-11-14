import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductGender,
  ProductStatus,
  ProductQueryParams,
} from '../types/product.types';
import {
  API_BASE_URL,
  authFetch,
  extractApiDataList,
  extractApiDataObject,
} from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_products_v1';

function normalizeProduct(raw: any): Product {
  const id = raw.id || raw.uniqueId || raw.productId || raw._id || `prod-${Date.now()}`;
  const categoryDoc = raw.category || (typeof raw.categoryId === 'object' ? raw.categoryId : null);
  const subCategoryDoc =
    raw.subCategory || raw.sub_category || (typeof raw.subCategoryId === 'object' ? raw.subCategoryId : null);

  const rawGender = String(raw.gender || 'WOMEN').toUpperCase();
  const gender: ProductGender =
    rawGender === 'MEN' || rawGender === 'WOMEN' || rawGender === 'UNISEX' ? rawGender : 'WOMEN';

  const rawStatus = String(raw.status || 'ACTIVE').toUpperCase();
  const status: ProductStatus =
    rawStatus === 'ACTIVE' || rawStatus === 'INACTIVE' || rawStatus === 'DRAFT'
      ? rawStatus
      : 'ACTIVE';

  return {
    id: String(id),
    uniqueId: raw.uniqueId ? String(raw.uniqueId) : String(id),
    productId: raw.productId ? String(raw.productId) : String(id),
    name: raw.name || raw.title || '',
    slug: raw.slug || '',
    shortDescription: raw.shortDescription || raw.short_description || '',
    description: raw.description || '',
    gender,
    fit: raw.fit || 'Regular Fit',
    basePrice: Number(raw.basePrice ?? raw.base_price ?? raw.price ?? 0),
    status,
    metaTitle: raw.metaTitle || raw.meta_title || '',
    metaDescription: raw.metaDescription || raw.meta_description || '',
    categoryId: String(categoryDoc?._id || categoryDoc?.id || categoryDoc?.uniqueId || raw.categoryId || raw.category_id || ''),
    category: categoryDoc
      ? {
        id: String(categoryDoc._id || categoryDoc.id || categoryDoc.uniqueId || ''),
        uniqueId: String(categoryDoc.uniqueId || categoryDoc._id || categoryDoc.id || ''),
        title: categoryDoc.title || categoryDoc.name || '',
        imageUrl: categoryDoc.imageUrl || categoryDoc.image_url || '',
      }
      : undefined,
    subCategoryId: subCategoryDoc
      ? String(subCategoryDoc._id || subCategoryDoc.id || subCategoryDoc.uniqueId || raw.subCategoryId || raw.sub_category_id || '')
      : raw.subCategoryId || raw.sub_category_id
        ? String(raw.subCategoryId || raw.sub_category_id)
        : undefined,
    subCategory: subCategoryDoc
      ? {
        id: String(subCategoryDoc._id || subCategoryDoc.id || subCategoryDoc.uniqueId || ''),
        uniqueId: String(subCategoryDoc.uniqueId || subCategoryDoc._id || subCategoryDoc.id || ''),
        name: subCategoryDoc.name || subCategoryDoc.title || '',
        slug: subCategoryDoc.slug || '',
        imageUrl: subCategoryDoc.imageUrl || subCategoryDoc.image_url || '',
      }
      : undefined,
    imageUrl:
      raw.imageUrl ||
      raw.image_url ||
      raw.image ||
      (Array.isArray(raw.images) && (raw.images[0]?.imageUrl || raw.images[0]?.url)) ||
      undefined,
    images: Array.isArray(raw.images) ? raw.images : undefined,
    variants: Array.isArray(raw.variants) ? raw.variants : undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function getStoredProducts(): Product[] {
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

function saveStoredProducts(items: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export const productService = {
  /**
   * 2.1 Get All Products (Storefront / Listing / Admin)
   * GET /api/v1/products
   * Supports searching, sorting, filtering by category, fit, gender, and price.
   */
  async getAll(query?: ProductQueryParams): Promise<{ data: Product[]; fromApi: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query?.categoryId) params.append('categoryId', query.categoryId);
      if (query?.subCategoryId) params.append('subCategoryId', query.subCategoryId);
      if (query?.gender) params.append('gender', query.gender);
      if (query?.status) params.append('status', query.status);
      if (query?.fit) params.append('fit', query.fit);
      if (query?.minPrice !== undefined) params.append('minPrice', String(query.minPrice));
      if (query?.maxPrice !== undefined) params.append('maxPrice', String(query.maxPrice));
      if (query?.search) params.append('search', query.search);

      const qs = params.toString();
      const url = qs ? `${API_BASE_URL}/products?${qs}` : `${API_BASE_URL}/products`;

      const response = await authFetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeProduct);
        saveStoredProducts(list);
        return { data: list, fromApi: true };
      }
    } catch {
      // Backend offline; fallback to cached items
    }

    return { data: getStoredProducts(), fromApi: false };
  },

  /**
   * GET /api/v1/products/sub-category/:subCategorySlug
   */
  async getBySubCategory(subCategorySlug: string): Promise<{ data: Product[]; fromApi: boolean }> {
    if (!subCategorySlug || subCategorySlug === 'ALL') {
      return this.getAll();
    }

    try {
      let response = await authFetch(
        `${API_BASE_URL}/products?subCategoryId=${encodeURIComponent(subCategorySlug)}&status=ACTIVE`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeProduct);
        return { data: list, fromApi: true };
      }
    } catch (err) {
      console.error('Failed to fetch products for sub-category:', subCategorySlug, err);
    }

    return { data: [], fromApi: false };
  },

  /**
   * GET /api/v1/products/:id
   */
  async getById(id: string): Promise<{ data: Product; fromApi: boolean }> {
    try {
      const response = await authFetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawData = extractApiDataObject(json);
        if (rawData) {
          const item = normalizeProduct(rawData);
          const stored = getStoredProducts();
          const index = stored.findIndex(
            (p) =>
              p.id === item.id ||
              p.productId === item.id ||
              p.uniqueId === item.id ||
              p.slug === item.slug
          );
          if (index !== -1) {
            stored[index] = item;
            saveStoredProducts(stored);
          }
          return { data: item, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredProducts();
    const found = stored.find(
      (p) =>
        p.id === id ||
        p.slug === id ||
        p.productId === id ||
        p.uniqueId === id
    );
    if (found) {
      return { data: found, fromApi: false };
    }

    throw new Error(`Garment product with ID "${id}" was not found.`);
  },

  /**
   * 2.3 Create Product (Admin)
   * POST /api/v1/products
   */
  async create(dto: CreateProductDto): Promise<{ data: Product; message: string }> {
    const basePrice = Number(dto.basePrice ?? dto.base_price ?? 0);
    const shortDesc = (dto.shortDescription ?? dto.short_description ?? '').trim();
    const finalImg = (dto.imageUrl ?? dto.image_url)?.trim();

    const payload: Record<string, any> = {
      name: dto.name.trim(),
      categoryId: dto.categoryId.trim(),
      category_id: dto.categoryId.trim(),
      gender: dto.gender,
      fit: dto.fit.trim(),
      basePrice: basePrice,
      base_price: basePrice,
      status: dto.status,
    };

    if (dto.slug?.trim()) payload.slug = dto.slug.toLowerCase().trim();
    if (finalImg) {
      payload.imageUrl = finalImg;
      payload.image_url = finalImg;
    }
    if (dto.subCategoryId?.trim()) {
      payload.subCategoryId = dto.subCategoryId.trim();
      payload.sub_category_id = dto.subCategoryId.trim();
    }
    if (shortDesc) {
      payload.shortDescription = shortDesc;
      payload.short_description = shortDesc;
    }
    if (dto.description?.trim()) payload.description = dto.description.trim();
    if (dto.metaTitle || dto.meta_title) {
      payload.meta_title = (dto.metaTitle ?? dto.meta_title)?.trim();
      payload.metaTitle = (dto.metaTitle ?? dto.meta_title)?.trim();
    }
    if (dto.metaDescription || dto.meta_description) {
      payload.meta_description = (dto.metaDescription ?? dto.meta_description)?.trim();
      payload.metaDescription = (dto.metaDescription ?? dto.meta_description)?.trim();
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/products`, {
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
          'Failed to create product. Please verify all inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = extractApiDataObject(json);
      const createdItem = normalizeProduct(rawData);
      const message = json?.message || 'Product created successfully';

      const stored = getStoredProducts();
      stored.unshift(createdItem);
      saveStoredProducts(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: Product = {
        id: `prod-${Date.now()}`,
        uniqueId: `prod-${Date.now()}`,
        productId: `prod-${Date.now()}`,
        name: payload.name,
        slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: payload.short_description,
        description: payload.description,
        gender: payload.gender,
        fit: payload.fit,
        imageUrl: payload.imageUrl,
        basePrice: payload.base_price,
        status: payload.status,
        metaTitle: payload.meta_title,
        metaDescription: payload.meta_description,
        categoryId: payload.categoryId,
        subCategoryId: payload.subCategoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stored = getStoredProducts();
      stored.unshift(localItem);
      saveStoredProducts(stored);

      return { data: localItem, message: 'Product created successfully' };
    }
  },

  /**
   * PATCH /api/v1/products/:id
   */
  async update(id: string, dto: UpdateProductDto): Promise<{ data: Product; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.slug !== undefined) payload.slug = dto.slug.toLowerCase().trim();
    if (dto.categoryId !== undefined) {
      payload.categoryId = dto.categoryId.trim();
      payload.category_id = dto.categoryId.trim();
    }
    if (dto.subCategoryId !== undefined) {
      payload.subCategoryId = dto.subCategoryId.trim() || undefined;
      payload.sub_category_id = dto.subCategoryId.trim() || undefined;
    }
    if (dto.short_description !== undefined) {
      payload.short_description = dto.short_description.trim();
      payload.shortDescription = dto.short_description.trim();
    }
    if (dto.description !== undefined) payload.description = dto.description.trim();
    const newImg = dto.imageUrl ?? dto.image_url;
    if (newImg !== undefined) {
      payload.imageUrl = newImg ? newImg.trim() : undefined;
      payload.image_url = newImg ? newImg.trim() : undefined;
    }
    if (dto.gender !== undefined) payload.gender = dto.gender;
    if (dto.fit !== undefined) payload.fit = dto.fit.trim();
    if (dto.base_price !== undefined) {
      payload.base_price = Number(dto.base_price);
      payload.basePrice = Number(dto.base_price);
    }
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.meta_title !== undefined) {
      payload.meta_title = dto.meta_title.trim();
      payload.metaTitle = dto.meta_title.trim();
    }
    if (dto.meta_description !== undefined) {
      payload.meta_description = dto.meta_description.trim();
      payload.metaDescription = dto.meta_description.trim();
    }

    try {
      let response = await authFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await authFetch(`${API_BASE_URL}/products/${id}`, {
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
          'Failed to update product.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = extractApiDataObject(json);
      const updatedItem = normalizeProduct(rawData);
      const message = json?.message || 'Product updated successfully';

      const stored = getStoredProducts().map((p) =>
        p.id === id || p.slug === id || p.productId === id ? updatedItem : p
      );
      saveStoredProducts(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredProducts();
      const index = stored.findIndex((p) => p.id === id || p.slug === id || p.productId === id);
      if (index === -1) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      const current = stored[index];
      const updatedItem: Product = {
        ...current,
        name: payload.name ?? current.name,
        slug: payload.slug ?? current.slug,
        categoryId: payload.categoryId ?? current.categoryId,
        subCategoryId: payload.subCategoryId ?? current.subCategoryId,
        shortDescription: payload.short_description ?? current.shortDescription,
        description: payload.description ?? current.description,
        gender: payload.gender ?? current.gender,
        fit: payload.fit ?? current.fit,
        imageUrl: payload.imageUrl !== undefined ? payload.imageUrl : current.imageUrl,
        basePrice: payload.base_price ?? current.basePrice,
        status: payload.status ?? current.status,
        metaTitle: payload.meta_title ?? current.metaTitle,
        metaDescription: payload.meta_description ?? current.metaDescription,
        updatedAt: new Date().toISOString(),
      };
      stored[index] = updatedItem;
      saveStoredProducts(stored);

      return { data: updatedItem, message: 'Product updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/products/:id
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await authFetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete product.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Product deleted successfully';

      const stored = getStoredProducts().filter(
        (p) => p.id !== id && p.slug !== id && p.productId !== id
      );
      saveStoredProducts(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredProducts().filter(
        (p) => p.id !== id && p.slug !== id && p.productId !== id
      );
      saveStoredProducts(stored);

      return { message: 'Product deleted successfully' };
    }
  },

  /**
   * Toggle product active/inactive status
   */
  async toggleStatus(
    id: string,
    currentStatus: ProductStatus
  ): Promise<{ data: Product; message: string }> {
    const nextStatus: ProductStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.update(id, { status: nextStatus });
  },
};
