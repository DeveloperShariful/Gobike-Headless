//app/providers/AuthProvider.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* --- Types --- */
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
  // initialUser ব্যবহার করা হচ্ছে যাতে layout.tsx ঠিক থাকে
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  /* --- ১. Initial User Sync (Server Side Data) --- */
  useEffect(() => {
    // যদি সার্ভার থেকে ডাটা আসে, সেটাই সেট হবে
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  /* --- ২. Session Rehydration (Client Side Check) --- */
  // এই অংশটিই আপনার "রিফ্রেশ করলে লগআউট" সমস্যা সমাধান করবে
  useEffect(() => {
    const checkSession = async () => {
      // যদি ইউজার ইতিমধ্যে না থাকে, আমরা API কল করে চেক করব কুকি আছে কি না
      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.loggedIn && data.user) {
              // কুকি থেকে ইউজার পাওয়া গেছে! রিস্টোর করা হচ্ছে...
              setUser(data.user);
            }
          }
        } catch (error) {
          console.error('Session check failed', error);
        }
      }
    };

    checkSession();
  }, []); // এটি অ্যাপ লোড হলে একবার রান হবে

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