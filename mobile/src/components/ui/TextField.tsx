import { memo } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, type } from '@/theme/styles';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export const TextField = memo(function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedLight}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { ...type.caption, fontWeight: '600', color: colors.secondary },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.secondary,
  },
});
