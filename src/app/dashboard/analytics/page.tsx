// src/app/dashboard/analytics/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Users, List, Clock, FileText, CheckCircle, Eye, Download, PieChart, Star } from 'lucide-react';
import { type User } from '@/contexts/auth-context';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Pie, Cell, ResponsiveContainer } from "recharts"


type Activity = {
    type: 'Demand' | 'Submission';
    id: string;
    user: string;
    timestamp: Date;
    details: string;
}

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}


export default function AnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { demands, submissions, listingAnalytics, listings } = useData();
    const router = useRouter();
    const [allUsers, setAllUsers] = React.useState<User[]>([]);
    
    React.useEffect(() => {
        if (!isAuthLoading && user?.email !== 'admin@example.com') {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    React.useEffect(() => {
        try {
            const usersFromStorage = localStorage.getItem('warehouseorigin_users');
            if (usersFromStorage) {
                setAllUsers(Object.values(JSON.parse(usersFromStorage)));
            }
        } catch (error) {
            console.error("Failed to parse users from local storage", error);
        }
    }, []);

    const userStats = React.useMemo(() => {
        const total = allUsers.length;
        const customers = allUsers.filter(u => u.role === 'User').length;
        const providers = allUsers.filter(u => u.role === 'SuperAdmin').length;
        return { total, customers, providers };
    }, [allUsers]);

    const averageResponseTime = React.useMemo(() => {
        if (submissions.length === 0) return 'N/A';

        let totalDiff = 0;
        let count = 0;

        submissions.forEach(sub => {
            const demand = demands.find(d => d.demandId === sub.demandId);
            if (demand && demand.demandId && sub.property.propertyId) {
                 try {
                    const demandTime = parseInt(demand.demandId.split('-')[1]);
                    const subTime = parseInt(sub.property.propertyId.split('-')[1]);
                     if (!isNaN(demandTime) && !isNaN(subTime)) {
                        totalDiff += (subTime - demandTime);
                        count++;
                    }
                 } catch(e) {
                     // ignore if IDs are not in the expected format
                 }
            }
        });

        if (count === 0) return 'N/A';
        const avgMilliseconds = totalDiff / count;
        const avgHours = avgMilliseconds / (1000 * 60 * 60);
        return `${avgHours.toFixed(1)} hours`;

    }, [submissions, demands]);

    const recentActivities = React.useMemo(() => {
        const combined: Activity[] = [];

        demands.forEach(d => {
            try {
                if (d.demandId) {
                    combined.push({
                        type: 'Demand',
                        id: d.demandId,
                        user: d.userName,
                        timestamp: new Date(parseInt(d.demandId.split('-')[1])),
                        details: `Logged demand for ${d.size.toLocaleString()} sq. ft. in ${d.locationName}`
                    });
                }
            } catch (e) { /* ignore format errors */ }
        });

        submissions.forEach(s => {
             try {
                if (s.property.propertyId) {
                    combined.push({
                        type: 'Submission',
                        id: s.property.propertyId,
                        user: s.property.userName,
                        timestamp: new Date(parseInt(s.property.propertyId.split('-')[1])),
                        details: `Submitted property for demand ${s.demandId}`
                    });
                }
            } catch (e) { /* ignore format errors */ }
        });

        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    }, [demands, submissions]);

    const topPerformingListings = React.useMemo(() => {
        return listingAnalytics
            .map(analytic => {
                const listing = listings.find(l => l.listingId === analytic.listingId);
                return { ...analytic, name: listing?.name || 'Unknown Listing' };
            })
            .sort((a,b) => b.views - a.views)
            .slice(0, 5);
    }, [listingAnalytics, listings]);


    const industryInterestData = React.useMemo(() => {
        const industryMap: Record<string, number> = {};
        listingAnalytics.forEach(analytic => {
            Object.entries(analytic.customerIndustries).forEach(([industry, count]) => {
                industryMap[industry] = (industryMap[industry] || 0) + count;
            });
        });

        const COLORS = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))',
        ];

        return Object.entries(industryMap).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
    }, [listingAnalytics]);
    
    const chartConfig = React.useMemo(() => {
        const config: any = {};
        industryInterestData.forEach(item => {
            config[item.name.toLowerCase().replace(/ /g, '-')] = {
                label: item.name,
                color: item.fill,
            };
        });
        return config;
    }, [industryInterestData]);

    if (isAuthLoading || user?.email !== 'admin@example.com') {
        return null; // Or a loading skeleton
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Analytics Dashboard</h2>
                    <p className="text-muted-foreground mt-2">
                        An overview of platform activity and performance.
                    </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Total Users" 
                        value={userStats.total} 
                        icon={Users} 
                        description={`${userStats.customers} Customers, ${userStats.providers} Providers`}
                    />
                    <StatCard 
                        title="Active Demands" 
                        value={demands.length} 
                        icon={List} 
                        description="Total demands logged by customers."
                    />
                    <StatCard 
                        title="Total Submissions" 
                        value={submissions.length} 
                        icon={CheckCircle}
                        description="Properties matched against demands."
                    />
                     <StatCard 
                        title="Avg. Response Time" 
                        value={averageResponseTime} 
                        icon={Clock}
                        description="Demand logged to first proposal."
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star className="text-amber-400" /> Top Performing Listings</CardTitle>
                            <CardDescription>Most viewed listings on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {topPerformingListings.length > 0 ? (
                                <div className="space-y-4">
                                    {topPerformingListings.map(item => (
                                        <div key={item.listingId} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/50">
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.listingId}</p>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4 text-primary" />
                                                    <span>{item.views} views</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Download className="h-4 w-4 text-primary" />
                                                    <span>{item.downloads} downloads</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No listing performance data available yet.</p>
                             )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PieChart className="text-primary"/> Customer Industry Interest</CardTitle>
                            <CardDescription>Breakdown of industries viewing listings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {industryInterestData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <Pie
                                            data={industryInterestData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            >
                                            {industryInterestData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </ResponsiveContainer>
                                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                </ChartContainer>
                             ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4">No industry data to display.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map(activity => (
                                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full">
                                        {activity.type === 'Demand' ? <FileText className="h-5 w-5 text-primary" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-sm">{activity.details}</p>
                                        <p className="text-xs text-muted-foreground">{activity.user} - {activity.timestamp.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                             {recentActivities.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display.</p>
                             )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
