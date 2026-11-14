import { SubCategoryParentCategory } from './productSubCategory.types';

export interface ProductParentSubCategory {
  id: string;
  uniqueId?: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export type ProductGender = 'MEN' | 'WOMEN' | 'UNISEX';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Product {
  id: string;
  uniqueId?: string;
  productId?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  gender: ProductGender;
  fit: string;
  imageUrl?: string;
  basePrice: number;
  status: ProductStatus;
  metaTitle?: string;
  metaDescription?: string;
  categoryId: string;
  category?: SubCategoryParentCategory;
  subCategoryId?: string;
  subCategory?: ProductParentSubCategory;
  images?: any[];
  variants?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  categoryId: string;
  subCategoryId?: string;
  shortDescription?: string;
  short_description?: string;
  description?: string;
  gender: ProductGender;
  fit: string;
  imageUrl?: string;
  image_url?: string;
  basePrice?: number;
  base_price?: number;
  status: ProductStatus;
  metaTitle?: string;
  meta_title?: string;
  metaDescription?: string;
  meta_description?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQueryParams {
  categoryId?: string;
  subCategoryId?: string;
  gender?: string;
  fit?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
}

export interface ProductApiResponse<T = Product> {
  message: string;
  data: T;
}

export type ProductStatusFilter = 'ALL' | ProductStatus;
export type ProductGenderFilter = 'ALL' | ProductGender;
export type ProductSortField = 'createdAt' | 'name' | 'basePrice' | 'fit';
