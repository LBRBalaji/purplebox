'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, LogIn, UserCog, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex flex-col items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Building className="h-10 w-10 text-primary" />
                <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
              </div>
              <h1 className="text-3xl font-bold font-headline text-primary">Origin Depot</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lease Properties, Sourced On Demand</p>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email or use a test account to sign in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In with Email
            </Button>
            
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or use a test account
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <Button type="button" variant="outline" onClick={() => login('admin@example.com')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Property Provider
                </Button>
                <Button type="button" variant="outline" onClick={() => login('user@example.com')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Demand Customer
                </Button>
            </div>

            <div className="text-sm text-center text-muted-foreground pt-2">
                Don&apos;t have a customer account?{' '}
                <Link href="/signup" className="underline text-primary">
                    Sign Up
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
