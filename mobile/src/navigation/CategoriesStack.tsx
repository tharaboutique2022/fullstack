import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShopByCategoryScreen } from '@/screens/ShopByCategoryScreen';
import { CategoryBrowseScreen } from '@/screens/CategoryBrowseScreen';
import { CategoryProductsScreen } from '@/screens/CategoryProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import type { CategoriesStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

export function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopByCategory" component={ShopByCategoryScreen} />
      <Stack.Screen name="CategoryBrowse" component={CategoryBrowseScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
