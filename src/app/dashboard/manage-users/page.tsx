
'use client';
import { AgentWaitlist } from "@/components/agent-waitlist";
import { UserList } from "@/components/user-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function ManageUsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user?.role === 'SuperAdmin';

    React.useEffect(() => {
        if (!isLoading && !hasAccess) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router, hasAccess]);
    
    if (isLoading || !hasAccess) {
        return null;
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Manage Users & Agents</h2>
                    <p className="text-muted-foreground mt-2">
                        Add, edit, or remove platform users and review agent applications from the waitlist.
                    </p>
                </div>
                <Tabs defaultValue="users">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="users">Platform Users</TabsTrigger>
                        <TabsTrigger value="agents">Agent Waitlist</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-6">
                        <UserList />
                    </TabsContent>
                    <TabsContent value="agents" className="mt-6">
                        <AgentWaitlist />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
