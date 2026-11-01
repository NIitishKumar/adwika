import { z } from 'zod';

export const productVariantSchema = z.object({
  productId: z
    .string()
    .min(1, 'Please select a product')
    .trim(),
  fitSizeId: z
    .string()
    .min(1, 'Please select a fit silhouette')
    .trim(),
  productColorId: z
    .string()
    .min(1, 'Please select an artisanal colorway')
    .trim(),
  price: z
    .coerce
    .number()
    .min(0, 'Price cannot be negative'),
  compare_at_price: z
    .coerce
    .number()
    .min(0, 'Compare-at price cannot be negative')
    .optional()
    .nullable(),
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'SKU may only contain letters, numbers, hyphens, and underscores')
    .trim(),
  stock_quantity: z
    .coerce
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock cannot be negative'),
  is_active: z.boolean().default(true),
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;

