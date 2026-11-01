export interface ImageParentProduct {
  id: string;
  uniqueId?: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  uniqueId?: string;
  imageId?: string;
  productId: string;
  product?: ImageParentProduct;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductImageDto {
  productId: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export type UpdateProductImageDto = Partial<CreateProductImageDto>;

export interface ProductImageApiResponse<T = ProductImage> {
  message: string;
  data: T;
}

export type ProductImageFilterType = 'ALL' | 'PRIMARY' | 'GALLERY';

export type ProductImageSortField = 'displayOrder' | 'product' | 'createdAt';
