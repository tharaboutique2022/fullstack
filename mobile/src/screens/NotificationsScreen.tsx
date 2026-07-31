import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '@ecomm/shared/api.types';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/QueryState';
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Notifications'>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const notificationsQuery = useNotifications(isAuthenticated);
  const unreadQuery = useUnreadNotificationCount(isAuthenticated);
  const markRead = useMarkNotificationRead();
  const { refreshControl } = useRefreshControl(notificationsQuery);

  function openNotification(item: AppNotification) {
    if (!item.readAt) {
      markRead.mutate(item.id);
    }

    if (item.entityType === 'order' && item.entityId) {
      navigation.navigate('OrderDetail', { orderId: item.entityId });
      return;
    }

    if (item.entityType === 'booking' && item.entityId) {
      navigation.navigate('BookingDetail', { bookingId: item.entityId });
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <NotificationsHeader
          unreadCount={0}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={type.body}>Sign in to view notifications.</Text>
          <Button label="Sign in" onPress={() => navigation.navigate('Login')} />
        </View>
      </Screen>
    );
  }

  const unreadCount = unreadQuery.data?.count ?? 0;
  const notifications = notificationsQuery.data ?? [];

  return (
    <Screen edges={['top', 'left', 'right']} style={styles.screen}>
      <NotificationsHeader
        unreadCount={unreadCount}
        onBack={() => navigation.goBack()}
      />

      <QueryState
        isLoading={authLoading || notificationsQuery.isLoading}
        isError={notificationsQuery.isError}
        error={notificationsQuery.error}
        isEmpty={!notifications.length}
        emptyMessage="No notifications yet."
      >
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={refreshControl}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => openNotification(item)} />
          )}
        />
      </QueryState>
    </Screen>
  );
}

function NotificationsHeader({
  unreadCount,
  onBack,
}: {
  unreadCount: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.secondary} />
      </Pressable>
      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <Text style={styles.newCount}>
            {unreadCount} new
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const isUnread = !item.readAt;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-outline" size={20} color={colors.primary} />
      </View>

      <View style={styles.rowContent}>
        <View style={styles.titleLine}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {isUnread ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.rowBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondary,
  },
  newCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedLight,
  },
  list: {
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  rowContent: {
    flex: 1,
    gap: 6,
    paddingRight: 4,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.discount,
  },
  rowBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
});
