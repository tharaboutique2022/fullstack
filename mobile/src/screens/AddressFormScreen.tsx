import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { AddressInput } from '@ecomm/shared/api.types';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/apiClient';
import { useAddressMutations } from '@/hooks/useAddresses';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'AddressForm'>;
type Route = RouteProp<AccountStackParamList, 'AddressForm'>;

const emptyForm: AddressInput = {
  label: 'Home',
  line1: '',
  line2: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '',
  isDefault: true,
};

export function AddressFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { create, update } = useAddressMutations();
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(route.params?.addressId);

  useEffect(() => {
    if (route.params?.address) {
      setForm({
        label: route.params.address.label,
        line1: route.params.address.line1,
        line2: route.params.address.line2 ?? '',
        city: route.params.address.city,
        state: route.params.address.state,
        pincode: route.params.address.pincode,
        isDefault: route.params.address.isDefault,
      });
    }
  }, [route.params?.address]);

  const pending = create.isPending || update.isPending;

  async function handleSave() {
    setError(null);
    try {
      const body: AddressInput = {
        ...form,
        line2: form.line2?.trim() || null,
      };

      if (isEdit && route.params?.addressId) {
        await update.mutateAsync({ id: route.params.addressId, body });
      } else {
        await create.mutateAsync(body);
      }
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
          <Text style={type.h3}>{isEdit ? 'Edit address' : 'Add address'}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          <TextField label="Label" value={form.label ?? ''} onChangeText={(label) => setForm({ ...form, label })} />
          <TextField label="Address line 1" value={form.line1} onChangeText={(line1) => setForm({ ...form, line1 })} />
          <TextField label="Address line 2 (optional)" value={form.line2 ?? ''} onChangeText={(line2) => setForm({ ...form, line2 })} />
          <TextField label="City" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
          <TextField label="State" value={form.state} onChangeText={(state) => setForm({ ...form, state })} />
          <TextField
            label="Pincode"
            value={form.pincode}
            onChangeText={(pincode) => setForm({ ...form, pincode })}
            keyboardType="number-pad"
          />

          <Pressable
            onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
            style={styles.defaultRow}
          >
            <Ionicons
              name={form.isDefault ? 'checkbox' : 'square-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={type.body}>Set as default address</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={handleSave} disabled={pending} style={[styles.saveBtn, pending && styles.disabled]}>
            {pending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Save address</Text>
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
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
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
