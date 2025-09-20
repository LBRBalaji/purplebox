
// src/app/dashboard/broking-transactions/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ProviderLeads } from '@/components/provider-leads';

export default function BrokingTransactionsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        if (!isAuthLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, hasAccess, router]);

    if (isAuthLoading || !hasAccess) {
        return null; // Or a loading skeleton
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                 <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Broking Transactions</h2>
                    <p className="text-muted-foreground mt-2">
                        Review and manage all leads initiated through the O2O Broking Model.
                    </p>
                </div>
                <ProviderLeads view="broking" />
            </div>
        </main>
    );
}
