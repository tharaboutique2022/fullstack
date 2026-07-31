import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { formatAddress } from '@ecomm/shared';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/QueryState';
import { useAddressMutations, useAddresses } from '@/hooks/useAddresses';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Addresses'>;

export function AddressesScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const addressesQuery = useAddresses(isAuthenticated);
  const { remove, setDefault } = useAddressMutations();
  const { refreshControl } = useRefreshControl(addressesQuery);

  if (!authLoading && !isAuthenticated) {
    return (
      <Screen>
        <ScreenContent>
          <Header onBack={() => navigation.goBack()} title="Addresses" />
          <View style={styles.center}>
            <Text style={type.body}>Sign in to manage your addresses.</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('Login')} />
          </View>
        </ScreenContent>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenContent>
        <Header
          onBack={() => navigation.goBack()}
          title="Addresses"
          onAdd={() => navigation.navigate('AddressForm', {})}
        />

        <QueryState
          isLoading={authLoading || (addressesQuery.isLoading && !addressesQuery.data)}
          isError={addressesQuery.isError}
          error={addressesQuery.error}
          isEmpty={!addressesQuery.data?.length}
          emptyMessage="No saved addresses yet."
        >
          <FlatList
            data={addressesQuery.data ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={refreshControl}
            style={styles.flex}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={type.title}>{item.label}</Text>
                  {item.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
                </View>
                <Text style={type.body}>{formatAddress(item)}</Text>
                <View style={styles.actions}>
                  {!item.isDefault ? (
                    <Pressable onPress={() => setDefault.mutate(item.id)}>
                      <Text style={type.link}>Set default</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() =>
                      navigation.navigate('AddressForm', {
                        addressId: item.id,
                        address: item,
                      })
                    }
                  >
                    <Text style={type.link}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      Alert.alert('Delete address', 'Remove this address?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(item.id) },
                      ])
                    }
                  >
                    <Text style={[type.link, styles.delete]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

function Header({
  onBack,
  title,
  onAdd,
}: {
  onBack: () => void;
  title: string;
  onAdd?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.iconBtn}>
        <Ionicons name="arrow-back" size={22} color={colors.secondary} />
      </Pressable>
      <Text style={type.h3}>{title}</Text>
      <Pressable onPress={onAdd} style={styles.iconBtn}>
        {onAdd ? <Ionicons name="add" size={24} color={colors.primary} /> : null}
      </Pressable>
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
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12, paddingBottom: 100 },
  flex: { flex: 1 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  defaultBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  actions: { flexDirection: 'row', gap: 16, marginTop: 4 },
  delete: { color: colors.danger },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
