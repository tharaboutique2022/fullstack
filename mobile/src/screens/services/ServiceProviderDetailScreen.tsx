import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { BookNowBar } from '@/components/services/BookNowBar';
import { PackageCard } from '@/components/services/PackageCard';
import { useServiceProvider } from '@/hooks/useCatalog';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  formatInr,
  formatRating,
  getProviderHeroImage,
  getProviderLocationLine,
  parsePrice,
} from '@/lib/catalog';
import type { RootTabParamList, ServicesStackParamList } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, type } from '@/theme/styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ServicesStackParamList, 'ServiceProviderDetail'>,
  BottomTabNavigationProp<RootTabParamList>
>;
type Route = RouteProp<ServicesStackParamList, 'ServiceProviderDetail'>;

export function ServiceProviderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const providerQuery = useServiceProvider(route.params.providerId);
  const provider = providerQuery.data;
  const { isAuthenticated } = useAuthSession();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const selectedPackage = useMemo(
    () => provider?.packages?.find((pkg) => pkg.id === selectedPackageId) ?? null,
    [provider?.packages, selectedPackageId]
  );

  const stickyPrice = selectedPackage
    ? formatInr(parsePrice(selectedPackage.priceMin))
    : provider
      ? `~${formatInr(parsePrice(provider.priceFrom))}`
      : '';

  function handleBookNow() {
    if (!provider || !selectedPackage) return;
    if (!isAuthenticated) {
      navigation.navigate('Account', { screen: 'Login' });
      return;
    }
    navigation.navigate('BookingCheckout', {
      providerId: provider.id,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: selectedPackage.priceMin,
    });
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.flex}>
        <QueryState
          isLoading={providerQuery.isLoading}
          isError={providerQuery.isError}
          error={providerQuery.error}
        >
          {provider ? (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.heroWrap}>
                  <Image
                    source={{ uri: getProviderHeroImage(provider) }}
                    style={styles.hero}
                    contentFit="cover"
                  />
                  <Pressable onPress={() => navigation.goBack()} style={styles.heroBack}>
                    <Ionicons name="arrow-back" size={20} color={colors.secondary} />
                  </Pressable>
                  <View style={styles.heroOverlay}>
                    {provider.audienceTag ? (
                      <Text style={styles.audienceTag}>
                        FOR {provider.audienceTag.toUpperCase()}
                      </Text>
                    ) : null}
                    <Text style={styles.heroTitle}>{provider.name}</Text>
                    <Text style={styles.heroMeta}>
                      {[getProviderLocationLine(provider), stickyPrice].filter(Boolean).join(' • ')}
                    </Text>
                  </View>
                </View>

                <ScreenContent style={styles.content}>
                  <View style={styles.actionRow}>
                    <View style={styles.actionGroup}>
                      <Pressable style={styles.actionBtn}>
                        <Ionicons name="call-outline" size={18} color={colors.primary} />
                        <Text style={styles.actionText}>Call</Text>
                      </Pressable>
                      <Pressable style={styles.actionBtn}>
                        <Ionicons name="share-social-outline" size={18} color={colors.primary} />
                        <Text style={styles.actionText}>Share</Text>
                      </Pressable>
                    </View>
                    <View style={styles.ratingBox}>
                      <Text style={styles.ratingValue}>
                        {provider.rating ? Number(provider.rating).toFixed(1) : '—'}/5
                      </Text>
                      <Text style={styles.ratingCount}>{formatRating(provider)} Ratings</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Packages</Text>
                  {(provider.packages ?? []).map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      selected={pkg.id === selectedPackageId}
                      onSelect={() => setSelectedPackageId(pkg.id)}
                    />
                  ))}
                </ScreenContent>
              </ScrollView>

              {selectedPackage ? (
                <BookNowBar priceLabel={stickyPrice} onBook={handleBookNow} />
              ) : null}
            </>
          ) : null}
        </QueryState>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 24 },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 280, backgroundColor: colors.primarySoft },
  heroBack: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  audienceTag: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 24, fontWeight: '700', color: colors.white },
  heroMeta: { fontSize: 13, color: colors.white },
  content: { paddingTop: 16 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionGroup: { flexDirection: 'row', gap: 20 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { ...type.caption, color: colors.primary, fontWeight: '600' },
  ratingBox: { alignItems: 'flex-end' },
  ratingValue: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  ratingCount: { ...type.caption },
  sectionTitle: { ...type.h3, marginBottom: 12 },
});
