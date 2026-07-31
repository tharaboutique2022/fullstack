import { applyTheme } from './applyTheme';
import { defaultTheme } from './defaultTheme';
import { roseGoldTheme } from './presets/roseGoldTheme';

export type { AdminTheme, ThemeColors } from './types';
export { defaultTheme } from './defaultTheme';
export { applyTheme } from './applyTheme';

/**
 * Active theme for the admin app.
 * To rebrand for a client: edit `defaultTheme.ts` or add a new theme file
 * and assign it here, e.g. `export const activeTheme = clientBeautyTheme`.
 */
export const activeTheme = roseGoldTheme;

export function initTheme(): void {
  applyTheme(activeTheme);
}
