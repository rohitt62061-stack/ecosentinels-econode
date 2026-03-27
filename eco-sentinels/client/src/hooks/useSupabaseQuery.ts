import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFromCache, saveToCache } from '../lib/offlineCache';

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<SupabaseResponse<T>>,
  cacheKey: string,
  deps: any[] = []
) {
  const { isReady } = useAuth();
  const [data, setData] = useState<T | null>(() => getFromCache(cacheKey));
  const [loading, setLoading] = useState(!data);

  const fetchData = async () => {
    if (!isReady) return;
    try {
      const { data, error } = await queryFn();
      if (!error && data) {
        setData(data);
        saveToCache(cacheKey, data);
      }
    } catch (err) {
      console.error(`Offline Cache Fallback for ${cacheKey}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isReady, cacheKey, ...deps]);

  return { data, loading, refetch: fetchData };
}
