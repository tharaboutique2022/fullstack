import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '@/components/ui/TextField';
import { colors, type } from '@/theme/styles';

export interface ProductFilters {
  brand?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFilterModalProps {
  visible: boolean;
  initialFilters: ProductFilters;
  onClose: () => void;
  onApply: (filters: ProductFilters) => void;
}

export function ProductFilterModal({
  visible,
  initialFilters,
  onClose,
  onApply,
}: ProductFilterModalProps) {
  const [brand, setBrand] = useState(initialFilters.brand ?? '');
  const [inStockOnly, setInStockOnly] = useState(initialFilters.inStockOnly ?? false);
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice != null ? String(initialFilters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : ''
  );

  useEffect(() => {
    if (!visible) return;
    setBrand(initialFilters.brand ?? '');
    setInStockOnly(initialFilters.inStockOnly ?? false);
    setMinPrice(initialFilters.minPrice != null ? String(initialFilters.minPrice) : '');
    setMaxPrice(initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : '');
  }, [visible, initialFilters]);

  function handleApply() {
    const parsedMin = minPrice.trim() ? Number(minPrice) : undefined;
    const parsedMax = maxPrice.trim() ? Number(maxPrice) : undefined;
    onApply({
      brand: brand.trim() || undefined,
      inStockOnly,
      minPrice: Number.isFinite(parsedMin) ? parsedMin : undefined,
      maxPrice: Number.isFinite(parsedMax) ? parsedMax : undefined,
    });
    onClose();
  }

  function handleClear() {
    setBrand('');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    onApply({});
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={type.h3}>Filter products</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.secondary} />
            </Pressable>
          </View>

          <TextField label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Zara" />

          <View style={styles.switchRow}>
            <Text style={type.body}>In stock only</Text>
            <Switch
              value={inStockOnly}
              onValueChange={setInStockOnly}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={inStockOnly ? colors.primary : colors.mutedLight}
            />
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <TextField
                label="Min price (₹)"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.priceField}>
              <TextField
                label="Max price (₹)"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholder="5000"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={handleClear} style={[styles.btn, styles.secondaryBtn]}>
              <Text style={styles.secondaryText}>Clear</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={[styles.btn, styles.primaryBtn]}>
              <Text style={styles.primaryText}>Apply filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 14,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceField: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.primary },
  secondaryText: { fontWeight: '600', color: colors.secondary },
  primaryText: { fontWeight: '600', color: colors.white },
});
