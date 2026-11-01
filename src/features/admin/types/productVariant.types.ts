export interface VariantParentProduct {
  id: string;
  uniqueId?: string;
  name: string;
  slug: string;
  basePrice?: number;
}

export interface VariantFitSize {
  id: string;
  uniqueId?: string;
  name: string;
  fitCode: string;
  displayOrder?: number;
}

export interface VariantProductColor {
  id: string;
  uniqueId?: string;
  name: string;
  code: string;
}

export interface ProductVariant {
  id: string;
  uniqueId?: string;
  variantId?: string;
  productId: string;
  product?: VariantParentProduct;
  fitSizeId: string;
  fitSize?: VariantFitSize;
  productColorId: string;
  productColor?: VariantProductColor;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductVariantDto {
  productId: string;
  fitSizeId: string;
  productColorId: string;
  price: number;
  compare_at_price?: number | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
}

export type UpdateProductVariantDto = Partial<CreateProductVariantDto>;

export interface ProductVariantApiResponse<T = ProductVariant> {
  message: string;
  data: T;
}

export type ProductVariantStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type ProductVariantSortField = 'sku' | 'price' | 'stock' | 'createdAt' | 'product';
