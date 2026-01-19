//app/providers/AuthProvider.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* --- Types Updated --- */
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  affiliateStatus?: string | null; // ★★★ নতুন ফিল্ড ★★★
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* --- Provider Component --- */
export function AuthProvider({ 
  children, 
  initialUser 
}: { 
  children: ReactNode; 
  initialUser: User 
}) {
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  /* --- 1. Initial User Sync --- */
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  /* --- 2. Session Rehydration --- */
  useEffect(() => {
    const checkSession = async () => {
      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.loggedIn && data.user) {
              setUser(data.user);
            }
          }
        } catch (error) {
          console.error('Session check failed', error);
        }
      }
    };

    checkSession();
  }, []); 

  /* --- Login Function --- */
  const login = (userData: User) => {
    setUser(userData);
    setIsLoading(true);
    
    router.refresh();

    const nextUrl = searchParams.get('next');
    if (nextUrl) {
      router.push(nextUrl);
    } else {
      router.push('/account');
    }
    
    setIsLoading(false);
  };

  /* --- Logout Function --- */
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* --- Custom Hook --- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}