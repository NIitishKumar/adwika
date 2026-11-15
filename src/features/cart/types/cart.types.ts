export interface CartProduct {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  basePrice?: number;
  fit?: string;
  shortDescription?: string;
  description?: string;
}

export interface CartFitSize {
  _id?: string;
  name: string;
  fitCode?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CartProductColor {
  _id?: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface CartVariant {
  _id: string;
  productId?: CartProduct;
  fitSizeId?: CartFitSize;
  productColorId?: CartProductColor;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface CartItem {
  _id: string;
  variantId: CartVariant;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartDto {
  variantId: string;
  quantity?: number;
  customizationNotes?: string;
}
