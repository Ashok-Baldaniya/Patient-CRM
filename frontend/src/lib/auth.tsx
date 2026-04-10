import type { PropsWithChildren } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from './api';

const TOKEN_STORAGE_KEY = 'patient-crm-token';

type AuthUser = {
  username: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setIsReady(true);
      return;
    }

    api
      .getCurrentUser()
      .then((response) => {
        setUser(response.user ? { username: response.user.username } : null);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isReady,
      user,
      async login(username: string, password: string) {
        const response = await api.login(username, password);
        window.localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
        setUser(response.user);
      },
      logout() {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}
