'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, LogIn } from 'lucide-react';

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
          <div className="mx-auto flex items-center gap-2 mb-4">
            <div className="relative">
              <Building className="h-10 w-10 text-primary" />
              <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-primary">PropSource AI</h1>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email to access your dashboard.
            <br />
            <small className="text-xs text-muted-foreground">
              (Use admin@example.com or user@example.com)
            </small>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
