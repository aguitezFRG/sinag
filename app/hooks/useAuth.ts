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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          setState({ user: null, loading: false, error: null });
          return;
        }
        throw new Error('Failed to fetch user');
      }
      const data = await res.json();
      setState({ user: data.user, loading: false, error: null });
    } catch (err: any) {
      setState({ user: null, loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
        throw new Error(data.error || 'Login failed');
      }
      setState({ user: data.user, loading: false, error: null });
      return data.user as User;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
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
        throw new Error(data.error || 'Registration failed');
      }
      setState({ user: data.user, loading: false, error: null });
      return data.user as User;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
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
          throw new Error(data.error || 'Failed to change password');
        }
        setState((s) => ({ ...s, loading: false, error: null }));
      } catch (err: any) {
        setState((s) => ({ ...s, loading: false, error: err.message }));
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
    refresh: fetchUser,
  };
}
