import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/styles';

interface BookNowBarProps {
  priceLabel: string;
  onBook: () => void;
  disabled?: boolean;
  buttonLabel?: string;
}

export function BookNowBar({ priceLabel, onBook, disabled, buttonLabel = 'Book now' }: BookNowBarProps) {
  return (
    <View style={styles.bar}>
      <Text style={styles.price}>{priceLabel}</Text>
      <Pressable
        onPress={onBook}
        disabled={disabled}
        style={[styles.bookBtn, disabled && styles.bookBtnDisabled]}
      >
        <Text style={styles.bookText}>{buttonLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  price: { fontSize: 18, fontWeight: '700', color: colors.secondary, minWidth: 90 },
  bookBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookBtnDisabled: { opacity: 0.5 },
  bookText: { color: colors.white, fontWeight: '600', fontSize: 15 },
});
