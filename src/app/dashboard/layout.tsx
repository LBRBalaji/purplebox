
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

    if (!isLoading && user) {
        const isSuperAdmin = user.role === 'SuperAdmin';
        const isO2OManager = user.role === 'O2O';
        const isCustomer = user.role === 'User';
        const isProvider = user.role === 'Warehouse Developer';
        const isAgent = user.role === 'Agent';

        const isAdmin = isSuperAdmin || isO2OManager;
        
        // Analytics is only for the main admin and O2O.
        if (pathname.startsWith('/dashboard/analytics') && !isAdmin) {
            router.push('/dashboard');
        }
        
        // Redirect non-admins away from user management (only super admin has access)
        if (pathname.startsWith('/dashboard/manage-users') && !isSuperAdmin) {
            router.push('/dashboard');
        }
        
        // Redirect non-admins away from search console (only super admin has access)
        if (pathname.startsWith('/dashboard/search-console') && !isSuperAdmin) {
            router.push('/dashboard');
        }

        // Redirect non-admins/O2O away from listing management
        if (pathname.startsWith('/dashboard/manage-listings') && !isAdmin) {
            router.push('/dashboard');
        }

        // Transactions page is for O2O Managers and all Agents
        if (pathname.startsWith('/dashboard/transactions') && !isO2OManager && !isAgent) {
            router.push('/dashboard');
        }

        // Allow Admins, O2O Managers, Customers, Providers AND Agents to access the leads detail pages
        if (pathname.startsWith('/dashboard/leads') && !isAdmin && !isCustomer && !isProvider && !isAgent) {
            router.push('/dashboard');
        }
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
