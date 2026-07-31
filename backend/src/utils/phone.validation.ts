import { z } from 'zod';
import { isValidIndianMobile, normalizeIndianMobile } from '@ecomm/shared';

export const indianMobileSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine(isValidIndianMobile, 'Enter a valid 10-digit Indian mobile number')
  .transform(normalizeIndianMobile);

export const optionalIndianMobileSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || isValidIndianMobile(value), 'Enter a valid 10-digit Indian mobile number')
  .transform((value) => (value ? normalizeIndianMobile(value) : undefined));
