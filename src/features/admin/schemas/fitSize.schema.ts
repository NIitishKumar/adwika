import { z } from 'zod';

export const fitSizeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  fitCode: z
    .string()
    .min(1, 'Fit Code is required')
    .max(10, 'Fit Code cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Fit Code must contain only letters, numbers, or dashes')
    .trim(),
  displayOrder: z
    .coerce
    .number()
    .int('Display Order must be an integer')
    .min(1, 'Display Order must be at least 1'),
  isActive: z.boolean().default(true),
});

export type FitSizeFormData = z.infer<typeof fitSizeSchema>;
