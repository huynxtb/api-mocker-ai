import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi, tokenStore } from '../services/api';
import { AuthUser } from '../types';

type AuthStatus = 'loading' | 'no-account' | 'unauthenticated' | 'authenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  hasAccount: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasAccount, setHasAccount] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const statusRes = await authApi.status();
      const accountExists: boolean = statusRes.data.data.hasAccount;
      setHasAccount(accountExists);

      if (!accountExists) {
        setStatus('no-account');
        setUser(null);
        tokenStore.clear();
        return;
      }

      if (!tokenStore.getAccess()) {
        setStatus('unauthenticated');
        setUser(null);
        return;
      }

      try {
        const meRes = await authApi.me();
        setUser(meRes.data.data);
        setStatus('authenticated');
      } catch {
        tokenStore.clear();
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    const { accessToken, refreshToken, user: u } = res.data.data;
    tokenStore.setTokens(accessToken, refreshToken);
    setUser(u);
    setHasAccount(true);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await authApi.register({ username, password });
    const { accessToken, refreshToken, user: u } = res.data.data;
    tokenStore.setTokens(accessToken, refreshToken);
    setUser(u);
    setHasAccount(true);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — still clear tokens locally
    }
    tokenStore.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, hasAccount, login, register, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
