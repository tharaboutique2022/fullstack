import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ServiceCategory } from '@ecomm/shared/api.types';
import { getCategoryDisplayName, getCategoryImage } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

interface ServiceCategoryRowProps {
  category: ServiceCategory;
  onPress: () => void;
}

export function ServiceCategoryRow({ category, onPress }: ServiceCategoryRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Image source={{ uri: getCategoryImage(category) }} style={styles.thumb} contentFit="cover" />
      <View style={styles.content}>
        <Text style={type.title}>{getCategoryDisplayName(category)}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {category.subtitle ?? 'Book trusted professionals near you'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  content: { flex: 1, gap: 4 },
  subtitle: { ...type.caption, lineHeight: 16 },
});
