import { z } from 'zod';

export const productColorSchema = z.object({
  name: z
    .string()
    .min(1, 'Color Name is required')
    .min(2, 'Color Name must be at least 2 characters')
    .max(50, 'Color Name cannot exceed 50 characters')
    .trim(),
  code: z
    .string()
    .min(1, 'Color Code is required')
    .max(20, 'Color Code cannot exceed 20 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Color Code must contain only alphanumeric characters, dashes or underscores')
    .transform((val) => val.toUpperCase().trim()),
  isActive: z.boolean().default(true),
});

export type ProductColorFormData = z.infer<typeof productColorSchema>;
