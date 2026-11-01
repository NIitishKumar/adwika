export interface SubCategoryParentCategory {
  id: string;
  uniqueId?: string;
  title: string;
  imageUrl?: string;
}

export interface ProductSubCategory {
  id: string;
  uniqueId?: string;
  categoryId: string;
  category?: SubCategoryParentCategory;
  name: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductSubCategoryDto {
  categoryId: string;
  name: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
}

export type UpdateProductSubCategoryDto = Partial<CreateProductSubCategoryDto>;

export interface ProductSubCategoryApiResponse<T = ProductSubCategory> {
  message: string;
  data: T;
}

export type ProductSubCategoryStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export type ProductSubCategorySortField = 'name' | 'slug' | 'category' | 'createdAt';
