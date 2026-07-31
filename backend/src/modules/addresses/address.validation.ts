import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).optional(),
  line1: z.string().trim().min(3),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
