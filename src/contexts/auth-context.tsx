'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer' | 'Agent';
  plan?: 'Free' | 'Paid_Premium';
  isCompanyAdmin?: boolean;
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string;
};

export type NewUser = User & {
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

const personalEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'live.com', 'msn.com', 'protonmail.com'];
const competitorKeywords = ['realtor', 'realty', 'real estate', 'cbre', 'jll', 'knightfrank', 'savils', 'hrr', 'hanu reddy', 'consulting', 'consultant'];export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<{ [email: string]: User }>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData: { [email: string]: User } = {};
      snapshot.forEach((doc) => { usersData[doc.id] = doc.data() as User; });
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.email!.toLowerCase()));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        sessionStorage.removeItem('user');
      }
      setIsLoading(false);
    });
    fetchUsers();
    return () => unsubscribe();
  }, [fetchUsers]);const login = async (email: string, password?: string, onLoginSuccess?: () => void) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.toLowerCase(), password!);
      const userDoc = await getDoc(doc(db, 'users', result.user.email!.toLowerCase()));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          let redirectPath = '/dashboard';
          if (userData.role === 'User') redirectPath = '/dashboard?tab=my-transactions';
          else if (userData.role === 'Warehouse Developer') redirectPath = '/dashboard?tab=registered-leads';
          router.push(redirectPath);
        }
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'User profile not found. Please contact admin.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password. Please try again.' });
    }
  };

  const signup = async (details: NewUser) => {
    const email = details.email.toLowerCase();
    const emailDomain = email.split('@')[1];
    if (personalEmailDomains.includes(emailDomain)) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please use your official company email.' });
      return;
    }
    const searchString = email + ' ' + details.companyName.toLowerCase();
    const foundKeyword = competitorKeywords.find(k => searchString.includes(k));
    if (foundKeyword) {
      toast({ variant: 'destructive', title: 'Registration Not Permitted', description: 'Please register as an Agent Partner.', duration: 8000 });
      router.push('/agent-signup');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, details.password);
      const newUser: User = { ...details, email, isCompanyAdmin: false, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', email), newUser);
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      router.push('/dashboard');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'Could not create account. Please try again.' });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };const addUser = async (details: NewUser) => {
    const email = details.email.toLowerCase();
    try {
      await createUserWithEmailAndPassword(auth, email, details.password);
      const newUser: User = { ...details, email, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', email), newUser);
      await fetchUsers();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to add user', description: 'Could not create user account.' });
    }
  };

  const updateUser = async (details: Partial<NewUser> & { email: string }) => {
    const email = details.email.toLowerCase();
    try {
      const { password, ...profileData } = details;
      await updateDoc(doc(db, 'users', email), profileData);
      await fetchUsers();
      if (user?.email === email) {
        const updated = { ...user, ...profileData };
        setUser(updated);
        sessionStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update user.' });
    }
  };

  const deleteUser = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'users', email.toLowerCase()));
      await fetchUsers();
      if (user?.email === email) logout();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete user.' });
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
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}