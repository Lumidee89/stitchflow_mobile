import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ApiError } from '../api/client';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = [], refreshOnFocus = false): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load, tick]);

  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshOnFocus])
  );

  return { data, loading, error, refresh: () => setTick((t) => t + 1) };
}
