
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Sparkles, LogIn, UserCog, User as UserIcon, Truck as TruckIcon, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { HowItWorksSection } from '@/components/how-it-works';
import { NetworkMapSection } from '@/components/network-map';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


function LoginCard() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="fixed top-4 right-4 z-20 w-full max-w-xs">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
        <Card className="shadow-2xl bg-background/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative mt-1">
                            <Building className="h-7 w-7 text-primary" />
                            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold font-headline">
                                <span className="text-accent">WareHouse Origin</span>
                            </CardTitle>
                            <CardDescription>Sourcing Simplified</CardDescription>
                        </div>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </CardHeader>
            <CollapsibleContent>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-0">
                 <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                </div>
                <div className="space-y-2 pt-4">
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
                        <span className="bg-card px-2 text-muted-foreground">
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
              </CardFooter>
            </form>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}


export default function LoginPage() {
  return (
    <div className="flex-grow">
      <LoginCard />
      <main>
        <HowItWorksSection />
        <NetworkMapSection />
      </main>
    </div>
  );
}
