
'use client';
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageWarehousesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        // Redirect logic can be simplified or removed, as this page is now informational.
        // Or redirect all users away immediately.
        router.push('/dashboard');
    }, [router]);
    
    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                 <Card className="text-center p-12">
                    <CardTitle>Feature Moved</CardTitle>
                    <CardDescription className="mt-2">
                        Warehouse management is now handled via the "My Listings" tab on the main dashboard for providers. You are being redirected.
                    </CardDescription>
                </Card>
            </div>
        </main>
    );
}
