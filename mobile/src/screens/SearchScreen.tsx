import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@ecomm/shared/api.types';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { SearchDiscoverGrid } from '@/components/search/SearchDiscoverGrid';
import { QueryState } from '@/components/QueryState';
import { useDiscoverProducts, useSearchProducts, useSearchProviders } from '@/hooks/useCatalog';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/lib/searchHistory';
import type { RootStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>;
type Route = RouteProp<RootStackParamList, 'Search'>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const { history, saveTerm, clearAll } = useSearchHistory();
  const discoverQuery = useDiscoverProducts();
  const productsQuery = useSearchProducts(debouncedQuery);
  const providersQuery = useSearchProviders(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(focusTimer);
  }, []);

  const historyChips = useMemo(
    () => (history.length ? history : [...DEFAULT_SEARCH_SUGGESTIONS]),
    [history]
  );

  const showResults = debouncedQuery.length >= 2;
  const discoverProducts = discoverQuery.data?.items ?? [];

  const openProduct = useCallback(
    (product: Product) => {
      void saveTerm(debouncedQuery || product.name);
      navigation.navigate('MainTabs', {
        screen: 'Categories',
        params: { screen: 'ProductDetail', params: { productId: product.id } },
      });
    },
    [navigation, saveTerm, debouncedQuery]
  );

  async function handleSubmitSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    await saveTerm(trimmed);
  }

  function handleChipPress(term: string) {
    setQuery(term);
    void saveTerm(term);
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenContent style={styles.content}>
        <View style={styles.searchRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <View style={styles.searchInputWrap}>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={colors.mutedLight}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => handleSubmitSearch(query)}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Search history</Text>
            {history.length > 0 ? (
              <Pressable onPress={() => void clearAll()} style={styles.trashBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.chipsWrap}>
            {historyChips.map((term) => (
              <Pressable key={term} style={styles.chip} onPress={() => handleChipPress(term)}>
                <Text style={styles.chipText}>{term}</Text>
              </Pressable>
            ))}
          </View>

          {showResults ? (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap]}>Results</Text>
              {productsQuery.isLoading || providersQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : (
                <>
                  {!productsQuery.data?.items.length && !providersQuery.data?.items.length ? (
                    <Text style={type.caption}>No results for “{debouncedQuery}”</Text>
                  ) : null}
                  {productsQuery.data?.items.length ? (
                    <SearchDiscoverGrid
                      products={productsQuery.data.items}
                      onPressProduct={(product) => {
                        void saveTerm(debouncedQuery);
                        openProduct(product);
                      }}
                    />
                  ) : null}
                  {providersQuery.data?.items.length ? (
                    <View style={styles.providersBlock}>
                      <Text style={type.title}>Services</Text>
                      {providersQuery.data.items.map((provider) => (
                        <Pressable
                          key={provider.id}
                          style={styles.providerRow}
                          onPress={() => {
                            void saveTerm(debouncedQuery);
                            navigation.navigate('MainTabs', {
                              screen: 'Services',
                              params: {
                                screen: 'ServiceProviderDetail',
                                params: { providerId: provider.id },
                              },
                            });
                          }}
                        >
                          <Text style={type.body}>{provider.name}</Text>
                          <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <View style={[styles.sectionHeader, styles.sectionGap]}>
                <Text style={styles.sectionTitle}>Discover</Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate('MainTabs', { screen: 'Categories' })
                  }
                >
                  <Text style={type.link}>View all →</Text>
                </Pressable>
              </View>

              <QueryState
                isLoading={discoverQuery.isLoading}
                isError={discoverQuery.isError}
                error={discoverQuery.error}
              >
                <SearchDiscoverGrid products={discoverProducts} onPressProduct={openProduct} />
              </QueryState>
            </>
          )}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchInputWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.secondary, paddingVertical: 0 },
  clearBtn: { padding: 4 },
  scroll: { paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  sectionGap: { marginTop: 20 },
  trashBtn: { padding: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.gray100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, color: colors.secondary },
  loader: { marginVertical: 24 },
  providersBlock: { marginTop: 20, gap: 8 },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
});
