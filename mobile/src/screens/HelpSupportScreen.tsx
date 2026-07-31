import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { env } from '@/config/env';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'HelpSupport'>;

const FAQ = [
  {
    q: 'How do I track my order?',
    a: 'Open Account → My Orders and tap your order to see the latest status.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes, from Services Booked → booking details, if the appointment is not today.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Online payment via Razorpay (UPI, cards, net banking). Cash on Delivery is shown but not enabled yet.',
  },
  {
    q: 'How does the courier contact me?',
    a: 'The delivery partner calls the phone number you enter at checkout.',
  },
];

export function HelpSupportScreen() {
  const navigation = useNavigation<Nav>();

  function openPhone() {
    void Linking.openURL(`tel:${env.supportPhone}`);
  }

  function openEmail() {
    void Linking.openURL(`mailto:${env.supportEmail}`);
  }

  function openWhatsApp() {
    void Linking.openURL(`https://wa.me/${env.supportWhatsApp}`);
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Help & Support</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={type.caption}>We're here to help with orders, bookings, and delivery.</Text>

          <View style={styles.actions}>
            <ContactButton icon="call-outline" label="Call us" onPress={openPhone} />
            <ContactButton icon="logo-whatsapp" label="WhatsApp" onPress={openWhatsApp} />
            <ContactButton icon="mail-outline" label="Email" onPress={openEmail} />
          </View>

          <Text style={type.h3}>FAQ</Text>
          {FAQ.map((item) => (
            <View key={item.q} style={styles.faqCard}>
              <Text style={type.title}>{item.q}</Text>
              <Text style={type.body}>{item.a}</Text>
            </View>
          ))}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}

function ContactButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.contactBtn}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.contactText}>{label}</Text>
    </Pressable>
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
  scroll: { gap: 16, paddingBottom: 40 },
  actions: { flexDirection: 'row', gap: 10 },
  contactBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  contactText: { fontSize: 12, fontWeight: '600', color: colors.secondary },
  faqCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 6,
  },
});
