import type { AdminTheme } from './types';

/**
 * Default admin theme — update this file (or swap the active theme in index.ts)
 * when the client wants different brand colors.
 */
export const defaultTheme: AdminTheme = {
  name: 'default',
  colors: {
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primarySoft: '#ede9fe',
    primaryText: '#ffffff',

    secondary: '#e5e7eb',
    secondaryHover: '#d1d5db',
    secondaryText: '#1f2937',

    background: '#f8f7fc',
    surface: '#ffffff',
    surfaceMuted: '#f3f4f6',

    sidebar: '#1e1b2e',
    sidebarText: '#f9fafb',
    sidebarActive: '#7c3aed',
    sidebarActiveText: '#ffffff',

    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    borderStrong: '#d1d5db',

    error: '#b91c1c',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',

    success: '#15803d',
    successBg: '#f0fdf4',
    warning: '#b45309',
    warningBg: '#fffbeb',

    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',

    focusRing: 'rgba(124, 58, 237, 0.35)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '999px',
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeMd: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2xl: '1.75rem',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightBold: '700',
    lineHeight: '1.5',
  },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
    md: '0 4px 12px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 32px rgba(15, 23, 42, 0.12)',
  },
  layout: {
    sidebarWidth: '240px',
    maxContentWidth: '1200px',
    loginCardWidth: '420px',
  },
};
