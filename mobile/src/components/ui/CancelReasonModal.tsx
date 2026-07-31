import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, type } from '@/theme/styles';

interface CancelReasonModalProps {
  visible: boolean;
  title: string;
  description: string;
  reason: string;
  onChangeReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
  error?: string | null;
}

export function CancelReasonModal({
  visible,
  title,
  description,
  reason,
  onChangeReason,
  onClose,
  onConfirm,
  busy = false,
  error,
}: CancelReasonModalProps) {
  const canSubmit = reason.trim().length >= 5 && !busy;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={type.h3}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <TextInput
            value={reason}
            onChangeText={onChangeReason}
            placeholder="Tell us why you are cancelling"
            placeholderTextColor={colors.mutedLight}
            multiline
            numberOfLines={4}
            style={styles.input}
            textAlignVertical="top"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.btn, styles.secondaryBtn]}>
              <Text style={styles.secondaryText}>Keep</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={!canSubmit}
              style={[styles.btn, styles.primaryBtn, !canSubmit && styles.disabled]}
            >
              <Text style={styles.primaryText}>{busy ? 'Cancelling…' : 'Confirm cancel'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: { ...type.caption },
  input: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 14,
    color: colors.secondary,
    backgroundColor: colors.surface,
  },
  error: { ...type.caption, color: colors.danger },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  secondaryText: { fontWeight: '600', color: colors.secondary },
  primaryText: { fontWeight: '600', color: colors.white },
});
