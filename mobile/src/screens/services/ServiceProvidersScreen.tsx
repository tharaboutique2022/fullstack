import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { ServiceProviderCard } from '@/components/services/ServiceProviderCard';
import { useServiceProviders } from '@/hooks/useCatalog';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import type { ServicesStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<ServicesStackParamList, 'ServiceProviders'>;
type Route = RouteProp<ServicesStackParamList, 'ServiceProviders'>;

export function ServiceProvidersScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const providersQuery = useServiceProviders(route.params.categoryId);
  const { refreshControl } = useRefreshControl(providersQuery);

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>{route.params.categoryName}</Text>
          <View style={styles.backBtn} />
        </View>

        <QueryState
          isLoading={providersQuery.isLoading && !providersQuery.data}
          isError={providersQuery.isError}
          error={providersQuery.error}
          isEmpty={!providersQuery.data?.items.length}
          emptyMessage="No providers in this category yet"
        >
          <FlatList
            data={providersQuery.data?.items ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={refreshControl}
            style={styles.flex}
            renderItem={({ item }) => (
              <ServiceProviderCard
                provider={item}
                onPress={() =>
                  navigation.navigate('ServiceProviderDetail', { providerId: item.id })
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: 100 },
  flex: { flex: 1 },
});
