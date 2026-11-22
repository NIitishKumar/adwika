import { authFetch, API_BASE_URL } from '@/config/api.config';
import { Cart, AddToCartDto } from '../types/cart.types';

function extractCart(resData: any): Cart | null {
  if (!resData) return null;
  const candidate = resData.data?.data || resData.data || resData;
  if (candidate && typeof candidate === 'object' && Array.isArray(candidate.items)) {
    return candidate as Cart;
  }
  return candidate as Cart;
}

export const cartService = {
  /**
   * GET /api/v1/cart
   * Fetches current authenticated user's cart with populated variants
   */
  async getCart(): Promise<Cart | null> {
    const res = await authFetch(`${API_BASE_URL}/cart`);
    if (!res.ok) {
      if (res.status === 404) return null;
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch cart.');
    }
    const data = await res.json();
    return extractCart(data);
  },

  /**
   * POST /api/v1/cart/items (or /cart)
   * Adds an item by variantId
   */
  async addToCart(dto: AddToCartDto): Promise<Cart> {
    let res = await authFetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Unable to add item to bag.');
    }

    const data = await res.json();
    const cart = extractCart(data);
    if (!cart) {
      const refreshed = await this.getCart();
      if (refreshed) return refreshed;
      throw new Error('Invalid cart response received.');
    }
    return cart;
  },

  /**
   * PATCH /api/v1/cart/items/:itemId
   * Updates line item quantity
   */
  async updateQuantity(itemId: string, quantity: number): Promise<Cart> {
    let res = await authFetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Unable to update item quantity.');
    }

    const data = await res.json();
    const cart = extractCart(data);
    if (!cart) {
      const refreshed = await this.getCart();
      if (refreshed) return refreshed;
      throw new Error('Invalid cart response received.');
    }
    return cart;
  },

  /**
   * DELETE /api/v1/cart/items/:itemId
   * Removes a line item from the user's cart
   */
  async removeItem(itemId: string): Promise<Cart> {
    let res = await authFetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Unable to remove item from bag.');
    }

    const data = await res.json();
    const cart = extractCart(data);
    if (!cart) {
      const refreshed = await this.getCart();
      if (refreshed) return refreshed;
      throw new Error('Invalid cart response received.');
    }
    return cart;
  },

  /**
   * DELETE /api/v1/cart/clear (or /cart)
   * Clears the user's entire cart
   */
  async clearCart(): Promise<void> {
    let res = await authFetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Unable to clear bag.');
    }
  },
};
