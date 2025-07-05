'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Building, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Building className="h-7 w-7 text-primary" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
          </div>
          <h1 className="text-xl font-bold font-headline text-primary">PropSource AI</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
        <div className="min-h-screen bg-background">
            <header className="p-4 border-b">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                   <Skeleton className="h-10 w-1/3" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-[400px] w-full" />
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
    </div>
  );
}
