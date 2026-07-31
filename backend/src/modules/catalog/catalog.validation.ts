import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).optional(),
  parentId: z.string().uuid().optional().nullable(),
  kind: z.enum(['department', 'group', 'brand', 'leaf']).optional(),
  subtitle: z.string().trim().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const listCategoriesQuerySchema = paginationSchema.extend({
  parentId: z.string().uuid().optional(),
  rootsOnly: z
    .union([z.enum(['true', 'false']), z.boolean()])
    .optional()
    .transform((value) => value === true || value === 'true'),
  kind: z.enum(['department', 'group', 'brand', 'leaf']).optional(),
});

const optionalImageUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || z.string().url().safeParse(value).success, {
    message: 'Invalid image URL',
  });

const productOptionValueSchema = z.object({
  value: z.string().trim().min(1),
  imageUrl: optionalImageUrl,
});

export const productSchema = z.object({
  categoryId: z.string().uuid(),
  brand: z.string().trim().optional().nullable(),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive(),
  imageUrl: optionalImageUrl,
  stockStatus: z.enum(['in_stock', 'out_of_stock']).optional(),
  isActive: z.boolean().optional(),
  hasVariants: z.boolean().optional(),
  options: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        values: z.array(productOptionValueSchema).min(1),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        optionValues: z.array(z.string().trim().min(1)).min(1),
        price: z.coerce.number().positive(),
        stockStatus: z.enum(['in_stock', 'out_of_stock']).optional(),
        sku: z.string().trim().optional().nullable(),
        imageUrl: optionalImageUrl,
        isActive: z.boolean().optional(),
      })
    )
    .optional(),
});

export const serviceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

export const listCatalogQuerySchema = paginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
  brand: z.string().trim().min(1).optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock']).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export type ListCatalogQuery = z.infer<typeof listCatalogQuerySchema>;
