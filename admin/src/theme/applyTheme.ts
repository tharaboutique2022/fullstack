import type { AdminTheme } from './types';

function setVar(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

export function applyTheme(theme: AdminTheme): void {
  const { colors, spacing, radius, typography, shadow, layout } = theme;

  setVar('--color-primary', colors.primary);
  setVar('--color-primary-hover', colors.primaryHover);
  setVar('--color-primary-soft', colors.primarySoft);
  setVar('--color-primary-text', colors.primaryText);

  setVar('--color-secondary', colors.secondary);
  setVar('--color-secondary-hover', colors.secondaryHover);
  setVar('--color-secondary-text', colors.secondaryText);

  setVar('--color-background', colors.background);
  setVar('--color-surface', colors.surface);
  setVar('--color-surface-muted', colors.surfaceMuted);

  setVar('--color-sidebar', colors.sidebar);
  setVar('--color-sidebar-text', colors.sidebarText);
  setVar('--color-sidebar-active', colors.sidebarActive);
  setVar('--color-sidebar-active-text', colors.sidebarActiveText);

  setVar('--color-text', colors.text);
  setVar('--color-text-muted', colors.textMuted);
  setVar('--color-border', colors.border);
  setVar('--color-border-strong', colors.borderStrong);

  setVar('--color-error', colors.error);
  setVar('--color-error-bg', colors.errorBg);
  setVar('--color-error-border', colors.errorBorder);

  setVar('--color-success', colors.success);
  setVar('--color-success-bg', colors.successBg);
  setVar('--color-warning', colors.warning);
  setVar('--color-warning-bg', colors.warningBg);

  setVar('--color-badge-bg', colors.badgeBg);
  setVar('--color-badge-text', colors.badgeText);

  setVar('--color-focus-ring', colors.focusRing);

  setVar('--spacing-xs', spacing.xs);
  setVar('--spacing-sm', spacing.sm);
  setVar('--spacing-md', spacing.md);
  setVar('--spacing-lg', spacing.lg);
  setVar('--spacing-xl', spacing.xl);
  setVar('--spacing-xxl', spacing.xxl);

  setVar('--radius-sm', radius.sm);
  setVar('--radius-md', radius.md);
  setVar('--radius-lg', radius.lg);
  setVar('--radius-full', radius.full);

  setVar('--font-family', typography.fontFamily);
  setVar('--font-size-xs', typography.fontSizeXs);
  setVar('--font-size-sm', typography.fontSizeSm);
  setVar('--font-size-md', typography.fontSizeMd);
  setVar('--font-size-lg', typography.fontSizeLg);
  setVar('--font-size-xl', typography.fontSizeXl);
  setVar('--font-size-2xl', typography.fontSize2xl);
  setVar('--font-weight-normal', typography.fontWeightNormal);
  setVar('--font-weight-medium', typography.fontWeightMedium);
  setVar('--font-weight-bold', typography.fontWeightBold);
  setVar('--line-height', typography.lineHeight);

  setVar('--shadow-sm', shadow.sm);
  setVar('--shadow-md', shadow.md);
  setVar('--shadow-lg', shadow.lg);

  setVar('--sidebar-width', layout.sidebarWidth);
  setVar('--max-content-width', layout.maxContentWidth);
  setVar('--login-card-width', layout.loginCardWidth);

  document.documentElement.dataset.theme = theme.name;
}
