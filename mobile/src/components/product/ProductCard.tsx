import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Product } from '@ecomm/shared/api.types';
import { getProductBrand, getProductListPrice, resolveImageUrl } from '@/lib/catalog';
import { PriceBlock } from '@/components/product/PriceBlock';
import { colors, type } from '@/theme/styles';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export const ProductCard = memo(function ProductCard({ product, onPress }: ProductCardProps) {
  const price = getProductListPrice(product);

  return (
    <Pressable onPress={() => onPress?.(product)} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: resolveImageUrl(product.imageUrl) }}
          style={styles.image}
          contentFit="cover"
        />
        {product.hasVariants ? (
          <View style={styles.variantBadge}>
            <Text style={styles.variantBadgeText}>Options</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.brand} numberOfLines={1}>
        {getProductBrand(product)}
      </Text>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <PriceBlock
        price={price}
        size="sm"
      />
    </Pressable>
  );
});

export const ProductGrid = memo(function ProductGrid({
  products,
  onPressProduct,
}: {
  products: Product[];
  onPressProduct?: (product: Product) => void;
}) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onPress={onPressProduct} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 16 },
  imageWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface },
  image: { width: '100%', height: 192 },
  variantBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  variantBadgeText: { fontSize: 10, fontWeight: '600', color: colors.secondary },
  brand: { marginTop: 8, fontSize: 14, fontWeight: '700', color: colors.secondary },
  name: { ...type.caption, color: colors.muted, minHeight: 32 },
});
