import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, ScreenContent, screenStyles } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { logout } from '@/hooks/useAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { AccountStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

const menuItems: {
  label: string;
  route?: keyof AccountStackParamList;
  requiresAuth?: boolean;
}[] = [
  { label: 'My Orders', route: 'MyOrders', requiresAuth: true },
  { label: 'Wishlist', route: 'Wishlist', requiresAuth: true },
  { label: 'Services Booked', route: 'ServicesBooked', requiresAuth: true },
  { label: 'Notifications', route: 'Notifications', requiresAuth: true },
  { label: 'Addresses', route: 'Addresses', requiresAuth: true },
  { label: 'Change Password', route: 'ChangePassword', requiresAuth: true },
  { label: 'Privacy & Terms', route: 'Policy' },
  { label: 'Help & Support', route: 'HelpSupport' },
];

type Nav = NativeStackNavigationProp<AccountStackParamList, 'AccountHome'>;

export function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuthSession();

  async function handleSignOut() {
    await logout(queryClient);
  }

  function openMenuItem(route: keyof AccountStackParamList) {
    switch (route) {
      case 'MyOrders':
        navigation.navigate('MyOrders');
        break;
      case 'Wishlist':
        navigation.navigate('Wishlist');
        break;
      case 'ServicesBooked':
        navigation.navigate('ServicesBooked');
        break;
      case 'Notifications':
        navigation.navigate('Notifications');
        break;
      case 'Addresses':
        navigation.navigate('Addresses');
        break;
      case 'ChangePassword':
        navigation.navigate('ChangePassword');
        break;
      case 'Policy':
        navigation.navigate('Policy');
        break;
      case 'HelpSupport':
        navigation.navigate('HelpSupport');
        break;
      default:
        break;
    }
  }

  return (
    <Screen>
      <ScreenContent>
        <ScrollView contentContainerStyle={screenStyles.scrollContent}>
          <Pressable
            style={styles.profile}
            onPress={() => {
              if (isAuthenticated) navigation.navigate('EditProfile');
            }}
            disabled={!isAuthenticated}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>
            {isLoading ? (
              <Text style={type.caption}>Loading...</Text>
            ) : isAuthenticated && user ? (
              <>
                <Text style={type.h2}>{user.name}</Text>
                <Text style={type.caption}>{user.email}</Text>
                {user.phone ? <Text style={type.caption}>{user.phone}</Text> : null}
                <Text style={type.link}>Edit profile</Text>
              </>
            ) : (
              <>
                <Text style={type.h2}>Guest</Text>
                <Text style={type.caption}>Welcome to Thara Boutique</Text>
              </>
            )}
          </Pressable>

          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                if (!item.route) return;
                if (item.requiresAuth && !isAuthenticated) {
                  navigation.navigate('Login');
                  return;
                }
                openMenuItem(item.route);
              }}
            >
              <Text style={type.title}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
            </Pressable>
          ))}

          {isAuthenticated ? (
            <Button label="Sign out" variant="primary" onPress={handleSignOut} />
          ) : (
            <Button
              label="Sign in"
              variant="primary"
              onPress={() => navigation.navigate('Login')}
            />
          )}
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
});
