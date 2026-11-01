import { z } from 'zod';

export const productImageSchema = z.object({
  productId: z
    .string()
    .min(1, 'Please select a garment product')
    .trim(),
  image_url: z
    .string()
    .min(1, 'Image URL is required')
    .trim(),
  alt_text: z
    .string()
    .max(200, 'Alt text cannot exceed 200 characters')
    .optional()
    .default(''),
  display_order: z
    .coerce
    .number()
    .int('Display order must be an integer')
    .min(1, 'Display order must be at least 1'),
  is_primary: z.boolean().default(false),
});

export type ProductImageFormData = z.infer<typeof productImageSchema>;
