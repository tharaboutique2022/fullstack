import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { TextField } from '@/components/ui/TextField';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/lib/apiClient';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'ResetPassword'>;
type Route = RouteProp<AccountStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      await authApi.resetPassword({
        email: route.params.email,
        otp: otp.trim(),
        password,
      });
      Alert.alert('Password updated', 'You can now sign in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <ScreenContent>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={type.h2}>Reset password</Text>
            <Text style={type.caption}>Enter the 6-digit code sent to {route.params.email}</Text>

            <TextField
              label="Reset code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={pending}
              style={[styles.submit, pending && styles.submitDisabled]}
            >
              {pending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Update password</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 16, paddingBottom: 32 },
  error: { color: colors.danger, fontSize: 14 },
  submit: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
