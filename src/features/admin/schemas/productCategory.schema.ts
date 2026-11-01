import { z } from 'zod';

export const productCategorySchema = z.object({
  id: z
    .string()
    .min(1, 'Category ID / Slug is required')
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens (e.g. ethnic-wear)')
    .transform((val) => val.toLowerCase().trim()),
  title: z
    .string()
    .min(1, 'Category Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  image_url: z
    .string()
    .trim()
    .optional()
    .default(''),
  banner_image_url: z
    .string()
    .trim()
    .optional()
    .default(''),
  order_by: z
    .coerce
    .number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1'),
  is_active: z.boolean().default(true),
});

export type ProductCategoryFormData = z.infer<typeof productCategorySchema>;
