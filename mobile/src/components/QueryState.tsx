import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '@/lib/apiClient';
import { colors } from '@/theme/styles';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function QueryState({
  isLoading,
  isError,
  error,
  children,
  emptyMessage = 'No data found',
  isEmpty = false,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{emptyMessage}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  muted: {
    color: colors.muted,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: colors.danger,
  },
});
