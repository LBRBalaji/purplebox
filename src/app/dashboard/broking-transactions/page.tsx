// src/app/dashboard/broking-transactions/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ProviderLeads } from '@/components/provider-leads';

// This page is being deprecated as its functionality is now integrated into the main dashboard.
// Redirecting to the main dashboard with the correct tab.
export default function BrokingTransactionsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        if (!isAuthLoading) {
            if (hasAccess) {
                router.replace('/dashboard?tab=broking-desk');
            } else {
                router.replace('/dashboard');
            }
        }
    }, [user, isAuthLoading, hasAccess, router]);

    return null; // Render nothing as we are redirecting
}
