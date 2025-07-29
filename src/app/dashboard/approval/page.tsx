
'use client';
import { ApprovalQueue } from "@/components/approval-queue";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ApprovalPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && user?.email !== 'admin@example.com') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);
    
    if (isLoading || user?.email !== 'admin@example.com') {
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
