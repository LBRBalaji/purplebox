'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  email: string;
  role: 'SuperAdmin' | 'User';
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hardcodedUsers: { [email: string]: User } = {
  'admin@example.com': { email: 'admin@example.com', role: 'SuperAdmin' },
  'user@example.com': { email: 'user@example.com', role: 'User' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
      sessionStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const foundUser = hardcodedUsers[email.toLowerCase()];
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
