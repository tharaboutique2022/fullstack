import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderStatusStep } from '@/lib/orders';
import { colors, type } from '@/theme/styles';

interface StatusTimelineProps {
  steps: OrderStatusStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.row}>
          <View style={styles.markerCol}>
            <View
              style={[
                styles.marker,
                step.done && styles.markerDone,
                step.active && styles.markerActive,
              ]}
            >
              {step.done ? (
                <Ionicons name="checkmark" size={12} color={colors.white} />
              ) : null}
            </View>
            {index < steps.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <Text style={[type.body, step.active && styles.activeLabel]}>{step.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: 'row', gap: 12, minHeight: 36 },
  markerCol: { alignItems: 'center', width: 20 },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  markerDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  markerActive: { borderColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  activeLabel: { fontWeight: '700', color: colors.primary },
});
