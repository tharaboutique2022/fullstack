import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '@/theme/styles';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
}

type PanelKey = 'sort' | 'price';

interface ProductSortFilterModalProps {
  visible: boolean;
  initialSort: SortOption;
  initialFilters: ProductFilters;
  initialPanel?: PanelKey;
  onClose: () => void;
  onApply: (sort: SortOption, filters: ProductFilters) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Popularity' },
  { value: 'price_desc', label: 'Cost: High to Low' },
  { value: 'price_asc', label: 'Cost: Low to High' },
];

const PANELS: { key: PanelKey; label: string }[] = [
  { key: 'sort', label: 'Sort' },
  { key: 'price', label: 'Price' },
];

const SHEET_SLIDE_OFFSET = Math.round(Dimensions.get('window').height * 0.45);
const ANIM_DURATION = 200;

export function ProductSortFilterModal({
  visible,
  initialSort,
  initialFilters,
  initialPanel = 'sort',
  onClose,
  onApply,
}: ProductSortFilterModalProps) {
  const [panel, setPanel] = useState<PanelKey>(initialPanel);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice != null ? String(initialFilters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : ''
  );
  const [mounted, setMounted] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_SLIDE_OFFSET)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(SHEET_SLIDE_OFFSET);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_SLIDE_OFFSET,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    if (!visible) return;
    setPanel(initialPanel);
    setSort(initialSort);
    setMinPrice(initialFilters.minPrice != null ? String(initialFilters.minPrice) : '');
    setMaxPrice(initialFilters.maxPrice != null ? String(initialFilters.maxPrice) : '');
  }, [visible, initialPanel, initialSort, initialFilters]);

  function handleApply() {
    const parsedMin = minPrice.trim() ? Number(minPrice) : undefined;
    const parsedMax = maxPrice.trim() ? Number(maxPrice) : undefined;
    onApply(sort, {
      minPrice: Number.isFinite(parsedMin) ? parsedMin : undefined,
      maxPrice: Number.isFinite(parsedMax) ? parsedMax : undefined,
    });
    onClose();
  }

  function handleClear() {
    onApply('newest', {});
    onClose();
  }

  function hasActiveFilters() {
    return Boolean(minPrice.trim() || maxPrice.trim() || sort !== 'newest');
  }

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]} />
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
        >
          <Text style={styles.title}>Sort/Filters</Text>
          <View style={styles.divider} />

          <View style={styles.body}>
            <View style={styles.sidebar}>
              {PANELS.map((item) => {
                const active = panel === item.key;
                const hasDot = item.key === 'price' && (minPrice || maxPrice);
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.sideItem, active && styles.sideItemActive]}
                    onPress={() => setPanel(item.key)}
                  >
                    {hasDot ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
                    <Text style={[styles.sideText, active && styles.sideTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {panel === 'sort'
                ? SORT_OPTIONS.map((option) => {
                    const selected = sort === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        style={styles.optionRow}
                        onPress={() => setSort(option.value)}
                      >
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={selected ? colors.primary : colors.mutedLight}
                        />
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })
                : null}

              {panel === 'price' ? (
                <View style={styles.fieldBlock}>
                  <Text style={type.caption}>Price range (₹)</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                      placeholder="Min"
                      placeholderTextColor={colors.mutedLight}
                    />
                    <Text style={type.caption}>to</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                      placeholder="Max"
                      placeholderTextColor={colors.mutedLight}
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Pressable style={[styles.footerBtn, styles.clearBtn]} onPress={handleClear}>
              <Text style={styles.clearText}>Clear{hasActiveFilters() ? ' all' : ''}</Text>
            </Pressable>
            <Pressable style={[styles.footerBtn, styles.applyBtn]} onPress={handleApply}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '78%',
    paddingBottom: 20,
  },
  title: {
    ...type.h3,
    textAlign: 'center',
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  body: {
    flexDirection: 'row',
    minHeight: 280,
  },
  sidebar: {
    width: 118,
    backgroundColor: colors.gray100,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sideItemActive: {
    backgroundColor: colors.surface,
    borderRightWidth: 0,
  },
  sideText: {
    ...type.body,
    color: colors.muted,
    fontSize: 14,
  },
  sideTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  dotSpacer: { width: 6 },
  content: {
    flex: 1,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  optionText: {
    ...type.body,
    color: colors.secondary,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  fieldBlock: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.secondary,
    backgroundColor: colors.surface,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: { flex: 1 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  applyBtn: {
    backgroundColor: colors.primary,
  },
  clearText: { fontWeight: '600', color: colors.secondary },
  applyText: { fontWeight: '600', color: colors.white },
});
