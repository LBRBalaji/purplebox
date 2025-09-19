
'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, List, ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsHubPage() {

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Analytics Hub</h2>
                    <p className="text-muted-foreground mt-2">
                        Select a dashboard to view historical performance metrics or generate AI-powered predictive insights.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Link href="/dashboard/analytics/listings-performance" className="group">
                        <Card className="h-full hover:border-primary transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart className="text-primary" />
                                        Listings Performance
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Analyze views, downloads, and engagement with your properties.
                                    </CardDescription>
                                </div>
                                <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                            </CardHeader>
                        </Card>
                   </Link>
                    <Link href="/dashboard/analytics/customer" className="group">
                        <Card className="h-full hover:border-primary transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="text-primary" />
                                        Customer Engagement Analytics
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Drill down into a specific customer's activity, including views, downloads, and interests.
                                    </CardDescription>
                                </div>
                                 <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                            </CardHeader>
                        </Card>
                    </Link>
                     <Link href="/dashboard/analytics/traffic" className="group">
                        <Card className="h-full hover:border-primary transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="text-primary" />
                                        Platform Traffic
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Monitor user growth and overall platform activity trends.
                                    </CardDescription>
                                </div>
                                 <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                            </CardHeader>
                        </Card>
                    </Link>
                     <Link href="/dashboard/analytics/predictive" className="group">
                        <Card className="h-full hover:border-primary transition-colors bg-primary/5">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="text-primary" />
                                        Predictive Demand Analytics (AI)
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Leverage AI to forecast future market trends, demand hotspots, and specification requirements.
                                    </CardDescription>
                                </div>
                                 <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </main>
    )
}
