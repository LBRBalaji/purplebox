
// src/app/registration-calculator/page.tsx
'use client';

import { RegistrationCalculator } from '@/components/registration-calculator';
import * as React from 'react';

export default function RegistrationCalculatorPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Registration Charges Calculator</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
                Estimate the total government charges for your lease agreement, including stamp duty and registration fees.
            </p>
        </div>
        <React.Suspense fallback={<div>Loading Calculator...</div>}>
            <RegistrationCalculator />
        </React.Suspense>
      </div>
    </main>
  );
}
