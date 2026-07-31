import { useState } from 'react';
import {
  ActivityIndicator,
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
import { getErrorMessage } from '@/lib/apiClient';
import { useLogin, useRegister } from '@/hooks/useAuth';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const login = useLogin();
  const register = useRegister();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pending = login.isPending || register.isPending;

  async function handleSubmit() {
    setError(null);
    try {
      if (mode === 'login') {
        await login.mutateAsync({ email: email.trim(), password });
      } else {
        await register.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
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
            <Text style={type.h2}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to save your cart and checkout'
                : 'Register to start shopping with Thara Boutique'}
            </Text>

            {mode === 'register' ? (
              <TextField label="Name" value={name} onChangeText={setName} autoComplete="name" />
            ) : null}

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />

            {mode === 'register' ? (
              <TextField
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            ) : null}

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'login' ? 'password' : 'new-password'}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {mode === 'login' ? (
              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={pending}
              style={[styles.submit, pending && styles.submitDisabled]}
            >
              {pending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
            >
              <Text style={styles.switch}>
                {mode === 'login'
                  ? "Don't have an account? Register"
                  : 'Already have an account? Sign in'}
              </Text>
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
  subtitle: { ...type.caption, marginBottom: 8 },
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
  switch: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: 14 },
  forgot: { textAlign: 'right', color: colors.primary, fontWeight: '600', fontSize: 13 },
});
