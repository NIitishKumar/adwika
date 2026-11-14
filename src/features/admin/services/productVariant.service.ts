import {
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from '../types/productVariant.types';
import {
  API_BASE_URL,
  authFetch,
  extractApiDataList,
  extractApiDataObject,
} from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_product_variants_v1';

function getStoredVariants(): ProductVariant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
  const productId =
    raw?.productId || raw?.product_id || raw?.product?.id || raw?.product?._id || '';

  // Fit size normalization
  const fitSizeRaw = raw?.fitSize || raw?.fit_size || raw?.size;
  const fitSizeId = raw?.fitSizeId || raw?.fit_size_id || fitSizeRaw?._id || fitSizeRaw?.id || '';
  const fitSize = fitSizeRaw
    ? {
        id: String(fitSizeRaw?._id || fitSizeRaw?.id || fitSizeRaw?.uniqueId || fitSizeId),
        uniqueId: fitSizeRaw?.uniqueId,
        name: fitSizeRaw?.name || fitSizeRaw?.title || (typeof fitSizeRaw === 'string' ? fitSizeRaw : ''),
        fitCode:
          fitSizeRaw?.fitCode ||
          fitSizeRaw?.fit_code ||
          fitSizeRaw?.code ||
          fitSizeRaw?.name ||
          '',
        displayOrder: Number(fitSizeRaw?.displayOrder ?? fitSizeRaw?.display_order ?? 0),
      }
    : undefined;

  // Product color normalization
  const colorRaw = raw?.productColor || raw?.product_color || raw?.color;
  const productColorId =
    raw?.productColorId || raw?.product_color_id || colorRaw?._id || colorRaw?.id || '';
  const rawColorName = colorRaw?.name || colorRaw?.title || (typeof colorRaw === 'string' ? colorRaw : '');
  const rawColorCode =
    raw?.product_color?.code ||
    raw?.productColor?.code ||
    colorRaw?.code ||
    raw?.product_color?.hexCode ||
    raw?.productColor?.hexCode ||
    colorRaw?.hexCode ||
    colorRaw?.hex ||
    '';

  const defaultColorHexMap: Record<string, string> = {
    'maheshwari olive': '#556B2F',
    'midnight blue': '#191970',
    'rose': '#B76E79',
    'ivory': '#FDFBF7',
    'gold': '#C46210',
    'black': '#111111',
    'emerald': '#004D40',
    'maroon': '#800000',
    'ruby': '#841B2D',
  };

  const finalColorCode =
    rawColorCode || defaultColorHexMap[rawColorName.toLowerCase().trim()] || '#2B2B2B';

  const productColor = colorRaw
    ? {
        id: String(colorRaw?._id || colorRaw?.id || colorRaw?.uniqueId || productColorId),
        uniqueId: colorRaw?.uniqueId,
        name: rawColorName,
        code: finalColorCode,
      }
    : undefined;

  // Product normalization
  const prodRaw = raw?.product;
  const product = prodRaw
    ? {
        id: String(prodRaw?._id || prodRaw?.id || prodRaw?.uniqueId || productId),
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
   * 4.3 Product Variants (SKU, Stock & Pricing)
   * GET /api/v1/product-variants?productId=<id>&inStock=true
   * Supported Controller: @Controller(['product-variants', 'variants'])
   */
  async getAll(
    filter?:
      | string
      | {
          productId?: string;
          inStock?: boolean | string;
          isActive?: boolean | string;
          sku?: string;
        },
    inStockArg?: boolean
  ): Promise<{ data: ProductVariant[]; fromApi: boolean }> {
    let productId: string | undefined;
    let inStock: boolean | string | undefined = inStockArg;
    let isActive: boolean | string | undefined;
    let sku: string | undefined;

    if (typeof filter === 'string') {
      productId = filter.trim();
    } else if (filter && typeof filter === 'object') {
      productId = filter.productId?.trim();
      if (filter.inStock !== undefined) inStock = filter.inStock;
      if (filter.isActive !== undefined) isActive = filter.isActive;
      if (filter.sku) sku = filter.sku.trim();
    }

    try {
      const params = new URLSearchParams();
      if (productId) {
        params.append('productId', productId);
      }
      if (inStock !== undefined) params.append('inStock', String(inStock));
      if (isActive !== undefined) params.append('isActive', String(isActive));
      if (sku) params.append('sku', sku);

      const qs = params.toString() ? `?${params.toString()}` : '';
      let response = await authFetch(`${API_BASE_URL}/product-variants${qs}`, {
        headers: { Accept: 'application/json' },
      });

      // Fallback if the controller route is alias /variants
      if (response.status === 404) {
        response = await authFetch(`${API_BASE_URL}/variants${qs}`, {
          headers: { Accept: 'application/json' },
        });
      }

      if (response.ok) {
        const json = await response.json();
        const rawList = extractApiDataList(json);
        const list = rawList.map(normalizeVariant);
        saveStoredVariants(list);
        return { data: list, fromApi: true };
      }
    } catch {
      // Backend offline; fallback to cached items
    }

    const stored = getStoredVariants();
    if (productId) {
      return {
        data: stored.filter(
          (v) =>
            v.productId === productId ||
            v.product?.id === productId ||
            v.product?.slug === productId
        ),
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
      const response = await authFetch(`${API_BASE_URL}/product-variants/${encodeURIComponent(cleanId)}`, {
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
      const response = await authFetch(`${API_BASE_URL}/product-variants`, {
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
      let response = await authFetch(`${API_BASE_URL}/product-variants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status === 404) {
        // Fallback to PUT if backend implements PUT
        response = await authFetch(`${API_BASE_URL}/product-variants/${id}`, {
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
      const response = await authFetch(`${API_BASE_URL}/product-variants/${id}`, {
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
