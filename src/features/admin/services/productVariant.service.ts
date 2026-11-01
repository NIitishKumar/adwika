import {
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from '../types/productVariant.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const STORAGE_KEY = 'adwika_admin_product_variants_v1';

const INITIAL_FALLBACK_VARIANTS: ProductVariant[] = [
  {
    id: '6ae6374e02b652733c3e70cc',
    uniqueId: '6ae6374e02b652733c3e70cc',
    variantId: '6ae6374e02b652733c3e70cc',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      uniqueId: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
      basePrice: 1498,
    },
    fitSizeId: '6ae6223e09ce4684c74844cd',
    fitSize: {
      id: '6ae6223e09ce4684c74844cd',
      uniqueId: '6ae6223e09ce4684c74844cd',
      name: 'Slim Fit2',
      fitCode: 'SLIM2',
      displayOrder: 1,
    },
    productColorId: '6ae6267ccad72829507651c8',
    productColor: {
      id: '6ae6267ccad72829507651c8',
      uniqueId: '6ae6267ccad72829507651c8',
      name: 'Midnight Blue',
      code: 'MID-BLU',
    },
    price: 1999,
    compareAtPrice: 2499,
    sku: 'KURTA-SLIM-MIDBLU-01',
    stockQuantity: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'var-anarkali-gulabi-m',
    uniqueId: 'var-anarkali-gulabi-m',
    variantId: 'var-anarkali-gulabi-m',
    productId: 'prod-royal-anarkali',
    product: {
      id: 'prod-royal-anarkali',
      name: 'Gulab Chanderi Hand-Embroidered Anarkali Set',
      slug: 'gulab-chanderi-hand-embroidered-anarkali-set',
      basePrice: 18500,
    },
    fitSizeId: 'fit-regular',
    fitSize: {
      id: 'fit-regular',
      name: 'Regular Fit',
      fitCode: 'REG',
      displayOrder: 2,
    },
    productColorId: 'col-gulabi',
    productColor: {
      id: 'col-gulabi',
      name: 'Gulabi Pink',
      code: 'GLB-PNK',
    },
    price: 18500,
    compareAtPrice: 22000,
    sku: 'ANR-REG-GLBPNK-01',
    stockQuantity: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'var-oxford-relaxed-ivory',
    uniqueId: 'var-oxford-relaxed-ivory',
    variantId: 'var-oxford-relaxed-ivory',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
      basePrice: 1498,
    },
    fitSizeId: 'fit-relaxed',
    fitSize: {
      id: 'fit-relaxed',
      name: 'Relaxed Fit',
      fitCode: 'RLX',
      displayOrder: 3,
    },
    productColorId: 'col-ivory',
    productColor: {
      id: 'col-ivory',
      name: 'Kashmiri Ivory',
      code: 'IVR',
    },
    price: 1599,
    compareAtPrice: 1899,
    sku: 'SHRT-RLX-IVR-02',
    stockQuantity: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getStoredVariants(): ProductVariant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_VARIANTS));
      return INITIAL_FALLBACK_VARIANTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FALLBACK_VARIANTS;
  } catch {
    return INITIAL_FALLBACK_VARIANTS;
  }
}

function saveStoredVariants(items: ProductVariant[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save product variants to localStorage', e);
  }
}

