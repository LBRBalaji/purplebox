'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Star, FileText, CheckSquare, Square, Send, Building2, MapPin, Maximize2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ORS_ADMIN = 'balaji@lakshmibalajio2o.com';

export function GeneralShortlist() {
  const { listings, generalShortlist, toggleGeneralShortlist, downloadHistory, addRegisteredLead, addTransactionActivity } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  const shortlistedListings = React.useMemo(() =>
    listings.filter(l => generalShortlist.includes(l.listingId)),
    [listings, generalShortlist]
  );

  // Downloaded listings not yet shortlisted — for the "you also downloaded" prompt
  const myDownloads = React.useMemo(() => {
    if (!user) return [];
    const downloadedIds = new Set(
      downloadHistory.filter(d => d.userId === user.email).map(d => d.listingId)
    );
    return listings.filter(l => downloadedIds.has(l.listingId) && !generalShortlist.includes(l.listingId));
  }, [downloadHistory, listings, generalShortlist, user]);

  // Downloaded listings that ARE shortlisted
  const downloadedShortlisted = React.useMemo(() => {
    if (!user) return [];
    const downloadedIds = new Set(
      downloadHistory.filter(d => d.userId === user.email).map(d => d.listingId)
    );
    return shortlistedListings.filter(l => downloadedIds.has(l.listingId));
  }, [downloadHistory, shortlistedListings, user]);

  const allListings = shortlistedListings;
  const allIds = allListings.map(l => l.listingId);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const handleBulkRFQ = async () => {
    if (!user || selected.size === 0) return;
    setSubmitting(true);
    const successIds: string[] = [];

    for (const listingId of Array.from(selected)) {
      const listing = listings.find(l => l.listingId === listingId);
      if (!listing) continue;

      const dealId = `LDR-QUOTE-${Date.now()}-${listingId}`;
      const developerEmail = listing.developerId;

      const newLead = {
        id: dealId,
        customerId: user.email,
        leadName: user.companyName,
        leadContact: user.userName,
        leadEmail: user.email,
        leadPhone: user.phone || '',
        requirementsSummary: `Request for Quote: ${listingId} — ${listing.name || listing.location?.split(',')[0]}`,
        registeredBy: user.email,
        providers: [{
          providerEmail: developerEmail || ORS_ADMIN,
          properties: [{ listingId, status: 'Pending' as const }],
        }],
        isO2OCollaborator: true,
      };

      addRegisteredLead(newLead as any, user.email);
      addTransactionActivity({
        leadId: dealId,
        activityType: 'Quote Requested',
        details: {
          message: `${user.companyName} submitted a Request for Quote for listing ${listingId} at ${listing.location?.split(',')[0] || listing.location}.`,
        },
        createdBy: user.email,
      });

      // Notify developer
      if (developerEmail && developerEmail !== ORS_ADMIN) {
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            id: `notif-rfq-bulk-${dealId}`,
            type: 'new_lead_for_provider',
            title: `Request for Quote: ${listingId}`,
            message: `${user.companyName} has submitted a Request for Quote for your listing ${listingId} at ${listing.location?.split(',')[0] || listing.location}. Please respond with commercial terms.`,
            href: `/dashboard/leads/${dealId}?tab=activity`,
            recipientEmail: developerEmail,
            timestamp: new Date().toISOString(),
            triggeredBy: user.email,
            isRead: false,
          }]),
        }).catch(() => {});
      }
      successIds.push(listingId);
    }

    setSelected(new Set());
    setSubmitting(false);

    toast({
      title: `Request for Quote Sent`,
      description: `${successIds.length} developer${successIds.length > 1 ? 's have' : ' has'} been notified. You'll hear back in their Transaction Workspace.`,
    });

    // Navigate to transactions
    setTimeout(() => router.push('/dashboard?tab=my-transactions'), 1200);
  };

  if (allListings.length === 0 && myDownloads.length === 0) {
    return (
      <div className="mt-8">
        <div className="p-12 text-center" style={{background:'#fff',border:'1px solid hsl(259 30% 90%)'}}>
          <Star className="h-10 w-10 mx-auto mb-3" style={{color:'hsl(259 30% 80%)'}} />
          <p className="font-bold" style={{color:'#1e1537'}}>No shortlisted properties yet</p>
          <p className="text-xs mt-1" style={{color:'hsl(259 15% 55%)'}}>
            Click the star icon on any listing to save it here. You can then request quotes in bulk.
          </p>
          <Button asChild className="mt-4" style={{borderRadius:0,background:'#6141ac'}}>
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">

      {/* RFQ Hub header */}
      {allListings.length > 0 && (
        <div style={{border:'1px solid hsl(259 44% 82%)'}}>
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
            <div>
              <p className="text-sm font-bold text-white">Request for Quote — Shortlisted Properties</p>
              <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.5)'}}>
                {selected.size === 0
                  ? 'Select one or more listings to send a Request for Quote to their developers.'
                  : `${selected.size} listing${selected.size > 1 ? 's' : ''} selected — developers will be notified individually.`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={toggleAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2"
                style={{background:'rgba(255,255,255,0.1)',color:'#fff',borderRadius:0,border:'1px solid rgba(255,255,255,0.2)'}}>
                {allSelected
                  ? <><CheckSquare className="h-3.5 w-3.5" /> Deselect All</>
                  : <><Square className="h-3.5 w-3.5" /> Select All</>}
              </button>
              <button
                onClick={handleBulkRFQ}
                disabled={selected.size === 0 || submitting}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 transition-all"
                style={{
                  background: selected.size > 0 ? '#6141ac' : 'rgba(255,255,255,0.15)',
                  color: selected.size > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                  borderRadius: 0,
                  cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                }}>
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Sending...' : `Request for Quote${selected.size > 1 ? ` (${selected.size})` : ''}`}
              </button>
            </div>
          </div>

          {/* Listing rows */}
          <div style={{background:'#fff'}}>
            {allListings.map((listing, idx) => {
              const isSelected = selected.has(listing.listingId);
              const wasDownloaded = downloadedShortlisted.some(l => l.listingId === listing.listingId);
              return (
                <div key={listing.listingId}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-all"
                  style={{
                    borderTop: idx > 0 ? '1px solid hsl(259 30% 93%)' : 'none',
                    background: isSelected ? 'hsl(259 44% 97%)' : '#fff',
                    borderLeft: isSelected ? '3px solid #6141ac' : '3px solid transparent',
                  }}
                  onClick={() => toggleSelect(listing.listingId)}>

                  {/* Checkbox */}
                  <div className="flex-shrink-0" onClick={e => { e.stopPropagation(); toggleSelect(listing.listingId); }}>
                    {isSelected
                      ? <CheckSquare className="h-5 w-5" style={{color:'#6141ac'}} />
                      : <Square className="h-5 w-5" style={{color:'hsl(259 30% 75%)'}} />}
                  </div>

                  {/* Thumbnail */}
                  <div className="h-14 w-20 flex-shrink-0 overflow-hidden" style={{background:'hsl(259 30% 93%)'}}>
                    <img
                      src={listing.documents?.[0]?.url || 'https://placehold.co/80x56.png'}
                      alt={listing.name}
                      className="h-full w-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x56.png'; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold truncate" style={{color:'#1e1537'}}>
                        {listing.name || listing.listingId}
                      </p>
                      {wasDownloaded && (
                        <span className="text-xs px-1.5 py-0.5 font-semibold flex-shrink-0"
                          style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
                          Downloaded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs flex items-center gap-1" style={{color:'#888'}}>
                        <MapPin className="h-3 w-3" />{listing.location?.split(',').slice(0,2).join(', ')}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{color:'#888'}}>
                        <Maximize2 className="h-3 w-3" />{listing.sizeSqFt?.toLocaleString()} sft
                      </span>
                      <span className="text-xs font-semibold" style={{color:'#6141ac'}}>
                        Request for Quote
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Link href={`/listings/${listing.listingId}`} target="_blank"
                      className="text-xs font-semibold px-3 py-1.5"
                      style={{border:'1px solid hsl(259 30% 85%)',color:'#6141ac',borderRadius:0}}>
                      View
                    </Link>
                    <button onClick={() => toggleGeneralShortlist(listing.listingId)}
                      className="text-xs font-semibold px-3 py-1.5"
                      style={{border:'1px solid hsl(259 30% 85%)',color:'#888',borderRadius:0}}>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          {selected.size > 0 && (
            <div className="px-5 py-3 flex items-center justify-between"
              style={{background:'hsl(259 44% 96%)',borderTop:'1px solid hsl(259 44% 82%)'}}>
              <p className="text-xs" style={{color:'hsl(259 15% 50%)'}}>
                Each developer receives an individual notification. Your request is sent separately — developers do not see each other.
              </p>
              <button onClick={handleBulkRFQ} disabled={submitting}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 ml-4 flex-shrink-0"
                style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Sending...' : `Send ${selected.size} Request${selected.size > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Downloaded but not shortlisted — prompt to shortlist */}
      {myDownloads.length > 0 && (
        <div style={{border:'1px solid hsl(259 30% 88%)'}}>
          <div className="px-4 py-3" style={{background:'hsl(259 30% 97%)'}}>
            <p className="text-xs font-bold" style={{color:'#1e1537'}}>
              You also downloaded {myDownloads.length} listing{myDownloads.length > 1 ? 's' : ''} not in your shortlist
            </p>
            <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
              Add them to your shortlist to include in bulk Request for Quote.
            </p>
          </div>
          {myDownloads.slice(0, 3).map((listing, idx) => (
            <div key={listing.listingId} className="flex items-center gap-3 px-4 py-3"
              style={{borderTop: idx > 0 ? '1px solid hsl(259 30% 93%)' : '1px solid hsl(259 30% 93%)',background:'#fff'}}>
              <Building2 className="h-4 w-4 flex-shrink-0" style={{color:'#aaa'}} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>{listing.name || listing.listingId}</p>
                <p className="text-xs" style={{color:'#aaa'}}>{listing.location?.split(',').slice(0,2).join(', ')} · {listing.sizeSqFt?.toLocaleString()} sft</p>
              </div>
              <button onClick={() => toggleGeneralShortlist(listing.listingId)}
                className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
                style={{background:'hsl(259 44% 94%)',color:'#6141ac',borderRadius:0}}>
                <Star className="h-3 w-3" /> Add to Shortlist
              </button>
            </div>
          ))}
          {myDownloads.length > 3 && (
            <div className="px-4 py-2 text-xs" style={{color:'hsl(259 15% 55%)',borderTop:'1px solid hsl(259 30% 93%)',background:'#fff'}}>
              +{myDownloads.length - 3} more downloaded listings
            </div>
          )}
        </div>
      )}
    </div>
  );
}
