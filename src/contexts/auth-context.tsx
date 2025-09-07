
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer';
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string; // Added createdAt
};

// NewUser now includes the role, as the signup form will determine it.
export type NewUser = Omit<User, 'createdAt'>;

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

const personalEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'live.com', 'msn.com', 'protonmail.com'
];

const competitorKeywords = [
    'realtor', 'realty', 'real estate', 'cbre', 'jll', 'knightfrank', 'savils', 'hrr', 'hanu reddy', 'consulting', 'consultant'
];


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

       // If no users exist, create a default admin user
      if (Object.keys(storedUsers).length === 0) {
          const defaultAdmin: User = {
              email: 'admin@example.com',
              role: 'SuperAdmin',
              companyName: 'Admin Corp',
              userName: 'Default Admin',
              phone: 'N/A',
              createdAt: new Date().toISOString()
          };
          storedUsers = { [defaultAdmin.email]: defaultAdmin };
          localStorage.setItem('warehouseorigin_users', JSON.stringify(storedUsers));
          console.log("No users found. Created default admin account.");
      }

    } catch (e) {
      console.error("Could not parse users from localStorage", e);
      storedUsers = {};
    }

    setUsers(storedUsers);
    
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
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "This email is not registered. Please sign up.",
      })
    }
  };

  const signup = (details: NewUser) => {
    const email = details.email.toLowerCase();
    const companyName = details.companyName.toLowerCase();
    const emailDomain = email.split('@')[1];

    // 1. Check for personal email domains
    if (personalEmailDomains.includes(emailDomain)) {
        toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Please sign up using your official company email ID. Personal email addresses are not permitted.",
        });
        return;
    }

    // 2. Check for competitor keywords
    const searchString = `${email} ${companyName}`;
    const foundKeyword = competitorKeywords.find(keyword => searchString.includes(keyword));
    if (foundKeyword) {
        toast({
            variant: "destructive",
            title: "Registration Not Permitted",
            description: "Based on your details, please register as an Agent Partner through the Agent Signup page.",
            duration: 8000,
        });
        router.push('/agent-signup');
        return;
    }

    // 3. Add user if validation passes
    const newUserWithTimestamp: User = { ...details, createdAt: new Date().toISOString() };
    addUser(newUserWithTimestamp);

    // Log the new user in
    setUser(newUserWithTimestamp);
    sessionStorage.setItem('user', JSON.stringify(newUserWithTimestamp));
    router.push('/dashboard');
  }

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const addUser = (details: NewUser) => {
    if (users[details.email.toLowerCase()]) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An account with this email already exists.",
      })
      return;
    }
    const newUserWithTimestamp: User = { ...details, createdAt: new Date().toISOString() };
    const newUsers = { ...users, [details.email.toLowerCase()]: newUserWithTimestamp };
    persistUsers(newUsers);
  };
  
  const updateUser = (details: NewUser) => {
    const existingUser = users[details.email.toLowerCase()];
    if (!existingUser) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Cannot update a non-existent user.",
      })
      return;
    }
    const updatedUser: User = { ...existingUser, ...details };
    const newUsers = { ...users, [details.email.toLowerCase()]: updatedUser };
    persistUsers(newUsers);

    // If the updated user is the currently logged-in user, update session storage as well
    if (user?.email === details.email) {
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (email: string) => {
    if (email === 'admin@example.com') {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "The admin account cannot be deleted.",
        });
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
