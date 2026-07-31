import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServiceCategoriesScreen } from '@/screens/services/ServiceCategoriesScreen';
import { ServiceProvidersScreen } from '@/screens/services/ServiceProvidersScreen';
import { ServiceProviderDetailScreen } from '@/screens/services/ServiceProviderDetailScreen';
import { BookingCheckoutScreen } from '@/screens/services/BookingCheckoutScreen';
import type { ServicesStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceCategories" component={ServiceCategoriesScreen} />
      <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
      <Stack.Screen name="ServiceProviderDetail" component={ServiceProviderDetailScreen} />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
    </Stack.Navigator>
  );
}
