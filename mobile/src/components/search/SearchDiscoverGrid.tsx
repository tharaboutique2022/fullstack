import { memo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Product } from '@ecomm/shared/api.types';
import { getProductDiscoverPricing, resolveImageUrl } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

const H_PADDING = 16;
const GAP = 10;
const COLUMNS = 3;
const CARD_WIDTH =
  (Dimensions.get('window').width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

interface SearchDiscoverGridProps {
  products: Product[];
  onPressProduct?: (product: Product) => void;
}

export const SearchDiscoverGrid = memo(function SearchDiscoverGrid({
  products,
  onPressProduct,
}: SearchDiscoverGridProps) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <SearchDiscoverCard key={product.id} product={product} onPress={onPressProduct} />
      ))}
    </View>
  );
});

function SearchDiscoverCard({
  product,
  onPress,
}: {
  product: Product;
  onPress?: (product: Product) => void;
}) {
  const { price, originalPrice, discountPercent } = getProductDiscoverPricing(product);

  return (
    <Pressable onPress={() => onPress?.(product)} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: resolveImageUrl(product.imageUrl) }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discountPercent}%</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹ {price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <Text style={styles.original}>₹ {originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 6,
    backgroundColor: colors.discount,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    minHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  original: {
    fontSize: 10,
    color: colors.primary,
    textDecorationLine: 'line-through',
  },
});
