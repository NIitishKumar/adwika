export interface SubscribePayload {
  productId?: string;
  variantId?: string;
  email?: string;
  phone?: string;
}

export interface UnsubscribePayload {
  email: string;
  productId?: string;
  variantId?: string;
}

export interface RestockVariantPayload {
  quantity?: number;
  stockQuantity?: number;
}

export interface BroadcastNotifyPayload {
  variantId: string;
  quantity: number;
}

export interface StockNotificationProduct {
  id?: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  basePrice?: number;
}

export interface StockNotificationVariant {
  id?: string;
  sku?: string;
  price?: number;
  size?: string;
  color?: string;
  stockQuantity?: number;
}

export interface StockNotification {
  id: string;
  uniqueId?: string;
  productId?: string;
  product?: StockNotificationProduct;
  variantId?: string;
  variant?: StockNotificationVariant;
  email: string;
  phone?: string;
  status: 'PENDING' | 'NOTIFIED' | 'CANCELLED';
  notifiedAt?: string | null;
  createdAt?: string;
}

export interface StockNotificationApiResponse<T = any> {
  message: string;
  data: T;
}
