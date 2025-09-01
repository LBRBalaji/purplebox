
// src/app/dashboard/analytics/listings/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Users, List, Clock, FileText, CheckCircle, Eye, Download, PieChart, Star, Calendar as CalendarIcon, Factory, Warehouse } from 'lucide-react';
import { type User } from '@/contexts/auth-context';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';


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


export default function ListingAnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { demands, submissions, listingAnalytics, listings } = useData();
    const router = useRouter();
    const [allUsers, setAllUsers] = React.useState<User[]>([]);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    
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
    
    const filteredDemands = React.useMemo(() => {
        return demands.filter(d => {
            if (!dateRange?.from || !dateRange?.to) return true;
            try {
                const demandTime = new Date(parseInt(d.demandId.split('-')[1]));
                return demandTime >= dateRange.from && demandTime <= dateRange.to;
            } catch { return false; }
        });
    }, [demands, dateRange]);

    const filteredSubmissions = React.useMemo(() => {
        return submissions.filter(s => {
            if (!dateRange?.from || !dateRange?.to) return true;
            try {
                const subTime = new Date(parseInt(s.property.propertyId.split('-')[1]));
                return subTime >= dateRange.from && subTime <= dateRange.to;
            } catch { return false; }
        });
    }, [submissions, dateRange]);
    
    const filteredListingAnalytics = React.useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return listingAnalytics;
        
        return listingAnalytics.map(analytic => {
            const filteredViews = (analytic.viewedBy || []).filter(v => {
                const viewDate = new Date(v.timestamp);
                return viewDate >= dateRange.from! && viewDate <= dateRange.to!;
            });

            const filteredDownloads = (analytic.downloadedBy || []).filter(d => {
                return d.timestamps.some(ts => {
                    const downloadDate = new Date(ts);
                    return downloadDate >= dateRange.from! && downloadDate <= dateRange.to!;
                });
            });
            
            const filteredIndustries: Record<string, number> = {};
            // Note: Industry data isn't timestamped in mock data, so we can't filter it by date.
            // In a real system, each view event would have an associated industry.
            // For now, we show all industry data.
            Object.assign(filteredIndustries, analytic.customerIndustries);

            return {
                ...analytic,
                views: filteredViews.length,
                downloads: filteredDownloads.reduce((sum, d) => sum + d.timestamps.filter(ts => {
                     const downloadDate = new Date(ts);
                    return downloadDate >= dateRange.from! && downloadDate <= dateRange.to!;
                }).length, 0),
                viewedBy: filteredViews,
                downloadedBy: filteredDownloads.map(d => ({
                    ...d,
                    timestamps: d.timestamps.filter(ts => {
                        const downloadDate = new Date(ts);
                        return downloadDate >= dateRange.from! && downloadDate <= dateRange.to!;
                    })
                })).filter(d => d.timestamps.length > 0),
                customerIndustries: filteredIndustries,
            };
        });
    }, [listingAnalytics, dateRange]);


    const userStats = React.useMemo(() => {
        const total = allUsers.length;
        const customers = allUsers.filter(u => u.role === 'User').length;
        const providers = allUsers.filter(u => u.role === 'SuperAdmin').length;
        return { total, customers, providers };
    }, [allUsers]);

    const averageResponseTime = React.useMemo(() => {
        if (filteredSubmissions.length === 0) return 'N/A';

        let totalDiff = 0;
        let count = 0;

        filteredSubmissions.forEach(sub => {
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

    }, [filteredSubmissions, demands]);

    const recentActivities = React.useMemo(() => {
        const combined: Activity[] = [];

        filteredDemands.forEach(d => {
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

        filteredSubmissions.forEach(s => {
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
    }, [filteredDemands, filteredSubmissions]);

    const topPerformingListings = React.useMemo(() => {
        return filteredListingAnalytics
            .map(analytic => {
                const listing = listings.find(l => l.listingId === analytic.listingId);
                return { ...analytic, name: listing?.name || 'Unknown Listing' };
            })
            .sort((a,b) => b.views - a.views)
            .slice(0, 5);
    }, [filteredListingAnalytics, listings]);


    const industryInterestData = React.useMemo(() => {
        const industryMap: Record<string, number> = {};
        filteredListingAnalytics.forEach(analytic => {
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
    }, [filteredListingAnalytics]);
    
    const industryChartConfig = React.useMemo(() => {
        const config: any = {};
        industryInterestData.forEach(item => {
            config[item.name.toLowerCase().replace(/ /g, '-')] = {
                label: item.name,
                color: item.fill,
            };
        });
        return config;
    }, [industryInterestData]);

    const demandTypeData = React.useMemo(() => {
        const counts = filteredDemands.reduce((acc, demand) => {
            const type = demand.operationType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { type: 'Warehousing', count: counts['Warehousing'] || 0, fill: 'hsl(var(--chart-1))' },
            { type: 'Manufacturing', count: counts['Manufacturing'] || 0, fill: 'hsl(var(--chart-2))' },
        ];
    }, [filteredDemands]);

    const demandChartConfig = {
      count: {
        label: 'Demands',
      },
      warehousing: {
        label: 'Warehousing',
        color: 'hsl(var(--chart-1))',
        icon: Warehouse,
      },
      manufacturing: {
        label: 'Manufacturing',
        color: 'hsl(var(--chart-2))',
        icon: Factory,
      },
    };


    if (isAuthLoading || user?.email !== 'admin@example.com') {
        return null; // Or a loading skeleton
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Listing Analytics Dashboard</h2>
                        <p className="text-muted-foreground mt-2">
                            An overview of listing activity and performance.
                        </p>
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
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
                        value={filteredDemands.length} 
                        icon={List} 
                        description="Demands in the selected period"
                    />
                    <StatCard 
                        title="Total Submissions" 
                        value={filteredSubmissions.length} 
                        icon={CheckCircle}
                        description="Submissions in the selected period"
                    />
                     <StatCard 
                        title="Avg. Response Time" 
                        value={averageResponseTime} 
                        icon={Clock}
                        description="Demand logged to first proposal"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star className="text-amber-400" /> Top Performing Listings</CardTitle>
                            <CardDescription>Most viewed listings in the selected period.</CardDescription>
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
                                <p className="text-sm text-muted-foreground text-center py-4">No listing performance data available for this period.</p>
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
                                <ChartContainer config={industryChartConfig} className="mx-auto aspect-square h-[250px]">
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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                             <CardDescription>
                                Showing the 10 most recent activities within the selected date range.
                            </CardDescription>
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
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display for this period.</p>
                                 )}
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Demand Trends</CardTitle>
                            <CardDescription>Breakdown of demand types.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {filteredDemands.length > 0 ? (
                                <ChartContainer config={demandChartConfig} className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart accessibilityLayer data={demandTypeData} margin={{ top: 20 }}>
                                            <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="count" radius={4}>
                                                {demandTypeData.map((entry) => (
                                                    <Cell key={entry.type} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                             ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4">No demand data to display.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
