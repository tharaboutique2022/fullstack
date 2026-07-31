import { formatIndianMobileDisplay, isValidIndianMobile, normalizeIndianMobile } from '@ecomm/shared';

export { formatIndianMobileDisplay, isValidIndianMobile, normalizeIndianMobile };

export function getPhoneValidationError(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Phone number is required for delivery calls' : null;
  }
  if (!isValidIndianMobile(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number';
  }
  return null;
}
