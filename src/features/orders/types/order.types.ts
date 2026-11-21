export type OrderStatus = 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type PaymentMethod = 'COD' | 'ONLINE' | 'UPI' | 'CARD' | 'NETBANKING';

export interface OrderItem {
  productId?: string;
  variantId: string;
  productName: string;
  productSlug?: string;
  productImageUrl?: string;
  sku?: string;
  size?: string;
  color?: string;
  colorCode?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  customizationNotes?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  addressType?: string;
}

export interface Order {
  id: string;
  _id?: string;
  uniqueId?: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currency: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DirectOrderItemDto {
  variantId: string;
  quantity: number;
  customizationNotes?: string;
}

export interface PlaceOrderDto {
  addressId: string;
  fromCart?: boolean;
  items?: DirectOrderItemDto[];
  paymentMethod: PaymentMethod;
  shippingFee?: number;
  discount?: number;
}

export interface CancelOrderDto {
  reason: string;
}

export interface UpdateOrderStatusDto {
  orderStatus: OrderStatus;
  paymentStatus?: PaymentStatus;
}
