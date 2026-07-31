import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Booking } from '@ecomm/shared/api.types';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import {
  formatBookingSchedule,
  getBookingTitle,
  getPackageLabel,
} from '@/lib/bookings';
import { resolveImageUrl } from '@/lib/catalog';
import { getErrorMessage } from '@/lib/apiClient';
import { useCreateServiceReview } from '@/hooks/useReviews';
import { colors, type } from '@/theme/styles';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
}

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const providerName = booking.provider?.name;
  const packageName = booking.package?.name;
  const imageUrl = resolveImageUrl(booking.provider?.imageUrl);
  const createReview = useCreateServiceReview();
  const [showReview, setShowReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const canReview = booking.status === 'completed';

  async function handleSubmitReview(rating: number, comment: string) {
    try {
      setReviewError(null);
      await createReview.mutateAsync({
        providerId: booking.providerId,
        bookingId: booking.id,
        rating,
        comment: comment || undefined,
      });
      setShowReview(false);
      Alert.alert('Thank you', 'Your review has been submitted.');
    } catch (error) {
      setReviewError(getErrorMessage(error));
    }
  }

  return (
    <>
      <Pressable onPress={onPress} style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: imageUrl }} style={styles.thumb} contentFit="cover" />
          <View style={styles.content}>
            <Text style={type.title}>{getBookingTitle(providerName)}</Text>
            <Text style={styles.package}>{getPackageLabel(packageName)}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.muted} />
              <Text style={styles.date}>{formatBookingSchedule(booking.bookingDate, booking.bookingTime)}</Text>
            </View>
            {booking.status !== 'confirmed' && booking.status !== 'completed' ? (
              <Text style={styles.status}>{booking.status}</Text>
            ) : null}
          </View>
        </View>

        {canReview ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              setShowReview(true);
            }}
            style={styles.reviewBtn}
          >
            <Text style={styles.reviewText}>Rate your review</Text>
            <Ionicons name="star-outline" size={16} color={colors.primary} />
          </Pressable>
        ) : null}
      </Pressable>

      <ReviewModal
        visible={showReview}
        title="Review service"
        onClose={() => {
          setShowReview(false);
          setReviewError(null);
        }}
        onSubmit={handleSubmitReview}
        busy={createReview.isPending}
        error={reviewError}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 14,
  },
  row: { flexDirection: 'row', gap: 12 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  content: { flex: 1, gap: 4 },
  package: { ...type.caption, color: colors.muted },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  date: { ...type.caption, flex: 1 },
  status: {
    ...type.small,
    alignSelf: 'flex-start',
    marginTop: 4,
    textTransform: 'capitalize',
    color: colors.primary,
    fontWeight: '600',
  },
  reviewBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
