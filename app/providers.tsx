//app/providers.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartProvider } from "../context/CartContext";
import ProgressBar from "../components/ProgressBar";
import { Toaster } from 'react-hot-toast';

// --- AUTH TYPES & CONTEXT ---
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

// --- MAIN PROVIDER COMPONENT ---
type Props = {
  children: ReactNode;
  initialUser: User; // লেআউট থেকে ইউজার ডাটা আসবে
};

export function Providers({ children, initialUser }: Props) {
  // Auth State
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initial User Sync
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  // 2. Session Rehydration (Client Side Check)
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

  // Login Function
  const login = (userData: User) => {
    setUser(userData);
    setIsLoading(true);
    router.refresh();
    
    // রিডাইরেক্ট লজিক (সাসপেন্স এড়ানোর জন্য try-catch বা if চেক)
    const nextUrl = searchParams ? searchParams.get('next') : null;
    if (nextUrl) {
      router.push(nextUrl);
    } else {
      router.push('/account');
    }
    setIsLoading(false);
  };

  // Logout Function
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
        {/* Progress Bar with Suspense inside Provider */}
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        
        <Toaster position="top-center" reverseOrder={false} />
        
        {children}
      </CartProvider>
    </AuthContext.Provider>
  );
}

// --- AUTH HOOK ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within Providers');
  }
  return context;
}