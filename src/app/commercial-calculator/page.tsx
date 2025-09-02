
'use client';

import { CommercialCalculator } from '@/components/commercial-calculator';
import * as React from 'react';

export default function CommercialCalculatorPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Area &amp; Commercials Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
                Analyze lease costs with our dynamic area calculator. Pre-fill data from a specific listing by using the "Calculate" button on any property card.
            </p>
        </div>
        <React.Suspense fallback={<div>Loading Calculator...</div>}>
            <CommercialCalculator />
        </React.Suspense>
      </div>
    </main>
  );
}
