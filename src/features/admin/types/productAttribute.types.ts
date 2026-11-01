export interface AttributeParentProduct {
  id: string;
  uniqueId?: string;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: string;
  uniqueId?: string;
  productId: string;
  product?: AttributeParentProduct;
  name: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductAttributeDto {
  productId: string;
  name: string;
  value: string;
}

export type UpdateProductAttributeDto = Partial<CreateProductAttributeDto>;

export interface ProductAttributeApiResponse<T = ProductAttribute> {
  message: string;
  data: T;
}

export type ProductAttributeSortField = 'name' | 'value' | 'product' | 'createdAt';