function normalizeVariant(raw: any): ProductVariant {
  const id = raw?.id || raw?.uniqueId || raw?.variantId || raw?._id || `var-${Date.now()}`;
  const productId = raw?.productId || raw?.product_id || raw?.product?.id || '';

  // Fit size normalization
  const fitSizeRaw = raw?.fitSize || raw?.fit_size;
  const fitSizeId = raw?.fitSizeId || raw?.fit_size_id || fitSizeRaw?.id || '';
  const fitSize = fitSizeRaw
    ? {
        id: fitSizeRaw?.id || fitSizeRaw?.uniqueId || fitSizeId,
        uniqueId: fitSizeRaw?.uniqueId,
        name: fitSizeRaw?.name || '',
        fitCode: fitSizeRaw?.fitCode || fitSizeRaw?.fit_code || fitSizeRaw?.code || '',
        displayOrder: Number(fitSizeRaw?.displayOrder ?? fitSizeRaw?.display_order ?? 0),
      }
    : undefined;

  // Product color normalization
  const colorRaw = raw?.productColor || raw?.product_color;
  const productColorId = raw?.productColorId || raw?.product_color_id || colorRaw?.id || '';
  const productColor = colorRaw
    ? {
        id: colorRaw?.id || colorRaw?.uniqueId || productColorId,
        uniqueId: colorRaw?.uniqueId,
        name: colorRaw?.name || '',
        code: colorRaw?.code || '',
      }
    : undefined;

  // Product normalization
  const prodRaw = raw?.product;
  const product = prodRaw
    ? {
        id: prodRaw?.id || prodRaw?.uniqueId || productId,
        uniqueId: prodRaw?.uniqueId,
        name: prodRaw?.name || '',
        slug: prodRaw?.slug || '',
        basePrice: prodRaw?.basePrice != null ? Number(prodRaw.basePrice) : undefined,
      }
    : undefined;

  const compareAtPrice =
    raw?.compareAtPrice !== undefined && raw?.compareAtPrice !== null
      ? Number(raw.compareAtPrice)
      : raw?.compare_at_price !== undefined && raw?.compare_at_price !== null
      ? Number(raw.compare_at_price)
      : null;

  return {
    id: String(id),
    uniqueId: raw?.uniqueId || String(id),
    variantId: raw?.variantId || String(id),
    productId: String(productId),
    product,
    fitSizeId: String(fitSizeId),
    fitSize,
    productColorId: String(productColorId),
    productColor,
    price: Number(raw?.price ?? 0),
    compareAtPrice,
    sku: String(raw?.sku || ''),
    stockQuantity: Number(raw?.stockQuantity ?? raw?.stock_quantity ?? 0),
    isActive: Boolean(raw?.isActive ?? raw?.is_active ?? true),
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.updated_at || new Date().toISOString(),
  };
}

