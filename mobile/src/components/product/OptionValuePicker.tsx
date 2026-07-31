import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ProductOptionValue } from '@ecomm/shared/api.types';
import { resolveImageUrl } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

interface OptionValuePickerProps {
  values: ProductOptionValue[];
  selectedId?: string;
  onSelect: (value: ProductOptionValue) => void;
}

export const OptionValuePicker = memo(function OptionValuePicker({
  values,
  selectedId,
  onSelect,
}: OptionValuePickerProps) {
  const useSwatches = values.some((value) => value.imageUrl);

  if (useSwatches) {
    return (
      <View style={styles.row}>
        {values.map((value) => {
          const selected = value.id === selectedId;
          return (
            <Pressable
              key={value.id}
              onPress={() => onSelect(value)}
              style={[styles.swatch, selected && styles.swatchSelected]}
            >
              <Image
                source={{ uri: resolveImageUrl(value.imageUrl) }}
                style={styles.swatchImage}
                contentFit="cover"
              />
              {selected ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.chips}>
      {values.map((value) => {
        const selected = value.id === selectedId;
        return (
          <Pressable
            key={value.id}
            onPress={() => onSelect(value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[type.body, selected && styles.chipTextSelected]}>{value.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.primary },
  swatchImage: { width: '100%', height: '100%' },
  check: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
});
