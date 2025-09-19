
// src/app/dashboard/analytics/demands/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as BarChartIcon, Users, List, Clock, CheckCircle, PieChart, Star, Calendar as CalendarIcon, Factory, Warehouse, Building, Repeat } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Pie,
  Cell
} from "@/components/ui/chart"
import { ResponsiveContainer } from "recharts"
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';


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


export default function DemandAnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { demands, submissions } = useData();
    const router = useRouter();
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    
    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
    
    React.useEffect(() => {
        if (!isAuthLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router, hasAccess]);

    const filteredDemands = React.useMemo(() => {
        return demands.filter(d => {
            if (!dateRange?.from || !dateRange?.to) return true;
            try {
                const demandTime = new Date(parseInt(d.demandId.split('-')[1]));
                return demandTime >= dateRange.from && demandTime <= dateRange.to;
            } catch { return false; }
        });
    }, [demands, dateRange]);

    const demandStats = React.useMemo(() => {
        const totalDemands = filteredDemands.length;
        
        let fulfilledCount = 0;
        filteredDemands.forEach(demand => {
            if (submissions.some(sub => sub.demandId === demand.demandId && sub.status === 'Approved')) {
                fulfilledCount++;
            }
        });
        
        const successRate = totalDemands > 0 ? ((fulfilledCount / totalDemands) * 100).toFixed(1) + '%' : '0%';

        return { totalDemands, fulfilledCount, successRate };
    }, [filteredDemands, submissions]);


    const averageTimeToMatch = React.useMemo(() => {
        let totalDiff = 0;
        let count = 0;

        filteredDemands.forEach(demand => {
            const firstApprovedSubmission = submissions
                .filter(s => s.demandId === demand.demandId && s.status === 'Approved')
                .sort((a, b) => parseInt(a.property.propertyId.split('-')[1]) - parseInt(b.property.propertyId.split('-')[1]))[0];

            if (firstApprovedSubmission) {
                try {
                    const demandTime = parseInt(demand.demandId.split('-')[1]);
                    const subTime = parseInt(firstApprovedSubmission.property.propertyId.split('-')[1]);
                    if (!isNaN(demandTime) && !isNaN(subTime)) {
                        totalDiff += (subTime - demandTime);
                        count++;
                    }
                } catch (e) {
                    // ignore format errors
                }
            }
        });

        if (count === 0) return 'N/A';
        const avgMilliseconds = totalDiff / count;
        const avgHours = avgMilliseconds / (1000 * 60 * 60);
        return `${avgHours.toFixed(1)} hours`;
    }, [filteredDemands, submissions]);

    const topCustomers = React.useMemo(() => {
        const customerCounts = filteredDemands.reduce((acc, demand) => {
            acc[demand.userEmail] = (acc[demand.userEmail] || { count: 0, name: demand.userName, company: demand.companyName });
            acc[demand.userEmail].count++;
            return acc;
        }, {} as Record<string, { count: number, name: string, company: string }>);

        return Object.entries(customerCounts)
            .map(([email, data]) => ({ ...data, email }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredDemands]);

    const locationDemandData = React.useMemo(() => {
        const locationCounts = filteredDemands.reduce((acc, demand) => {
            const location = demand.locationName?.split(',')[0] || 'Unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const COLORS = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))',
        ];

        return Object.entries(locationCounts).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));
    }, [filteredDemands]);

    const locationChartConfig = React.useMemo(() => {
        const config: any = {};
        locationDemandData.forEach(item => {
            config[item.name.toLowerCase().replace(/ /g, '-')] = {
                label: item.name,
                color: item.fill,
            };
        });
        return config;
    }, [locationDemandData]);

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
      count: { label: 'Demands' },
      warehousing: { label: 'Warehousing', color: 'hsl(var(--chart-1))', icon: Warehouse },
      manufacturing: { label: 'Manufacturing', color: 'hsl(var(--chart-2))', icon: Factory },
    };


    if (isAuthLoading || !hasAccess) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Demand & Customer Analytics</h2>
                        <p className="text-muted-foreground mt-2">
                            An overview of customer demand activity and trends.
                        </p>
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal",!dateRange && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/>
                        </PopoverContent>
                    </Popover>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard 
                        title="Total Demands" 
                        value={demandStats.totalDemands} 
                        icon={List} 
                        description="Demands in selected period"
                    />
                    <StatCard 
                        title="Success Rate" 
                        value={demandStats.successRate} 
                        icon={CheckCircle}
                        description="Demands with at least one approved submission"
                    />
                     <StatCard 
                        title="Avg. Time to Match" 
                        value={averageTimeToMatch} 
                        icon={Clock}
                        description="From demand logged to first approved match"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Repeat className="text-primary" /> Top Customers by Demand</CardTitle>
                            <CardDescription>Customers who have logged the most demands in this period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {topCustomers.length > 0 ? (
                                <div className="space-y-4">
                                    {topCustomers.map(customer => (
                                        <div key={customer.email} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/50">
                                            <div>
                                                <p className="font-semibold">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.company}</p>
                                            </div>
                                            <div className="text-lg font-bold text-primary">
                                                {customer.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No customer data available for this period.</p>
                             )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PieChart className="text-primary"/> Demands by Location</CardTitle>
                            <CardDescription>Breakdown of top locations by demand count.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {locationDemandData.length > 0 ? (
                                <ChartContainer config={locationChartConfig} className="mx-auto aspect-square h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <Pie data={locationDemandData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                            {locationDemandData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                                        </Pie>
                                    </ResponsiveContainer>
                                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                </ChartContainer>
                             ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4">No location data to display.</p>
                             )}
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChartIcon className="text-primary"/> Demand by Type</CardTitle>
                            <CardDescription>Breakdown of demands by the type of operation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {filteredDemands.length > 0 ? (
                                <ChartContainer config={demandChartConfig} className="h-[250px] w-full">
                                    <BarChart accessibilityLayer data={demandTypeData} margin={{ top: 20 }}>
                                        <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" radius={4}>
                                            {demandTypeData.map((entry) => ( <Cell key={entry.type} fill={entry.fill} /> ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                             ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4">No demand data to display.</p>
                             )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> Demand by Size (Sq. Ft.)</CardTitle>
                            <CardDescription>Distribution of required warehouse sizes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-4">Size distribution chart coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
