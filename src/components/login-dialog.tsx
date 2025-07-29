
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, LogIn, UserCog, User as UserIcon, Truck as TruckIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


export function LoginDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    onOpenChange(false);
  };

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
                      Login to <span className="text-accent">WareHouse Origin</span>
                  </DialogTitle>
                  <DialogDescription>Enter your email to sign in.</DialogDescription>
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
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In with Email
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
                    Or use a test account
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
                <Button type="button" variant="outline" onClick={() => login('admin@example.com')}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Property Provider
                </Button>
                <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" onClick={() => login('user@example.com')}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Customer
                    </Button>
                    <Button type="button" variant="outline" onClick={() => login('logistics.pro@example.com')}>
                        <TruckIcon className="mr-2 h-4 w-4" />
                        Logistics Pro
                    </Button>
                </div>
            </div>

            <div className="text-sm text-center text-muted-foreground pt-2">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline text-primary">
                    Sign Up
                </Link>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
