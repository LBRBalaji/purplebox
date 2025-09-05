
// src/app/roi-calculator/page.tsx
'use client';

import { RoiCalculator } from '@/components/roi-calculator';
import * as React from 'react';

export default function RoiCalculatorPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Real Estate Investment ROI Calculator</h1>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Analyze your property investment potential with detailed financial projections.</p>
        </div>
        <React.Suspense fallback={<div>Loading Calculator...</div>}>
            <RoiCalculator />
        </React.Suspense>
      </div>
    </main>
  );
}
