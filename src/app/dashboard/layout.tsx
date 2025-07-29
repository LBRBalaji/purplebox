
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';

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
    </>
  );
}
