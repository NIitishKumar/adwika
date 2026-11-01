import { SortDirection } from './fitSize.types';

export interface ProductCategory {
  id: string; // Database unique identifier (or categoryId fallback)
  uniqueId?: string;
  categoryId: string; // Human-readable slug, e.g. "ethnic-wear"
  title: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  orderBy: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductCategoryDto {
  id: string; // Slug/id, e.g. "ethnic-wear"
  title: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  order_by: number;
  is_active: boolean;
}

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>;

export interface ProductCategoryApiResponse<T = ProductCategory> {
  message: string;
  data: T;
}

export type ProductCategoryStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export type ProductCategorySortField = 'orderBy' | 'title' | 'categoryId';

