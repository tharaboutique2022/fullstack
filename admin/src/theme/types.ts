export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryText: string;

  secondary: string;
  secondaryHover: string;
  secondaryText: string;

  background: string;
  surface: string;
  surfaceMuted: string;

  sidebar: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarActiveText: string;

  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;

  error: string;
  errorBg: string;
  errorBorder: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;

  badgeBg: string;
  badgeText: string;

  focusRing: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  lineHeight: string;
}

export interface ThemeShadow {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeLayout {
  sidebarWidth: string;
  maxContentWidth: string;
  loginCardWidth: string;
}

export interface AdminTheme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  shadow: ThemeShadow;
  layout: ThemeLayout;
}
