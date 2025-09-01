
'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';

// This component now acts as a redirector to the default analytics page.
export default function AnalyticsRedirectPage() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/dashboard/analytics/listings');
    }, [router]);
    
    return null; // Render nothing while redirecting
}
