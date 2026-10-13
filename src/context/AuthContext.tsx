import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { authApi } from '../api';
import { getToken, setToken as persistToken } from '../api/client';
import type { Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name: string; email: string; phone: string; password: string; password_confirmation: string; role: Role }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  completeInvitation: (session: { user: User; token: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await authApi.me();
          setUser(me);
          if (me.token_expires_at && new Date(me.token_expires_at).getTime()-Date.now()<7*86400000) { const rotated=await authApi.rotateToken(); await persistToken(rotated.token); }
        } catch {
          await persistToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await persistToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register: AuthContextValue['register'] = async (payload) => {
    const res = await authApi.register(payload);
    await persistToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout, clear local session regardless
    }
    await persistToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch {
      return null;
    }
  };

  const completeInvitation = async (session: { user: User; token: string }) => {
    await persistToken(session.token);
    setUser(session.user);
  };

  const value = useMemo(() => ({ user, isLoading, login, register, logout, refreshUser, completeInvitation }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
