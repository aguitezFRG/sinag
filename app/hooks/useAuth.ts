'use client';

import { useState, useEffect, useCallback } from 'react';
import { encryptAuthPayload, isClientAuthEncryptionReady } from '@/app/utils/auth-crypto';

export type UserRole = 'student' | 'adviser' | 'coordinator' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

async function fetchUserData(): Promise<{ user: User | null; error: string | null }> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        return { user: null, error: null };
      }
      throw new Error('Failed to fetch user');
    }
    const data = await res.json();
    return { user: data.user as User | null, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { user: null, error: message };
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchUserData().then((result) => {
      if (!cancelled) {
        setState({ ...result, loading: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const result = await fetchUserData();
    setState({ ...result, loading: false });
    return result.user;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const shouldRequireEncryption = process.env.NODE_ENV === 'production';
      if (shouldRequireEncryption && !isClientAuthEncryptionReady()) {
        throw new Error('Auth encryption is not configured on this client');
      }

      const authPayload = { email, password };
      const body = isClientAuthEncryptionReady()
        ? { encrypted: true, payload: await encryptAuthPayload(authPayload) }
        : authPayload;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error ?? 'Login failed');
        throw new Error(message);
      }
      setState({ user: data.user, loading: false, error: null });
      return data.user as User;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    studentNumber?: string;
    program?: string;
    department?: string;
    specialization?: string[];
  }) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const shouldRequireEncryption = process.env.NODE_ENV === 'production';
      if (shouldRequireEncryption && !isClientAuthEncryptionReady()) {
        throw new Error('Auth encryption is not configured on this client');
      }

      const body = isClientAuthEncryptionReady()
        ? { encrypted: true, payload: await encryptAuthPayload(payload) }
        : payload;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error ?? 'Registration failed');
        throw new Error(message);
      }
      setState({ user: data.user, loading: false, error: null });
      return data.user as User;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setState({ user: null, loading: false, error: null });
    window.location.href = '/';
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          const message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error ?? 'Failed to change password');
          throw new Error(message);
        }
        setState((s) => ({ ...s, loading: false, error: null }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setState((s) => ({ ...s, loading: false, error: message }));
        throw err;
      }
    },
    []
  );

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    login,
    register,
    logout,
    changePassword,
    clearError,
    refresh,
  };
}
