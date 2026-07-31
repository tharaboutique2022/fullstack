import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '@/components/layout/AppHeader';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { ServiceCategoryRow } from '@/components/services/ServiceCategoryRow';
import { useDefaultAddress } from '@/hooks/useAddresses';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAppHeaderActions } from '@/hooks/useAppHeaderActions';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import type { RootStackParamList, RootTabParamList, ServicesStackParamList } from '@/navigation/types';
import { useServiceCategories } from '@/hooks/useCatalog';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { getCategoryDisplayName } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ServicesStackParamList, 'ServiceCategories'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export function ServiceCategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuthSession();
  const { locationLabel, onLocationPress, onNotificationsPress } = useAppHeaderActions();
  const unreadQuery = useUnreadNotificationCount(isAuthenticated);
  const defaultAddressQuery = useDefaultAddress(isAuthenticated);
  const categoriesQuery = useServiceCategories();
  const { refreshControl } = useRefreshControl(categoriesQuery, defaultAddressQuery);

  return (
    <Screen>
      <ScreenContent>
        <AppHeader
          showLocation
          location={locationLabel}
          searchPlaceholder='Search "Services"'
          onSearchPress={() => navigation.navigate('Search')}
          onNotificationsPress={onNotificationsPress}
          onLocationPress={onLocationPress}
          unreadCount={unreadQuery.data?.count ?? 0}
        />
        <Text style={styles.title}>Services</Text>

        <QueryState
          isLoading={categoriesQuery.isLoading && !categoriesQuery.data}
          isError={categoriesQuery.isError}
          error={categoriesQuery.error}
          isEmpty={!categoriesQuery.data?.length}
          emptyMessage="No service categories available"
        >
          <FlatList
            data={categoriesQuery.data ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={refreshControl}
            style={styles.flex}
            renderItem={({ item }) => (
              <ServiceCategoryRow
                category={item}
                onPress={() =>
                  navigation.navigate('ServiceProviders', {
                    categoryId: item.id,
                    categoryName: getCategoryDisplayName(item),
                  })
                }
              />
            )}
          />
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...type.h3, marginBottom: 8 },
  list: { paddingBottom: 100 },
  flex: { flex: 1 },
});
