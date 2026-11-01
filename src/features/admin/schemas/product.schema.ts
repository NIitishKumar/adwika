import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name cannot exceed 120 characters')
    .trim(),
  slug: z
    .string()
    .max(120, 'Slug cannot exceed 120 characters')
    .regex(/^[a-z0-9-]*$/, 'Slug must be lowercase alphanumeric and dashes')
    .optional()
    .default(''),
  categoryId: z
    .string()
    .min(1, 'Please select a product category')
    .trim(),
  subCategoryId: z
    .string()
    .trim()
    .optional()
    .default(''),
  short_description: z
    .string()
    .max(300, 'Short description cannot exceed 300 characters')
    .optional()
    .default(''),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),
  gender: z
    .enum(['MEN', 'WOMEN', 'UNISEX'])
    .default('WOMEN'),
  fit: z
    .string()
    .min(1, 'Fit silhouette is required')
    .trim(),
  imageUrl: z
    .string()
    .url('Please enter a valid image URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  base_price: z
    .coerce
    .number()
    .min(0, 'Base price cannot be negative'),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'DRAFT'])
    .default('ACTIVE'),
  meta_title: z
    .string()
    .max(150, 'Meta title cannot exceed 150 characters')
    .optional()
    .default(''),
  meta_description: z
    .string()
    .max(300, 'Meta description cannot exceed 300 characters')
    .optional()
    .default(''),
});

export type ProductFormData = z.infer<typeof productSchema>;
