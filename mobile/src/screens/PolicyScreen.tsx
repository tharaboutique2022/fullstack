import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Policy'>;

export function PolicyScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Privacy & Terms</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={type.h2}>Thara Boutique</Text>
          <Text style={type.caption}>Last updated: July 2026</Text>

          <Text style={type.h3}>Privacy Policy</Text>
          <Text style={type.body}>
            Thara Boutique respects your privacy. We collect your name, email, phone number, and
            delivery addresses to process orders and service bookings. Payment details are handled
            securely by Razorpay and are not stored on our servers.
          </Text>
          <Text style={type.body}>
            We use your contact information to send order updates, booking confirmations, and
            important service notifications. You may request account deletion by contacting our
            support team.
          </Text>

          <Text style={type.h3}>Terms of Service</Text>
          <Text style={type.body}>
            By using Thara Boutique, you agree to provide accurate information during checkout and
            booking. Product prices, availability, and service slots may change without notice.
            Online payment is required for orders and bookings; cash on delivery is not available.
          </Text>
          <Text style={type.body}>
            Cancellations are subject to our cancellation policy. Refunds for eligible cancelled
            orders are processed to the original payment method within 5–7 business days.
          </Text>
          <Text style={type.body}>
            For questions about these policies, reach us via Help & Support in the app.
          </Text>
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
  content: { gap: 12, paddingBottom: 48 },
});
