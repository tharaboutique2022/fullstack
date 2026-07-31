import type { Address } from './api.types';

export function formatAddress(address: Pick<Address, 'line1' | 'line2' | 'city' | 'state' | 'pincode'>): string {
  const cityLine = `${address.city}, ${address.state} ${address.pincode}`;
  return [address.line1, address.line2, cityLine].filter(Boolean).join(', ');
}
