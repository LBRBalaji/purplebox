
// src/app/dashboard/analytics/customer/page.tsx
'use client';

import * as React from 'react';
import { useAuth, type User } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, List, Download, Eye, MapPin, Building, Activity, Clock, BarChart as BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function groupAndSort<T>(items: T[], keyExtractor: (item: T) => string) {
  const counts = items.reduce((acc, item) => {
    const key = keyExtractor(item);
    if(key) {
        acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function CustomerAnalyticsPage() {
    const { user: currentUser, users } = useAuth();
    const { demands, viewHistory, downloadHistory, listings } = useData();
    const router = useRouter();

    const [selectedUserId, setSelectedUserId] = React.useState<string>('all');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const hasAccess = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'O2O';
    
    React.useEffect(() => {
        if (!hasAccess) {
            router.push('/dashboard');
        }
    }, [currentUser, hasAccess, router]);

    const customers = React.useMemo(() => Object.values(users).filter(u => u.role === 'User'), [users]);

    const filteredData = React.useMemo(() => {
        const from = dateRange?.from || new Date(0);
        const to = dateRange?.to || new Date();

        const isUserSelected = selectedUserId && selectedUserId !== 'all';
        const selectedUser = users[selectedUserId];

        const relevantDemands = isUserSelected 
            ? demands.filter(d => d.userEmail === selectedUserId)
            : demands;

        const relevantViews = viewHistory.filter(v => {
            const viewDate = new Date(v.timestamp);
            const userMatch = isUserSelected ? v.userId === selectedUserId : true;
            return viewDate >= from && viewDate <= to && userMatch;
        });

        const relevantDownloads = downloadHistory.filter(d => {
            const downloadDate = new Date(d.timestamp);
            const userMatch = isUserSelected ? d.userId === selectedUserId : true;
            return downloadDate >= from && downloadDate <= to && userMatch;
        });

        const topViewedLocations = groupAndSort(relevantViews, view => {
            const listing = listings.find(l => l.listingId === view.listingId);
            return listing?.location || '';
        });

        const topViewedDevelopers = groupAndSort(relevantViews, view => {
            const listing = listings.find(l => l.listingId === view.listingId);
            const developer = listing ? Object.values(users).find(u => u.email === listing.developerId) : null;
            return developer?.companyName || 'Unknown';
        });
        
        const recentActivities = [...relevantViews, ...relevantDownloads]
            .sort((a,b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(item => {
                const listing = listings.find(l => l.listingId === item.listingId);
                return {
                    type: 'userId' in item ? 'View' : 'Download',
                    listingName: listing?.name || item.listingId,
                    timestamp: new Date(item.timestamp).toLocaleString(),
                }
            });

        return {
            totalDemands: relevantDemands.length,
            totalViews: relevantViews.length,
            totalDownloads: relevantDownloads.length,
            topViewedLocations,
            topViewedDevelopers,
            recentActivities,
            selectedUser,
        }

    }, [selectedUserId, dateRange, demands, viewHistory, downloadHistory, listings, users]);

    if (!hasAccess) return null;

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Customer Engagement Analytics</h2>
                    <p className="text-muted-foreground mt-2">
                        Analyze demand trends, platform usage, and customer interests.
                    </p>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Customer or Company</label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.email} value={customer.email}>
                                            {customer.companyName} ({customer.userName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Select Date Range</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard title="Total Demands" value={filteredData.totalDemands} icon={List} />
                    <StatCard title="Listings Viewed" value={filteredData.totalViews} icon={Eye} />
                    <StatCard title="Listings Downloaded" value={filteredData.totalDownloads} icon={Download} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin className="text-primary"/> Top Viewed Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Location</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredData.topViewedLocations.map(loc => (
                                        <TableRow key={loc.name}><TableCell>{loc.name}</TableCell><TableCell className="text-right">{loc.count}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> Top Viewed Developers</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Developer</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredData.topViewedDevelopers.map(dev => (
                                        <TableRow key={dev.name}><TableCell>{dev.name}</TableCell><TableCell className="text-right">{dev.count}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="text-primary"/> Recent Activity</CardTitle>
                         <CardDescription>
                            Latest views and downloads by {filteredData.selectedUser ? filteredData.selectedUser.userName : 'all customers'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>Listing</TableHead><TableHead className="text-right">Time</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredData.recentActivities.map((act, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Badge variant={act.type === 'View' ? 'outline' : 'secondary'}>{act.type}</Badge></TableCell>
                                        <TableCell>{act.listingName}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">{act.timestamp}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </main>
    )
}
