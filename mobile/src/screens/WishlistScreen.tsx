import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@ecomm/shared/api.types';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { ProductGrid } from '@/components/product/ProductCard';
import { QueryState } from '@/components/QueryState';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Wishlist'>;

export function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuthSession();
  const wishlistQuery = useWishlist(isAuthenticated);
  const { refreshControl } = useRefreshControl(wishlistQuery);
  const products = (wishlistQuery.data ?? []).map((item) => item.product);

  function openProduct(product: Product) {
    navigation.getParent()?.navigate('Categories', {
      screen: 'ProductDetail',
      params: { productId: product.id },
    });
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>Wishlist</Text>
          <View style={styles.backBtn} />
        </View>

        <QueryState
          isLoading={wishlistQuery.isLoading}
          isError={wishlistQuery.isError}
          error={wishlistQuery.error}
          isEmpty={!wishlistQuery.data?.length}
          emptyMessage="Your wishlist is empty. Tap the heart on products you love."
        >
          <ScrollView contentContainerStyle={styles.list} refreshControl={refreshControl}>
            <ProductGrid products={products} onPressProduct={openProduct} />
          </ScrollView>
        </QueryState>
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
  list: { paddingBottom: 100 },
});
