
'use client';
import { WarehouseList } from "@/components/warehouse-list";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ManageWarehousesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && user?.role !== 'SuperAdmin') {
            // Redirect non-admins away from this page
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);
    
    // Render nothing or a loading state until the redirect can happen
    if (isLoading || user?.role !== 'SuperAdmin') {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Manage Warehouse Listings</h2>
                    <p className="text-muted-foreground mt-2">
                        Here you can activate or deactivate warehouse listings on the public map search.
                    </p>
                </div>
                <WarehouseList />
            </div>
        </main>
    );
}
