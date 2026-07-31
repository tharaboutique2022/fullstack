import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '@/theme/styles';

interface ReviewModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  busy?: boolean;
  error?: string | null;
}

export function ReviewModal({
  visible,
  title,
  onClose,
  onSubmit,
  busy = false,
  error,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  function handleClose() {
    setRating(0);
    setComment('');
    onClose();
  }

  function handleSubmit() {
    if (rating < 1) return;
    onSubmit(rating, comment.trim());
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={type.h3}>{title}</Text>
          <Text style={styles.description}>Share your experience with a rating and optional comment.</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)} style={styles.starBtn}>
                <Ionicons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={value <= rating ? colors.primary : colors.mutedLight}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write your review (optional)"
            placeholderTextColor={colors.mutedLight}
            multiline
            numberOfLines={4}
            style={styles.input}
            textAlignVertical="top"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={handleClose} style={[styles.btn, styles.secondaryBtn]}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={rating < 1 || busy}
              style={[styles.btn, styles.primaryBtn, (rating < 1 || busy) && styles.disabled]}
            >
              <Text style={styles.primaryText}>{busy ? 'Submitting…' : 'Submit review'}</Text>
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
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  starBtn: { padding: 4 },
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
  primaryBtn: { backgroundColor: colors.primary },
  disabled: { opacity: 0.5 },
  secondaryText: { fontWeight: '600', color: colors.secondary },
  primaryText: { fontWeight: '600', color: colors.white },
});
