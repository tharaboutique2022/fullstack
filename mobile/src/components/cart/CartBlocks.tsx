import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { CartItem } from '@ecomm/shared/api.types';
import { PriceBlock } from '@/components/product/PriceBlock';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { parsePrice, resolveImageUrl } from '@/lib/catalog';
import { colors, type } from '@/theme/styles';

export const AddressCard = memo(function AddressCard({ address }: { address: string }) {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressBody}>
        <View style={styles.addressHeader}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.addressTitle}>Shipping Address</Text>
        </View>
        <Text style={type.body}>{address}</Text>
      </View>
      <Pressable>
        <Ionicons name="pencil" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
});

interface CartItemRowProps {
  item: CartItem;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  busy?: boolean;
}

export const CartItemRow = memo(function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  busy = false,
}: CartItemRowProps) {
  const variantLabel = item.variant?.title;

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemTop}>
        <Image
          source={{ uri: resolveImageUrl(item.imageUrl ?? item.product.imageUrl) }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Pressable onPress={onRemove} disabled={busy}>
              <Ionicons name="trash-outline" size={18} color={colors.mutedLight} />
            </Pressable>
          </View>
          <PriceBlock price={parsePrice(item.unitPrice)} size="sm" />
          {!item.isAvailable ? <Text style={styles.unavailable}>Unavailable</Text> : null}
        </View>
      </View>

      <View style={styles.itemFooter}>
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
        {variantLabel ? (
          <>
            <View style={styles.divider} />
            <View style={styles.attrRow}>
              <Text style={styles.attrLabel}>Variant:</Text>
              <Text style={styles.attrValue}>{variantLabel}</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
});

interface CartFooterProps {
  total: number;
  onPlaceOrder?: () => void;
}

export const CartFooter = memo(function CartFooter({ total, onPlaceOrder }: CartFooterProps) {
  return (
    <View style={styles.footer}>
      <View>
        <Text style={type.caption}>Total</Text>
        <Text style={type.h2}>₹ {total.toLocaleString('en-IN')}</Text>
      </View>
      <Pressable onPress={onPlaceOrder} style={styles.orderBtn}>
        <Text style={styles.orderText}>Place Order →</Text>
      </Pressable>
    </View>
  );
});

export const CartSignInPrompt = memo(function CartSignInPrompt({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  return (
    <View style={styles.prompt}>
      <Ionicons name="cart-outline" size={48} color={colors.mutedLight} />
      <Text style={type.h3}>Sign in to view your cart</Text>
      <Text style={type.caption}>Save items and checkout when you are ready</Text>
      <Pressable onPress={onSignIn} style={styles.promptBtn}>
        <Text style={styles.promptBtnText}>Sign in</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
  },
  addressBody: { flex: 1, gap: 4, paddingRight: 12 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressTitle: { fontWeight: '600', color: colors.primary },
  itemRow: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 16 },
  itemTop: { flexDirection: 'row', gap: 12 },
  itemImage: { width: 96, height: 96, borderRadius: 16 },
  itemInfo: { flex: 1, gap: 4 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  itemName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.secondary, paddingRight: 8 },
  unavailable: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  itemFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { width: 1, height: 24, backgroundColor: colors.border },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  attrLabel: { fontSize: 12, color: colors.muted },
  attrValue: { fontSize: 12, fontWeight: '500', color: colors.secondary, flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  orderBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  orderText: { color: colors.white, fontWeight: '600' },
  prompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  promptBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBtnText: { color: colors.white, fontWeight: '600' },
});
