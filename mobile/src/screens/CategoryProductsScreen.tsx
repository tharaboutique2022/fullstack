import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Product } from '@ecomm/shared/api.types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppHeader, SectionHeader } from '@/components/layout/AppHeader';
import { Screen, ScreenContent, screenStyles } from '@/components/layout/Screen';
import { ProductGrid } from '@/components/product/ProductCard';
import { ProductSortFilterModal, type ProductFilters, type SortOption } from '@/components/product/ProductSortFilterModal';
import { QueryState } from '@/components/QueryState';
import { useAppHeaderActions } from '@/hooks/useAppHeaderActions';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useCategoryProducts } from '@/hooks/useCatalog';
import type { CategoriesStackParamList, RootStackParamList, RootTabParamList } from '@/navigation/types';
import { colors } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CategoriesStackParamList, 'CategoryProducts'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;
type Route = RouteProp<CategoriesStackParamList, 'CategoryProducts'>;

export function CategoryProductsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuthSession();
  const { locationLabel, onLocationPress, onNotificationsPress } = useAppHeaderActions();
  const unreadQuery = useUnreadNotificationCount(isAuthenticated);
  const productsQuery = useCategoryProducts({
    categoryId: route.params.categoryId,
    departmentId: route.params.departmentId,
    sort,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });
  const { refreshControl } = useRefreshControl(productsQuery);
  const products = productsQuery.data?.items ?? [];
  const searchHint = route.params.searchHint ?? route.params.title;
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice != null) count += 1;
    if (filters.maxPrice != null) count += 1;
    if (sort !== 'newest') count += 1;
    return count;
  }, [filters, sort]);

  const openProduct = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation]
  );

  return (
    <Screen>
      <ScreenContent>
        <AppHeader
          showBack
          onBack={() => navigation.goBack()}
          showLogo={false}
          searchPlaceholder={searchHint}
          showLocation
          location={locationLabel}
          onSearchPress={() => navigation.navigate('Search', { initialQuery: searchHint })}
          onNotificationsPress={onNotificationsPress}
          onLocationPress={onLocationPress}
          unreadCount={unreadQuery.data?.count ?? 0}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenStyles.scrollContent}
          refreshControl={refreshControl}
        >
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>RADIANT LOOK</Text>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800' }}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>

          <SectionHeader title="More than 50% Discount" />
          <QueryState
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            error={productsQuery.error}
            isEmpty={!productsQuery.isLoading && products.length === 0}
            emptyMessage="No products found"
          >
            <ProductGrid products={products} onPressProduct={openProduct} />
          </QueryState>
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
          <Ionicons name="options-outline" size={22} color={colors.white} />
          {activeFilterCount > 0 ? (
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <ProductSortFilterModal
          visible={showModal}
          initialSort={sort}
          initialFilters={filters}
          onClose={() => setShowModal(false)}
          onApply={(nextSort, nextFilters) => {
            setSort(nextSort);
            setFilters(nextFilters);
          }}
        />
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heroEyebrow: {
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    color: colors.secondary,
  },
  heroImage: { width: '100%', height: 144 },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  fabBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
