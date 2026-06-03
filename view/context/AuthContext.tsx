'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  storeAuth,
  type User,
} from '@/lib/auth';
import { ROLE_HOME } from '@/lib/constants';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    const token = getAccessToken();
    if (stored && token) setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/auth/login', { email, password });
      const { user: loggedIn, accessToken, refreshToken } = data.data;
      storeAuth(loggedIn, accessToken, refreshToken);
      setUser(loggedIn);
      toast.success('Login successful');
      router.push(ROLE_HOME[loggedIn.role as keyof typeof ROLE_HOME] || '/login');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // still clear local session
    }
    clearAuth();
    setUser(null);
    toast.success('Logged out');
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
