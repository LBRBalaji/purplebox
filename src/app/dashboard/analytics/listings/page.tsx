
'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function DeprecatedListingsAnalyticsPage() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/dashboard/analytics/listings-performance');
    }, [router]);

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Redirecting...</CardTitle>
                        <CardDescription>
                            This page has been moved. You are being redirected to the new Listings Performance Analytics page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </main>
    )
}
