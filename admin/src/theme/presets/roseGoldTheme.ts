import type { AdminTheme } from '../types';
import { defaultTheme } from '../defaultTheme';

/**
 * Example client theme — duplicate this file per client and swap `activeTheme` in index.ts.
 * Only override the values that differ from the default.
 */
export const roseGoldTheme: AdminTheme = {
  ...defaultTheme,
  name: 'rose-gold',
  colors: {
    ...defaultTheme.colors,
    primary: '#be185d',
    primaryHover: '#9d174d',
    primarySoft: '#fce7f3',
    sidebar: '#2a1020',
    sidebarActive: '#be185d',
    badgeBg: '#fce7f3',
    badgeText: '#9d174d',
    focusRing: 'rgba(190, 24, 93, 0.35)',
  },
};
