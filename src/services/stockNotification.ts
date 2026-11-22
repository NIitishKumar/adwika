import { API_BASE_URL, authFetch } from '@/config/api.config';
import {
  SubscribePayload,
  UnsubscribePayload,
  StockNotification,
  StockNotificationApiResponse,
} from '@/features/stock-notifications/types/stockNotification.types';

export * from '@/features/stock-notifications/types/stockNotification.types';

export const stockNotificationApi = {
  /**
   * 1. Subscribe to restock alerts
   * POST /api/v1/stock-notifications/subscribe (or /stock-notifications)
   * Auth: Optional (JWT or cookies automatically sent via authFetch)
   */
  async subscribe(payload: SubscribePayload): Promise<StockNotificationApiResponse<StockNotification>> {
    let res = await authFetch(`${API_BASE_URL}/stock-notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/stock-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        data?.message ||
        (res.status === 409
          ? 'You already have an active restock notification for this piece.'
          : 'Failed to subscribe to restock notifications.');
      throw new Error(message);
    }

    return data;
  },

  /**
   * 2. Fetch subscriptions for logged-in user or guest by email
   * GET /api/v1/stock-notifications/my-subscriptions
   */
  async getMySubscriptions(email?: string): Promise<StockNotificationApiResponse<StockNotification[]>> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/my-subscriptions${qs}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch stock notifications.');
    }

    return data;
  },

  /**
   * 3. Unsubscribe from restock notifications
   * POST /api/v1/stock-notifications/unsubscribe
   */
  async unsubscribe(
    payload: UnsubscribePayload
  ): Promise<StockNotificationApiResponse<{ email: string; cancelledCount: number }>> {
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to unsubscribe from restock notifications.');
    }

    return data;
  },

  /**
   * 4. Admin restock a product variant
   * PATCH /api/v1/product-variants/:id/restock (or /product-variants/:id)
   */
  async restockVariant(variantId: string, quantity: number): Promise<any> {
    let res = await authFetch(`${API_BASE_URL}/product-variants/${encodeURIComponent(variantId)}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, stockQuantity: quantity }),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/product-variants/${encodeURIComponent(variantId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: quantity, stockQuantity: quantity }),
      });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to restock product variant.');
    }

    return data;
  },

  /**
   * 5. Admin manual trigger / broadcast restock
   * POST /api/v1/stock-notifications/notify
   */
  async notifyRestock(variantId: string, quantity: number): Promise<any> {
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, quantity }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to trigger restock notifications.');
    }

    return data;
  },

  /**
   * 6. Admin list all restock subscriptions with filters
   * GET /api/v1/stock-notifications
   */
  async getAllSubscriptions(params?: {
    email?: string;
    productId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<StockNotificationApiResponse<StockNotification[]>> {
    const query = new URLSearchParams();
    if (params?.email) query.set('email', params.email);
    if (params?.productId) query.set('productId', params.productId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${API_BASE_URL}/stock-notifications${qs}`, {
      headers: { Accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to list stock subscriptions.');
    }
    return data;
  },

  /**
   * 7. Admin get single subscription details
   * GET /api/v1/stock-notifications/:id
   */
  async getSubscriptionById(id: string): Promise<StockNotificationApiResponse<StockNotification>> {
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to get stock subscription details.');
    }
    return data;
  },

  /**
   * 8. Admin update subscription status / email / phone
   * PATCH /api/v1/stock-notifications/:id
   */
  async updateSubscription(
    id: string,
    dataToUpdate: Partial<{ status: string; email: string; phone: string }>
  ): Promise<StockNotificationApiResponse<StockNotification>> {
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToUpdate),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update stock subscription.');
    }
    return data;
  },

  /**
   * 9. Admin delete/cancel restock subscription
   * DELETE /api/v1/stock-notifications/:id
   */
  async deleteSubscription(id: string): Promise<StockNotificationApiResponse<void>> {
    const res = await authFetch(`${API_BASE_URL}/stock-notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to delete stock subscription.');
    }
    return data;
  },
};
