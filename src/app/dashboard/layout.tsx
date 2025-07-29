
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }
    // Specific check for analytics page
    if (!isLoading && user && pathname.startsWith('/dashboard/analytics') && user.email !== 'admin@example.com') {
      router.push('/dashboard');
    }
     // Specific check for manage warehouses page
    if (!isLoading && user && pathname.startsWith('/dashboard/manage-warehouses') && user.role !== 'SuperAdmin') {
      router.push('/dashboard');
    }
     // Specific check for approval page
    if (!isLoading && user && pathname.startsWith('/dashboard/approval') && user.email !== 'admin@example.com') {
      router.push('/dashboard');
    }
     // Specific check for manage users page
    if (!isLoading && user && pathname.startsWith('/dashboard/manage-users') && user.email !== 'admin@example.com') {
        router.push('/dashboard');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
  }

  return (
    <>
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
