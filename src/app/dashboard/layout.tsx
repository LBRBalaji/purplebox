
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, LogOut, Sparkles, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
                <div className="relative">
                    <Building className="h-7 w-7 text-primary" />
                    <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-headline text-primary">WareHouse Origin</h1>
                    <p className="text-xs text-muted-foreground">Sourcing Simplified</p>
                </div>
            </Link>
            <nav className="flex items-center gap-4">
                <Link href="/map-search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <Map className="h-4 w-4" /> Map Search
                </Link>
                {user?.role === 'SuperAdmin' && (
                    <Link href="/dashboard/manage-warehouses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Manage Warehouses
                    </Link>
                )}
            </nav>
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
        <div className="flex flex-col min-h-screen">
            <header className="p-4 border-b">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 flex-grow">
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
    <>
      <Header />
      <main className="flex-grow">
        <React.Suspense fallback={
          <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <Skeleton className="h-10 w-full max-w-[500px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-[250px] w-full" />
                  <Skeleton className="h-[250px] w-full" />
                  <Skeleton className="h-[250px] w-full" />
              </div>
            </div>
          </div>
        }>{children}</React.Suspense>
      </main>
    </>
  );
}
