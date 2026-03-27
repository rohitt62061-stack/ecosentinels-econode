import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>, 
  deps: any[] = []
) {
  const { isReady } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await queryFn();
      if (error) setError(error);
      else setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    
    let isMounted = true;
    
    queryFn().then(({ data, error }) => {
      if (isMounted) {
        if (error) setError(error);
        else setData(data);
        setLoading(false);
      }
    }).catch(err => {
      if (isMounted) {
        setError(err);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isReady, ...deps]);

  return { data, error, loading, setData, refetch: fetchData };
}
