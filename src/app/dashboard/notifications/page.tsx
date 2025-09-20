
// src/app/dashboard/notifications/page.tsx
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Bell, MessageSquare, ClipboardList, CheckCircle, UserPlus, HardHat } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const activityIconMap: { [key: string]: React.ElementType } = {
  'new_demand': ClipboardList,
  'new_submission': CheckCircle,
  'new_lead_for_provider': UserPlus,
  'new_chat_message': MessageSquare,
  'new_activity': HardHat,
};


export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationsAsRead } = useData();
  const router = useRouter();

  React.useEffect(() => {
    // Mark notifications as read when the component mounts
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);
  
  if (!user) {
    router.push('/');
    return null;
  }

  const myNotifications = notifications.filter(n => {
    // SuperAdmins and O2O see almost everything
    if (user.role === 'SuperAdmin' || user.role === 'O2O') {
        // Exclude notifications triggered by themselves
        return n.triggeredBy !== user.email;
    }
    // Other roles only see notifications targeted to them
    return n.recipientEmail === user.email;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3">
            <Bell /> Notifications
          </h2>
          <p className="text-muted-foreground mt-2">
            A log of all recent activity on the platform that requires your attention.
          </p>
        </div>
        <Card>
            <CardContent className="p-0">
                 {myNotifications.length > 0 ? (
                    <div className="divide-y">
                        {myNotifications.map(notification => (
                            <div key={notification.id} className="p-4 flex items-start gap-4 hover:bg-secondary/50">
                                <div className="mt-1">
                                    {React.createElement(activityIconMap[notification.type] || Bell, { className: "h-5 w-5 text-primary" })}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={notification.href}>
                                        View <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        <p className="font-semibold">No notifications yet.</p>
                        <p className="text-sm mt-1">New activities will appear here.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
