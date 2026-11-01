import { z } from 'zod';

export const productAttributeSchema = z.object({
  productId: z
    .string()
    .min(1, 'Please select a garment product')
    .trim(),
  name: z
    .string()
    .min(1, 'Attribute name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  value: z
    .string()
    .min(1, 'Attribute value is required')
    .max(500, 'Value cannot exceed 500 characters')
    .trim(),
});

export type ProductAttributeFormData = z.infer<typeof productAttributeSchema>;
