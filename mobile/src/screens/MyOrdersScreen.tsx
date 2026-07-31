import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { OrderCard } from '@/components/orders/OrderBlocks';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/QueryState';
import { useOrders } from '@/hooks/useOrders';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { formatAddress } from '@ecomm/shared';
import { useDefaultAddress } from '@/hooks/useAddresses';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'MyOrders'>;

export function MyOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const ordersQuery = useOrders(isAuthenticated);
  const defaultAddressQuery = useDefaultAddress(isAuthenticated);
  const { refreshControl } = useRefreshControl(ordersQuery, defaultAddressQuery);
  const addressText = defaultAddressQuery.data
    ? formatAddress(defaultAddressQuery.data)
    : 'Add a default address in Account';

  if (!authLoading && !isAuthenticated) {
    return (
      <Screen>
        <ScreenContent>
          <Header onBack={() => navigation.goBack()} />
          <View style={styles.center}>
            <Text style={type.body}>Sign in to view your orders.</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('Login')} />
          </View>
        </ScreenContent>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenContent>
        <Header onBack={() => navigation.goBack()} />

        <View style={styles.addressRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.addressLabel}>Default Address</Text>
        </View>
        <Text style={styles.addressText}>{addressText}</Text>

        <QueryState
          isLoading={authLoading || (ordersQuery.isLoading && !ordersQuery.data)}
          isError={ordersQuery.isError}
          error={ordersQuery.error}
          isEmpty={!ordersQuery.data?.length}
          emptyMessage="No orders yet. Add products to cart and checkout."
        >
          <FlatList
            data={ordersQuery.data ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={refreshControl}
            style={styles.flex}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              />
            )}
          />
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={colors.secondary} />
      </Pressable>
      <Text style={type.h3}>My Orders</Text>
      <View style={styles.backBtn} />
    </View>
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
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addressLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  addressText: { ...type.caption, marginBottom: 16 },
  list: { gap: 14, paddingBottom: 100 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
