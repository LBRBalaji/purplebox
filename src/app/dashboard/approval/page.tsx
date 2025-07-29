
'use client';
import { ApprovalQueue } from "@/components/approval-queue";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ApprovalPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.email === 'admin@example.com' || user?.role === 'O2O';

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
                <ApprovalQueue />
            </div>
        </main>
    );
}
