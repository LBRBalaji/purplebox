// src/app/signup/page.tsx
'use client';

import * as React from 'react';
import { useAuth, type NewUser } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const { signup } = useAuth();
  const [formData, setFormData] = React.useState<NewUser>({
    email: '',
    companyName: '',
    userName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center gap-2 mb-4">
            <div className="relative">
              <Building className="h-10 w-10 text-primary" />
              <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-primary">PropSource AI</h1>
          </div>
          <CardTitle className="text-2xl">Create Customer Account</CardTitle>
          <CardDescription>
            Sign up to start logging your property demands.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Your Company LLC" required onChange={handleChange} value={formData.companyName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input id="userName" placeholder="John Doe" required onChange={handleChange} value={formData.userName} />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" required onChange={handleChange} value={formData.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 234 567 890" required onChange={handleChange} value={formData.phone} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Button>
            <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/" className="underline text-primary">
                    Log In
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
