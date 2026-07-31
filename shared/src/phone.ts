/** Indian mobile: 10 digits starting with 6–9. */
export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianMobile(value: string): boolean {
  return INDIAN_MOBILE_PATTERN.test(normalizeIndianMobile(value));
}

export function formatIndianMobileDisplay(value: string): string {
  const normalized = normalizeIndianMobile(value);
  if (!INDIAN_MOBILE_PATTERN.test(normalized)) {
    return value;
  }
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}
