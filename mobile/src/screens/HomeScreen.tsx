import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Product, ProductCategory } from '@ecomm/shared/api.types';
import { AppHeader, GenderTabs, SectionHeader } from '@/components/layout/AppHeader';
import { Screen, ScreenContent, screenStyles } from '@/components/layout/Screen';
import { AnnouncementCard, CategoryRow, PromoBanner } from '@/components/home/HomeBlocks';
import { ProductGrid } from '@/components/product/ProductCard';
import { QueryState } from '@/components/QueryState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAppHeaderActions } from '@/hooks/useAppHeaderActions';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useDepartmentProducts, useProducts, useRootProductCategories } from '@/hooks/useCatalog';
import type { RootStackParamList, RootTabParamList } from '@/navigation/types';
import { type } from '@/theme/styles';

const ALL_TAB = 'All';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const departmentsQuery = useRootProductCategories();
  const productsQuery = useProducts();
  const [activeTab, setActiveTab] = useState(ALL_TAB);

  const activeDepartment = useMemo(
    () => departmentsQuery.data?.find((department) => department.name === activeTab),
    [activeTab, departmentsQuery.data]
  );
  const departmentProductsQuery = useDepartmentProducts(activeDepartment?.id);
  const { refreshControl } = useRefreshControl(departmentsQuery, productsQuery, departmentProductsQuery);

  const tabs = useMemo(() => {
    const names = (departmentsQuery.data ?? []).map((department) => department.name);
    return [ALL_TAB, ...names];
  }, [departmentsQuery.data]);

  const filteredProducts = useMemo(() => {
    if (activeTab === ALL_TAB) {
      return (productsQuery.data?.items ?? []).slice(0, 8);
    }
    return departmentProductsQuery.data?.items ?? [];
  }, [activeTab, departmentProductsQuery.data, productsQuery.data]);

  const openProduct = useCallback(
    (product: Product) => {
      navigation.navigate('Categories', {
        screen: 'ProductDetail',
        params: { productId: product.id },
      });
    },
    [navigation]
  );

  const openDepartment = useCallback(
    (category: ProductCategory) => {
      navigation.navigate('Categories', {
        screen: 'ShopByCategory',
        params: { departmentId: category.id },
      });
    },
    [navigation]
  );

  const { user, isAuthenticated } = useAuthSession();
  const { onLocationPress, onNotificationsPress } = useAppHeaderActions();
  const unreadQuery = useUnreadNotificationCount(isAuthenticated);
  const greetingName = isAuthenticated && user ? user.name.split(' ')[0] : 'there';
  const isLoading =
    departmentsQuery.isLoading ||
    productsQuery.isLoading ||
    (activeDepartment ? departmentProductsQuery.isLoading : false);
  const isError =
    departmentsQuery.isError ||
    productsQuery.isError ||
    (activeDepartment ? departmentProductsQuery.isError : false);
  const error =
    departmentsQuery.error ?? productsQuery.error ?? departmentProductsQuery.error;

  return (
    <Screen>
      <ScreenContent>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={screenStyles.scrollContent}
          refreshControl={refreshControl}
        >
          <AppHeader
            searchPlaceholder='Search "Tops"'
            onSearchPress={() => navigation.navigate('Search')}
            onNotificationsPress={onNotificationsPress}
            onLocationPress={onLocationPress}
            unreadCount={unreadQuery.data?.count ?? 0}
          />
          <GenderTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <QueryState isLoading={departmentsQuery.isLoading} isError={departmentsQuery.isError} error={departmentsQuery.error}>
            <CategoryRow categories={departmentsQuery.data ?? []} onPressCategory={openDepartment} />
          </QueryState>
          <Text style={type.italicGreeting}>Hello, {greetingName}...</Text>
          <AnnouncementCard />
          <PromoBanner />
          <SectionHeader title="Great Deals" />
          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={!isLoading && !isError && filteredProducts.length === 0}
            emptyMessage="No products yet"
          >
            <ProductGrid products={filteredProducts} onPressProduct={openProduct} />
          </QueryState>
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
