import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthGuardedQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>, 
  deps: any[] = []
) {
  const { isReady, user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isReady) return; // Wait for auth to be definitively ready (even if no user)
    
    if (!user) {
      setFetching(false);
      return; // No user, handle as needed in the component
    }

    let isMounted = true;
    setFetching(true);
    setError(null);

    queryFn()
      .then(({ data, error }) => {
        if (isMounted) {
          if (error) setError(error);
          else setData(data);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, user, ...deps]);

  const refetch = () => {
    if (!isReady || !user) return;
    setFetching(true);
    queryFn().then(({ data, error }) => {
      if (error) setError(error);
      else setData(data);
      setFetching(false);
    });
  };

  return { data, error, fetching, refetch, setData };
}
