
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, LogIn } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


export function LoginDialog({ isOpen, onOpenChange, onLoginSuccess }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onLoginSuccess?: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, () => {
        onOpenChange(false);
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    }); 
  };
  
  const handleTestUserLogin = (testEmail: string) => {
    login(testEmail, "password", () => {
        onOpenChange(false);
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                  <Building className="h-7 w-7 text-primary" />
                  <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
              </div>
              <div>
                  <DialogTitle className="text-xl font-bold font-headline">
                      Login to <span className="text-primary">Lakshmi Balaji O2O</span>
                  </DialogTitle>
                  <DialogDescription>Enter your email and password to sign in.</DialogDescription>
              </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </div>
        </form>
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>

            <div className="text-sm text-center text-muted-foreground pt-2 space-y-2">
                <div>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="underline text-primary" onClick={() => onOpenChange(false)}>
                        Sign Up
                    </Link>
                </div>
                 <div>
                    Are you an agent?{' '}
                    <Link href="/agent-signup" className="underline text-primary" onClick={() => onOpenChange(false)}>
                        Register Here
                    </Link>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
