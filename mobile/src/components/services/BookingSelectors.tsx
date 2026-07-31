import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildDateOnlyOptions, todayDateOnly } from '@ecomm/shared';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '@/theme/styles';

interface DateSelectorProps {
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  days?: number;
}

export function DateSelector({ selectedDate, onSelect, days = 14 }: DateSelectorProps) {
  const options = useMemo(() => buildDateOnlyOptions(days), [days]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        Select a Session <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.row}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {options.map((option) => {
            const active = option.key === selectedDate;
            return (
              <Pressable
                key={option.key}
                onPress={() => onSelect(option.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipDay, active && styles.chipTextActive]}>{option.weekday}</Text>
                <Text style={[styles.chipDate, active && styles.chipTextActive]}>
                  {option.day} {option.month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

interface TimeSlotGridProps {
  slots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect }: TimeSlotGridProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        Time <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const active = slot === selectedTime;
          return (
            <Pressable
              key={slot}
              onPress={() => onSelect(slot)}
              style={[styles.slot, active && styles.slotActive]}
            >
              <Text style={[styles.slotText, active && styles.slotTextActive]}>{slot}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  label: { ...type.title, fontSize: 15 },
  required: { color: colors.danger },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scroll: { gap: 10, paddingRight: 8 },
  chip: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    gap: 2,
  },
  chipActive: { backgroundColor: colors.primary },
  chipDay: { fontSize: 11, fontWeight: '600', color: colors.muted },
  chipDate: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  chipTextActive: { color: colors.white },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    minWidth: '30%',
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  slotActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  slotTextActive: { color: colors.primary },
});
