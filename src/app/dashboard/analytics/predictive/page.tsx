
// src/app/dashboard/analytics/predictive/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, TrendingUp, MapPin, ListChecks, FileText } from 'lucide-react';
import { predictDemandTrends } from '@/ai/flows/predict-demand-trends';
import { useToast } from '@/hooks/use-toast';
import type { PredictDemandTrendsOutput } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';

export default function PredictiveAnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [analysis, setAnalysis] = React.useState<PredictDemandTrendsOutput | null>(null);

    React.useEffect(() => {
        if (!isAuthLoading && user?.email !== 'admin@example.com' && user?.role !== 'O2O') {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await predictDemandTrends({ timeHorizon: 'next quarter' });
            setAnalysis(result);
        } catch (error) {
            console.error("Failed to generate predictive analysis:", error);
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: "Analysis Failed",
                description: e.message || "An unexpected error occurred."
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isAuthLoading || (user && user.email !== 'admin@example.com' && user.role !== 'O2O')) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Predictive Demand Analytics</h2>
                        <p className="text-muted-foreground mt-2 max-w-3xl">
                           Leverage AI to forecast market trends based on your platform's historical data.
                        </p>
                    </div>
                    <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? 'Generating Insights...' : 'Generate Analysis for Next Quarter'}
                    </Button>
                </div>
                
                {isLoading && (
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                                <CardContent className="space-y-4">
                                     <Skeleton className="h-16 w-full" />
                                     <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {analysis ? (
                    <div className="space-y-8 animate-in fade-in-50">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="text-primary" /> Market Outlook
                                </CardTitle>
                                <CardDescription>An AI-generated summary of predicted trends for the next quarter.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">{analysis.marketOutlook}</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-primary" /> Predicted Demand Hotspots
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.predictedHotspots.map((hotspot, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> {hotspot.location}
                                                {hotspot.growthPercentage && <Badge variant="secondary">{hotspot.growthPercentage}% Growth</Badge>}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1 pl-6">{hotspot.reasoning}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ListChecks className="text-primary" /> Trending Specifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.trendingSpecifications.map((spec, index) => (
                                        <div key={index} className="p-4 rounded-lg bg-secondary/50">
                                            <h4 className="font-semibold">{spec.specification}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{spec.reasoning}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <Alert className="text-center p-8">
                            <Sparkles className="h-6 w-6 mx-auto mb-2" />
                            <AlertTitle className="text-lg font-semibold">Ready to See the Future?</AlertTitle>
                            <AlertDescription className="mt-2">
                                Click the "Generate Analysis" button to process your historical data and reveal predictive insights for the next quarter.
                            </AlertDescription>
                        </Alert>
                    )
                )}
            </div>
        </main>
    );
}
