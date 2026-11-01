export interface ProductColor {
  id: string;
  uniqueId?: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductColorDto {
  name: string;
  code: string;
  isActive: boolean;
}

export type UpdateProductColorDto = Partial<CreateProductColorDto>;

export type ProductColorStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export type ProductColorSortField = 'name' | 'code' | 'createdAt';
