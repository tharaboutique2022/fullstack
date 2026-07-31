import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, type } from '@/theme/styles';

interface ImageCarouselProps {
  images: string[];
}

export const ImageCarousel = memo(function ImageCarousel({ images }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.carousel}>
      <Image
        source={{ uri: images[activeIndex] ?? images[0] }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.dots}>
        {images.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => setActiveIndex(index)}
            style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
});

interface StickyBuyBarProps {
  price: number;
  originalPrice?: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export const StickyBuyBar = memo(function StickyBuyBar({
  price,
  originalPrice,
  onAddToCart,
  onBuyNow,
}: StickyBuyBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.priceCol}>
        <Text style={styles.price}>₹ {price.toLocaleString('en-IN')}</Text>
        {originalPrice ? (
          <Text style={styles.strike}>₹ {originalPrice.toLocaleString('en-IN')}</Text>
        ) : null}
      </View>
      <Pressable onPress={onAddToCart} style={styles.cartBtn}>
        <Text style={styles.cartIcon}>🛒</Text>
      </Pressable>
      <Pressable onPress={onBuyNow} style={styles.buyBtn}>
        <Text style={styles.buyText}>Buy now →</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  carousel: { position: 'relative' },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.7)' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceCol: { minWidth: 90 },
  price: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  strike: { fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' },
  cartBtn: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cartIcon: { color: colors.primary, fontSize: 18 },
  buyBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buyText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
