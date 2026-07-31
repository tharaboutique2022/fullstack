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
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { TextField } from '@/components/ui/TextField';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/lib/apiClient';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setPending(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      if (result.devOtp) {
        Alert.alert('Development OTP', `Your reset code: ${result.devOtp}`);
      }
      navigation.navigate('ResetPassword', { email: email.trim() });
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
            <Text style={type.h2}>Forgot password</Text>
            <Text style={type.caption}>
              Enter your email and we&apos;ll send a 6-digit reset code.
            </Text>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
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
                <Text style={styles.submitText}>Send reset code</Text>
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
