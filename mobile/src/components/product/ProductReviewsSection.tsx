import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Review } from '@ecomm/shared/api.types';
import { useProductReviews } from '@/hooks/useReviews';
import { colors, type } from '@/theme/styles';

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={14}
          color={star <= rating ? '#F59E0B' : colors.mutedLight}
        />
      ))}
    </View>
  );
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.author}>{review.authorName}</Text>
        <Stars rating={review.rating} />
      </View>
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
    </View>
  );
}

export function ProductReviewsSection({ productId }: { productId: string }) {
  const reviewsQuery = useProductReviews(productId);

  if (reviewsQuery.isLoading) {
    return (
      <View style={styles.section}>
        <Text style={type.title}>Customer reviews</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const reviews = reviewsQuery.data ?? [];
  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={type.title}>Customer reviews</Text>
        {average ? <Text style={type.caption}>{average} ★ · {reviews.length} reviews</Text> : null}
      </View>

      {reviews.length === 0 ? (
        <Text style={type.caption}>No reviews yet. Be the first after your purchase.</Text>
      ) : (
        reviews.slice(0, 5).map((review) => <ReviewRow key={review.id} review={review} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionHeader: { gap: 4 },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    backgroundColor: colors.surface,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  author: { ...type.body, fontWeight: '600' },
  comment: { ...type.body, color: colors.muted },
  stars: { flexDirection: 'row', gap: 2 },
});
