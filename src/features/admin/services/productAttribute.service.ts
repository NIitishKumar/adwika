import {
  ProductAttribute,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
} from '../types/productAttribute.types';
import { API_BASE_URL } from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_product_attributes_v1';

const INITIAL_FALLBACK_ATTRIBUTES: ProductAttribute[] = [
  {
    id: '6ae632dfb22413fc2864e67c',
    uniqueId: '6ae632dfb22413fc2864e67c',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      uniqueId: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
    },
    name: 'Fabric',
    value: '100% Pure Mulberry Silk',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-oxford-weave',
    uniqueId: 'attr-oxford-weave',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      uniqueId: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
    },
    name: 'Weave',
    value: 'Traditional Handloom Pinpoint Oxford',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-anarkali-fabric',
    uniqueId: 'attr-anarkali-fabric',
    productId: 'prod-royal-anarkali',
    product: {
      id: 'prod-royal-anarkali',
      name: 'Gulab Chanderi Hand-Embroidered Anarkali Set',
      slug: 'gulab-chanderi-hand-embroidered-anarkali-set',
    },
    name: 'Fabric Composition',
    value: 'Pure Chanderi Silk with Cotton Silk Lining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-anarkali-care',
    uniqueId: 'attr-anarkali-care',
    productId: 'prod-royal-anarkali',
    product: {
      id: 'prod-royal-anarkali',
      name: 'Gulab Chanderi Hand-Embroidered Anarkali Set',
      slug: 'gulab-chanderi-hand-embroidered-anarkali-set',
    },
    name: 'Care Instructions',
    value: 'Dry Clean Only. Store wrapped in pure muslin cloth.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'attr-noor-craft',
    uniqueId: 'attr-noor-craft',
    productId: 'prod-noor-coord',
    product: {
      id: 'prod-noor-coord',
      name: 'Noor Artisanal Lounge Co-ord Set',
      slug: 'noor-artisanal-lounge-coord-set',
    },
    name: 'Artisan Technique',
    value: 'Hand Block-Printed using natural vegetable dyes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeAttribute(raw: any): ProductAttribute {
  const id = raw.id || raw.uniqueId || raw._id || `attr-${Date.now()}`;
  const productDoc = raw.product || (typeof raw.productId === 'object' ? raw.productId : null);

  return {
    id: String(id),
    uniqueId: raw.uniqueId ? String(raw.uniqueId) : String(id),
    productId: String(productDoc?._id || productDoc?.id || raw.productId || raw.product_id || ''),
    product: productDoc
      ? {
          id: String(productDoc._id || productDoc.id || productDoc.uniqueId || ''),
          uniqueId: String(productDoc.uniqueId || productDoc._id || productDoc.id || ''),
          name: productDoc.name || '',
          slug: productDoc.slug || '',
        }
      : undefined,
    name: raw.name || '',
    value: raw.value || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function getStoredAttributes(): ProductAttribute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_ATTRIBUTES));
      return INITIAL_FALLBACK_ATTRIBUTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_ATTRIBUTES;
  }
}

function saveStoredAttributes(items: ProductAttribute[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save attributes to localStorage', e);
  }
}

export const productAttributeService = {
  /**
   * GET /api/v1/product-attributes
   */
  async getAll(productId?: string): Promise<{ data: ProductAttribute[]; fromApi: boolean }> {
    try {
      const url = productId
        ? `${API_BASE_URL}/product-attributes?productId=${encodeURIComponent(productId)}`
        : `${API_BASE_URL}/product-attributes`;

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
          const list = rawList.map(normalizeAttribute);
          saveStoredAttributes(list);
          return { data: list, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredAttributes();
    if (productId) {
      return {
        data: stored.filter((a) => a.productId === productId),
        fromApi: false,
      };
    }
    return { data: stored, fromApi: false };
  },

  /**
   * POST /api/v1/product-attributes
   */
  async create(dto: CreateProductAttributeDto): Promise<{ data: ProductAttribute; message: string }> {
    const payload = {
      productId: dto.productId.trim(),
      product_id: dto.productId.trim(),
      name: dto.name.trim(),
      value: dto.value.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/product-attributes`, {
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
          'Failed to create product attribute. Please verify inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeAttribute(rawData);
      const message = json?.message || 'Product attribute created successfully';

      const stored = getStoredAttributes();
      stored.unshift(createdItem);
      saveStoredAttributes(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: ProductAttribute = {
        id: `attr-${Date.now()}`,
        uniqueId: `attr-${Date.now()}`,
        productId: payload.productId,
        name: payload.name,
        value: payload.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stored = getStoredAttributes();
      stored.unshift(localItem);
      saveStoredAttributes(stored);

      return { data: localItem, message: 'Product attribute created successfully' };
    }
  },

  /**
   * PATCH /api/v1/product-attributes/:id
   */
  async update(
    id: string,
    dto: UpdateProductAttributeDto
  ): Promise<{ data: ProductAttribute; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.productId !== undefined) {
      payload.productId = dto.productId.trim();
      payload.product_id = dto.productId.trim();
    }
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.value !== undefined) payload.value = dto.value.trim();

    try {
      let response = await fetch(`${API_BASE_URL}/product-attributes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${API_BASE_URL}/product-attributes/${id}`, {
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
          'Failed to update product attribute.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const updatedItem = normalizeAttribute(rawData);
      const message = json?.message || 'Product attribute updated successfully';

      const stored = getStoredAttributes().map((a) => (a.id === id ? updatedItem : a));
      saveStoredAttributes(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredAttributes();
      const index = stored.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error(`Attribute with ID ${id} not found.`);
      }

      const current = stored[index];
      const updatedItem: ProductAttribute = {
        ...current,
        productId: payload.productId ?? current.productId,
        name: payload.name ?? current.name,
        value: payload.value ?? current.value,
        updatedAt: new Date().toISOString(),
      };
      stored[index] = updatedItem;
      saveStoredAttributes(stored);

      return { data: updatedItem, message: 'Product attribute updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/product-attributes/:id
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-attributes/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete attribute.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Product attribute deleted successfully';

      const stored = getStoredAttributes().filter((a) => a.id !== id);
      saveStoredAttributes(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredAttributes().filter((a) => a.id !== id);
      saveStoredAttributes(stored);

      return { message: 'Product attribute deleted successfully' };
    }
  },
};
