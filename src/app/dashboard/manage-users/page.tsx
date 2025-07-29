
'use client';
import { UserList } from "@/components/user-list";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ManageUsersPage() {
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Manage Users</h2>
                    <p className="text-muted-foreground mt-2">
                        Add, edit, or remove customer and property provider profiles.
                    </p>
                </div>
                <UserList />
            </div>
        </main>
    );
}