export const productVariantService = {
  /**
   * GET /api/v1/product-variants
   */
  async getAll(productId?: string): Promise<{ data: ProductVariant[]; fromApi: boolean }> {
    try {
      const url = productId
        ? `${API_BASE_URL}/product-variants?productId=${encodeURIComponent(productId)}`
        : `${API_BASE_URL}/product-variants`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(rawList)) {
          const list = rawList.map(normalizeVariant);
          saveStoredVariants(list);
          return { data: list, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredVariants();
    if (productId) {
      return {
        data: stored.filter((v) => v.productId === productId),
        fromApi: false,
      };
    }
    return { data: stored, fromApi: false };
  },

  /**
   * GET /api/v1/product-variants/:id
   */
  async getById(id: string): Promise<{ data: ProductVariant; fromApi: boolean }> {
    const cleanId = (id || '').trim();
    if (!cleanId) {
      throw new Error('Product variant identifier is missing.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/product-variants/${encodeURIComponent(cleanId)}`, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const raw = json?.data || json;
        if (raw) {
          const item = normalizeVariant(raw);
          const stored = getStoredVariants();
          const idx = stored.findIndex(
            (v) => v.id === item.id || v.variantId === item.id || v.uniqueId === item.id
          );
          if (idx !== -1) {
            stored[idx] = item;
            saveStoredVariants(stored);
          }
          return { data: item, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredVariants();
    const found = stored.find(
      (v) =>
        v.id === cleanId ||
        v.variantId === cleanId ||
        v.uniqueId === cleanId ||
        v.sku === cleanId
    );
    if (found) {
      return { data: found, fromApi: false };
    }

    throw new Error(`Product variant with ID "${cleanId}" was not found.`);
  },

  /**
   * POST /api/v1/product-variants
   */
  async create(dto: CreateProductVariantDto): Promise<{ data: ProductVariant; message: string }> {
    const payload = {
      productId: dto.productId.trim(),
      product_id: dto.productId.trim(),
      fitSizeId: dto.fitSizeId.trim(),
      fit_size_id: dto.fitSizeId.trim(),
      productColorId: dto.productColorId.trim(),
      product_color_id: dto.productColorId.trim(),
      price: Number(dto.price),
      compare_at_price: dto.compare_at_price != null ? Number(dto.compare_at_price) : null,
      compareAtPrice: dto.compare_at_price != null ? Number(dto.compare_at_price) : null,
      sku: dto.sku.trim().toUpperCase(),
      stock_quantity: Number(dto.stock_quantity),
      stockQuantity: Number(dto.stock_quantity),
      is_active: Boolean(dto.is_active),
      isActive: Boolean(dto.is_active),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/product-variants`, {
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
          'Failed to create product variant. Please verify input data.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeVariant(rawData);
      const message = json?.message || 'Product variant created successfully';

      const stored = getStoredVariants();
      stored.unshift(createdItem);
      saveStoredVariants(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: ProductVariant = {
        id: `var-${Date.now()}`,
        uniqueId: `var-${Date.now()}`,
        variantId: `var-${Date.now()}`,
        productId: payload.productId,
        fitSizeId: payload.fitSizeId,
        productColorId: payload.productColorId,
        price: payload.price,
        compareAtPrice: payload.compareAtPrice,
        sku: payload.sku,
        stockQuantity: payload.stockQuantity,
        isActive: payload.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stored = getStoredVariants();
      stored.unshift(localItem);
      saveStoredVariants(stored);

      return {
        data: localItem,
        message: 'Product variant created (saved in local store)',
      };
    }
  },

  /**
   * PATCH /api/v1/product-variants/:id
   */
  async update(
    id: string,
    dto: UpdateProductVariantDto
  ): Promise<{ data: ProductVariant; message: string }> {
    const payload: Record<string, any> = {};

    if (dto.productId !== undefined) {
      payload.productId = dto.productId.trim();
      payload.product_id = dto.productId.trim();
    }
    if (dto.fitSizeId !== undefined) {
      payload.fitSizeId = dto.fitSizeId.trim();
      payload.fit_size_id = dto.fitSizeId.trim();
    }
    if (dto.productColorId !== undefined) {
      payload.productColorId = dto.productColorId.trim();
      payload.product_color_id = dto.productColorId.trim();
    }
    if (dto.price !== undefined) {
      payload.price = Number(dto.price);
    }
    if (dto.compare_at_price !== undefined) {
      payload.compare_at_price = dto.compare_at_price != null ? Number(dto.compare_at_price) : null;
      payload.compareAtPrice = payload.compare_at_price;
    }
    if (dto.sku !== undefined) {
      payload.sku = dto.sku.trim().toUpperCase();
    }
    if (dto.stock_quantity !== undefined) {
      payload.stock_quantity = Number(dto.stock_quantity);
      payload.stockQuantity = payload.stock_quantity;
    }
    if (dto.is_active !== undefined) {
      payload.is_active = Boolean(dto.is_active);
      payload.isActive = payload.is_active;
    }

    try {
      let response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status === 404) {
        // Fallback to PUT if backend implements PUT
        response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
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
          'Failed to update product variant.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const updated = normalizeVariant(json?.data || json);
      const stored = getStoredVariants();
      const idx = stored.findIndex((v) => v.id === id);
      if (idx !== -1) {
        stored[idx] = updated;
        saveStoredVariants(stored);
      }

      return {
        data: updated,
        message: json?.message || 'Product variant updated successfully',
      };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const stored = getStoredVariants();
      const idx = stored.findIndex((v) => v.id === id);
      if (idx !== -1) {
        const item = stored[idx];
        const updated: ProductVariant = {
          ...item,
          productId: payload.productId ?? item.productId,
          fitSizeId: payload.fitSizeId ?? item.fitSizeId,
          productColorId: payload.productColorId ?? item.productColorId,
          price: payload.price ?? item.price,
          compareAtPrice:
            payload.compareAtPrice !== undefined ? payload.compareAtPrice : item.compareAtPrice,
          sku: payload.sku ?? item.sku,
          stockQuantity: payload.stockQuantity ?? item.stockQuantity,
          isActive: payload.isActive ?? item.isActive,
          updatedAt: new Date().toISOString(),
        };
        stored[idx] = updated;
        saveStoredVariants(stored);
        return {
          data: updated,
          message: 'Product variant updated (saved locally)',
        };
      }
      throw new Error(`Variant ${id} not found in local storage`);
    }
  },

  /**
   * DELETE /api/v1/product-variants/:id
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = await response.json().catch(() => ({}));
        const stored = getStoredVariants().filter((v) => v.id !== id);
        saveStoredVariants(stored);
        return {
          success: true,
          message: json?.message || 'Product variant deleted successfully',
        };
      }
    } catch {
      // Backend offline
    }

    const stored = getStoredVariants().filter((v) => v.id !== id);
    saveStoredVariants(stored);
    return { success: true, message: 'Product variant deleted locally' };
  },

  /**
   * Toggle Active Status
   */
  async toggleStatus(id: string, currentStatus: boolean): Promise<ProductVariant> {
    const res = await this.update(id, { is_active: !currentStatus });
    return res.data;
  },
};
