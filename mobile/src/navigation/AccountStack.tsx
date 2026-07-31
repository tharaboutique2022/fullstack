import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountScreen } from '@/screens/AccountScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { AddressesScreen } from '@/screens/AddressesScreen';
import { AddressFormScreen } from '@/screens/AddressFormScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { ServicesBookedScreen } from '@/screens/ServicesBookedScreen';
import { MyOrdersScreen } from '@/screens/MyOrdersScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { BookingDetailScreen } from '@/screens/BookingDetailScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/screens/ResetPasswordScreen';
import { HelpSupportScreen } from '@/screens/HelpSupportScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { WishlistScreen } from '@/screens/WishlistScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { PolicyScreen } from '@/screens/PolicyScreen';
import { ChangePasswordScreen } from '@/screens/ChangePasswordScreen';
import type { AccountStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountHome" component={AccountScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="ServicesBooked" component={ServicesBookedScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Policy" component={PolicyScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
