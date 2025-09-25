
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useData } from './data-context';

export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer' | 'Agent';
  plan?: 'Free' | 'Paid_Premium';
  isCompanyAdmin?: boolean;
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string; 
  password?: string; // Made optional for existing users
};

export type NewUser = Omit<User, 'createdAt'> & {
  password: string;
};

type AuthContextType = {
  user: User | null;
  users: { [email: string]: User };
  login: (email: string, password?: string, onLoginSuccess?: () => void) => void;
  signup: (details: NewUser) => void;
  logout: () => void;
  isLoading: boolean;
  addUser: (details: NewUser) => void;
  updateUser: (details: Partial<NewUser> & { email: string }) => void;
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

  const persistUsers = async (updatedUsers: { [email: string]: User }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers),
      });
      if (!response.ok) {
        throw new Error('Failed to persist users');
      }
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving users:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save user data to the server.',
      });
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      if (Object.keys(data).length === 0) {
        const defaultAdmin: User = {
            email: 'admin@example.com',
            password: 'password', // Default password for initial admin
            role: 'SuperAdmin',
            isCompanyAdmin: true,
            companyName: 'Admin Corp',
            userName: 'Default Admin',
            phone: 'N/A',
            createdAt: new Date().toISOString()
        };
        const initialUsers = { [defaultAdmin.email]: defaultAdmin };
        await persistUsers(initialUsers);
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users, starting with default admin if empty:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    try {
      let anonymousId = sessionStorage.getItem('anonymousId');
      if (!anonymousId) {
        anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('anonymousId', anonymousId);
      }

      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
      sessionStorage.removeItem('user');
    }
  }, [fetchUsers]);

  const login = (email: string, password?: string, onLoginSuccess?: () => void) => {
    const foundUser = users[email.toLowerCase()];
    
    if (foundUser && (!foundUser.password || foundUser.password === password)) {
      setUser(foundUser);
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        let redirectPath = '/dashboard';
        if (foundUser.role === 'User') {
          redirectPath = '/dashboard?tab=my-transactions';
        } else if (foundUser.role === 'Warehouse Developer') {
          redirectPath = '/dashboard?tab=registered-leads';
        }
        router.push(redirectPath);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      })
    }
  };

  const signup = (details: NewUser) => {
    const email = details.email.toLowerCase();
    const companyName = details.companyName.toLowerCase();
    const emailDomain = email.split('@')[1];

    if (personalEmailDomains.includes(emailDomain)) {
        toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Please sign up using your official company email ID. Personal email addresses are not permitted.",
        });
        return;
    }

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
    
    const newUser: User = { 
        ...details, 
        isCompanyAdmin: false,
        createdAt: new Date().toISOString() 
    };

    addUser(newUser);

    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    router.push('/dashboard');
  }

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    // We keep the anonymousId in case they log back in during the same session
    router.push('/');
  };

  const addUser = async (details: NewUser) => {
    if (users[details.email.toLowerCase()]) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An account with this email already exists.",
      })
      return;
    }
    const newUser: User = {
        ...details,
        createdAt: new Date().toISOString()
    };
    const newUsers = { ...users, [details.email.toLowerCase()]: newUser };
    await persistUsers(newUsers);
  };
  
  const updateUser = async (details: Partial<NewUser> & { email: string }) => {
    const emailLower = details.email.toLowerCase();
    const existingUser = users[emailLower];
    if (!existingUser) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Cannot update a non-existent user.",
      })
      return;
    }

    // Create a new object for the updated user
    const updatedUser: User = {
      ...existingUser,
      ...details,
    };

    // If a new password is not provided, keep the old one
    if (!details.password) {
      updatedUser.password = existingUser.password;
    }

    const newUsers = { ...users, [emailLower]: updatedUser };
    await persistUsers(newUsers);

    if (user?.email === emailLower) {
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = async (email: string) => {
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
    await persistUsers(newUsers);

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
