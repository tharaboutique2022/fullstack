import { useEffect, useState } from 'react';
import { getToken } from '@/lib/authStorage';
import { useMe } from '@/hooks/useAuth';

export function useAuthSession() {
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let active = true;
    getToken().then((token) => {
      if (!active) return;
      setHasToken(Boolean(token));
      setTokenChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const meQuery = useMe(tokenChecked && hasToken);

  return {
    user: meQuery.data,
    isAuthenticated: Boolean(meQuery.data),
    isLoading:
      !tokenChecked ||
      (hasToken && meQuery.isFetching && !meQuery.data && !meQuery.isError),
    refetchUser: meQuery.refetch,
  };
}
