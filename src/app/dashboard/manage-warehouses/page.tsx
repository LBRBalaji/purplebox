
'use client';
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageWarehousesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && user?.role !== 'SuperAdmin') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);
    
    if (isLoading || user?.role !== 'SuperAdmin') {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                 <Card className="text-center p-12">
                    <CardTitle>Feature Deprecated</CardTitle>
                    <CardDescription className="mt-2">
                        Warehouse management is now handled via the "My Listings" tab on the main dashboard for providers.
                    </CardDescription>
                </Card>
            </div>
        </main>
    );
}
