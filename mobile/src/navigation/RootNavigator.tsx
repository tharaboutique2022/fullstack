import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from '@/navigation/MainTabs';
import { SearchScreen } from '@/screens/SearchScreen';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
