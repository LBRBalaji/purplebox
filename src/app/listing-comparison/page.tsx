
// src/app/listing-comparison/page.tsx
'use client';

import { ComparisonCalculator } from '@/components/commercial-calculator';
import * as React from 'react';

export default function ListingComparisonPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Listing Comparison Tool</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
            Select up to 5 properties from the list below to generate a side-by-side financial comparison.
          </p>
        </div>
        <React.Suspense fallback={<div>Loading Comparison Tool...</div>}>
          <ComparisonCalculator />
        </React.Suspense>
      </div>
    </main>
  );
}
