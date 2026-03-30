'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';


type PaymentRequest = {
  id: string;
  developerId: string;
  listingId: string;
  prospectCompany: string;
  activityType: string;
  status: string;
  requestedAt: number;
  confirmedAt: number | null;
};

export function PaymentRequests() {
  const { users } = useAuth();
  const { listings, listingAnalytics, addNotification, addRegisteredLead } = useData();
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<PaymentRequest[]>([]);
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [fetching, setFetching] = React.useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/prospect-connections');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data.sort((a: PaymentRequest, b: PaymentRequest) => b.requestedAt - a.requestedAt) : []);
    } catch {}
    finally { setFetching(false); }
  };

  React.useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (request: PaymentRequest, action: 'connected' | 'rejected') => {
    setLoading(prev => ({ ...prev, [request.id]: true }));
    try {
      await fetch('/api/prospect-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: request.developerId,
          listingId: request.listingId,
          prospectCompany: request.prospectCompany,
          activityType: request.activityType,
          status: action,
          requestedAt: request.requestedAt,
          confirmedAt: Date.now(),
        }),
      });

      if (action === 'connected') {
        const listing = listings.find(l => l.listingId === request.listingId);
        const analytics = listingAnalytics.find(a => a.listingId === request.listingId);
        const allUsers = Object.values(users || {}) as any[];

        const downloader = analytics?.downloadedBy?.find((d: any) => d.company === request.prospectCompany);
        let customerEmail = downloader?.email || '';
        if (!customerEmail) {
          const matchedUser = allUsers.find((u: any) => u.companyName === request.prospectCompany && u.role === 'User');
          customerEmail = matchedUser?.email || '';
        }

        if (customerEmail && listing) {
          const leadId = 'TXN-' + Date.now().toString(36).toUpperCase();
          addRegisteredLead({
            id: leadId,
            customerId: customerEmail,
            leadName: request.prospectCompany,
            leadContact: request.prospectCompany,
            leadEmail: customerEmail,
            leadPhone: '',
            requirementsSummary: 'Prospect connected via platform after downloading listing ' + (listing.name || request.listingId),
            registeredBy: 'system',
            providers: [{
              providerEmail: request.developerId,
              properties: [{ listingId: request.listingId, status: 'Pending' }],
            }],
            isO2OCollaborator: false,
          }, 'system');
        }

        addNotification({
          id: Date.now().toString(),
          type: 'new_lead_for_provider',
          title: 'Payment Confirmed — Engagement Lead Created',
          message: 'Your payment for prospect ' + request.prospectCompany + ' has been confirmed. A new engagement lead has been created. Go to My Leads & Proposals to connect.',
          href: '/dashboard?tab=registered-leads',
          timestamp: new Date().toISOString(),
          recipientEmail: request.developerId,
          triggeredBy: 'admin',
        });
        toast({ title: 'Payment Confirmed', description: 'Engagement lead auto-created for ' + request.prospectCompany });
      } else {
        toast({ title: 'Request Rejected', description: 'Developer will be notified.' });
      }
      await fetchRequests();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    } finally {
      setLoading(prev => ({ ...prev, [request.id]: false }));
    }
  };

  const getDeveloperName = (email: string) => {
    const u = Object.values(users || {}).find((u: any) => u.email === email);
    return (u as any)?.companyName || email;
  };

  const getListingName = (listingId: string) => {
    const l = listings.find(l => l.listingId === listingId);
    return l ? (l.name || listingId) + ' · ' + l.location : listingId;
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const pending = requests.filter(r => r.status === 'requested');
  const completed = requests.filter(r => r.status !== 'requested');

  if (fetching) return <div className="text-center py-12 text-muted-foreground text-sm">Loading payment requests...</div>;

  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-bold text-foreground text-lg mb-1">No Payment Requests</h3>
        <p className="text-muted-foreground text-sm">When developers request to connect with prospects, payment requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <p className="text-sm font-bold text-foreground">Pending Confirmation ({pending.length})</p>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {pending.map((req, i) => (
              <div key={req.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{getDeveloperName(req.developerId)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">wants to connect with <span className="font-semibold text-foreground">{req.prospectCompany}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{getListingName(req.listingId)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-primary">₹5,000 + GST</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(req.requestedAt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" className="rounded-lg text-xs bg-primary hover:bg-primary/90"
                    disabled={loading[req.id]}
                    onClick={() => handleAction(req, 'connected')}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {loading[req.id] ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50"
                    disabled={loading[req.id]}
                    onClick={() => handleAction(req, 'rejected')}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold text-foreground">Completed ({completed.length})</p>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {completed.map((req) => (
              <div key={req.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{getDeveloperName(req.developerId)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{req.prospectCompany} · {getListingName(req.listingId)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-primary">₹5,000 + GST</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{req.confirmedAt ? formatDate(req.confirmedAt) : ''}</p>
                </div>
                <Badge variant="outline" className={req.status === 'connected' ? 'bg-green-50 text-green-700 border-green-200 text-xs' : 'bg-red-50 text-red-700 border-red-200 text-xs'}>
                  {req.status === 'connected' ? 'Confirmed' : 'Rejected'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
