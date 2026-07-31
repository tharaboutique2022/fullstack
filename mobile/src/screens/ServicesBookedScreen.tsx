import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/QueryState';
import { useBookings } from '@/hooks/useBookings';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'ServicesBooked'>;

export function ServicesBookedScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const bookingsQuery = useBookings(isAuthenticated);
  const { refreshControl } = useRefreshControl(bookingsQuery);

  if (!authLoading && !isAuthenticated) {
    return (
      <Screen>
        <ScreenContent>
          <Header onBack={() => navigation.goBack()} />
          <View style={styles.center}>
            <Text style={type.body}>Sign in to view your booked services.</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('Login')} />
          </View>
        </ScreenContent>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenContent>
        <Header onBack={() => navigation.goBack()} />

        <QueryState
          isLoading={authLoading || (bookingsQuery.isLoading && !bookingsQuery.data)}
          isError={bookingsQuery.isError}
          error={bookingsQuery.error}
          isEmpty={!bookingsQuery.data?.length}
          emptyMessage="No services booked yet. Explore services to book your first appointment."
        >
          <FlatList
            data={bookingsQuery.data ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={refreshControl}
            style={styles.flex}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
              />
            )}
          />
        </QueryState>
      </ScreenContent>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={colors.secondary} />
      </Pressable>
      <Text style={type.h3}>Services Booked</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: 14, paddingBottom: 100 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
