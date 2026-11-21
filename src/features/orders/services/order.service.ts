import { authFetch, API_BASE_URL } from '@/config/api.config';
import {
  Order,
  PlaceOrderDto,
  UpdateOrderStatusDto,
} from '../types/order.types';

function normalizeOrder(raw: any): Order {
  if (!raw) {
    throw new Error('Order data is missing or invalid.');
  }

  const shippingAddr = raw.shippingAddress || raw.shipping_address || {};

  return {
    id: String(raw.id || raw._id || raw.uniqueId || ''),
    _id: raw._id,
    uniqueId: raw.uniqueId,
    orderNumber: raw.orderNumber || raw.order_number || `ADW-${raw.id || 'ORDER'}`,
    userId: raw.userId || raw.user_id,
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          productId: it.productId || it.product_id || it.product?._id || it.product?.id,
          variantId: it.variantId || it.variant_id || it.variant?._id || it.variant?.id || '',
          productName: it.productName || it.product_name || it.product?.name || 'Adwika Heirloom',
          productSlug: it.productSlug || it.product_slug || it.product?.slug,
          productImageUrl:
            it.productImageUrl ||
            it.product_image_url ||
            it.product?.imageUrl ||
            it.imageUrl ||
            '/images/default.jpg',
          sku: it.sku || it.variant?.sku,
          size: it.size || it.variant?.fitSizeId?.name || it.variant?.size,
          color: it.color || it.variant?.productColorId?.name || it.variant?.color,
          colorCode: it.colorCode || it.variant?.productColorId?.code,
          price: Number(it.price ?? 0),
          quantity: Number(it.quantity ?? 1),
          totalPrice: Number(it.totalPrice ?? ((it.price ?? 0) * (it.quantity || 1))),
          customizationNotes: it.customizationNotes || it.customization_notes,
        }))
      : [],
    shippingAddress: {
      name: shippingAddr.name || 'Valued Patron',
      phone: shippingAddr.phone || '',
      alternatePhone: shippingAddr.alternatePhone || shippingAddr.alternate_phone,
      addressLine1: shippingAddr.addressLine1 || shippingAddr.address_line1 || shippingAddr.address || '',
      addressLine2: shippingAddr.addressLine2 || shippingAddr.address_line2,
      landmark: shippingAddr.landmark,
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      postalCode: shippingAddr.postalCode || shippingAddr.postal_code || shippingAddr.pinCode || '',
      country: shippingAddr.country || 'India',
      addressType: shippingAddr.addressType || shippingAddr.address_type || 'HOME',
    },
    subtotal: Number(raw.subtotal ?? raw.totalAmount ?? 0),
    shippingFee: Number(raw.shippingFee ?? raw.shipping_fee ?? 0),
    discount: Number(raw.discount ?? 0),
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    currency: raw.currency || 'INR',
    orderStatus: (raw.orderStatus || raw.order_status || 'CONFIRMED') as any,
    paymentStatus: (raw.paymentStatus || raw.payment_status || 'PENDING') as any,
    paymentMethod: (raw.paymentMethod || raw.payment_method || 'COD') as any,
    cancellationReason: raw.cancellationReason || raw.cancellation_reason,
    cancelledAt: raw.cancelledAt || raw.cancelled_at,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}

function extractOrderList(resData: any): Order[] {
  if (!resData) return [];
  const list = resData.data?.data || resData.data || resData;
  if (Array.isArray(list)) {
    return list.map(normalizeOrder);
  }
  return [];
}

export const orderService = {
  /**
   * POST /api/v1/orders (or /orders/checkout)
   * Places a new order from cart or direct items
   */
  async placeOrder(dto: PlaceOrderDto): Promise<Order> {
    let res = await authFetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to place order.');
    }

    const data = await res.json();
    const candidate = data.data?.data || data.data || data;
    return normalizeOrder(candidate);
  },

  /**
   * GET /api/v1/orders (or /orders/my-orders)
   * Fetches customer's orders with optional status filters
   */
  async getMyOrders(params?: { orderStatus?: string; paymentStatus?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.orderStatus && params.orderStatus !== 'ALL') {
      query.set('orderStatus', params.orderStatus);
    }
    if (params?.paymentStatus && params.paymentStatus !== 'ALL') {
      query.set('paymentStatus', params.paymentStatus);
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';

    let res = await authFetch(`${API_BASE_URL}/orders${queryString}`);

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/orders/my-orders${queryString}`);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch orders.');
    }

    const data = await res.json();
    return extractOrderList(data);
  },

  /**
   * GET /api/v1/orders/:id
   * Views order details by mongo ID or readable orderNumber
   */
  async getOrderById(idOrNumber: string): Promise<Order> {
    const res = await authFetch(`${API_BASE_URL}/orders/${idOrNumber}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch order details.');
    }

    const data = await res.json();
    const candidate = data.data?.data || data.data || data;
    return normalizeOrder(candidate);
  },

  /**
   * PATCH /api/v1/orders/:id/cancel
   * Cancels a customer order before delivery
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const res = await authFetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to cancel order.');
    }

    const data = await res.json();
    const candidate = data.data?.data || data.data || data;
    return normalizeOrder(candidate);
  },

  /**
   * PATCH /api/v1/orders/:id/status
   * Updates orderStatus & paymentStatus (Admin)
   */
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const res = await authFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to update order status.');
    }

    const data = await res.json();
    const candidate = data.data?.data || data.data || data;
    return normalizeOrder(candidate);
  },
};
