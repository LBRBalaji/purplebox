'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import type { DemandSchema, ListingSchema } from '@/lib/schema';
import {
  Handshake, MapPin, Building, Factory, ListChecks, Info, Target,
  Share2, Mail, MessageCircle, Linkedin, Search, SlidersHorizontal,
  Plus, ChevronDown, ChevronUp, X, ArrowRight, LogIn
} from 'lucide-react';

// ── Share helpers ────────────────────────────────────────────────────────────
function buildShareText(demand: DemandSchema) {
  const loc = demand.locationName || 'India';
  const size = demand.size?.toLocaleString() || '';
  return `Warehouse Demand: ${size} sft near ${loc} (${demand.readiness}) — ORS-ONE`;
}
function buildShareUrl(demand: DemandSchema) {
  return `https://lease.orsone.app/demands`;
}

function SharePanel({ demand, onClose }: { demand: DemandSchema; onClose: () => void }) {
  const text = buildShareText(demand);
  const url = buildShareUrl(demand);
  const enc = encodeURIComponent;

  const channels = [
    {
      label: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.112 1.523 5.84L.057 23.428a.5.5 0 00.609.61l5.652-1.456A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.5-5.201-1.375l-.373-.213-3.86.994.998-3.77-.233-.384A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${enc(text + ' ' + url)}`,
    },
    {
      label: 'LinkedIn',
      color: '#0A66C2',
      icon: <Linkedin size={16} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}&summary=${enc(text)}`,
    },
    {
      label: 'Facebook',
      color: '#1877F2',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`,
    },
    {
      label: 'Instagram',
      color: '#E1306C',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      // Instagram doesn't have a web share — copy link instead
      href: null,
      copyText: text + ' ' + url,
    },
    {
      label: 'Email',
      color: '#6141ac',
      icon: <Mail size={16} />,
      href: `mailto:?subject=${enc('Warehouse Demand — ORS-ONE')}&body=${enc(text + '\n\n' + url)}`,
    },
  ];

  const [copied, setCopied] = React.useState(false);
  const copyLink = (txt?: string) => {
    navigator.clipboard.writeText(txt || url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(30,21,55,0.7)'}}>
      <div className="w-full max-w-sm" style={{background:'#fff',borderRadius:0,boxShadow:'0 8px 40px rgba(97,65,172,0.25)'}}>
        <div className="flex items-center justify-between px-5 py-4" style={{background:'#1e1537'}}>
          <p className="text-sm font-bold text-white">Share this Demand</p>
          <button onClick={onClose}><X className="h-4 w-4 text-white opacity-60 hover:opacity-100" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs" style={{color:'hsl(259 15% 50%)',lineHeight:1.6}}>{buildShareText(demand)}</p>
          <div className="grid grid-cols-5 gap-2 pt-1">
            {channels.map(ch => (
              <button key={ch.label}
                onClick={() => ch.href ? window.open(ch.href, '_blank') : copyLink(ch.copyText)}
                className="flex flex-col items-center gap-1.5 py-3 transition-opacity hover:opacity-80"
                style={{background:'hsl(259 44% 96%)',borderRadius:0,border:'1px solid hsl(259 44% 86%)'}}>
                <span style={{color: ch.color}}>{ch.icon}</span>
                <span className="text-xs font-medium" style={{color:'#1e1537',fontSize:'10px'}}>{ch.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input readOnly value={url} className="flex-1 text-xs px-3 py-2 border" style={{borderColor:'hsl(259 30% 85%)',borderRadius:0,color:'hsl(259 15% 50%)',background:'hsl(259 44% 97%)'}} />
            <button onClick={() => copyLink()} className="text-xs font-bold px-3 py-2" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Match submission dialog ──────────────────────────────────────────────────
function MatchDialog({ demand, onClose }: { demand: DemandSchema; onClose: () => void }) {
  const { user } = useAuth();
  const { listings, addRegisteredLead, addTransactionActivity } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const isProvider = user?.role === 'Warehouse Developer';

  // Developer: only their own approved listings
  const myListings = React.useMemo(() =>
    listings.filter(l => l.developerId === user?.email && l.status === 'approved'),
    [listings, user]
  );

  // Admin: all approved listings, grouped by developer
  const allApprovedListings = React.useMemo(() =>
    listings.filter(l => l.status === 'approved'),
    [listings]
  );

  const [selectedListingId, setSelectedListingId] = React.useState('');
  const [brokerageAgreed, setBrokerageAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Detect geo-matches for developer
  const [demandLat, demandLng] = demand.location?.split(',').map(Number) ?? [NaN, NaN];
  const potentialMatches = React.useMemo(() => {
    if (!isProvider || isNaN(demandLat)) return [];
    return myListings.filter(l => {
      if (!l.latLng) return false;
      const [la, lo] = l.latLng.split(',').map(Number);
      const R = 6371, dLa = (la - demandLat) * Math.PI / 180, dLo = (lo - demandLng) * Math.PI / 180;
      const a = Math.sin(dLa/2)**2 + Math.cos(demandLat*Math.PI/180)*Math.cos(la*Math.PI/180)*Math.sin(dLo/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= (demand.radius || 25);
    });
  }, [myListings, demandLat, demandLng, demand.radius, isProvider]);

  const listingsToShow = isAdmin ? allApprovedListings : myListings;

  // Group by developer for admin
  const grouped = React.useMemo(() => {
    if (!isAdmin) return null;
    const g: Record<string, ListingSchema[]> = {};
    allApprovedListings.forEach(l => {
      if (!g[l.developerId]) g[l.developerId] = [];
      g[l.developerId].push(l);
    });
    return g;
  }, [isAdmin, allApprovedListings]);

  const handleSubmit = async () => {
    if (!selectedListingId || !user) return;
    setSubmitting(true);
    try {
      const dealId = `LDR-MATCH-${Date.now()}`;
      const selectedListing = listings.find(l => l.listingId === selectedListingId)!;
      addRegisteredLead({
        id: dealId,
        customerId: demand.userEmail,
        leadName: demand.companyName,
        leadContact: demand.userName,
        leadEmail: demand.userEmail,
        leadPhone: demand.userPhone || '',
        requirementsSummary: `Match for demand ${demand.demandId} — ${demand.size?.toLocaleString()} sft near ${demand.locationName || 'location'}`,
        registeredBy: user.email,
        providers: [{ providerEmail: selectedListing.developerId, properties: [{ listingId: selectedListingId, status: 'Pending' as const }] }],
        isO2OCollaborator: true,
      } as any, user.email);

      toast({ title: 'Match Submitted', description: 'ORS-ONE will connect both parties. Transaction workspace created.' });
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  if (isProvider && myListings.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(30,21,55,0.7)'}}>
        <div className="w-full max-w-md space-y-4 p-6" style={{background:'#fff',boxShadow:'0 8px 40px rgba(97,65,172,0.2)'}}>
          <p className="font-bold text-sm" style={{color:'#1e1537'}}>No Approved Listings Found</p>
          <p className="text-xs" style={{color:'hsl(259 15% 50%)',lineHeight:1.6}}>
            You need at least one approved listing to submit a match. Add a listing now — once approved by ORS-ONE admin it will appear here.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { onClose(); router.push('/dashboard?tab=my-listings'); }}
              className="flex-1 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{background:'#6141ac',borderRadius:0}}>
              <Plus className="h-4 w-4" /> Add a Listing
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold" style={{background:'hsl(259 30% 93%)',color:'hsl(259 15% 45%)',borderRadius:0}}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(30,21,55,0.7)'}}>
      <div className="w-full max-w-lg" style={{background:'#fff',boxShadow:'0 8px 40px rgba(97,65,172,0.2)'}}>
        <div className="px-6 py-4" style={{background:'#1e1537'}}>
          <p className="text-sm font-bold text-white">Submit Listing as Match</p>
          <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.5)'}}>Demand {demand.demandId} · {demand.size?.toLocaleString()} sft · {demand.locationName || ''}</p>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Potential matches banner for developer */}
          {isProvider && potentialMatches.length > 0 && (
            <div className="px-4 py-3 text-xs" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
              <p className="font-bold" style={{color:'#15803d'}}>
                {potentialMatches.length} listing{potentialMatches.length > 1 ? 's' : ''} in your inventory match the location radius
              </p>
            </div>
          )}

          {/* Listing selector */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{color:'#1e1537'}}>
              {isAdmin ? 'Select any approved listing' : 'Select your listing to submit'}
            </label>
            <select value={selectedListingId} onChange={e => setSelectedListingId(e.target.value)}
              className="w-full h-10 border px-3 text-sm" style={{borderColor:'hsl(259 30% 85%)',borderRadius:0}}>
              <option value="">Choose a listing...</option>
              {isAdmin && grouped ? (
                Object.entries(grouped).map(([devEmail, devListings]) => (
                  <optgroup key={devEmail} label={`Developer: ${devEmail}`}>
                    {devListings.map(l => (
                      <option key={l.listingId} value={l.listingId}>
                        {l.listingId} — {l.name || l.location?.split(',')[0]} ({l.sizeSqFt?.toLocaleString()} sft)
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                <>
                  {potentialMatches.length > 0 && (
                    <optgroup label="Within demand radius">
                      {potentialMatches.map(l => (
                        <option key={l.listingId} value={l.listingId}>{l.listingId} — {l.name || l.location?.split(',')[0]} ({l.sizeSqFt?.toLocaleString()} sft)</option>
                      ))}
                    </optgroup>
                  )}
                  {myListings.filter(l => !potentialMatches.some(m => m.listingId === l.listingId)).length > 0 && (
                    <optgroup label="Other listings">
                      {myListings.filter(l => !potentialMatches.some(m => m.listingId === l.listingId)).map(l => (
                        <option key={l.listingId} value={l.listingId}>{l.listingId} — {l.name || l.location?.split(',')[0]} ({l.sizeSqFt?.toLocaleString()} sft)</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          {/* Brokerage T&C */}
          {demand.isOrsoneTP && (
            <div className="px-4 py-3 text-xs" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 84%)'}}>
              <p style={{color:'hsl(259 15% 40%)',lineHeight:1.7}}>
                This demand is facilitated by <strong style={{color:'#1e1537'}}>ORS-ONE as Official Transaction Partner</strong>. Industry standard brokerage is payable to Lakshmi Balaji ORS Private Limited upon successful deal closure.
              </p>
            </div>
          )}

          {/* Acknowledgement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={brokerageAgreed} onChange={e => setBrokerageAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-purple-600" />
            <span className="text-xs" style={{color:'#1e1537',lineHeight:1.6}}>
              I, <strong>{user?.userName}</strong> ({user?.companyName}), formally acknowledge the brokerage terms and submit this listing against demand <strong>{demand.demandId}</strong>.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSubmit} disabled={!brokerageAgreed || !selectedListingId || submitting}
              className="flex-1 py-2.5 text-sm font-bold text-white"
              style={{background: brokerageAgreed && selectedListingId ? '#6141ac' : 'hsl(259 30% 80%)', borderRadius:0, cursor: brokerageAgreed && selectedListingId ? 'pointer' : 'not-allowed'}}>
              {submitting ? 'Submitting...' : 'Confirm & Submit Match'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold" style={{background:'hsl(259 30% 93%)',color:'hsl(259 15% 45%)',borderRadius:0}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Public Demand Card ───────────────────────────────────────────────────────
function PublicDemandCard({ demand }: { demand: DemandSchema }) {
  const { user } = useAuth();
  const [showShare, setShowShare] = React.useState(false);
  const [showMatch, setShowMatch] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const isProvider = user?.role === 'Warehouse Developer';
  const canSubmitMatch = isAdmin || isProvider;

  const readinessColor: Record<string, string> = {
    'Immediate': '#e1f5ee',
    'Within 45 Days': '#faeeda',
    'Within 90 Days': '#faeeda',
    'More than 90 Days': '#f4f2fb',
    'BTS': '#e6f1fb',
  };
  const readinessText: Record<string, string> = {
    'Immediate': '#0f6e56',
    'Within 45 Days': '#854f0b',
    'Within 90 Days': '#854f0b',
    'More than 90 Days': '#3b2870',
    'BTS': '#185fa5',
  };

  return (
    <div style={{background:'#fff',border:'0.5px solid hsl(259 30% 88%)',borderRadius:0}}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-medium px-2 py-0.5" style={{background:'#f0edfb',color:'#6141ac'}}>
              {demand.operationType}
            </span>
            <span className="text-xs font-medium px-2 py-0.5" style={{background: readinessColor[demand.readiness] || '#f4f2fb', color: readinessText[demand.readiness] || '#3b2870'}}>
              {demand.readiness}
            </span>
            {(demand as any).isOrsoneTP && (
              <span className="text-xs font-medium px-2 py-0.5" style={{background:'#e1f5ee',color:'#0f6e56'}}>
                ORS-ONE TP
              </span>
            )}
          </div>
          <button onClick={() => setShowShare(true)} className="flex-shrink-0 p-1.5 hover:opacity-70 transition-opacity" style={{color:'#6141ac'}}>
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-base font-bold mb-1" style={{color:'#1e1537'}}>
          {demand.size?.toLocaleString()} – {Math.round((demand.size || 0) * 1.1).toLocaleString()} sft · {demand.locationName || demand.location?.split(',')[0] || 'India'}
        </p>
        <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>
          Within {demand.radius} km · {demand.buildingType} · Posted {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'recently'}
        </p>
      </div>

      {/* Location map — Static Maps API circle showing demand radius */}
      {demand.location && demand.location.includes(',') && (() => {
        const [lat, lng] = demand.location.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        const radius = demand.radius || 10;
        // Build circle path for Static Maps API
        // Approximate circle using 20-point polygon
        const toRad = (d: number) => d * Math.PI / 180;
        const R = 6371; // earth radius km
        const points = Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * 2 * Math.PI;
          const dLat = (radius / R) * (180 / Math.PI) * Math.cos(angle);
          const dLng = (radius / R) * (180 / Math.PI) * Math.sin(angle) / Math.cos(toRad(lat));
          return `${(lat + dLat).toFixed(5)},${(lng + dLng).toFixed(5)}`;
        });
        const circlePath = points.concat(points[0]).join('|');
        // Zoom level based on radius
        const zoom = radius <= 5 ? 13 : radius <= 10 ? 12 : radius <= 20 ? 11 : radius <= 40 ? 10 : 9;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        const mapUrl = apiKey
          ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x220&scale=2&maptype=roadmap&markers=color:purple%7Csize:small%7C${lat},${lng}&path=color:0x6141acCC%7Cweight:2%7Cfillcolor:0x6141ac33%7C${circlePath}&key=${apiKey}&style=feature:all%7Celement:labels.text%7Cvisibility:simplified&style=feature:poi%7Cvisibility:off`
          : '';
        if (!mapUrl) return null;
        return (
          <div style={{margin:'0 0 0 0',overflow:'hidden',borderBottom:'0.5px solid hsl(259 30% 90%)',position:'relative'}}>
            <img
              src={mapUrl}
              alt={`Map showing ${demand.locationName || 'location'} within ${radius} km radius`}
              style={{width:'100%',height:180,objectFit:'cover',display:'block'}}
              loading="lazy"
            />
            {/* Radius badge overlay */}
            <div style={{position:'absolute',bottom:8,left:8,background:'rgba(30,21,55,0.82)',color:'#fff',fontSize:10,fontWeight:600,padding:'3px 8px',letterSpacing:'.02em'}}>
              {demand.locationName || 'Selected location'} · {radius} km radius
            </div>
          </div>
        );
      })()}

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-px mx-4 mb-3" style={{border:'0.5px solid hsl(259 30% 90%)'}}>
        {[
          ['Size target', `${demand.size?.toLocaleString()} sft`],
          ['Operation', demand.operationType],
          demand.ceilingHeight ? ['Eave height', `≥ ${demand.ceilingHeight} ${demand.ceilingHeightUnit || 'ft'}`] : null,
          demand.docks ? ['Docks', `${demand.docks} min`] : null,
          demand.powerMin ? ['Power', `${demand.powerMin}–${demand.powerMax || '?'} kVA`] : null,
          demand.buildingType ? ['Building', demand.buildingType] : null,
        ].filter(Boolean).slice(0, 4).map(([label, value]) => (
          <div key={label as string} className="px-3 py-2" style={{background:'hsl(259 44% 97%)'}}>
            <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>{label}</p>
            <p className="text-sm font-medium" style={{color:'#1e1537'}}>{value}</p>
          </div>
        ))}
      </div>

      {/* Priority tags */}
      {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {demand.preferences.nonCompromisable.map(item => (
            <span key={item} className="text-xs px-2 py-0.5" style={{background:'hsl(259 30% 96%)',color:'hsl(259 15% 45%)',border:'0.5px solid hsl(259 30% 86%)'}}>
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Expand */}
      {demand.description && (
        <div className="px-4 pb-3">
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs font-medium" style={{color:'#6141ac'}}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Less detail' : 'More detail'}
          </button>
          {expanded && (
            <p className="mt-2 text-xs leading-relaxed" style={{color:'hsl(259 15% 50%)'}}>{demand.description}</p>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="px-4 py-3 flex items-center gap-2" style={{borderTop:'0.5px solid hsl(259 30% 90%)'}}>
        {canSubmitMatch ? (
          <button onClick={() => setShowMatch(true)}
            className="flex-1 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{background:'#6141ac',borderRadius:0}}>
            <Handshake className="h-4 w-4" />
            Submit Matching Listing
          </button>
        ) : user ? (
          <div className="flex-1 py-2.5 text-xs text-center" style={{background:'hsl(259 44% 96%)',color:'hsl(259 15% 50%)'}}>
            Only verified developers and admin can submit matches
          </div>
        ) : (
          <Link href="/login" className="flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            style={{background:'hsl(259 44% 96%)',color:'#6141ac',borderRadius:0,textDecoration:'none'}}>
            <LogIn className="h-4 w-4" />
            Login to submit a match
          </Link>
        )}
        <button onClick={() => setShowShare(true)}
          className="py-2.5 px-3 flex items-center gap-1.5 text-xs font-medium"
          style={{border:'0.5px solid hsl(259 30% 85%)',color:'hsl(259 15% 45%)',borderRadius:0}}>
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>

      {showShare && <SharePanel demand={demand} onClose={() => setShowShare(false)} />}
      {showMatch && canSubmitMatch && <MatchDialog demand={demand} onClose={() => setShowMatch(false)} />}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function DemandsPublicPage() {
  const { demands } = useData();
  const [search, setSearch] = React.useState('');
  const [opFilter, setOpFilter] = React.useState<'all' | 'Warehousing' | 'Manufacturing'>('all');
  const [readinessFilter, setReadinessFilter] = React.useState('all');

  const filtered = React.useMemo(() => {
    return demands.filter(d => {
      if (opFilter !== 'all' && d.operationType !== opFilter) return false;
      if (readinessFilter !== 'all' && d.readiness !== readinessFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(d.locationName?.toLowerCase().includes(s) || d.operationType?.toLowerCase().includes(s) || d.description?.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [demands, opFilter, readinessFilter, search]);

  return (
    <main className="min-h-screen" style={{background:'hsl(259 30% 97%)'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1e1537,#3b2870)'}}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-xs font-bold mb-2" style={{color:'#9b7ee0',letterSpacing:'0.08em',textTransform:'uppercase'}}>Active Warehouse Demands</p>
          <h1 className="text-3xl font-bold text-white mb-3">Match Your Listing to a Customer</h1>
          <p className="text-sm max-w-xl" style={{color:'rgba(255,255,255,0.55)'}}>
            Verified customers are actively looking for warehouse and industrial space. If your listing matches, submit it directly — ORS-ONE connects both parties.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48" style={{background:'#fff',border:'0.5px solid hsl(259 30% 85%)',padding:'8px 12px'}}>
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{color:'hsl(259 15% 55%)'}} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by location or type..."
              className="flex-1 text-sm outline-none bg-transparent" style={{color:'#1e1537'}} />
          </div>
          <select value={opFilter} onChange={e => setOpFilter(e.target.value as any)}
            className="text-sm px-3 py-2" style={{background:'#fff',border:'0.5px solid hsl(259 30% 85%)',color:'#1e1537',borderRadius:0}}>
            <option value="all">All types</option>
            <option value="Warehousing">Warehousing</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
          <select value={readinessFilter} onChange={e => setReadinessFilter(e.target.value)}
            className="text-sm px-3 py-2" style={{background:'#fff',border:'0.5px solid hsl(259 30% 85%)',color:'#1e1537',borderRadius:0}}>
            <option value="all">Any readiness</option>
            <option>Immediate</option>
            <option>Within 45 Days</option>
            <option>Within 90 Days</option>
            <option>More than 90 Days</option>
            <option>BTS</option>
          </select>
          <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>
            {filtered.length} demand{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{background:'#fff',border:'0.5px solid hsl(259 30% 88%)'}}>
            <p className="font-bold" style={{color:'#1e1537'}}>No demands match your filters</p>
            <p className="text-sm mt-2" style={{color:'hsl(259 15% 55%)'}}>Try adjusting the filters above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(demand => <PublicDemandCard key={demand.demandId} demand={demand} />)}
          </div>
        )}
      </div>
    </main>
  );
}
