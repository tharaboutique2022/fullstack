import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ServiceProvider } from '@ecomm/shared/api.types';
import {
  formatInr,
  formatRating,
  getProviderHeroImage,
  getProviderLocationLine,
  parsePrice,
} from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onPress: () => void;
}

export function ServiceProviderCard({ provider, onPress }: ServiceProviderCardProps) {
  const tags = provider.tags.length ? provider.tags.join(', ') : provider.category?.name ?? 'Service';
  const locationLine = getProviderLocationLine(provider);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: getProviderHeroImage(provider) }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={type.title} numberOfLines={1}>
            {provider.name}
          </Text>
          <Text style={styles.priceFrom}>
            {formatInr(parsePrice(provider.priceFrom))}
            {'\n'}
            <Text style={styles.priceLabel}>starts from</Text>
          </Text>
        </View>
        <Text style={styles.tags} numberOfLines={1}>
          {tags}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.meta}>{formatRating(provider)}</Text>
          </View>
          {locationLine ? (
            <Text style={styles.meta} numberOfLines={1}>
              {locationLine}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primarySoft,
  },
  body: { padding: 14, gap: 6 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceFrom: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'right',
    lineHeight: 18,
  },
  priceLabel: { fontSize: 10, fontWeight: '500', color: colors.muted },
  tags: { ...type.caption, color: colors.muted },
  metaRow: { gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { ...type.caption, color: colors.muted },
});
