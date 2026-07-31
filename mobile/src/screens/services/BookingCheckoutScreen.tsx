import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { todayDateOnly } from '@ecomm/shared';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { DateSelector, TimeSlotGrid } from '@/components/services/BookingSelectors';
import { BookNowBar } from '@/components/services/BookNowBar';
import { QueryState } from '@/components/QueryState';
import { TextField } from '@/components/ui/TextField';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useServiceProvider } from '@/hooks/useCatalog';
import { getErrorMessage } from '@/lib/apiClient';
import { formatInr, parsePrice } from '@/lib/catalog';
import { getPhoneValidationError, normalizeIndianMobile } from '@/lib/phone';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList, ServicesStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ServicesStackParamList, 'BookingCheckout'>,
  BottomTabNavigationProp<RootTabParamList>
>;
type Route = RouteProp<ServicesStackParamList, 'BookingCheckout'>;

export function BookingCheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuthSession();
  const providerQuery = useServiceProvider(route.params.providerId);
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState(todayDateOnly);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [contactPhoneError, setContactPhoneError] = useState<string | null>(null);
  const [alternatePhoneError, setAlternatePhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user?.phone]);

  const timeSlots = useMemo(
    () => (providerQuery.data?.timeSlots ?? []).map((slot) => slot.slotTime),
    [providerQuery.data?.timeSlots]
  );

  const priceLabel = formatInr(parsePrice(route.params.price));
  const canConfirm = Boolean(selectedDate && selectedTime && !createBooking.isPending);

  async function handleConfirm() {
    if (!selectedTime) {
      Alert.alert('Select time', 'Please choose a time slot to continue.');
      return;
    }

    const primaryError = getPhoneValidationError(contactPhone, true);
    const alternateError = alternatePhone.trim()
      ? getPhoneValidationError(alternatePhone, false)
      : null;

    setContactPhoneError(primaryError);
    setAlternatePhoneError(alternateError);

    if (primaryError || alternateError) {
      Alert.alert('Check phone numbers', primaryError ?? alternateError ?? 'Invalid phone number');
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        providerId: route.params.providerId,
        packageId: route.params.packageId,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        contactPhone: normalizeIndianMobile(contactPhone),
        alternatePhone: alternatePhone.trim()
          ? normalizeIndianMobile(alternatePhone)
          : undefined,
      });

      Alert.alert(
        'Booking confirmed',
        'Your appointment is booked. You can pay online anytime from booking details.',
        [
          {
            text: 'View booking',
            onPress: () => {
              navigation.navigate('Account', {
                screen: 'BookingDetail',
                params: { bookingId: booking.id },
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Booking failed', getErrorMessage(error));
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.flex}>
        <ScreenContent>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.secondary} />
            </Pressable>
            <Text style={type.h3}>Booking Checkout</Text>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="bag-outline" size={22} color={colors.secondary} />
            </Pressable>
          </View>

          <Text style={styles.packageLine}>
            {route.params.packageName} package • {priceLabel}
          </Text>
          <Text style={styles.payLaterNote}>
            Payment is optional now — you can pay online later from your booking details.
          </Text>

          <QueryState
            isLoading={providerQuery.isLoading}
            isError={providerQuery.isError}
            error={providerQuery.error}
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <View style={styles.phoneSection}>
                <Text style={type.title}>Contact numbers</Text>
                <Text style={styles.phoneHint}>
                  The provider may call these numbers to confirm your appointment.
                </Text>
                <TextField
                  label="Primary mobile"
                  value={contactPhone}
                  onChangeText={(value) => {
                    setContactPhone(value);
                    if (contactPhoneError) {
                      setContactPhoneError(getPhoneValidationError(value, true));
                    }
                  }}
                  keyboardType="phone-pad"
                  placeholder="10-digit mobile number"
                  maxLength={14}
                />
                {contactPhoneError ? <Text style={styles.phoneError}>{contactPhoneError}</Text> : null}
                <TextField
                  label="Alternate mobile (optional)"
                  value={alternatePhone}
                  onChangeText={(value) => {
                    setAlternatePhone(value);
                    if (alternatePhoneError) {
                      setAlternatePhoneError(
                        value.trim() ? getPhoneValidationError(value, false) : null
                      );
                    }
                  }}
                  keyboardType="phone-pad"
                  placeholder="Backup number if primary is unreachable"
                  maxLength={14}
                />
                {alternatePhoneError ? <Text style={styles.phoneError}>{alternatePhoneError}</Text> : null}
              </View>

              <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
              <TimeSlotGrid
                slots={timeSlots}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
              />
            </ScrollView>
          </QueryState>
        </ScreenContent>

        <BookNowBar
          priceLabel={priceLabel}
          onBook={handleConfirm}
          disabled={!canConfirm}
          buttonLabel="Confirm booking"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageLine: { ...type.caption, marginBottom: 8 },
  payLaterNote: { ...type.caption, color: colors.primary, marginBottom: 20 },
  form: { gap: 24, paddingBottom: 24 },
  phoneSection: { gap: 8 },
  phoneHint: { ...type.caption, marginBottom: 4 },
  phoneError: { ...type.caption, color: colors.danger },
});
