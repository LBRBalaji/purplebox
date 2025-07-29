
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  email: string;
  role: 'SuperAdmin' | 'User';
  companyName: string;
  userName: string;
  phone: string;
};

// NewUser now includes the role, as the signup form will determine it.
export type NewUser = User;

type AuthContextType = {
  user: User | null;
  login: (email: string, onLoginSuccess?: () => void) => void;
  signup: (details: NewUser) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: { [email: string]: User } = {
  'admin@example.com': { email: 'admin@example.com', role: 'SuperAdmin', companyName: 'Origin Depot', userName: 'Admin', phone: 'N/A' },
  'user@example.com': { email: 'user@example.com', role: 'User', companyName: 'Test Customer Co.', userName: 'Test User', phone: '555-123-4567' },
  'logistics.pro@example.com': { email: 'logistics.pro@example.com', role: 'User', companyName: 'ProLogistics Solutions', userName: 'Sunil Patel', phone: '555-987-6543' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<{ [email: string]: User }>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let storedUsers;
    try {
      // Use localStorage to persist user accounts across sessions
      const usersFromStorage = localStorage.getItem('warehouseorigin_users');
      storedUsers = usersFromStorage ? JSON.parse(usersFromStorage) : {};
    } catch (e) {
      console.error("Could not parse users from localStorage", e);
      storedUsers = {};
    }

    // Merge default users with stored users to ensure defaults are always available
    const mergedUsers = { ...defaultUsers, ...storedUsers };
    setUsers(mergedUsers);
    localStorage.setItem('warehouseorigin_users', JSON.stringify(mergedUsers));


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

  const login = (email: string, onLoginSuccess?: () => void) => {
    const foundUser = users[email.toLowerCase()];
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.push('/dashboard');
      }
    } else {
      alert('This email is not registered. Please sign up.');
    }
  };

  const signup = (details: NewUser) => {
    if (users[details.email.toLowerCase()]) {
      alert("An account with this email already exists. Please log in.");
      return;
    }
    
    const newUsers = { ...users, [details.email.toLowerCase()]: details };
    setUsers(newUsers);
    localStorage.setItem('warehouseorigin_users', JSON.stringify(newUsers));

    // Log the new user in
    setUser(details);
    sessionStorage.setItem('user', JSON.stringify(details));
    router.push('/dashboard');
  }

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
