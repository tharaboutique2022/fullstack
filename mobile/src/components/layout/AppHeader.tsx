import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '@/theme/styles';

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  onSearchPress?: () => void;
  searchPlaceholder?: string;
  showLogo?: boolean;
  showLocation?: boolean;
  location?: string;
  onNotificationsPress?: () => void;
  onLocationPress?: () => void;
  unreadCount?: number;
}

export function AppHeader({
  showBack = false,
  onBack,
  onSearchPress,
  searchPlaceholder = 'Search "Tops"',
  showLogo = true,
  showLocation = false,
  location,
  onNotificationsPress,
  onLocationPress,
  unreadCount = 0,
}: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
        ) : showLogo ? (
          <View style={styles.logo}>
            <Ionicons name="flower-outline" size={22} color={colors.primary} />
          </View>
        ) : null}

        <Pressable style={styles.search} onPress={onSearchPress}>
          <Text style={styles.searchText}>{searchPlaceholder}</Text>
          <Ionicons name="search" size={18} color={colors.mutedLight} />
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={onNotificationsPress}>
          <Ionicons name="notifications-outline" size={22} color={colors.secondary} />
          {unreadCount > 0 ? <View style={styles.badge} /> : null}
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onLocationPress}>
          <Ionicons name="location-outline" size={22} color={colors.secondary} />
        </Pressable>
      </View>

      {showLocation && location ? (
        <Pressable style={styles.locationRow} onPress={onLocationPress}>
          <Ionicons name="location-sharp" size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
}

export function SectionHeader({ title, onPress }: SectionHeaderProps) {
  return (
    <Pressable onPress={onPress} style={styles.sectionHeader}>
      <Text style={type.h3}>{title}</Text>
      {onPress ? <Ionicons name="chevron-forward" size={20} color={colors.secondary} /> : null}
    </Pressable>
  );
}

interface GenderTabsProps {
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function GenderTabs({ tabs, activeTab, onChange }: GenderTabsProps) {
  return (
    <View style={styles.tabsRow}>
      {tabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <Pressable key={tab} onPress={() => onChange(tab)} style={styles.tabItem}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            {active ? <View style={styles.tabIndicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
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
  searchText: { flex: 1, fontSize: 14, color: colors.muted },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  locationText: { flex: 1, fontSize: 12, color: colors.secondary },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tabItem: { paddingBottom: 12 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  tabIndicator: {
    marginTop: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
});
