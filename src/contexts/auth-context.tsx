
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
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
  users: { [email: string]: User };
  login: (email: string, onLoginSuccess?: () => void) => void;
  signup: (details: NewUser) => void;
  logout: () => void;
  isLoading: boolean;
  addUser: (details: NewUser) => void;
  updateUser: (details: NewUser) => void;
  deleteUser: (email: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: { [email: string]: User } = {
  'admin@example.com': { email: 'admin@example.com', role: 'SuperAdmin', companyName: 'Origin Depot', userName: 'Admin', phone: 'N/A' },
  'user@example.com': { email: 'user@example.com', role: 'User', companyName: 'Test Customer Co.', userName: 'Test User', phone: '555-123-4567' },
  'logistics.pro@example.com': { email: 'logistics.pro@example.com', role: 'User', companyName: 'ProLogistics Solutions', userName: 'Sunil Patel', phone: '555-987-6543' },
  'provider@example.com': { email: 'provider@example.com', role: 'SuperAdmin', companyName: 'Prime Properties', userName: 'Anil Kumar', phone: '555-111-2222' },
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

  const persistUsers = (updatedUsers: { [email: string]: User }) => {
    setUsers(updatedUsers);
    localStorage.setItem('warehouseorigin_users', JSON.stringify(updatedUsers));
  }

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
    addUser(details);
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

  const addUser = (details: NewUser) => {
    if (users[details.email.toLowerCase()]) {
      alert("An account with this email already exists.");
      return;
    }
    const newUsers = { ...users, [details.email.toLowerCase()]: details };
    persistUsers(newUsers);
  };
  
  const updateUser = (details: NewUser) => {
    if (!users[details.email.toLowerCase()]) {
      alert("Cannot update a non-existent user.");
      return;
    }
    const newUsers = { ...users, [details.email.toLowerCase()]: details };
    persistUsers(newUsers);

    // If the updated user is the currently logged-in user, update session storage as well
    if (user?.email === details.email) {
      setUser(details);
      sessionStorage.setItem('user', JSON.stringify(details));
    }
  };

  const deleteUser = (email: string) => {
    if (email === 'admin@example.com') {
        alert("The main admin account cannot be deleted.");
        return;
    }
    const newUsers = { ...users };
    delete newUsers[email.toLowerCase()];
    persistUsers(newUsers);

    if (user?.email === email) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, login, signup, logout, isLoading, addUser, updateUser, deleteUser }}>
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
