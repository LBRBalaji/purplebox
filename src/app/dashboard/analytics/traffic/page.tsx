
// src/app/dashboard/analytics/traffic/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, List, Building, CheckSquare, BarChart, Clock, UserPlus, ClipboardList, PackagePlus } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, Pie, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';


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

function groupDataByDay(items: any[], dateExtractor: (item: any) => Date) {
    const counts: { [key: string]: number } = {};
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    
    days.forEach(day => {
        counts[format(day, 'MMM d')] = 0;
    });

    items.forEach(item => {
        try {
            const date = dateExtractor(item);
            if (date >= days[0] && date <= days[days.length - 1]) {
                const dayKey = format(date, 'MMM d');
                counts[dayKey] = (counts[dayKey] || 0) + 1;
            }
        } catch {}
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

const activityIconMap: { [key: string]: React.ElementType } = {
    'New User': UserPlus,
    'New Demand': ClipboardList,
    'New Listing': PackagePlus,
};


export default function TrafficAnalyticsPage() {
    const { user, users, isLoading: isAuthLoading } = useAuth();
    const { demands, listings, submissions, isLoading: isDataLoading } = useData();
    const router = useRouter();
    
    const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
    
    React.useEffect(() => {
        if (!isAuthLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router, hasAccess]);

    const platformStats = React.useMemo(() => {
        return {
            totalUsers: Object.keys(users).length,
            totalListings: listings.length,
            totalDemands: demands.length,
            totalSubmissions: submissions.length,
        };
    }, [users, listings, demands, submissions]);

    const userGrowthData = React.useMemo(() => {
        return groupDataByDay(Object.values(users), (item) => new Date(item.createdAt));
    }, [users]);
    
    const demandActivityData = React.useMemo(() => {
        return groupDataByDay(demands, (item) => new Date(parseInt(item.demandId.split('-')[1])));
    }, [demands]);

    const userRoleData = React.useMemo(() => {
        const roleCounts = Object.values(users).reduce((acc, user) => {
            let role = user.role;
            if (role === 'Warehouse Developer') role = 'Provider';
            if (role === 'SuperAdmin') role = 'Provider';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

         const COLORS = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
        ];

        return Object.entries(roleCounts).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] }));

    }, [users]);
    
    const recentActivity = React.useMemo(() => {
        const userEvents = Object.values(users).map(u => ({ type: 'New User', subject: u.userName, timestamp: new Date(u.createdAt) }));
        const demandEvents = demands.map(d => ({ type: 'New Demand', subject: d.demandId, timestamp: new Date(parseInt(d.demandId.split('-')[1])) }));
        const listingEvents = listings.filter(l => l.createdAt).map(l => ({ type: 'New Listing', subject: l.name, timestamp: new Date(l.createdAt!) }));

        return [...userEvents, ...demandEvents, ...listingEvents]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5);

    }, [users, demands, listings]);


    if (isAuthLoading || isDataLoading || !hasAccess) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Platform Traffic & Activity</h2>
                        <p className="text-muted-foreground mt-2">
                            An overview of user growth and platform engagement.
                        </p>
                    </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Users" value={platformStats.totalUsers} icon={Users} description="All registered user accounts" />
                    <StatCard title="Total Listings" value={platformStats.totalListings} icon={Building} description="All properties listed" />
                    <StatCard title="Total Demands" value={platformStats.totalDemands} icon={List} description="All demands logged" />
                    <StatCard title="Total Submissions" value={platformStats.totalSubmissions} icon={CheckSquare} description="All matches submitted" />
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">User Growth</CardTitle>
                        <CardDescription>New user signups over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-[300px] w-full">
                           <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">Demand Activity</CardTitle>
                            <CardDescription>New demands logged over the last 30 days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={{}} className="h-[300px] w-full">
                                <AreaChart data={demandActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Users by Role</CardTitle>
                            <CardDescription>Breakdown of all registered users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                        {userRoleData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                                    </Pie>
                                </ResponsiveContainer>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => {
                                    const Icon = activityIconMap[activity.type] || Clock;
                                    return (
                                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 text-sm">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <div className="flex-grow">
                                                <span className="font-semibold">{activity.type}:</span> {activity.subject}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(activity.timestamp, 'MMM d, h:mm a')}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                         ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display.</p>
                         )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
