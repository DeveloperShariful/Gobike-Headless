//app/providers.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartProvider } from "../context/CartContext";
import ProgressBar from "../components/ProgressBar";
import { Toaster } from 'react-hot-toast';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  affiliateStatus?: string | null;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
  initialUser: User; 
};

export function Providers({ children, initialUser }: Props) {
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

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

  const login = (userData: User) => {
    setUser(userData);
    setIsLoading(true);
    router.refresh();
    
    const nextUrl = searchParams ? searchParams.get('next') : null;
    if (nextUrl) {
      router.push(nextUrl);
    } else {
      router.push('/account');
    }
    setIsLoading(false);
  };

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
      <CartProvider>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        
        <Toaster position="top-center" reverseOrder={false} />
        
        {children}
      </CartProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within Providers');
  }
  return context;
}