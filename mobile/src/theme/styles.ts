import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#AD1457',
  primaryDark: '#880E4F',
  primaryLight: '#FCE4EC',
  primarySoft: '#FFF0F5',
  secondary: '#2D264B',
  accent: '#C2185B',
  discount: '#139D5C',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  background: '#FFFBFC',
  surface: '#FFFFFF',
  border: '#F0E6EB',
  banner: '#4A148C',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
} as const;

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shadowCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export const type = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '700', color: colors.secondary },
  h2: { fontSize: 24, fontWeight: '700', color: colors.secondary },
  h3: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  title: { fontSize: 16, fontWeight: '600', color: colors.secondary },
  body: { fontSize: 14, color: colors.secondary },
  caption: { fontSize: 12, color: colors.muted },
  small: { fontSize: 11, color: colors.muted },
  italicGreeting: { fontSize: 24, fontStyle: 'italic', color: colors.secondary },
  price: { fontSize: 20, fontWeight: '700', color: colors.secondary },
  priceSm: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  link: { fontSize: 12, fontWeight: '600', color: colors.primary },
});

export const buttons = StyleSheet.create({
  primary: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  outline: {
    height: 48,
    width: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
