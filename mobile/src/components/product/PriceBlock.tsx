import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '@/theme/styles';

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  showTaxNote?: boolean;
}

export const PriceBlock = memo(function PriceBlock({
  price,
  originalPrice,
  discountPercent,
  size = 'md',
  showTaxNote = false,
}: PriceBlockProps) {
  const priceStyle = size === 'sm' ? type.priceSm : size === 'lg' ? styles.priceLg : type.price;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={priceStyle}>₹ {price.toLocaleString('en-IN')}</Text>
        {originalPrice ? (
          <Text style={styles.strike}>₹ {originalPrice.toLocaleString('en-IN')}</Text>
        ) : null}
        {discountPercent ? <Text style={styles.off}>{discountPercent}% Off</Text> : null}
      </View>
      {showTaxNote ? <Text style={styles.tax}>Inclusive of all taxes</Text> : null}
    </View>
  );
});

export const RatingBadge = memo(function RatingBadge({
  rating,
  reviewCount,
  compact = false,
}: {
  rating: number;
  reviewCount: number;
  compact?: boolean;
}) {
  return (
    <View style={[styles.badge, !compact && styles.badgeInline]}>
      <Text style={styles.badgeText}>
        {rating} ★ ({reviewCount})
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  priceLg: { fontSize: 24, fontWeight: '700', color: colors.secondary },
  strike: { fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' },
  off: { fontSize: 12, fontWeight: '600', color: colors.primary },
  tax: { fontSize: 10, color: colors.muted },
  badge: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4 },
  badgeInline: { alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '500', color: colors.secondary },
});
