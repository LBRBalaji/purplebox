// src/app/dashboard/analytics/page.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, List, Clock, FileText, CheckCircle } from 'lucide-react';
import { type User } from '@/contexts/auth-context';

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
    const { demands, submissions } = useData();
    const router = useRouter();
    const [allUsers, setAllUsers] = React.useState<User[]>([]);
    
    React.useEffect(() => {
        if (!isAuthLoading && user?.role !== 'SuperAdmin') {
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
            if (demand) {
                try {
                    const demandTime = parseInt(demand.demandId.split('-')[1]);
                    const subTime = parseInt(sub.property.propertyId.split('-')[1]);
                    if (!isNaN(demandTime) && !isNaN(subTime)) {
                        totalDiff += (subTime - demandTime);
                        count++;
                    }
                } catch (e) {
                    // Ignore if IDs are not in the expected format
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
                combined.push({
                    type: 'Demand',
                    id: d.demandId,
                    user: d.userName,
                    timestamp: new Date(parseInt(d.demandId.split('-')[1])),
                    details: `Logged demand for ${d.size.toLocaleString()} sq. ft. in ${d.location}`
                });
            } catch (e) { /* ignore format errors */ }
        });

        submissions.forEach(s => {
             try {
                combined.push({
                    type: 'Submission',
                    id: s.property.propertyId,
                    user: s.property.userName,
                    timestamp: new Date(parseInt(s.property.propertyId.split('-')[1])),
                    details: `Submitted property for demand ${s.demandId}`
                });
            } catch (e) { /* ignore format errors */ }
        });

        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    }, [demands, submissions]);

    if (isAuthLoading || user?.role !== 'SuperAdmin') {
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
