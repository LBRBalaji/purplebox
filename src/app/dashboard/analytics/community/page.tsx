
'use client';

import * as React from 'react';
import { useAuth, type User } from '@/contexts/auth-context';
import { useData, type ShareHistoryEntry } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Users, MessageCircle, Share2, Rss, BookOpen, Calendar, Briefcase } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar as BarRechart, ResponsiveContainer, XAxis, YAxis, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

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

function groupDataByDay(items: any[], dateExtractor: (item: any) => Date) {
    const counts: { [key: string]: number } = {};
    const days = Array.from({ length: 30 }, (_, i) => startOfDay(subDays(new Date(), i))).reverse();
    
    days.forEach(day => {
        counts[format(day, 'MMM d')] = 0;
    });

    items.forEach(item => {
        try {
            const date = dateExtractor(item);
            const thirtyDaysAgo = subDays(new Date(), 29);
            if (date >= startOfDay(thirtyDaysAgo)) {
                const dayKey = format(date, 'MMM d');
                if (dayKey in counts) {
                    counts[dayKey]++;
                }
            }
        } catch {}
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

const categoryIcons = {
    Learn: BookOpen,
    Events: Calendar,
    Stories: Briefcase,
    Default: Rss
};

export default function CommunityAnalyticsPage() {
    const { user: currentUser, users } = useAuth();
    const { communityPosts, isLoading: isDataLoading, shareHistory } = useData();
    const router = useRouter();

    const hasAccess = currentUser?.role === 'SuperAdmin';
    
    React.useEffect(() => {
        if (!isDataLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [currentUser, hasAccess, router, isDataLoading]);

    const communityStats = React.useMemo(() => {
        const posts = communityPosts || [];
        const shares = shareHistory || [];

        const totalPosts = posts.length;
        const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
        const totalShares = shares.length;

        const postActivity = groupDataByDay(posts, (post) => new Date(post.createdAt));

        const topCategories = posts.reduce((acc, post) => {
            acc[post.category] = (acc[post.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
        const categoryData = Object.entries(topCategories).map(([name, value], index) => ({
            name, value, fill: COLORS[index % COLORS.length]
        }));
        
        const topPosts = [...posts].sort((a, b) => {
            const scoreA = (a.comments?.length || 0) * 2 + (shares.filter(s => s.postId === a.id).length || 0);
            const scoreB = (b.comments?.length || 0) * 2 + (shares.filter(s => s.postId === b.id).length || 0);
            return scoreB - scoreA;
        }).slice(0, 5);

        const topSharers = shares.reduce((acc, share) => {
            if (!acc[share.sharedByEmail]) {
                acc[share.sharedByEmail] = { count: 0, name: share.sharedByName, company: users[share.sharedByEmail]?.companyName || 'N/A' };
            }
            acc[share.sharedByEmail].count++;
            return acc;
        }, {} as Record<string, { count: number; name: string, company: string }>);
        
        const sortedTopSharers = Object.entries(topSharers)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 5)
            .map(([email, data]) => ({ email, ...data }));


        return {
            totalPosts,
            totalComments,
            totalShares,
            postActivity,
            categoryData,
            topPosts,
            topSharers: sortedTopSharers,
        };

    }, [communityPosts, shareHistory, users]);

    if (!hasAccess) return null;

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Community Analytics</h2>
                    <p className="text-muted-foreground mt-2">
                        Monitor post performance, user engagement, and sharing trends.
                    </p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Total Posts" value={communityStats.totalPosts} icon={Rss} />
                    <StatCard title="Total Comments" value={communityStats.totalComments} icon={MessageCircle} />
                    <StatCard title="Total Shares" value={communityStats.totalShares} icon={Share2} />
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Post Activity</CardTitle>
                        <CardDescription>New posts created over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-[300px] w-full">
                           <AreaChart data={communityStats.postActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Posts by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Pie data={communityStats.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                        {communityStats.categoryData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                                    </Pie>
                                </ResponsiveContainer>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                           <CardTitle>Top Performing Posts</CardTitle>
                           <CardDescription>Posts with the most comments and shares.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Post</TableHead>
                                        <TableHead className="text-center">Comments</TableHead>
                                        <TableHead className="text-center">Shares</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {communityStats.topPosts.map(post => {
                                        const CategoryIcon = categoryIcons[post.category as keyof typeof categoryIcons] || categoryIcons.Default;
                                        return (
                                            <TableRow key={post.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                                        <Link href={`/community/${post.id}`} className="hover:underline font-medium truncate" target="_blank">
                                                            {post.text.replace(/<[^>]+>/g, '').substring(0, 50)}...
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">{post.comments.length}</TableCell>
                                                <TableCell className="text-center">{(shareHistory || []).filter(s => s.postId === post.id).length}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Sharers</CardTitle>
                        <CardDescription>Users who have shared community content most frequently.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="text-right">Total Shares</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {communityStats.topSharers.map(sharer => (
                                    <TableRow key={sharer.email}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{sharer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{sharer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{sharer.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{sharer.company}</TableCell>
                                        <TableCell className="text-right font-medium">{sharer.count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
