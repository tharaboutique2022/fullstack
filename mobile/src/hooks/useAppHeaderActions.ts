import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { formatAddress } from '@ecomm/shared';
import { useDefaultAddress } from '@/hooks/useAddresses';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { RootTabParamList } from '@/navigation/types';

const FALLBACK_LOCATION = 'Chennai, Tamil Nadu';

export function useAppHeaderActions() {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { isAuthenticated } = useAuthSession();
  const defaultAddressQuery = useDefaultAddress(isAuthenticated);

  const locationLabel = defaultAddressQuery.data
    ? formatAddress(defaultAddressQuery.data)
    : FALLBACK_LOCATION;

  function onNotificationsPress() {
    if (!isAuthenticated) {
      navigation.navigate('Account', { screen: 'Login' });
      return;
    }
    navigation.navigate('Account', { screen: 'Notifications' });
  }

  function onLocationPress() {
    if (isAuthenticated) {
      navigation.navigate('Account', { screen: 'Addresses' });
      return;
    }
    navigation.navigate('Account', { screen: 'AccountHome' });
  }

  return {
    locationLabel,
    onNotificationsPress,
    onLocationPress,
  };
}
