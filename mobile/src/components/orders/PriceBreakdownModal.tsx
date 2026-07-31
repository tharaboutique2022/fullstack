import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CheckoutQuote } from '@ecomm/shared/api.types';
import { formatInrAmount } from '@/lib/orders';
import { colors, type } from '@/theme/styles';

interface PriceBreakdownModalProps {
  visible: boolean;
  quote: CheckoutQuote;
  onClose: () => void;
}

export function PriceBreakdownModal({ visible, quote, onClose }: PriceBreakdownModalProps) {
  const rows = [
    { label: 'Listing price', value: quote.subtotal },
    { label: 'Platform Fee', value: quote.platformFee },
    { label: 'Discount', value: quote.discount },
    { label: 'Shipping Charge', value: quote.shippingCharge },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={type.h3}>Price Breakdown</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.secondary} />
            </Pressable>
          </View>

          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={type.body}>{row.label}</Text>
              <Text style={type.body}>{formatInrAmount(row.value)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatInrAmount(quote.totalAmount)}</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.secondary },
});
