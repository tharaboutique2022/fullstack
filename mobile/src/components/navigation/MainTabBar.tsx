import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/styles';

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabConfig: Record<string, { label: string; icon: TabIconName; activeIcon: TabIconName }> = {
  Home: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  Categories: { label: 'Categories', icon: 'grid-outline', activeIcon: 'grid' },
  Services: { label: 'Services', icon: 'brush-outline', activeIcon: 'brush' },
  Cart: { label: 'Cart', icon: 'cart-outline', activeIcon: 'cart' },
  Account: { label: 'Account', icon: 'person-outline', activeIcon: 'person' },
};

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = tabConfig[route.name] ?? tabConfig.Home;
          const iconColor = focused ? colors.primary : colors.muted;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
            >
              <Ionicons name={focused ? config.activeIcon : config.icon} size={22} color={iconColor} />
              <Text style={[styles.label, focused && styles.labelActive]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tab: { minWidth: 64, alignItems: 'center', gap: 4 },
  label: { fontSize: 11, fontWeight: '500', color: colors.muted },
  labelActive: { color: colors.primary },
});
