import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { CheckoutSectionCard } from '@/components/orders/OrderBlocks';
import { StatusTimeline } from '@/components/orders/StatusTimeline';
import { QueryState } from '@/components/QueryState';
import { CancelReasonModal } from '@/components/ui/CancelReasonModal';
import { useCancelOrder, useOrder } from '@/hooks/useOrders';
import { useInitiateOrderPayment } from '@/hooks/usePayments';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  canCancelOrder,
  canRetryPayment,
  formatInrAmount,
  getOrderStatusSteps,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/lib/orders';
import { formatIndianMobileDisplay } from '@/lib/phone';
import { getErrorMessage } from '@/lib/apiClient';
import { resolveImageUrl } from '@/lib/catalog';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'OrderDetail'>;
type Route = RouteProp<AccountStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuthSession();
  const orderQuery = useOrder(route.params.orderId);
  const cancelOrder = useCancelOrder();
  const initiatePayment = useInitiateOrderPayment();
  const order = orderQuery.data;

  useEffect(() => {
    const result = route.params.paymentResult;
    if (result !== 'success') {
      if (result === 'failure') {
        navigation.setParams({ paymentResult: undefined });
      }
      return;
    }

    Alert.alert(
      'Payment successful',
      'Your payment was received. We will confirm your order shortly.'
    );
    navigation.setParams({ paymentResult: undefined });
  }, [navigation, route.params.paymentResult]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const contactPhone = order?.contactPhone
    ? formatIndianMobileDisplay(order.contactPhone)
    : user?.phone
      ? formatIndianMobileDisplay(user.phone)
      : 'Not provided';

  async function handleRetryPayment() {
    if (!order) return;

    try {
      const payment = await initiatePayment.mutateAsync(order.id);
      navigation.navigate('Payment', {
        checkout: payment,
        displayNumber: order.orderNumber,
        origin: 'account',
      });
    } catch (error) {
      Alert.alert('Payment not started', getErrorMessage(error));
    }
  }

  async function handleCancelConfirm() {
    if (!order) return;
    if (cancelReason.trim().length < 5) {
      setCancelError('Please enter at least 5 characters');
      return;
    }

    try {
      setCancelError(null);
      await cancelOrder.mutateAsync({ id: order.id, reason: cancelReason.trim() });
      setShowCancelModal(false);
      setCancelReason('');
      Alert.alert('Order cancelled', 'Your order has been cancelled.');
    } catch (error) {
      setCancelError(getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Order Details</Text>
          <View style={styles.backBtn} />
        </View>

        <QueryState
          isLoading={orderQuery.isLoading}
          isError={orderQuery.isError}
          error={orderQuery.error}
        >
          {order ? (
            <ScrollView contentContainerStyle={styles.scroll}>
              <CheckoutSectionCard title={`Order ${order.orderNumber}`}>
                <StatusTimeline steps={getOrderStatusSteps(order.status, order.paymentStatus)} />
                {order.trackingId ? (
                  <Text style={type.body}>Tracking ID: {order.trackingId}</Text>
                ) : null}
                {order.cancelReason ? (
                  <Text style={styles.cancelReason}>Cancelled: {order.cancelReason}</Text>
                ) : null}
              </CheckoutSectionCard>

              <CheckoutSectionCard title="Delivery Details">
                <Text style={type.title}>{user?.name ?? 'Customer'}</Text>
                <Text style={type.body}>
                  {order.shippingAddress ?? 'Address not available for this order'}
                </Text>
              </CheckoutSectionCard>

              <CheckoutSectionCard title="Contact Information">
                <Text style={type.body}>{contactPhone}</Text>
                <Text style={type.body}>{user?.email ?? ''}</Text>
              </CheckoutSectionCard>

              <Text style={type.h3}>Items ({order.items.length})</Text>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Image
                    source={{ uri: resolveImageUrl(item.imageUrl) }}
                    style={styles.itemThumb}
                    contentFit="cover"
                  />
                  <View style={styles.itemText}>
                    <Text style={type.title}>{item.productName}</Text>
                    {item.variantTitle ? <Text style={type.caption}>{item.variantTitle}</Text> : null}
                    <Text style={type.caption}>
                      Qty {item.quantity} · {formatInrAmount(item.priceAtOrder)}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={type.h3}>Price Details</Text>
              <View style={styles.priceCard}>
                <PriceRow label="Subtotal" value={order.subtotal} />
                <PriceRow label="Platform fee" value={order.platformFee} />
                <PriceRow label="Shipping" value={order.shippingCharge} />
                <PriceRow label="Discount" value={order.discount} />
                <View style={styles.divider} />
                <PriceRow label="Total" value={order.totalAmount} bold />
                <Text style={styles.paymentMode}>
                  Payment: {getPaymentMethodLabel(order.paymentMethod)} · {getPaymentStatusLabel(order.paymentStatus)}
                </Text>
              </View>

              {canRetryPayment(order) ? (
                <Pressable
                  style={[styles.retryBtn, initiatePayment.isPending && styles.retryBtnDisabled]}
                  onPress={handleRetryPayment}
                  disabled={initiatePayment.isPending}
                >
                  <Text style={styles.retryText}>
                    {initiatePayment.isPending ? 'Starting payment…' : 'Retry payment'}
                  </Text>
                </Pressable>
              ) : null}

              {canCancelOrder(order) ? (
                <Pressable style={styles.cancelBtn} onPress={() => setShowCancelModal(true)}>
                  <Text style={styles.cancelText}>Cancel order</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : null}
        </QueryState>

        <CancelReasonModal
          visible={showCancelModal}
          title="Cancel order"
          description="Please tell us why you want to cancel. This helps us improve delivery support."
          reason={cancelReason}
          onChangeReason={setCancelReason}
          onClose={() => {
            setShowCancelModal(false);
            setCancelError(null);
          }}
          onConfirm={handleCancelConfirm}
          busy={cancelOrder.isPending}
          error={cancelError}
        />
      </ScreenContent>
    </Screen>
  );
}

function PriceRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={bold ? styles.totalLabel : type.body}>{label}</Text>
      <Text style={bold ? styles.totalValue : type.body}>{formatInrAmount(value)}</Text>
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
  scroll: { gap: 16, paddingBottom: 100 },
  cancelReason: { ...type.caption, color: colors.danger, marginTop: 8 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemThumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.primarySoft },
  itemText: { flex: 1, gap: 2 },
  priceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  paymentMode: { ...type.caption, marginTop: 4 },
  retryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnDisabled: { opacity: 0.6 },
  retryText: { color: colors.white, fontWeight: '600' },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.danger, fontWeight: '600' },
});
