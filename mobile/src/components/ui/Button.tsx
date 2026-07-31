import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buttons, colors } from '@/theme/styles';

type ButtonVariant = 'primary' | 'outline';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[variant === 'primary' ? buttons.primary : buttons.outline, disabled && styles.disabled]}
    >
      <Text style={buttons.primaryText}>{label}</Text>
    </Pressable>
  );
});

interface BadgeProps {
  label: string;
  tone?: 'discount' | 'neutral' | 'brand';
}

export const Badge = memo(function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const toneStyle =
    tone === 'discount' ? styles.discount : tone === 'brand' ? styles.brand : styles.neutral;
  const textStyle =
    tone === 'discount' ? styles.discountText : tone === 'brand' ? styles.brandText : styles.neutralText;

  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  neutral: { backgroundColor: colors.gray100 },
  neutralText: { color: colors.muted },
  brand: { backgroundColor: colors.primarySoft },
  brandText: { color: colors.primary },
  discount: { backgroundColor: 'rgba(19, 157, 92, 0.15)' },
  discountText: { color: colors.discount },
});
