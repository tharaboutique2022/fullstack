import * as SecureStore from 'expo-secure-store';

const GUEST_CART_KEY = 'thara_guest_cart';

export interface GuestCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
  variantTitle: string | null;
  unitPrice: string;
  imageUrl: string | null;
}

/** In-memory fallback when secure storage is unavailable (e.g. web). */
let memoryLines: GuestCartLine[] = [];

function lineKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? 'default'}`;
}

async function readLines(): Promise<GuestCartLine[]> {
  try {
    const raw = await SecureStore.getItemAsync(GUEST_CART_KEY);
    if (!raw) return memoryLines;
    const parsed = JSON.parse(raw) as GuestCartLine[];
    memoryLines = Array.isArray(parsed) ? parsed : [];
    return memoryLines;
  } catch {
    return memoryLines;
  }
}

async function writeLines(lines: GuestCartLine[]): Promise<void> {
  memoryLines = lines;
  try {
    if (lines.length === 0) {
      await SecureStore.deleteItemAsync(GUEST_CART_KEY);
      return;
    }
    await SecureStore.setItemAsync(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // Keep in-memory cart only
  }
}

export async function getGuestCartLines(): Promise<GuestCartLine[]> {
  return readLines();
}

export async function getGuestCartItemCount(): Promise<number> {
  const lines = await readLines();
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export async function addGuestCartLine(
  line: Omit<GuestCartLine, 'quantity'> & { quantity?: number }
): Promise<GuestCartLine[]> {
  const lines = await readLines();
  const key = lineKey(line.productId, line.variantId);
  const existing = lines.find(
    (item) => lineKey(item.productId, item.variantId) === key
  );

  if (existing) {
    existing.quantity += line.quantity ?? 1;
  } else {
    lines.push({
      ...line,
      quantity: line.quantity ?? 1,
    });
  }

  await writeLines(lines);
  return lines;
}

export async function updateGuestCartQuantity(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<GuestCartLine[]> {
  const lines = await readLines();
  const key = lineKey(productId, variantId);
  const next = lines
    .map((item) => {
      if (lineKey(item.productId, item.variantId) !== key) return item;
      return { ...item, quantity };
    })
    .filter((item) => item.quantity > 0);

  await writeLines(next);
  return next;
}

export async function removeGuestCartLine(
  productId: string,
  variantId: string | null
): Promise<GuestCartLine[]> {
  const lines = await readLines();
  const key = lineKey(productId, variantId);
  const next = lines.filter((item) => lineKey(item.productId, item.variantId) !== key);
  await writeLines(next);
  return next;
}

export async function clearGuestCart(): Promise<void> {
  memoryLines = [];
  try {
    await SecureStore.deleteItemAsync(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

export function getGuestCartSubtotal(lines: GuestCartLine[]): string {
  const total = lines.reduce(
    (sum, line) => sum + Number(line.unitPrice) * line.quantity,
    0
  );
  return total.toFixed(2);
}

export function toMergeCartItems(lines: GuestCartLine[]) {
  return lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    quantity: line.quantity,
  }));
}
