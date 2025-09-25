

'use client';

import * as React from 'react';
import { TransactionsPage } from '@/components/transactions-page';


export default function DashboardTransactionsPage() {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <TransactionsPage />
        </main>
    );
}
