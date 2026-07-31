import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Order } from '@ecomm/shared/api.types';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import {
  formatInrAmount,
  getDeliveryEstimate,
  getOrderPrimaryItem,
  getOrderStatusLabel,
  getOrderTitle,
} from '@/lib/orders';
import { resolveImageUrl } from '@/lib/catalog';
import { getErrorMessage } from '@/lib/apiClient';
import { useCreateProductReview } from '@/hooks/useReviews';
import { colors, type } from '@/theme/styles';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const item = getOrderPrimaryItem(order);
  const imageUrl = resolveImageUrl(item?.imageUrl);
  const createReview = useCreateProductReview();
  const [showReview, setShowReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const canReview = order.status === 'delivered' && !!item;

  async function handleSubmitReview(rating: number, comment: string) {
    if (!item) return;

    try {
      setReviewError(null);
      await createReview.mutateAsync({
        productId: item.productId,
        orderId: order.id,
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
            <Text style={type.title}>{getOrderStatusLabel(order.status, order.createdAt)}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {getOrderTitle(order)}
            </Text>
            <View style={styles.deliveryRow}>
              <Ionicons name="car-outline" size={14} color={colors.muted} />
              <Text style={styles.meta}>{getOrderStatusLabel(order.status, order.createdAt)}</Text>
            </View>
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
        title="Review product"
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

interface CheckoutItemRowProps {
  name: string;
  subtitle?: string;
  imageUrl: string;
  quantity: number;
  unitPrice: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  busy?: boolean;
}

export function CheckoutItemRow({
  name,
  subtitle,
  imageUrl,
  quantity,
  unitPrice,
  onIncrement,
  onDecrement,
  onRemove,
  busy,
}: CheckoutItemRowProps) {
  return (
    <View style={styles.checkoutItem}>
      <View style={styles.checkoutTop}>
        <Image source={{ uri: imageUrl }} style={styles.thumb} contentFit="cover" />
        <View style={styles.content}>
          <View style={styles.checkoutHeader}>
            <Text style={type.title} numberOfLines={2}>
              {name}
            </Text>
            <Pressable onPress={onRemove} disabled={busy}>
              <Ionicons name="trash-outline" size={18} color={colors.mutedLight} />
            </Pressable>
          </View>
          {subtitle ? <Text style={styles.meta}>{subtitle}</Text> : null}
          <Text style={styles.price}>{formatInrAmount(unitPrice)}</Text>
        </View>
      </View>
      <View style={styles.checkoutFooter}>
        <QuantityStepper
          quantity={quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
        <View style={styles.deliveryRow}>
          <Ionicons name="car-outline" size={14} color={colors.muted} />
          <Text style={styles.meta}>{getDeliveryEstimate()}</Text>
        </View>
      </View>
    </View>
  );
}

interface CheckoutSectionCardProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function CheckoutSectionCard({ title, children, onEdit }: CheckoutSectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onEdit ? (
          <Pressable onPress={onEdit} style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color={colors.white} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
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
  productName: { ...type.caption, color: colors.muted },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { ...type.caption, flex: 1 },
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
  checkoutItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
    gap: 12,
  },
  checkoutTop: { flexDirection: 'row', gap: 12 },
  checkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  checkoutFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
