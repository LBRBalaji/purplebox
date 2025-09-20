
// src/app/dashboard/analytics/customer/page.tsx
'use client';

import * as React from 'react';
import { useAuth, type User } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, List, Download, Eye, MapPin, Building, Activity, Clock, BarChart as BarChartIcon, Star, FileQuestion, MessageCircle, ClipboardList, PackagePlus, HardHat, Notebook } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

function groupAndSort<T>(items: T[], keyExtractor: (item: T) => string | undefined) {
  if (!items) return [];
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

const activityIconMap: { [key: string]: React.ElementType } = {
    'View': Eye,
    'Download': Download,
    'Quote Request': MessageCircle,
    'New Demand': ClipboardList,
    'Layout Request': FileQuestion,
    'Tenant Improvements': HardHat,
    'Negotiation Board Update': Notebook,
};

export default function CustomerAnalyticsPage() {
    const { user: currentUser, users } = useAuth();
    const { demands, viewHistory, downloadHistory, listings, isLoading: isDataLoading, registeredLeads, layoutRequests, transactionActivities, negotiationBoards } = useData();
    const router = useRouter();

    const [selectedCompany, setSelectedCompany] = React.useState<string>('all');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const hasAccess = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'O2O';
    
    React.useEffect(() => {
        if (!isDataLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [currentUser, hasAccess, router, isDataLoading]);

    const customerCompanies = React.useMemo(() => {
        const companies = new Set(Object.values(users || {}).filter(u => u.role === 'User').map(u => u.companyName));
        return Array.from(companies).sort();
    }, [users]);

    const filteredData = React.useMemo(() => {
        if (isDataLoading || !demands || !viewHistory || !downloadHistory || !listings || !users || !registeredLeads || !layoutRequests || !transactionActivities || !negotiationBoards) {
            return {
                totalDemands: 0,
                totalViews: 0,
                totalDownloads: 0,
                totalQuoteRequests: 0,
                totalLayoutRequests: 0,
                totalShortlists: 0,
                totalTenantImprovements: 0,
                totalNegotiationUpdates: 0,
                topViewedLocations: [],
                topViewedDevelopers: [],
                recentActivities: [],
            };
        }

        const from = dateRange?.from || new Date(0);
        const to = dateRange?.to || new Date();
        to.setHours(23, 59, 59, 999);

        const isAllCompanies = selectedCompany === 'all';
        
        // Create a set of user emails to filter by.
        const companyUserEmails = new Set<string>();
        if (isAllCompanies) {
            Object.values(users).forEach(u => {
                if (u.role === 'User') {
                    companyUserEmails.add(u.email);
                }
            });
        } else {
             Object.values(users).forEach(u => {
                if (u.companyName === selectedCompany) {
                    companyUserEmails.add(u.email);
                }
            });
        }

        const dateFilter = (timestamp: string | number | Date) => {
            const date = new Date(timestamp);
            return date >= from && date <= to;
        };
        
        // Filter each data source by the user email set and date range
        const relevantDemands = demands.filter(d => companyUserEmails.has(d.userEmail) && d.createdAt && dateFilter(d.createdAt));
        const relevantViews = viewHistory.filter(v => companyUserEmails.has(v.userId) && dateFilter(v.timestamp));
        const relevantDownloads = downloadHistory.filter(d => companyUserEmails.has(d.userId) && dateFilter(d.timestamp));
        const relevantQuoteRequests = registeredLeads.filter(l => companyUserEmails.has(l.customerId) && dateFilter(l.registeredAt));
        const relevantLayoutRequests = layoutRequests.filter(r => {
             const userForRequest = Object.values(users).find(u => u.email === r.userEmail);
             return userForRequest && companyUserEmails.has(userForRequest.email) && dateFilter(r.requestedAt);
        });

        const relevantLeadsSet = new Set(registeredLeads.filter(lead => companyUserEmails.has(lead.customerId)).map(l => l.id));
        
        const relevantTenantImprovements = transactionActivities.filter(a => a.activityType === 'Tenant Improvements' && relevantLeadsSet.has(a.leadId) && dateFilter(a.createdAt));
        const relevantNegotiationUpdates = negotiationBoards.flatMap(n => n.sessions.filter(s => relevantLeadsSet.has(n.leadId) && dateFilter(s.date))).length;
        
        // Group and sort for top lists
        const topViewedLocations = groupAndSort(relevantViews, view => {
            const listing = listings.find(l => l.listingId === view.listingId);
            return listing?.location;
        });

        const topViewedDevelopers = groupAndSort(relevantViews, view => {
            const listing = listings.find(l => l.listingId === view.listingId);
            const developer = listing ? Object.values(users).find(u => u.email === listing.developerId) : null;
            return developer?.companyName;
        });

        // Consolidate all activities into a single stream
        const viewActivities = relevantViews.map(item => ({
            type: 'View' as const,
            subject: listings.find(l => l.listingId === item.listingId)?.name || item.listingId,
            timestamp: new Date(item.timestamp).toISOString(),
            link: `/listings/${item.listingId}`,
            userName: users[item.userId]?.userName || item.companyName,
        }));
        
        const downloadActivities = relevantDownloads.map(item => ({
            type: 'Download' as const,
            subject: `Downloaded ${item.listingId ? 'listing ' + item.listingId : 'data'}`,
            timestamp: new Date(item.timestamp).toISOString(),
            link: `/listings/${item.listingId}`,
            userName: users[item.userId]?.userName || item.companyName,
        }));

        const quoteActivities = relevantQuoteRequests.map(item => ({
             type: 'Quote Request' as const,
             subject: item.requirementsSummary,
             timestamp: item.registeredAt,
             link: `/dashboard/leads/${item.id}`,
             userName: item.leadContact,
        }));

        const demandActivities = relevantDemands.map(item => ({
             type: 'New Demand' as const,
             subject: item.demandId,
             timestamp: item.createdAt!,
             link: `/dashboard?editDemandId=${item.demandId}`,
             userName: item.userName,
        }));
        
        const layoutRequestActivities = relevantLayoutRequests.map(item => ({
             type: 'Layout Request' as const,
             subject: item.listingName,
             timestamp: item.requestedAt,
             link: `/listings/${item.listingId}`,
             userName: item.userName,
        }));
        
        const tenantImprovementActivities = relevantTenantImprovements.map(item => ({
             type: 'Tenant Improvements' as const,
             subject: `Update for Lead ${item.leadId}`,
             timestamp: item.createdAt,
             link: `/dashboard/leads/${item.leadId}?tab=improvements`,
             userName: registeredLeads.find(l => l.id === item.leadId)?.leadContact || 'N/A'
        }));
        
        const negotiationActivities = negotiationBoards.filter(n => relevantLeadsSet.has(n.leadId)).flatMap(n => n.sessions.filter(s => dateFilter(s.date)).map(s => ({
            type: 'Negotiation Board Update' as const,
            subject: `Session for Lead ${n.leadId}`,
            timestamp: s.date,
            link: `/dashboard/leads/${n.leadId}?tab=negotiation-board`,
            userName: registeredLeads.find(l => l.id === n.leadId)?.leadContact || 'N/A'
        })));


        const recentActivities = [...viewActivities, ...downloadActivities, ...quoteActivities, ...demandActivities, ...layoutRequestActivities, ...tenantImprovementActivities, ...negotiationActivities]
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return {
            totalDemands: relevantDemands.length,
            totalViews: relevantViews.length,
            totalDownloads: relevantDownloads.length,
            totalQuoteRequests: relevantQuoteRequests.length,
            totalLayoutRequests: relevantLayoutRequests.length,
            totalShortlists: 0, // This logic was not implemented. Keeping at 0.
            totalTenantImprovements: relevantTenantImprovements.length,
            totalNegotiationUpdates,
            topViewedLocations,
            topViewedDevelopers,
            recentActivities,
        }

    }, [selectedCompany, dateRange, demands, viewHistory, downloadHistory, listings, users, registeredLeads, layoutRequests, transactionActivities, negotiationBoards, isDataLoading]);

    if (!hasAccess) return null;
    
    if (isDataLoading) {
        return (
             <div className="container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        )
    }

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
                            <label className="text-sm font-medium">Select Customer Company</label>
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customer Companies</SelectItem>
                                    {customerCompanies.map(company => (
                                        <SelectItem key={company} value={company}>
                                            {company}
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Demands" value={filteredData.totalDemands} icon={List} />
                    <StatCard title="Listings Viewed" value={filteredData.totalViews} icon={Eye} />
                    <StatCard title="Listings Downloaded" value={filteredData.totalDownloads} icon={Download} />
                    <StatCard title="Quote Requests" value={filteredData.totalQuoteRequests} icon={MessageCircle} />
                    <StatCard title="Layout Requests" value={filteredData.totalLayoutRequests} icon={FileQuestion} />
                    <StatCard title="Shortlisted" value={filteredData.totalShortlists} icon={Star} />
                    <StatCard title="TI Requests" value={filteredData.totalTenantImprovements} icon={HardHat} />
                    <StatCard title="Transaction Activities" value={filteredData.totalNegotiationUpdates} icon={Notebook} />
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
                                    {filteredData.topViewedLocations.length > 0 ? filteredData.topViewedLocations.map(loc => (
                                        <TableRow key={loc.name}><TableCell>{loc.name}</TableCell><TableCell className="text-right">{loc.count}</TableCell></TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data for this period.</TableCell></TableRow>}
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
                                    {filteredData.topViewedDevelopers.length > 0 ? filteredData.topViewedDevelopers.map(dev => (
                                        <TableRow key={dev.name}><TableCell>{dev.name}</TableCell><TableCell className="text-right">{dev.count}</TableCell></TableRow>
                                    )) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data for this period.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity className="text-primary"/> Recent Activity</CardTitle>
                         <CardDescription>
                            Latest activities by {selectedCompany === 'all' ? 'all customers' : selectedCompany}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>Subject</TableHead><TableHead>User</TableHead><TableHead className="text-right">Time</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredData.recentActivities.length > 0 ? filteredData.recentActivities.map((act, index) => {
                                    const Icon = activityIconMap[act.type] || Activity;
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Badge variant={act.type === 'Download' || act.type === 'New Demand' ? 'secondary' : 'outline'} className="flex items-center gap-1.5 w-fit">
                                                    <Icon className="h-3 w-3"/>
                                                    {act.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <a href={act.link} target="_blank" rel="noopener noreferrer" className="hover:underline max-w-sm truncate block">
                                                    {act.subject}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{act.userName}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleString()}</TableCell>
                                        </TableRow>
                                    )
                                }) : <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No recent activity for this period.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </main>
    )
}
