import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/apiClient';
import { getPhoneValidationError, normalizeIndianMobile } from '@/lib/phone';
import { useUpdateProfile } from '@/hooks/useAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthSession();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  async function handleSave() {
    setError(null);
    const phoneValidationError = phone.trim() ? getPhoneValidationError(phone, false) : null;
    if (phoneValidationError) {
      setError(phoneValidationError);
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim() ? normalizeIndianMobile(phone) : null,
      });
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Edit profile</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          <TextField label="Name" value={name} onChangeText={setName} />
          <TextField label="Email" value={user?.email ?? ''} editable={false} />
          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
            maxLength={14}
          />
          <Text style={type.caption}>
            Used for delivery and booking calls. Keep this number active.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={updateProfile.isPending}
            style={[styles.saveBtn, updateProfile.isPending && styles.disabled]}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Save changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 14, paddingBottom: 32 },
  error: { color: colors.danger },
  saveBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.6 },
  saveText: { color: colors.white, fontWeight: '600' },
});
