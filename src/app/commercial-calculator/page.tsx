'use client';

import { CommercialCalculator } from '@/components/commercial-calculator';

export default function CommercialCalculatorPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Commercials Calculator</h1>
            <p className="text-muted-foreground mt-2">
                Analyze lease costs with our dynamic area and rental outflow calculator.
            </p>
        </div>
        <CommercialCalculator />
      </div>
    </main>
  );
}
