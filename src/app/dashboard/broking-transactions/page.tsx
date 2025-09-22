// src/app/dashboard/broking-transactions/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

// This page is being deprecated as its functionality is now integrated into the main dashboard.
// Redirecting to the main dashboard with the correct tab.
export default function BrokingTransactionsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        if (!isAuthLoading) {
            // Redirect all relevant users to the new primary broking desk view
            router.replace('/dashboard?tab=broking-desk');
        }
    }, [user, isAuthLoading, hasAccess, router]);

    return null; // Render nothing as we are redirecting
}
