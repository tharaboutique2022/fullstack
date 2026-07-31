import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { ProductCategory } from '@ecomm/shared/api.types';
import { getCategoryImage } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

export const CategoryRow = memo(function CategoryRow({
  categories,
  onPressCategory,
}: {
  categories: ProductCategory[];
  onPressCategory?: (category: ProductCategory) => void;
}) {
  if (!categories.length) return null;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.item} onPress={() => onPressCategory?.(item)}>
          <Image source={{ uri: getCategoryImage(item) }} style={styles.image} contentFit="cover" />
          <Text style={styles.label} numberOfLines={2}>
            {item.name}
          </Text>
        </Pressable>
      )}
    />
  );
});

export const AnnouncementCard = memo(function AnnouncementCard() {
  return (
    <View style={styles.announcement}>
      <View style={styles.announcementText}>
        <Text style={styles.announcementTitle}>Announcement</Text>
        <Text style={type.body}>
          Grab your limited time deal now. Flat 50% off on all products!
        </Text>
      </View>
      <Pressable style={styles.announcementBtn}>
        <Text style={styles.announcementBtnText}>→</Text>
      </Pressable>
    </View>
  );
});

export const PromoBanner = memo(function PromoBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerEyebrow}>SUMMER SALE</Text>
      <Text style={styles.bannerTitle}>50% OFF</Text>
      <Text style={styles.bannerSub}>On Fashion & Accessories</Text>
      <Pressable style={styles.bannerBtn}>
        <Text style={styles.bannerBtnText}>Shop Now →</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  list: { gap: 12, paddingVertical: 4 },
  item: { width: 96, alignItems: 'center', gap: 8 },
  image: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.primarySoft },
  label: { ...type.caption, textAlign: 'center', color: colors.secondary, fontWeight: '500' },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
  },
  announcementText: { flex: 1, gap: 4, paddingRight: 12 },
  announcementTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  announcementBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBtnText: { color: colors.white, fontSize: 18 },
  banner: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.banner,
    padding: 20,
  },
  bannerEyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 2, color: 'rgba(255,255,255,0.8)' },
  bannerTitle: { marginTop: 4, fontSize: 36, fontWeight: '700', color: colors.white },
  bannerSub: { marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  bannerBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
