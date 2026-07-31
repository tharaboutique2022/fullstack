import { useCallback, useEffect, useState } from 'react';
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
} from '@/lib/searchHistory';

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await getSearchHistory();
    setHistory(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveTerm = useCallback(async (term: string) => {
    const next = await addSearchHistory(term);
    setHistory(next);
    return next;
  }, []);

  const clearAll = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  return { history, loading, refresh, saveTerm, clearAll };
}
