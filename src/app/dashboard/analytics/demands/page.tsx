// src/app/dashboard/analytics/demands/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// This page is being deprecated and replaced by customer/page.tsx
export default function DeprecatedDemandAnalyticsPage() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/dashboard/analytics/customer');
    }, [router]);

    return null;
}
