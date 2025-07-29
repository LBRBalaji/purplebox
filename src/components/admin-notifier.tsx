
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function AdminNotifier() {
  const { lastEvent } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const averyLongTimeAgo = new Date('2000-01-01').toISOString();
  const [lastNotifiedTimestamp, setLastNotifiedTimestamp] = React.useState(averyLongTimeAgo);

  React.useEffect(() => {
    if (user?.role !== 'SuperAdmin' || !lastEvent || lastEvent.timestamp <= lastNotifiedTimestamp) {
      return;
    }

    // This ensures we don't show a notification for the admin's own actions
    if (lastEvent.triggeredBy === user.email) {
      return;
    }

    if (lastEvent.type === 'new_demand') {
      toast({
        title: (
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span>New Demand Logged</span>
            </div>
        ),
        description: `Customer logged a new demand: ${lastEvent.id}`,
      });
    } else if (lastEvent.type === 'new_submission') {
       toast({
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>New Property Match</span>
            </div>
        ),
        description: `A new match was submitted for demand: ${lastEvent.id}`,
      });
    }

    setLastNotifiedTimestamp(lastEvent.timestamp);

  }, [lastEvent, user, toast, lastNotifiedTimestamp]);

  return null; // This component does not render anything visible
}
