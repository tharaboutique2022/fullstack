import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { todayDateOnly } from '@ecomm/shared';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { CheckoutSectionCard } from '@/components/orders/OrderBlocks';
import { DateSelector, TimeSlotGrid } from '@/components/services/BookingSelectors';
import { QueryState } from '@/components/QueryState';
import { CancelReasonModal } from '@/components/ui/CancelReasonModal';
import { useBooking, useCancelBooking, useRescheduleBooking } from '@/hooks/useBookings';
import { useServiceProvider } from '@/hooks/useCatalog';
import { useInitiateBookingPayment } from '@/hooks/usePayments';
import {
  canCancelBooking,
  canRescheduleBooking,
  canRetryBookingPayment,
  formatBookingSchedule,
  getBookingStatusLabel,
  getBookingTitle,
  getPackageLabel,
} from '@/lib/bookings';
import { formatInrAmount, getPaymentStatusLabel } from '@/lib/orders';
import { formatIndianMobileDisplay } from '@/lib/phone';
import { getErrorMessage } from '@/lib/apiClient';
import { resolveImageUrl } from '@/lib/catalog';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'BookingDetail'>;
type Route = RouteProp<AccountStackParamList, 'BookingDetail'>;

export function BookingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const bookingQuery = useBooking(route.params.bookingId);
  const cancelBooking = useCancelBooking();
  const rescheduleBooking = useRescheduleBooking();
  const initiatePayment = useInitiateBookingPayment();
  const booking = bookingQuery.data;
  const providerQuery = useServiceProvider(booking?.providerId ?? '');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(todayDateOnly());
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const timeSlots = useMemo(
    () => (providerQuery.data?.timeSlots ?? []).map((slot) => slot.slotTime),
    [providerQuery.data?.timeSlots]
  );

  useEffect(() => {
    const result = route.params.paymentResult;
    if (result !== 'success') {
      if (result === 'failure') {
        navigation.setParams({ paymentResult: undefined });
      }
      return;
    }

    Alert.alert('Payment successful', 'Your booking payment was received.');
    navigation.setParams({ paymentResult: undefined });
  }, [navigation, route.params.paymentResult]);

  useEffect(() => {
    if (!booking) return;
    setRescheduleDate(booking.bookingDate);
    setRescheduleTime(booking.bookingTime);
  }, [booking]);

  async function handleCancelConfirm() {
    if (!booking) return;
    if (cancelReason.trim().length < 5) {
      setCancelError('Please enter at least 5 characters');
      return;
    }

    try {
      setCancelError(null);
      await cancelBooking.mutateAsync({ id: booking.id, reason: cancelReason.trim() });
      setShowCancelModal(false);
      setCancelReason('');
      Alert.alert('Booking cancelled', 'Your appointment has been cancelled.');
    } catch (error) {
      setCancelError(getErrorMessage(error));
    }
  }

  async function handleReschedule() {
    if (!booking || !rescheduleTime) {
      setRescheduleError('Please select a time slot');
      return;
    }

    try {
      setRescheduleError(null);
      await rescheduleBooking.mutateAsync({
        id: booking.id,
        bookingDate: rescheduleDate,
        bookingTime: rescheduleTime,
      });
      setShowReschedule(false);
      Alert.alert('Rescheduled', 'Your appointment has been updated.');
    } catch (error) {
      setRescheduleError(getErrorMessage(error));
    }
  }

  async function handleRetryPayment() {
    if (!booking) return;

    try {
      const payment = await initiatePayment.mutateAsync(booking.id);
      navigation.navigate('Payment', {
        checkout: payment,
        displayNumber: booking.bookingNumber,
        origin: 'account',
      });
    } catch (error) {
      Alert.alert('Payment not started', getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Booking Details</Text>
          <View style={styles.backBtn} />
        </View>

        <QueryState
          isLoading={bookingQuery.isLoading}
          isError={bookingQuery.isError}
          error={bookingQuery.error}
        >
          {booking ? (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.summary}>
                <Image
                  source={{ uri: resolveImageUrl(booking.provider?.imageUrl) }}
                  style={styles.thumb}
                  contentFit="cover"
                />
                <View style={styles.summaryText}>
                  <Text style={type.title}>{getBookingTitle(booking.provider?.name)}</Text>
                  <Text style={type.caption}>{getPackageLabel(booking.package?.name)}</Text>
                  <Text style={styles.status}>{getBookingStatusLabel(booking.status)}</Text>
                </View>
              </View>

              <CheckoutSectionCard title="Appointment">
                <Text style={type.body}>
                  {formatBookingSchedule(booking.bookingDate, booking.bookingTime)}
                </Text>
                {booking.provider?.location ? (
                  <Text style={type.caption}>{booking.provider.location}</Text>
                ) : null}
              </CheckoutSectionCard>

              <CheckoutSectionCard title="Contact numbers">
                <Text style={type.body}>
                  Primary:{' '}
                  {booking.contactPhone
                    ? formatIndianMobileDisplay(booking.contactPhone)
                    : 'Not provided'}
                </Text>
                {booking.alternatePhone ? (
                  <Text style={type.body}>
                    Alternate: {formatIndianMobileDisplay(booking.alternatePhone)}
                  </Text>
                ) : null}
              </CheckoutSectionCard>

              <CheckoutSectionCard title="Amount">
                <Text style={type.title}>{formatInrAmount(booking.totalAmount)}</Text>
                <Text style={type.caption}>
                  Payment: {getPaymentStatusLabel(booking.paymentStatus)}
                </Text>
              </CheckoutSectionCard>

              {booking.cancelReason ? (
                <Text style={styles.cancelReason}>Cancelled: {booking.cancelReason}</Text>
              ) : null}

              {booking.notes ? (
                <CheckoutSectionCard title="Notes">
                  <Text style={type.body}>{booking.notes}</Text>
                </CheckoutSectionCard>
              ) : null}

              {canRescheduleBooking(booking) ? (
                <Pressable style={styles.secondaryBtn} onPress={() => setShowReschedule((value) => !value)}>
                  <Text style={styles.secondaryText}>
                    {showReschedule ? 'Hide reschedule' : 'Reschedule appointment'}
                  </Text>
                </Pressable>
              ) : null}

              {showReschedule ? (
                <View style={styles.rescheduleBox}>
                  <DateSelector selectedDate={rescheduleDate} onSelect={setRescheduleDate} />
                  <TimeSlotGrid
                    slots={timeSlots}
                    selectedTime={rescheduleTime}
                    onSelect={setRescheduleTime}
                  />
                  {rescheduleError ? <Text style={styles.cancelReason}>{rescheduleError}</Text> : null}
                  <Pressable
                    style={[styles.retryBtn, rescheduleBooking.isPending && styles.btnDisabled]}
                    onPress={() => void handleReschedule()}
                    disabled={rescheduleBooking.isPending}
                  >
                    <Text style={styles.retryText}>
                      {rescheduleBooking.isPending ? 'Saving…' : 'Save new schedule'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {canRetryBookingPayment(booking) ? (
                <Pressable
                  style={[styles.retryBtn, initiatePayment.isPending && styles.btnDisabled]}
                  onPress={() => void handleRetryPayment()}
                  disabled={initiatePayment.isPending}
                >
                  <Text style={styles.retryText}>
                    {initiatePayment.isPending ? 'Starting payment…' : 'Pay now'}
                  </Text>
                </Pressable>
              ) : null}

              {canCancelBooking(booking) ? (
                <Pressable style={styles.cancelBtn} onPress={() => setShowCancelModal(true)}>
                  <Text style={styles.cancelText}>Cancel booking</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : null}
        </QueryState>

        <CancelReasonModal
          visible={showCancelModal}
          title="Cancel booking"
          description="Please tell us why you want to cancel this appointment."
          reason={cancelReason}
          onChangeReason={setCancelReason}
          onClose={() => {
            setShowCancelModal(false);
            setCancelError(null);
          }}
          onConfirm={handleCancelConfirm}
          busy={cancelBooking.isPending}
          error={cancelError}
        />
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
  scroll: { gap: 16, paddingBottom: 100 },
  summary: { flexDirection: 'row', gap: 12 },
  thumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.primarySoft },
  summaryText: { flex: 1, gap: 4 },
  status: { ...type.caption, color: colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  cancelReason: { ...type.caption, color: colors.danger },
  rescheduleBox: { gap: 16 },
  secondaryBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.secondary, fontWeight: '600' },
  retryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
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
