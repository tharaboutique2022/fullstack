import { z } from 'zod';

const optionalImageUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || z.string().url().safeParse(value).success, {
    message: 'Invalid image URL',
  });

export const servicePackageSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  priceMin: z.coerce.number().positive(),
  priceMax: z.coerce.number().positive().optional().nullable(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  gallery: z.array(z.string().url()).optional(),
});

export const serviceProviderSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).optional(),
  tagline: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  imageUrl: optionalImageUrl,
  location: z.string().trim().optional().nullable(),
  distanceKm: z.coerce.number().nonnegative().optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().int().nonnegative().optional(),
  audienceTag: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
  priceFrom: z.coerce.number().positive(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  gallery: z.array(z.string().url()).optional(),
  timeSlots: z.array(z.string().trim().min(3)).optional(),
  packages: z.array(servicePackageSchema).optional(),
});

export type ServiceProviderInput = z.infer<typeof serviceProviderSchema>;
