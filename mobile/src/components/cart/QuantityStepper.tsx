import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/styles';

interface QuantityStepperProps {
  quantity: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const QuantityStepper = memo(function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityStepperProps) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onDecrement} style={styles.btn}>
        <Ionicons name="remove" size={16} color={colors.muted} />
      </Pressable>
      <Text style={styles.qty}>{quantity}</Text>
      <Pressable onPress={onIncrement} style={styles.btn}>
        <Ionicons name="add" size={16} color={colors.muted} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
});
