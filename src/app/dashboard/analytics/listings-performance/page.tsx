
'use client';
import { AdminListings } from "@/components/admin-listings";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ListingsPerformancePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        if (!isLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router, hasAccess]);
    
    if (isLoading || !hasAccess) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <AdminListings />
            </div>
        </main>
    );
}
