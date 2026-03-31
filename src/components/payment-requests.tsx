'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Building2, FileText, ExternalLink } from 'lucide-react';


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
  const { listings, listingAnalytics } = useData();
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
          const existingRes = await fetch('/api/registered-leads');
          const existingData = await existingRes.json();
          const existingLeads = Array.isArray(existingData) ? existingData : Object.values(existingData);
          const newLead = {
            id: leadId,
            customerId: customerEmail,
            leadName: request.prospectCompany,
            leadContact: request.prospectCompany,
            leadEmail: customerEmail,
            leadPhone: '',
            requirementsSummary: 'Prospect connected via platform after downloading listing ' + (listing.name || request.listingId),
            registeredBy: 'system',
            registeredAt: new Date().toISOString(),
            providers: [{
              providerEmail: request.developerId,
              properties: [{ listingId: request.listingId, status: 'Pending' }],
            }],
            isO2OCollaborator: false,
          };
          await fetch('/api/registered-leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([...existingLeads, newLead]),
          });
        }


        // Notify developer via notifications API
        try {
          const notifRes = await fetch('/api/notifications');
          const notifData = await notifRes.json();
          const existingNotifs = Array.isArray(notifData) ? notifData : Object.values(notifData);
          const newNotif = {
            id: 'notif-' + Date.now(),
            type: 'new_lead_for_provider',
            title: 'Payment Confirmed — Connect with Your Prospect',
            message: 'Your payment has been confirmed. An engagement lead has been created. Open the Chat widget (bottom right) to connect with your prospect on the platform.',
            href: '/dashboard?tab=registered-leads',
            timestamp: new Date().toISOString(),
            recipientEmail: request.developerId,
            triggeredBy: 'admin',
            isRead: false,
          };
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([...existingNotifs, newNotif]),
          });
        } catch(e) { console.error('Notification error:', e); }
        // Send receipt to developer
        const receiptId = 'RCPT-' + Date.now().toString(36).toUpperCase();
        const developer = allUsers.find((u: any) => u.email === request.developerId);
        fetch('/api/send-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            developerEmail: request.developerId,
            developerName: developer?.userName || request.developerId,
            developerCompany: developer?.companyName || '',
            prospectCompany: request.prospectCompany,
            listingId: request.listingId,
            listingLocation: listing?.location || '',
            amount: '₹5,000 + GST',
            receiptId,
            confirmedAt: Date.now(),
          }),
        }).catch(e => console.error('Receipt email error:', e));
        toast({ title: 'Payment Confirmed', description: 'Developer notified and receipt sent. Engagement lead created for ' + request.prospectCompany });
      } else {
        toast({ title: 'Request Rejected', description: 'Developer will be notified.' });
      }
      await fetchRequests();
    } catch(err: any) {
      console.error('Payment confirmation error:', err);
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Please try again.' });
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
                {req.status === 'connected' && (
                  <button onClick={() => {
                    const receiptData = {
                      receiptId: 'RCPT-' + req.id.substring(0,8).toUpperCase(),
                      developer: getDeveloperName(req.developerId),
                      developerId: req.developerId,
                      prospect: req.prospectCompany,
                      listing: getListingName(req.listingId),
                      amount: '₹5,000 + GST',
                      date: req.confirmedAt ? formatDate(req.confirmedAt) : '',
                    };
                    const w = window.open('', '_blank');
                    if (w) w.document.write('<html><head><title>Receipt ' + receiptData.receiptId + '</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px;} table{width:100%;border-collapse:collapse;} td{padding:10px;border-bottom:1px solid #eee;} .primary{color:#6141ac;} .header{background:#6141ac;color:white;padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;} .total{font-size:20px;font-weight:900;color:#6141ac;}</style></head><body><div class="header"><h1 style="margin:0">ORS-ONE</h1><p style="margin:6px 0 0;opacity:0.8;font-size:12px">Lakshmi Balaji ORS Private Limited</p></div><h2>Payment Receipt</h2><table><tr><td style="color:#888">Receipt No.</td><td><b>' + receiptData.receiptId + '</b></td></tr><tr><td style="color:#888">Date</td><td>' + receiptData.date + '</td></tr><tr><td style="color:#888">Billed To</td><td>' + receiptData.developer + '</td></tr><tr><td style="color:#888">Service</td><td>Pay For Purpose — Prospect Connection</td></tr><tr><td style="color:#888">Listing</td><td>' + receiptData.listing + '</td></tr><tr><td style="color:#888">Prospect Industry</td><td>' + receiptData.prospect + '</td></tr><tr><td style="color:#888">Amount</td><td class="total">' + receiptData.amount + '</td></tr></table><p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">For queries: balaji@lakshmibalajio2o.com</p></body></html>');
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0">
                    <FileText className="h-3.5 w-3.5" /> Receipt
                  </button>
                )}
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
