'use client';

import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (
    url: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      setState({ data, loading: false, error: null });
      return data as T;
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message });
      return null;
    }
  }, []);

  return {
    ...state,
    fetchData,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}
