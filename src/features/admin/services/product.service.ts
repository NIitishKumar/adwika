import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductGender,
  ProductStatus,
} from '../types/product.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const STORAGE_KEY = 'adwika_admin_products_v1';

const INITIAL_FALLBACK_PRODUCTS: Product[] = [
  {
    id: '6ae63157baaed242a3252445',
    uniqueId: '6ae63157baaed242a3252445',
    productId: '6ae63157baaed242a3252445',
    name: 'Classic Oxford Cotton Shirt Ragular Fit',
    slug: 'classic-oxford-cotton-shirt-ragular-fit',
    shortDescription: 'Premium breathable 100% cotton shirt',
    description: 'Tailored for comfort and versatility, ideal for casual and formal occasions.',
    gender: 'MEN',
    fit: 'Slim Fit',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    basePrice: 1498,
    status: 'ACTIVE',
    metaTitle: 'Classic Oxford Cotton Shirt Ragular fit - Adwika Ragular fit',
    metaDescription: 'Shop premium 100% cotton oxford shirts for men.',
    categoryId: 'cat-shirts',
    category: {
      id: 'cat-shirts',
      title: 'Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    subCategoryId: 'sub-festive-shirts',
    subCategory: {
      id: 'sub-festive-shirts',
      name: 'Resort & Festive Shirts',
      slug: 'resort-and-festive-shirts',
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-royal-anarkali',
    uniqueId: 'prod-royal-anarkali',
    productId: 'prod-royal-anarkali',
    name: 'Gulab Chanderi Hand-Embroidered Anarkali Set',
    slug: 'gulab-chanderi-hand-embroidered-anarkali-set',
    shortDescription: 'Three-piece royal festive ensemble with zardozi borders and organza dupatta.',
    description: 'Impeccably tailored from handwoven pure Chanderi silk with intricate floral gota-patti and zardozi needlework.',
    gender: 'WOMEN',
    fit: 'Relaxed Fit',
    imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=600&q=80',
    basePrice: 8490,
    status: 'ACTIVE',
    metaTitle: 'Gulab Chanderi Anarkali Set | Adwika Festive Couture',
    metaDescription: 'Handcrafted luxury Anarkali suit set in pure Chanderi silk.',
    categoryId: 'cat-suits',
    category: {
      id: 'cat-suits',
      title: 'Suits',
      imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=600&q=80',
    },
    subCategoryId: 'sub-anarkali-sets',
    subCategory: {
      id: 'sub-anarkali-sets',
      name: 'Anarkali Sets',
      slug: 'anarkali-sets',
      imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-noor-coord',
    uniqueId: 'prod-noor-coord',
    productId: 'prod-noor-coord',
    name: 'Noor Artisanal Lounge Co-ord Set',
    slug: 'noor-artisanal-lounge-coord-set',
    shortDescription: 'Modern relaxed two-piece silhouette with refined tailored collar and drawstring trousers.',
    description: 'Designed for effortless festive gatherings and evening soirees, merging fluid drapes with heritage craftsmanship.',
    gender: 'WOMEN',
    fit: 'Regular Fit',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    basePrice: 5290,
    status: 'ACTIVE',
    metaTitle: 'Noor Luxury Co-ord Set | Adwika Contemporary',
    metaDescription: 'Contemporary handcrafted coordinated set for women.',
    categoryId: 'cat-coords',
    category: {
      id: 'cat-coords',
      title: 'Co-ords',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    },
    subCategoryId: 'sub-chanderi-coords',
    subCategory: {
      id: 'sub-chanderi-coords',
      name: 'Chanderi Lounge Sets',
      slug: 'chanderi-lounge-sets',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    name: raw.name || '',
    slug: raw.slug || '',
    shortDescription: raw.shortDescription || raw.short_description || '',
    description: raw.description || '',
    gender,
    fit: raw.fit || 'Regular Fit',
    basePrice: Number(raw.basePrice ?? raw.base_price ?? 0),
    status,
    metaTitle: raw.metaTitle || raw.meta_title || '',
    metaDescription: raw.metaDescription || raw.meta_description || '',
    categoryId: String(categoryDoc?._id || categoryDoc?.id || raw.categoryId || raw.category_id || ''),
    category: categoryDoc
      ? {
          id: String(categoryDoc._id || categoryDoc.id || categoryDoc.uniqueId || ''),
          uniqueId: String(categoryDoc.uniqueId || categoryDoc._id || categoryDoc.id || ''),
          title: categoryDoc.title || categoryDoc.name || '',
          imageUrl: categoryDoc.imageUrl || categoryDoc.image_url || '',
        }
      : undefined,
    subCategoryId: subCategoryDoc
      ? String(subCategoryDoc._id || subCategoryDoc.id || raw.subCategoryId || raw.sub_category_id || '')
      : raw.subCategoryId || raw.sub_category_id
      ? String(raw.subCategoryId || raw.sub_category_id)
      : undefined,
    subCategory: subCategoryDoc
      ? {
          id: String(subCategoryDoc._id || subCategoryDoc.id || subCategoryDoc.uniqueId || ''),
          uniqueId: String(subCategoryDoc.uniqueId || subCategoryDoc._id || subCategoryDoc.id || ''),
          name: subCategoryDoc.name || '',
          slug: subCategoryDoc.slug || '',
          imageUrl: subCategoryDoc.imageUrl || subCategoryDoc.image_url || '',
        }
      : undefined,
    imageUrl:
      raw.imageUrl ||
      raw.image_url ||
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_PRODUCTS));
      return INITIAL_FALLBACK_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_PRODUCTS;
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
   * GET /api/v1/products
   */
  async getAll(query?: {
    categoryId?: string;
    subCategoryId?: string;
    gender?: string;
    status?: string;
    fit?: string;
  }): Promise<{ data: Product[]; fromApi: boolean }> {
    try {
      const params = new URLSearchParams();
      if (query?.categoryId) params.append('categoryId', query.categoryId);
      if (query?.subCategoryId) params.append('subCategoryId', query.subCategoryId);
      if (query?.gender) params.append('gender', query.gender);
      if (query?.status) params.append('status', query.status);
      if (query?.fit) params.append('fit', query.fit);

      const qs = params.toString();
      const url = qs ? `${API_BASE_URL}/products?${qs}` : `${API_BASE_URL}/products`;

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
          const list = rawList.map(normalizeProduct);
          saveStoredProducts(list);
          return { data: list, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    return { data: getStoredProducts(), fromApi: false };
  },

  /**
   * GET /api/v1/products/:id
   */
  async getById(id: string): Promise<{ data: Product; fromApi: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawData = json?.data || json;
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
   * POST /api/v1/products
   */
  async create(dto: CreateProductDto): Promise<{ data: Product; message: string }> {
    const payload: Record<string, any> = {
      name: dto.name.trim(),
      categoryId: dto.categoryId.trim(),
      category_id: dto.categoryId.trim(),
      gender: dto.gender,
      fit: dto.fit.trim(),
      base_price: Number(dto.base_price),
      status: dto.status,
    };

    if (dto.slug?.trim()) payload.slug = dto.slug.toLowerCase().trim();
    const finalImg = (dto.imageUrl ?? dto.image_url)?.trim();
    if (finalImg) {
      payload.imageUrl = finalImg;
      payload.image_url = finalImg;
    }
    if (dto.subCategoryId?.trim()) {
      payload.subCategoryId = dto.subCategoryId.trim();
      payload.sub_category_id = dto.subCategoryId.trim();
    }
    if (dto.short_description?.trim()) {
      payload.short_description = dto.short_description.trim();
      payload.shortDescription = dto.short_description.trim();
    }
    if (dto.description?.trim()) payload.description = dto.description.trim();
    if (dto.meta_title?.trim()) {
      payload.meta_title = dto.meta_title.trim();
      payload.metaTitle = dto.meta_title.trim();
    }
    if (dto.meta_description?.trim()) {
      payload.meta_description = dto.meta_description.trim();
      payload.metaDescription = dto.meta_description.trim();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
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

      const rawData = json?.data || json;
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
      let response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${API_BASE_URL}/products/${id}`, {
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

      const rawData = json?.data || json;
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
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
