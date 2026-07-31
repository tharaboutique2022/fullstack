import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DummyColor } from '@/data/dummy';
import { colors } from '@/theme/styles';

export const ColorSwatchRow = memo(function ColorSwatchRow({
  colors: swatches,
  selectedId,
  onSelect,
}: {
  colors: DummyColor[];
  selectedId?: string;
  onSelect?: (color: DummyColor) => void;
}) {
  return (
    <View style={styles.row}>
      {swatches.map((color) => {
        const selected = color.id === selectedId;
        return (
          <Pressable
            key={color.id}
            onPress={() => onSelect?.(color)}
            style={[
              styles.swatch,
              { backgroundColor: color.hex },
              selected && styles.swatchSelected,
            ]}
          >
            {selected ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: colors.primary },
});
