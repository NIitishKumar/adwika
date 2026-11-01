import {
  ProductImage,
  CreateProductImageDto,
  UpdateProductImageDto,
} from '../types/productImage.types';
import { API_BASE_URL } from '@/config/api.config';

const STORAGE_KEY = 'adwika_admin_product_images_v1';

const INITIAL_FALLBACK_IMAGES: ProductImage[] = [
  {
    id: '6ae635370524444ba6985f47',
    uniqueId: '6ae635370524444ba6985f47',
    imageId: '6ae635370524444ba6985f47',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      uniqueId: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
    },
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    altText: 'Front view of classic oxford cotton shirt in tailored cut',
    displayOrder: 1,
    isPrimary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'img-oxford-collar-detail',
    uniqueId: 'img-oxford-collar-detail',
    imageId: 'img-oxford-collar-detail',
    productId: '6ae63157baaed242a3252445',
    product: {
      id: '6ae63157baaed242a3252445',
      uniqueId: '6ae63157baaed242a3252445',
      name: 'Classic Oxford Cotton Shirt Ragular Fit',
      slug: 'classic-oxford-cotton-shirt-ragular-fit',
    },
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    altText: 'Close up collar stitching and mother-of-pearl buttons',
    displayOrder: 2,
    isPrimary: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'img-anarkali-hero',
    uniqueId: 'img-anarkali-hero',
    imageId: 'img-anarkali-hero',
    productId: 'prod-royal-anarkali',
    product: {
      id: 'prod-royal-anarkali',
      name: 'Gulab Chanderi Hand-Embroidered Anarkali Set',
      slug: 'gulab-chanderi-hand-embroidered-anarkali-set',
    },
    imageUrl: 'https://images.unsplash.com/photo-1583391733975-ae9847156947?auto=format&fit=crop&w=800&q=80',
    altText: 'Royal festive Gulab Chanderi Anarkali with gold organza dupatta',
    displayOrder: 1,
    isPrimary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'img-coord-hero',
    uniqueId: 'img-coord-hero',
    imageId: 'img-coord-hero',
    productId: 'prod-noor-coord',
    product: {
      id: 'prod-noor-coord',
      name: 'Noor Artisanal Lounge Co-ord Set',
      slug: 'noor-artisanal-lounge-coord-set',
    },
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    altText: 'Noor relaxed artisanal lounge coordinated two-piece set',
    displayOrder: 1,
    isPrimary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeImage(raw: any): ProductImage {
  const id = raw.id || raw.uniqueId || raw.imageId || raw._id || `img-${Date.now()}`;
  const productDoc = raw.product || (typeof raw.productId === 'object' ? raw.productId : null);

  return {
    id: String(id),
    uniqueId: raw.uniqueId ? String(raw.uniqueId) : String(id),
    imageId: raw.imageId ? String(raw.imageId) : String(id),
    productId: String(productDoc?._id || productDoc?.id || raw.productId || raw.product_id || ''),
    product: productDoc
      ? {
          id: String(productDoc._id || productDoc.id || productDoc.uniqueId || ''),
          uniqueId: String(productDoc.uniqueId || productDoc._id || productDoc.id || ''),
          name: productDoc.name || '',
          slug: productDoc.slug || '',
        }
      : undefined,
    imageUrl: raw.imageUrl || raw.image_url || '',
    altText: raw.altText || raw.alt_text || '',
    displayOrder: Number(raw.displayOrder ?? raw.display_order ?? 1),
    isPrimary:
      typeof raw.isPrimary === 'boolean'
        ? raw.isPrimary
        : typeof raw.is_primary === 'boolean'
        ? raw.is_primary
        : false,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function getStoredImages(): ProductImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_IMAGES));
      return INITIAL_FALLBACK_IMAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_IMAGES;
  }
}

function saveStoredImages(items: ProductImage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save product images to localStorage', e);
  }
}

