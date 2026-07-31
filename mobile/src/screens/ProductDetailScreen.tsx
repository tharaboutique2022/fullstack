import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { Screen, ScreenContent, screenStyles } from '@/components/layout/Screen';
import { OptionValuePicker } from '@/components/product/OptionValuePicker';
import { PriceBlock } from '@/components/product/PriceBlock';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { ImageCarousel, StickyBuyBar } from '@/components/product/ProductMedia';
import { QueryState } from '@/components/QueryState';
import { useProduct } from '@/hooks/useCatalog';
import { useAddToCart } from '@/hooks/useCart';
import { useAppHeaderActions } from '@/hooks/useAppHeaderActions';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useProductVariantSelection } from '@/hooks/useProductVariantSelection';
import { useToggleWishlist, useWishlistStatus } from '@/hooks/useWishlist';
import { getErrorMessage } from '@/lib/apiClient';
import { addGuestCartLine } from '@/lib/guestCart';
import {
  getProductBrand,
  parsePrice,
  resolveImageUrl,
} from '@/lib/catalog';
import type { CategoriesStackParamList, RootStackParamList, RootTabParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CategoriesStackParamList, 'ProductDetail'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;
type Route = RouteProp<CategoriesStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const productQuery = useProduct(route.params.productId);
  const product = productQuery.data;
  const { isAuthenticated } = useAuthSession();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const wishlistStatusQuery = useWishlistStatus(route.params.productId, isAuthenticated);
  const { onLocationPress, onNotificationsPress } = useAppHeaderActions();
  const unreadQuery = useUnreadNotificationCount(isAuthenticated);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const {
    selectedValueIds,
    selectedVariant,
    selectOptionValue,
    resetSelection,
    displayPrice,
    displayImageUrl,
    isAvailable,
  } = useProductVariantSelection(product);

  const wishlisted = wishlistStatusQuery.data?.wishlisted ?? false;

  useEffect(() => {
    resetSelection();
    setCartMessage(null);
  }, [product?.id, resetSelection]);

  const images = useMemo(() => {
    if (!product) return [];
    const primary = resolveImageUrl(displayImageUrl ?? product.imageUrl);
    const extras = (product.variants ?? [])
      .map((variant) => variant.imageUrl)
      .filter((url): url is string => !!url)
      .map((url) => resolveImageUrl(url));
    const unique = [primary, ...extras].filter((url, index, list) => list.indexOf(url) === index);
    return unique.length ? unique : [primary];
  }, [product, displayImageUrl]);

  const price = parsePrice(displayPrice);

  function requireAuthForCheckout(): boolean {
    if (isAuthenticated) return true;
    navigation.navigate('Account', { screen: 'Login' });
    return false;
  }

  function validateSelection(): boolean {
    if (!product) return false;
    if (product.hasVariants && !selectedVariant) {
      Alert.alert('Select options', 'Please choose all product options before adding to cart.');
      return false;
    }
    if (!isAvailable) {
      Alert.alert('Unavailable', 'This product is currently out of stock.');
      return false;
    }
    return true;
  }

  async function handleToggleWishlist() {
    if (!product) return;
    if (!isAuthenticated) {
      navigation.navigate('Account', { screen: 'Login' });
      return;
    }

    try {
      await toggleWishlist.mutateAsync({ productId: product.id, wishlisted });
    } catch (error) {
      Alert.alert('Wishlist', getErrorMessage(error));
    }
  }

  async function handleAddToCart(goToCart = false) {
    if (!product || !validateSelection()) return;

    setCartMessage(null);

    if (!isAuthenticated) {
      try {
        await addGuestCartLine({
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          productName: product.name,
          variantTitle: selectedVariant?.title ?? null,
          unitPrice: displayPrice ?? product.price,
          imageUrl: displayImageUrl ?? product.imageUrl,
          quantity: 1,
        });
        if (goToCart) {
          navigation.navigate('Cart');
        } else {
          setCartMessage('Added to cart');
        }
      } catch (error) {
        Alert.alert('Could not add to cart', getErrorMessage(error));
      }
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        quantity: 1,
      });
      if (goToCart) {
        navigation.navigate('Cart');
      } else {
        setCartMessage('Added to cart');
      }
    } catch (error) {
      Alert.alert('Could not add to cart', getErrorMessage(error));
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenContent style={screenStyles.noPx}>
        <View style={styles.header}>
          <AppHeader
            showBack
            onBack={() => navigation.goBack()}
            showLogo={false}
            searchPlaceholder="Search"
            onSearchPress={() => navigation.navigate('Search')}
            onNotificationsPress={onNotificationsPress}
            onLocationPress={onLocationPress}
            unreadCount={unreadQuery.data?.count ?? 0}
          />
        </View>

        <QueryState
          isLoading={productQuery.isLoading}
          isError={productQuery.isError}
          error={productQuery.error}
          isEmpty={!productQuery.isLoading && !productQuery.isError && !product}
          emptyMessage="Product not found"
        >
          {product ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[screenStyles.scrollContentTight, styles.content]}
              >
                <ImageCarousel images={images} />

                <View style={styles.titleRow}>
                  <View style={styles.titleCol}>
                    <Text style={type.h2}>{getProductBrand(product)}</Text>
                    <Text style={type.caption}>{product.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => void handleToggleWishlist()}
                    style={styles.wishlistBtn}
                    disabled={toggleWishlist.isPending}
                  >
                    <Ionicons
                      name={wishlisted ? 'heart' : 'heart-outline'}
                      size={24}
                      color={wishlisted ? colors.primary : colors.secondary}
                    />
                  </Pressable>
                </View>

                <PriceBlock price={price} size="lg" showTaxNote />
                {cartMessage ? <Text style={styles.added}>{cartMessage}</Text> : null}
                {!isAvailable && product.hasVariants ? (
                  <Text style={styles.stockNote}>Select all options to check availability</Text>
                ) : null}
                {product.stockStatus === 'out_of_stock' && !product.hasVariants ? (
                  <Text style={styles.outOfStock}>Out of stock</Text>
                ) : null}

                {product.description ? (
                  <Text style={styles.description}>{product.description}</Text>
                ) : null}

                {product.options?.map((option) => (
                  <View key={option.id} style={styles.section}>
                    <Text style={type.title}>{option.name}</Text>
                    <OptionValuePicker
                      values={option.values}
                      selectedId={selectedValueIds[option.id]}
                      onSelect={(value) => selectOptionValue(option.id, value.id)}
                    />
                  </View>
                ))}

                <ProductReviewsSection productId={product.id} />
              </ScrollView>

              <StickyBuyBar
                price={price}
                onAddToCart={() => handleAddToCart(false)}
                onBuyNow={() => {
                  if (!requireAuthForCheckout()) return;
                  void handleAddToCart(true);
                }}
              />
            </>
          ) : null}
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16 },
  content: { paddingHorizontal: 16, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleCol: { flex: 1, gap: 4 },
  wishlistBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  description: { fontSize: 14, lineHeight: 24, color: colors.muted },
  section: { gap: 8 },
  stockNote: { fontSize: 12, color: colors.muted },
  outOfStock: { fontSize: 14, fontWeight: '600', color: colors.danger },
  added: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
