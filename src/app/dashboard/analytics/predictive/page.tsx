'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Sparkles, Brain, TrendingUp, MapPin, ListChecks, Clock } from 'lucide-react';

export default function PredictiveAnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => { if (!isLoading && !hasAccess) router.push('/dashboard'); }, [user, isLoading, router, hasAccess]);
  if (isLoading || !hasAccess) return null;
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="h-10 w-10 text-primary" />
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <Clock className="h-4 w-4" /> Coming Soon
        </div>
        <h2 className="text-3xl font-black text-foreground mb-4">Predictive Demand Analytics</h2>
        <p className="text-muted-foreground text-lg mb-8">
          AI-powered market forecasting is being upgraded to use our latest Gemini integration. 
          This feature will be available shortly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: TrendingUp, title: 'Demand Hotspots', desc: 'Predict which locations will see demand surge' },
            { icon: ListChecks, title: 'Trending Specs', desc: 'Forecast most sought-after warehouse features' },
            { icon: MapPin, title: 'Market Outlook', desc: 'AI-generated forward-looking market analysis' },
          ].map((f, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 opacity-60">
              <f.icon className="h-6 w-6 text-primary mb-3" />
              <p className="font-bold text-foreground text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}