export const productImageService = {
  /**
   * GET /api/v1/product-images
   */
  async getAll(productId?: string): Promise<{ data: ProductImage[]; fromApi: boolean }> {
    try {
      const url = productId
        ? `${API_BASE_URL}/product-images?productId=${encodeURIComponent(productId)}`
        : `${API_BASE_URL}/product-images`;

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
          const list = rawList.map(normalizeImage);
          saveStoredImages(list);
          const filtered = productId
            ? list.filter(
                (img) =>
                  img.productId === productId ||
                  img.product?.id === productId ||
                  img.product?.uniqueId === productId
              )
            : list;
          return { data: filtered, fromApi: true };
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredImages();
    if (productId) {
      return {
        data: stored.filter(
          (img) =>
            img.productId === productId ||
            img.product?.id === productId ||
            img.product?.uniqueId === productId
        ),
        fromApi: false,
      };
    }
    return { data: stored, fromApi: false };
  },

  /**
   * GET /api/v1/product-images?productId=:productId
   * Fetch all images associated with a specific product ID
   */
  async getByProductId(productId: string): Promise<{ data: ProductImage[]; fromApi: boolean }> {
    const cleanId = (productId || '').trim();
    if (!cleanId) {
      return { data: [], fromApi: false };
    }

    try {
      // 1. Try querying with ?productId=
      const response = await fetch(
        `${API_BASE_URL}/product-images?productId=${encodeURIComponent(cleanId)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawList = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(rawList)) {
          const list = rawList.map(normalizeImage);
          // Update cache
          const stored = getStoredImages();
          const merged = [...stored];
          list.forEach((item) => {
            const idx = merged.findIndex((m) => m.id === item.id);
            if (idx >= 0) merged[idx] = item;
            else merged.unshift(item);
          });
          saveStoredImages(merged);

          const matches = list.filter(
            (img) =>
              img.productId === cleanId ||
              img.product?.id === cleanId ||
              img.product?.uniqueId === cleanId
          );

          if (matches.length > 0) {
            return {
              data: matches.sort((a, b) => a.displayOrder - b.displayOrder),
              fromApi: true,
            };
          }

          if (rawList.length > 0) {
            return {
              data: list.sort((a, b) => a.displayOrder - b.displayOrder),
              fromApi: true,
            };
          }
        }
      }

      // 2. Fallback: try fetching all product images and filtering
      const allRes = await fetch(`${API_BASE_URL}/product-images`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (allRes.ok) {
        const json = await allRes.json();
        const rawList = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(rawList)) {
          const list = rawList.map(normalizeImage);
          saveStoredImages(list);
          const matches = list.filter(
            (img) =>
              img.productId === cleanId ||
              img.product?.id === cleanId ||
              img.product?.uniqueId === cleanId
          );
          if (matches.length > 0) {
            return {
              data: matches.sort((a, b) => a.displayOrder - b.displayOrder),
              fromApi: true,
            };
          }
        }
      }
    } catch {
      // Backend offline or booting; fallback to local storage
    }

    const stored = getStoredImages();
    const localMatches = stored.filter(
      (img) =>
        img.productId === cleanId ||
        img.product?.id === cleanId ||
        img.product?.uniqueId === cleanId
    );
    return {
      data: localMatches.sort((a, b) => a.displayOrder - b.displayOrder),
      fromApi: false,
    };
  },

  /**
   * POST /api/v1/product-images
   */
  async create(dto: CreateProductImageDto): Promise<{ data: ProductImage; message: string }> {
    const payload = {
      productId: dto.productId.trim(),
      product_id: dto.productId.trim(),
      image_url: dto.image_url.trim(),
      imageUrl: dto.image_url.trim(),
      alt_text: (dto.alt_text || '').trim(),
      altText: (dto.alt_text || '').trim(),
      display_order: Number(dto.display_order),
      displayOrder: Number(dto.display_order),
      is_primary: Boolean(dto.is_primary),
      isPrimary: Boolean(dto.is_primary),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/product-images`, {
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
          'Failed to upload product image. Please verify inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeImage(rawData);
      const message = json?.message || 'Product image created successfully';

      const stored = getStoredImages();
      // If new image is primary, remove primary flag from sibling images of same product
      if (createdItem.isPrimary) {
        stored.forEach((img) => {
          if (img.productId === createdItem.productId) {
            img.isPrimary = false;
          }
        });
      }
      stored.unshift(createdItem);
      saveStoredImages(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback
      const localItem: ProductImage = {
        id: `img-${Date.now()}`,
        uniqueId: `img-${Date.now()}`,
        imageId: `img-${Date.now()}`,
        productId: payload.productId,
        imageUrl: payload.image_url,
        altText: payload.alt_text,
        displayOrder: payload.display_order,
        isPrimary: payload.is_primary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stored = getStoredImages();
      if (localItem.isPrimary) {
        stored.forEach((img) => {
          if (img.productId === localItem.productId) {
            img.isPrimary = false;
          }
        });
      }
      stored.unshift(localItem);
      saveStoredImages(stored);

      return { data: localItem, message: 'Product image created successfully' };
    }
  },

  /**
   * PATCH /api/v1/product-images/:id
   */
  async update(id: string, dto: UpdateProductImageDto): Promise<{ data: ProductImage; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.productId !== undefined) {
      payload.productId = dto.productId.trim();
      payload.product_id = dto.productId.trim();
    }
    if (dto.image_url !== undefined) {
      payload.image_url = dto.image_url.trim();
      payload.imageUrl = dto.image_url.trim();
    }
    if (dto.alt_text !== undefined) {
      payload.alt_text = dto.alt_text.trim();
      payload.altText = dto.alt_text.trim();
    }
    if (dto.display_order !== undefined) {
      payload.display_order = Number(dto.display_order);
      payload.displayOrder = Number(dto.display_order);
    }
    if (dto.is_primary !== undefined) {
      payload.is_primary = Boolean(dto.is_primary);
      payload.isPrimary = Boolean(dto.is_primary);
    }

    try {
      let response = await fetch(`${API_BASE_URL}/product-images/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${API_BASE_URL}/product-images/${id}`, {
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
          'Failed to update product image.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const updatedItem = normalizeImage(rawData);
      const message = json?.message || 'Product image updated successfully';

      const stored = getStoredImages().map((img) => {
        if (img.id === id) return updatedItem;
        if (updatedItem.isPrimary && img.productId === updatedItem.productId) {
          return { ...img, isPrimary: false };
        }
        return img;
      });
      saveStoredImages(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredImages();
      const index = stored.findIndex((img) => img.id === id);
      if (index === -1) {
        throw new Error(`Product image with ID ${id} not found.`);
      }

      const current = stored[index];
      const updatedItem: ProductImage = {
        ...current,
        productId: payload.productId ?? current.productId,
        imageUrl: payload.image_url ?? current.imageUrl,
        altText: payload.alt_text ?? current.altText,
        displayOrder: payload.display_order ?? current.displayOrder,
        isPrimary: payload.is_primary ?? current.isPrimary,
        updatedAt: new Date().toISOString(),
      };

      const nextStored = stored.map((img) => {
        if (img.id === id) return updatedItem;
        if (updatedItem.isPrimary && img.productId === updatedItem.productId) {
          return { ...img, isPrimary: false };
        }
        return img;
      });
      saveStoredImages(nextStored);

      return { data: updatedItem, message: 'Product image updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/product-images/:id
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-images/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete product image.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Product image deleted successfully';

      const stored = getStoredImages().filter((img) => img.id !== id);
      saveStoredImages(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredImages().filter((img) => img.id !== id);
      saveStoredImages(stored);

      return { message: 'Product image deleted successfully' };
    }
  },

  /**
   * Toggle Primary image status
   */
  async togglePrimary(id: string, productId: string): Promise<{ data: ProductImage; message: string }> {
    return this.update(id, { is_primary: true, productId });
  },
};
