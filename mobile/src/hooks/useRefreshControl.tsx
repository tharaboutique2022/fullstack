import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { colors } from '@/theme/styles';

type RefreshableQuery = { refetch: () => Promise<unknown> };

export function useRefreshControl(...queries: RefreshableQuery[]) {
  const [refreshing, setRefreshing] = useState(false);
  const queriesRef = useRef(queries);
  queriesRef.current = queries;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(queriesRef.current.map((query) => query.refetch()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    ),
    [refreshing, onRefresh]
  );

  return { refreshing, onRefresh, refreshControl };
}
