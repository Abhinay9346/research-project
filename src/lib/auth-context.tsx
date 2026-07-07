import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Role, User } from './types';
import api from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'rsms_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, _role: Role): Promise<boolean> => {
    try {
      const response: any = await api.post('/auth/login', { email, password: _password });
      if (response?.success && response?.user) {
        const loggedIn = {
          id: response.user.id,
          name: response.user.full_name,
          email: response.user.email,
          role: response.user.role as Role,
          department: response.user.department || '',
          scholarId: response.user.scholar_id,
          guideName: response.user.guide_name,
          researchDomain: response.user.research_domain,
        };
        setUser(loggedIn);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
