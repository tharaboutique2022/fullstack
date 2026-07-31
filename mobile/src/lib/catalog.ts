import type {
  Product,
  ProductCategory,
  ServiceCategory,
  ServicePackage,
  ServiceProvider,
} from '@ecomm/shared/api.types';
import { env } from '@/config/env';

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

export function parsePrice(value?: string | null): number {
  if (!value) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = env.apiBaseUrl.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

export function getProductListPrice(product: Product): number {
  return parsePrice(product.hasVariants ? product.priceFrom : product.price);
}

export function getProductBrand(product: Product): string {
  return product.brand ?? product.category?.name ?? 'Thara Boutique';
}

export function getCategoryImage(category: ProductCategory | ServiceCategory): string {
  return resolveImageUrl(category.imageUrl);
}

/** Unique URI per category id — avoids image view reuse when several categories share the same URL. */
export function getCategoryImageForId(
  category: ProductCategory | ServiceCategory,
  key: string
): string {
  const base = getCategoryImage(category);
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}cat=${encodeURIComponent(key)}`;
}

export function formatInr(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function formatPriceRange(pkg: ServicePackage): string {
  const min = parsePrice(pkg.priceMin);
  const max = pkg.priceMax ? parsePrice(pkg.priceMax) : null;
  if (max && max !== min) {
    return `${formatInr(min)} - ${formatInr(max)}`;
  }
  return formatInr(min);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} Hr${hours > 1 ? 's' : ''}` : `${hours.toFixed(1)} Hrs`;
}

export function formatDistance(km?: string | null): string | null {
  if (!km) return null;
  const value = Number(km);
  if (!Number.isFinite(value)) return null;
  return `${value.toFixed(1)} Kms`;
}

export function formatRating(provider: ServiceProvider): string {
  const rating = provider.rating ? Number(provider.rating).toFixed(1) : '—';
  return `${rating} (${provider.reviewCount})`;
}

export function getProviderHeroImage(provider: ServiceProvider): string {
  const gallery = provider.gallery?.[0]?.imageUrl;
  return resolveImageUrl(gallery ?? provider.imageUrl);
}

export function getProviderLocationLine(provider: ServiceProvider): string {
  const parts = [provider.location, formatDistance(provider.distanceKm)].filter(Boolean);
  return parts.join(' • ');
}

export function getCategoryDisplayName(category: ServiceCategory): string {
  const map: Record<string, string> = {
    mehandi: 'Mehandi Artist',
    makeup: 'Makeup Artist',
    gym: 'GYM Trainer',
  };
  return map[category.slug] ?? category.name;
}

/** Display pricing for discover/search cards (visual discount badge). */
export function getProductDiscoverPricing(product: Product) {
  const price = getProductListPrice(product);
  const discountPercent = 10 + (product.id.charCodeAt(0) % 41);
  const originalPrice = Math.round(price / (1 - discountPercent / 100));
  return { price, originalPrice, discountPercent };
}
