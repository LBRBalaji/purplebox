'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, Clock, Building2, Warehouse, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'none' | 'requested' | 'connected';

type ProspectRecord = {
  listingId: string;
  listingName: string;
  location: string;
  prospectCompany: string;
  industryType: string;
  activityType: 'download' | 'view';
  lastActivity: number;
  activityCount: number;
  status: ConnectionStatus;
};

export function ProspectsTab() {
  const { user } = useAuth();
  const { listings, listingAnalytics } = useData();
  const { toast } = useToast();
  const [connections, setConnections] = React.useState<Record<string, ConnectionStatus>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [fetching, setFetching] = React.useState(true);

  const myListings = React.useMemo(() =>
    listings.filter(l => l.developerId === user?.email && l.status === 'approved'),
    [listings, user]
  );

  React.useEffect(() => {
    fetch('/api/prospect-connections')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, ConnectionStatus> = {};
        (data || []).forEach((c: any) => {
          if (c.developerId === user?.email) {
            const key = c.listingId + '_' + c.prospectCompany;
            map[key] = c.status;
          }
        });
        setConnections(map);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const prospects = React.useMemo(() => {
    const result: ProspectRecord[] = [];
    myListings.forEach(listing => {
      const analytics = listingAnalytics.find(a => a.listingId === listing.listingId);
      if (!analytics) return;

      const companyMap: Record<string, ProspectRecord> = {};

      (analytics.downloadedBy || []).forEach(d => {
        if (!d.company || d.company === 'Anonymous') return;
        const key = listing.listingId + '_' + d.company;
        const last = Math.max(...d.timestamps);
        if (!companyMap[d.company] || companyMap[d.company].activityType !== 'download') {
          companyMap[d.company] = {
            listingId: listing.listingId,
            listingName: listing.name || listing.listingId,
            location: listing.location,
            prospectCompany: d.company,
            industryType: d.industryType || 'Unknown Industry',
            activityType: 'download',
            lastActivity: last,
            activityCount: d.timestamps.length,
            status: connections[key] || 'none',
          };
        }
      });

      (analytics.viewedBy || []).forEach(v => {
        if (!v.company || v.company === 'Anonymous') return;
        const key = listing.listingId + '_' + v.company;
        if (!companyMap[v.company]) {
          companyMap[v.company] = {
            listingId: listing.listingId,
            listingName: listing.name || listing.listingId,
            location: listing.location,
            prospectCompany: v.company,
            industryType: v.industryType || 'Unknown Industry',
            activityType: 'view',
            lastActivity: v.timestamp,
            activityCount: 1,
            status: connections[key] || 'none',
          };
        }
      });

      Object.values(companyMap).forEach(p => result.push(p));
    });

    return result.sort((a, b) => {
      if (a.activityType === 'download' && b.activityType !== 'download') return -1;
      if (a.activityType !== 'download' && b.activityType === 'download') return 1;
      return b.lastActivity - a.lastActivity;
    });
  }, [myListings, listingAnalytics, connections]);

  const downloads = prospects.filter(p => p.activityType === 'download');
  const views = prospects.filter(p => p.activityType === 'view');

  const handleRequestConnect = async (prospect: ProspectRecord) => {
    const key = prospect.listingId + '_' + prospect.prospectCompany;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fetch('/api/prospect-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: user?.email,
          listingId: prospect.listingId,
          prospectCompany: prospect.prospectCompany,
          activityType: prospect.activityType,
          status: 'requested',
          requestedAt: Date.now(),
        }),
      });
      setConnections(prev => ({ ...prev, [key]: 'requested' }));
      toast({ title: 'Request Sent!', description: 'This payment is for connecting with this specific prospect only. ORS-ONE team will confirm receipt and unlock the connection.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getInitials = (industry: string) => {
    if (industry.includes('3PL')) return '3P';
    if (industry.includes('E-Commerce')) return 'EC';
    if (industry.includes('FMCG')) return 'FM';
    if (industry.includes('Pharma')) return 'PH';
    if (industry.includes('Automotive')) return 'AU';
    if (industry.includes('Cold Chain')) return 'CC';
    if (industry.includes('Textile')) return 'TX';
    if (industry.includes('Electronics')) return 'EL';
    if (industry.includes('Chemical')) return 'CH';
    if (industry.includes('Agricultural')) return 'AG';
    if (industry.includes('Engineering')) return 'EN';
    if (industry.includes('Financial')) return 'FI';
    if (industry.includes('Media')) return 'ME';
    if (industry.includes('Retail')) return 'RT';
    return industry.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  const ProspectRow = ({ prospect }: { prospect: ProspectRecord }) => {
    const key = prospect.listingId + '_' + prospect.prospectCompany;
    const status = connections[key] || prospect.status;
    const isLoading = loading[key];

    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-primary">
          {prospect.industryType && prospect.industryType !== 'Unknown Industry'
            ? getInitials(prospect.industryType)
            : <Warehouse className="h-4 w-4 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{prospect.industryType && prospect.industryType !== 'Unknown Industry' ? prospect.industryType : 'Verified Prospect'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {prospect.activityType === 'download'
              ? prospect.activityCount + ' download' + (prospect.activityCount > 1 ? 's' : '')
              : 'Viewed ' + prospect.activityCount + ' time' + (prospect.activityCount > 1 ? 's' : '')
            } · {formatTime(prospect.lastActivity)}
          </p>
        </div>
        <Badge variant="outline" className={cn('text-xs flex-shrink-0',
          prospect.activityType === 'download'
            ? 'bg-primary/5 text-primary border-primary/20'
            : 'bg-accent/10 text-accent-foreground border-accent/20'
        )}>
          {prospect.activityType === 'download'
            ? 'Listing Accessed'
            : 'Listing Viewed'
          }
        </Badge>
        {status === 'connected' ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex-shrink-0">
            <CheckCircle className="h-3.5 w-3.5" /> Connected
          </div>
        ) : status === 'requested' ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex-shrink-0">
            <Clock className="h-3.5 w-3.5" /> Awaiting Confirmation
          </div>
        ) : (
          <Button size="sm" className="rounded-lg text-xs font-bold flex-shrink-0 bg-primary hover:bg-primary/90"
            onClick={() => handleRequestConnect(prospect)}
            disabled={isLoading}>
            {isLoading ? 'Requesting...' : 'Pay ₹5,000 — Connect with Prospect'}
          </Button>
        )}
      </div>
    );
  };

  const ListingGroup = ({ listingId, listingName, location, items }: { listingId: string; listingName: string; location: string; items: ProspectRecord[] }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{listingName}</span>
          <span className="text-xs text-muted-foreground">{location}</span>
        </div>
        <Badge variant="outline" className="text-xs">{items.length} prospect{items.length > 1 ? 's' : ''}</Badge>
      </div>
      {items.map((p, i) => <ProspectRow key={i} prospect={p} />)}
    </div>
  );

  if (fetching) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Loading prospects...</div>;
  }

  if (prospects.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-bold text-foreground text-lg mb-1">No Prospects Yet</h3>
        <p className="text-muted-foreground text-sm">When customers view or download your listings, they will appear here.</p>
      </div>
    );
  }

  const groupByListing = (items: ProspectRecord[]) => {
    const map: Record<string, ProspectRecord[]> = {};
    items.forEach(p => {
      if (!map[p.listingId]) map[p.listingId] = [];
      map[p.listingId].push(p);
    });
    return map;
  };

  const downloadGroups = groupByListing(downloads);
  const viewGroups = groupByListing(views);

  return (
    <div className="space-y-6 mt-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Prospects', value: prospects.length },
          { label: 'Downloads', value: downloads.length },
          { label: 'Detailed Views', value: views.length },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {downloads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm font-bold text-foreground">Downloads — High Intent</p>
          </div>
          {Object.entries(downloadGroups).map(([listingId, items]) => (
            <ListingGroup key={listingId} listingId={listingId}
              listingName={items[0].listingName} location={items[0].location} items={items} />
          ))}
        </div>
      )}

      {views.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <p className="text-sm font-bold text-foreground">Detailed Views — Emerging Interest</p>
          </div>
          {Object.entries(viewGroups).map(([listingId, items]) => (
            <ListingGroup key={listingId} listingId={listingId}
              listingName={items[0].listingName} location={items[0].location} items={items} />
          ))}
        </div>
      )}
    </div>
  );
}
