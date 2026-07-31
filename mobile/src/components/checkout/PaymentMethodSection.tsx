import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '@/theme/styles';

export function PaymentMethodSection() {
  return (
    <View style={styles.wrap}>
      <Text style={type.h3}>Payment method</Text>
      <View style={[styles.option, styles.optionActive]}>
        <Ionicons name="radio-button-on" size={20} color={colors.primary} />
        <View style={styles.optionText}>
          <Text style={type.title}>Online payment</Text>
          <Text style={type.caption}>UPI, cards, net banking (Razorpay)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: { flex: 1, gap: 2 },
});
