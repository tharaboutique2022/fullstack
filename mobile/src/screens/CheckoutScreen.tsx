import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { TextField } from '@/components/ui/TextField';
import { PaymentMethodSection } from '@/components/checkout/PaymentMethodSection';
import {
  CheckoutItemRow,
  CheckoutSectionCard,
} from '@/components/orders/OrderBlocks';
import { PriceBreakdownModal } from '@/components/orders/PriceBreakdownModal';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useCheckoutQuote, useCreateOrder } from '@/hooks/useOrders';
import { paymentsApi } from '@/api/payments';
import { formatAddress } from '@ecomm/shared';
import type { CouponValidationResult, PaymentInitResponse } from '@ecomm/shared/api.types';
import { useDefaultAddress } from '@/hooks/useAddresses';
import { getErrorMessage } from '@/lib/apiClient';
import { getPhoneValidationError, normalizeIndianMobile } from '@/lib/phone';
import { formatInrAmount, ORDER_STANDARD_SHIPPING } from '@/lib/orders';
import { resolveImageUrl } from '@/lib/catalog';
import type { CartStackParamList, RootTabParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CartStackParamList, 'Checkout'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthSession();
  const cartQuery = useCart(true);
  const items = cartQuery.data?.items ?? [];
  const hasItems = items.length > 0;
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const quoteQuery = useCheckoutQuote(couponCode, hasItems);
  const validateCoupon = useValidateCoupon();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const createOrder = useCreateOrder();
  const defaultAddressQuery = useDefaultAddress(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const quote = quoteQuery.data;
  const defaultAddress = defaultAddressQuery.data;
  const busy = updateItem.isPending || removeItem.isPending || createOrder.isPending;
  const contactEmail = user?.email ?? '';

  useEffect(() => {
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user?.phone]);

  useEffect(() => {
    if (!cartQuery.isLoading && !hasItems) {
      navigation.replace('CartHome');
    }
  }, [cartQuery.isLoading, hasItems, navigation]);

  function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return;
    updateItem.mutate({ id, quantity });
  }

  async function openPayment(checkout: PaymentInitResponse, displayNumber: string) {
    navigation.navigate('Payment', {
      checkout,
      displayNumber,
      origin: 'cart',
    });
  }

  async function handleApplyVoucher() {
    const code = voucherInput.trim();
    if (!code) {
      setVoucherError('Enter a voucher code');
      return;
    }

    try {
      setVoucherError(null);
      const subtotal = cartQuery.data?.subtotal ?? '0';
      const result = await validateCoupon.mutateAsync({ code, subtotal });
      setAppliedCoupon(result);
      setCouponCode(result.code);
      setShowVoucherModal(false);
    } catch (error) {
      setVoucherError(getErrorMessage(error));
    }
  }

  function handleRemoveVoucher() {
    setAppliedCoupon(null);
    setCouponCode(undefined);
    setVoucherInput('');
  }

  async function handlePlaceOrder() {
    const phoneValidationError = getPhoneValidationError(contactPhone, true);
    setPhoneError(phoneValidationError);
    if (phoneValidationError) {
      Alert.alert('Phone required', 'Courier partners call this number for delivery. Please enter a valid mobile number.');
      return;
    }

    if (!defaultAddress) {
      Alert.alert('Address required', 'Add a delivery address before placing your order.', [
        {
          text: 'Add address',
          onPress: () => navigation.navigate('Account', { screen: 'Addresses' }),
        },
      ]);
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        addressId: defaultAddress.id,
        contactPhone: normalizeIndianMobile(contactPhone),
        paymentMethod: 'online',
        couponCode: appliedCoupon?.code,
      });

      if (result.payment?.razorpayOrderId && result.payment.keyId) {
        await openPayment(result.payment, result.order.orderNumber);
        return;
      }

      const paymentMessage =
        result.paymentError ??
        'Razorpay could not be started. Check backend Razorpay keys, then tap Pay now to retry.';

      Alert.alert(
        'Order created — payment required',
        `${paymentMessage}\n\nOrder ${result.order.orderNumber} will be confirmed after payment.`,
        [
          {
            text: 'Pay now',
            onPress: () => {
              void (async () => {
                try {
                  const checkout = await paymentsApi.initiateOrder(result.order.id);
                  await openPayment(checkout, result.order.orderNumber);
                } catch (error) {
                  Alert.alert('Payment not started', getErrorMessage(error));
                }
              })();
            },
          },
          {
            text: 'View orders',
            onPress: () => navigation.navigate('Account', { screen: 'MyOrders' }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Checkout failed', getErrorMessage(error));
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.flex}>
        <ScreenContent style={styles.noPx}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.secondary} />
            </Pressable>
            <View>
              <Text style={type.h3}>Checkout</Text>
              <Text style={type.caption}>{items.length} items</Text>
            </View>
            <View style={styles.iconBtn} />
          </View>

          <QueryState
            isLoading={cartQuery.isLoading || quoteQuery.isLoading}
            isError={cartQuery.isError || quoteQuery.isError}
            error={cartQuery.error ?? quoteQuery.error}
          >
            <ScrollView contentContainerStyle={styles.scroll}>
              <CheckoutSectionCard
                title="Shipping Address"
                onEdit={() => navigation.navigate('Account', { screen: 'Addresses' })}
              >
                <Text style={type.body}>
                  {defaultAddress ? formatAddress(defaultAddress) : 'No address saved yet'}
                </Text>
              </CheckoutSectionCard>

              <CheckoutSectionCard title="Delivery phone">
                <Text style={styles.phoneHint}>
                  Courier partners deliver only after calling this number. Double-check it before placing the order.
                </Text>
                <TextField
                  label="Mobile number"
                  value={contactPhone}
                  onChangeText={(value) => {
                    setContactPhone(value);
                    if (phoneError) {
                      setPhoneError(getPhoneValidationError(value, true));
                    }
                  }}
                  keyboardType="phone-pad"
                  placeholder="10-digit mobile number"
                  maxLength={14}
                />
                {phoneError ? <Text style={styles.phoneError}>{phoneError}</Text> : null}
                {contactEmail ? <Text style={type.caption}>Email: {contactEmail}</Text> : null}
              </CheckoutSectionCard>

              <View style={styles.itemsHeader}>
                <View style={styles.itemsTitleRow}>
                  <Text style={type.h3}>Items</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{items.length}</Text>
                  </View>
                </View>
                {appliedCoupon ? (
                  <Pressable onPress={handleRemoveVoucher}>
                    <Text style={type.link}>Remove {appliedCoupon.code}</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setShowVoucherModal(true)}>
                    <Text style={type.link}>Add Voucher</Text>
                  </Pressable>
                )}
              </View>

              {appliedCoupon ? (
                <Text style={type.caption}>
                  Voucher applied — you save {formatInrAmount(appliedCoupon.discountAmount)}
                </Text>
              ) : null}

              {items.map((item) => (
                <CheckoutItemRow
                  key={item.id}
                  name={item.product.name}
                  subtitle={item.variant?.title}
                  imageUrl={resolveImageUrl(item.imageUrl ?? item.product.imageUrl)}
                  quantity={item.quantity}
                  unitPrice={item.unitPrice}
                  busy={busy}
                  onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeItem.mutate(item.id)}
                />
              ))}

              <PaymentMethodSection />

              <Text style={[type.h3, styles.shippingTitle]}>Shipping Options</Text>
              <View style={styles.shippingCard}>
                <View style={styles.shippingRow}>
                  <Ionicons name="checkbox" size={20} color={colors.primary} />
                  <View style={styles.shippingText}>
                    <Text style={type.title}>Standard</Text>
                    <Text style={styles.shippingEta}>5-7 days</Text>
                  </View>
                  <Text style={type.title}>{formatInrAmount(ORDER_STANDARD_SHIPPING)}</Text>
                </View>
              </View>
            </ScrollView>
          </QueryState>
        </ScreenContent>

        {quote ? (
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerTotal}>{formatInrAmount(quote.totalAmount)}</Text>
              <Pressable onPress={() => setShowBreakdown(true)}>
                <Text style={type.link}>View Breakdown</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handlePlaceOrder}
              disabled={busy || !items.length || !defaultAddress}
              style={[styles.payBtn, (busy || !items.length || !defaultAddress) && styles.payBtnDisabled]}
            >
              <Text style={styles.payText}>Proceed to pay online</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </Pressable>
          </View>
        ) : null}

        {quote ? (
          <PriceBreakdownModal
            visible={showBreakdown}
            quote={quote}
            onClose={() => setShowBreakdown(false)}
          />
        ) : null}

        <Modal visible={showVoucherModal} transparent animationType="fade" onRequestClose={() => setShowVoucherModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowVoucherModal(false)}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={type.h3}>Apply voucher</Text>
              <TextField
                label="Voucher code"
                value={voucherInput}
                onChangeText={setVoucherInput}
                placeholder="Enter code"
                autoCapitalize="characters"
              />
              {voucherError ? <Text style={styles.phoneError}>{voucherError}</Text> : null}
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setShowVoucherModal(false);
                    setVoucherError(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalApplyBtn, validateCoupon.isPending && styles.payBtnDisabled]}
                  onPress={() => void handleApplyVoucher()}
                  disabled={validateCoupon.isPending}
                >
                  <Text style={styles.payText}>
                    {validateCoupon.isPending ? 'Validating…' : 'Apply'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noPx: { paddingHorizontal: 0, flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 16, paddingBottom: 24 },
  phoneHint: { ...type.caption, marginBottom: 8 },
  phoneError: { ...type.caption, color: colors.danger, marginTop: -6 },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  shippingTitle: { marginTop: 4 },
  shippingCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  shippingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shippingText: { flex: 1, gap: 2 },
  shippingEta: { ...type.caption, color: colors.danger },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  footerTotal: { fontSize: 20, fontWeight: '700', color: colors.secondary },
  payBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnDisabled: { opacity: 0.5 },
  payText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { fontWeight: '600', color: colors.secondary },
  modalApplyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
