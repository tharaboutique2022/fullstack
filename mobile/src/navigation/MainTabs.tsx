import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabBar } from '@/components/navigation/MainTabBar';
import { CategoriesStack } from '@/navigation/CategoriesStack';
import type { RootTabParamList } from '@/navigation/types';
import { AccountStack } from '@/navigation/AccountStack';
import { CartStack } from '@/navigation/CartStack';
import { HomeScreen } from '@/screens/HomeScreen';
import { ServicesStack } from '@/navigation/ServicesStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}
