import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'ecomm_search_history';
const MAX_ITEMS = 12;

export const DEFAULT_SEARCH_SUGGESTIONS = [
  'Brow Pencil',
  'Glow Foundation',
  'Matte Lipsticks',
  'Primer Serum',
  'Blush Stick',
  'Face Mask',
  'Shimmer Highlighter',
  'Gel Eyeliner',
  'Setting Spray',
] as const;

export async function getSearchHistory(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addSearchHistory(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return getSearchHistory();

  const current = await getSearchHistory();
  const next = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_ITEMS
  );
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearSearchHistory(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
