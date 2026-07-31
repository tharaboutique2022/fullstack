import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { AddressCard, CartFooter, CartItemRow, CartSignInPrompt } from '@/components/cart/CartBlocks';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { PriceBlock } from '@/components/product/PriceBlock';
import { QueryState } from '@/components/QueryState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { parsePrice, resolveImageUrl } from '@/lib/catalog';
import { formatAddress } from '@ecomm/shared';
import {
  getGuestCartLines,
  getGuestCartSubtotal,
  removeGuestCartLine,
  updateGuestCartQuantity,
  type GuestCartLine,
} from '@/lib/guestCart';
import { useDefaultAddress } from '@/hooks/useAddresses';
import type { CartStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<CartStackParamList, 'CartHome'>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const cartQuery = useCart(isAuthenticated);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>([]);
  const [guestLoading, setGuestLoading] = useState(true);

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const total = parsePrice(cart?.subtotal);
  const guestTotal = parsePrice(getGuestCartSubtotal(guestLines));
  const defaultAddressQuery = useDefaultAddress(isAuthenticated);
  const { refreshControl } = useRefreshControl(cartQuery, defaultAddressQuery);
  const defaultAddressText = defaultAddressQuery.data
    ? formatAddress(defaultAddressQuery.data)
    : null;

  const loadGuestCart = useCallback(async () => {
    setGuestLoading(true);
    const lines = await getGuestCartLines();
    setGuestLines(lines);
    setGuestLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        void loadGuestCart();
      }
    }, [isAuthenticated, loadGuestCart])
  );

  useEffect(() => {
    if (isAuthenticated) {
      setGuestLines([]);
      setGuestLoading(false);
    }
  }, [isAuthenticated]);

  const goToLogin = useCallback(() => {
    navigation.getParent()?.navigate('Account', { screen: 'Login' });
  }, [navigation]);

  const busy = updateItem.isPending || removeItem.isPending;

  const goToAddresses = useCallback(() => {
    navigation.getParent()?.navigate('Account', { screen: 'Addresses' });
  }, [navigation]);

  const goToCheckout = useCallback(() => {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    if (!defaultAddressQuery.data) {
      goToAddresses();
      return;
    }
    navigation.navigate('Checkout');
  }, [defaultAddressQuery.data, goToAddresses, goToLogin, isAuthenticated, navigation]);

  function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return;
    updateItem.mutate({ id, quantity });
  }

  async function updateGuestQuantity(line: GuestCartLine, quantity: number) {
    const next = await updateGuestCartQuantity(line.productId, line.variantId, quantity);
    setGuestLines(next);
  }

  async function removeGuestLine(line: GuestCartLine) {
    const next = await removeGuestCartLine(line.productId, line.variantId);
    setGuestLines(next);
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <ScreenContent style={styles.noPx}>
          <View style={styles.header}>
            <Text style={type.h2}>My Cart</Text>
            <Text style={type.caption}>{guestLines.length} items</Text>
          </View>

          {guestLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : guestLines.length === 0 ? (
            <CartSignInPrompt onSignIn={goToLogin} />
          ) : (
            <>
              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                <View style={styles.guestBanner}>
                  <Text style={type.body}>Sign in to checkout and save your cart across devices.</Text>
                  <Text style={type.link} onPress={goToLogin}>
                    Sign in
                  </Text>
                </View>
                {guestLines.map((line) => (
                  <GuestCartItemRow
                    key={`${line.productId}:${line.variantId ?? 'default'}`}
                    line={line}
                    onIncrement={() => void updateGuestQuantity(line, line.quantity + 1)}
                    onDecrement={() => void updateGuestQuantity(line, line.quantity - 1)}
                    onRemove={() => void removeGuestLine(line)}
                  />
                ))}
              </ScrollView>
              <CartFooter total={guestTotal} onPlaceOrder={goToCheckout} />
            </>
          )}
        </ScreenContent>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenContent style={styles.noPx}>
        <View style={styles.header}>
          <Text style={type.h2}>My Cart</Text>
          <Text style={type.caption}>{cart?.itemCount ?? 0} items</Text>
        </View>

        <QueryState
          isLoading={authLoading || (cartQuery.isLoading && !cartQuery.data)}
          isError={cartQuery.isError}
          error={cartQuery.error}
          isEmpty={!cartQuery.isLoading && items.length === 0}
          emptyMessage="Your cart is empty"
        >
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
          >
            {defaultAddressText ? (
              <AddressCard address={defaultAddressText} />
            ) : (
              <View style={styles.addressPrompt}>
                <Text style={type.body}>Add a delivery address to checkout</Text>
                <Text style={type.link} onPress={goToAddresses}>
                  Add address
                </Text>
              </View>
            )}
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                busy={busy}
                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                onRemove={() => removeItem.mutate(item.id)}
              />
            ))}
          </ScrollView>

          {items.length > 0 ? <CartFooter total={total} onPlaceOrder={goToCheckout} /> : null}
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

function GuestCartItemRow({
  line,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  line: GuestCartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemTop}>
        <Image
          source={{ uri: resolveImageUrl(line.imageUrl) }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {line.productName}
            </Text>
            <Pressable onPress={onRemove}>
              <Ionicons name="trash-outline" size={18} color={colors.mutedLight} />
            </Pressable>
          </View>
          <PriceBlock price={parsePrice(line.unitPrice)} size="sm" />
          {line.variantTitle ? <Text style={type.caption}>{line.variantTitle}</Text> : null}
        </View>
      </View>
      <View style={styles.itemFooter}>
        <QuantityStepper
          quantity={line.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noPx: { paddingHorizontal: 0 },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  list: { flex: 1, paddingHorizontal: 16 },
  listContent: { gap: 16, paddingTop: 16, paddingBottom: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  guestBanner: {
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
    gap: 8,
  },
  addressPrompt: {
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
    gap: 8,
  },
  itemRow: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 16 },
  itemTop: { flexDirection: 'row', gap: 12 },
  itemImage: { width: 96, height: 96, borderRadius: 16 },
  itemInfo: { flex: 1, gap: 4 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  itemName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.secondary, paddingRight: 8 },
  itemFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
