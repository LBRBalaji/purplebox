'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type DeveloperSubRole = 'Inventory In-Charge' | 'Transaction In-Charge';

export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer' | 'Agent';
  plan?: 'Free' | 'Paid_Premium';
  isCompanyAdmin?: boolean;
  isInternalStaff?: boolean;
  staffRole?: string;
  privileges?: string[];
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  // Developer sub-roles (multi-city / official email developers only)
  developerSubRoles?: DeveloperSubRole[];       // requested at signup
  approvedSubRoles?: DeveloperSubRole[];        // confirmed by Company Admin / SuperAdmin
  subRoleDeactivated?: boolean;                 // Company Admin can deactivate
};

export type NewUser = User & {
  password: string;
  industryType?: string;
  emailNotifications?: boolean;
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
  fetchUsers: () => Promise<void>;
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
        if (userData.status === 'pending') {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Account Pending Verification', description: 'Your account is under review. You will receive an email once your access is activated.' });
          return;
        }
        if (userData.status === 'rejected') {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Account Not Approved', description: 'Your account has not been approved. Please contact support.' });
          return;
        }
        if (userData.status === 'suspended') {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Account Suspended', description: 'Your account has been temporarily suspended. Please contact balaji@lakshmibalajio2o.com.' });
          return;
        }
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
    const isPersonalEmail = personalEmailDomains.includes(emailDomain);

    // Block duplicate registration and cross-role registration
    const existingUser = (users || {})[email] as any;
    if (existingUser) {
      const existingRole = existingUser.role;
      if (existingRole === details.role) {
        toast({ variant: 'destructive', title: 'Account Already Exists', description: 'An account with this email already exists. Please login instead.' });
      } else {
        const roleLabel = (r: string) => r === 'Warehouse Developer' ? 'Property Developer' : r === 'User' ? 'Customer' : r;
        toast({ variant: 'destructive', title: 'Email Already Registered', description: `This email is already registered as a ${roleLabel(existingRole)}. Cross-role registration is not permitted.` });
      }
      return;
    }

    // Developers may use personal email — block only for Customer/Agent roles
    if (details.role !== 'Warehouse Developer' && isPersonalEmail) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please use your official company email.' });
      return;
    }

    // Identity verification — GST/PAN rules
    // Developer + personal email: mandatory. Customer + personal email: optional but validated if provided. Agent: not collected.
    const gst = (details as any).gstNumber?.trim().toUpperCase() || '';
    const pan = (details as any).panNumber?.trim().toUpperCase() || '';
    const existingUsers = Object.values(users || {}) as any[];

    if (details.role === 'Warehouse Developer' && isPersonalEmail) {
      if (!gst && !pan) {
        toast({ variant: 'destructive', title: 'GST or PAN Required', description: 'Personal email accounts must provide a GST number or PAN to register as a Property Developer.' });
        return;
      }
    }

    // Validate format if provided (Developer or Customer)
    if (details.role !== 'Agent') {
      if (gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
        toast({ variant: 'destructive', title: 'Invalid GST Number', description: 'GST number must be 15 characters in valid format (e.g. 29ABCDE1234F1Z5).' });
        return;
      }
      if (!gst && pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        toast({ variant: 'destructive', title: 'Invalid PAN Number', description: 'PAN must be 10 characters (e.g. ABCDE1234F).' });
        return;
      }
      if (gst && existingUsers.some(u => u.gstNumber?.toUpperCase() === gst)) {
        toast({ variant: 'destructive', title: 'GST Already Registered', description: 'An account with this GST number already exists. Please login or contact support.' });
        return;
      }
      if (!gst && pan && existingUsers.some(u => u.panNumber?.toUpperCase() === pan)) {
        toast({ variant: 'destructive', title: 'PAN Already Registered', description: 'An account with this PAN number already exists. Please login or contact support.' });
        return;
      }
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
      const newUser: User = { ...details, email, isCompanyAdmin: false, status: 'pending', createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', email), newUser);
      // Sign out immediately — user must wait for SuperAdmin approval before accessing dashboard
      await signOut(auth);
      setUser(null);
      toast({ title: 'Registration Submitted', description: 'Your account is pending approval. You will receive an email once activated by our team.' });
      router.push('/');
    } catch (error) {
      const errMsg = (error as any)?.code === 'auth/email-already-in-use' ? 'This email is already registered. Please login instead.' : (error as any)?.code === 'auth/invalid-email' ? 'Invalid email address.' : (error as any)?.code === 'auth/weak-password' ? 'Password is too weak. Use at least 6 characters.' : 'Could not create account. Please try again.'; toast({ variant: 'destructive', title: 'Signup Failed', description: errMsg });
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
      const newUser: User = { ...details, email, status: 'pending', createdAt: new Date().toISOString() };
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
    <AuthContext.Provider value={{ user, users, login, signup, logout, isLoading, addUser, updateUser, deleteUser, fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}