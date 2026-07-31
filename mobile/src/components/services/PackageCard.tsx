import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ServicePackage } from '@ecomm/shared/api.types';
import { formatDuration, formatPriceRange, resolveImageUrl } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

interface PackageCardProps {
  pkg: ServicePackage;
  selected: boolean;
  onSelect: () => void;
}

export function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  const gallery = (pkg.gallery ?? []).slice(0, 2);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={type.h3}>{pkg.name} Package</Text>
          <Text style={styles.price}>{formatPriceRange(pkg)}</Text>
          <Text style={styles.meta}>
            {formatDuration(pkg.durationMinutes)}
            {pkg.description ? ` • ${pkg.description}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={onSelect}
          style={[styles.selectBtn, selected && styles.selectBtnActive]}
        >
          {selected ? (
            <>
              <Ionicons name="checkmark" size={16} color={colors.white} />
              <Text style={styles.selectTextActive}>Selected</Text>
            </>
          ) : (
            <Text style={styles.selectText}>Select +</Text>
          )}
        </Pressable>
      </View>

      {gallery.length > 0 ? (
        <View style={styles.gallery}>
          {gallery.map((image) => (
            <Image
              key={image.id}
              source={{ uri: resolveImageUrl(image.imageUrl) }}
              style={styles.galleryImage}
              contentFit="cover"
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: { flex: 1, gap: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  meta: { ...type.caption, lineHeight: 16 },
  selectBtn: {
    minWidth: 96,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 4,
  },
  selectBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  selectTextActive: { fontSize: 13, fontWeight: '600', color: colors.white },
  gallery: { flexDirection: 'row', gap: 10 },
  galleryImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
});
