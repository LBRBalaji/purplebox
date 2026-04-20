
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Info, ListChecks, Building, Factory, Construction, Lightbulb, MapPin, Target, Handshake, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import type { DemandSchema, ListingSchema } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const priorityLabels: { [key: string]: string } = {
  size: 'Size Range',
  location: 'Location & Radius',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
  buildingType: 'Building Type',
};

const haversineDistance = (coords1: {lat: number, lon: number}, coords2: {lat: number, lon: number}) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};


function DemandCard({ demand }: { demand: DemandSchema }) {
  const router = useRouter();
  const { user } = useAuth();
  const { listings, addRegisteredLead, addTransactionActivity } = useData();
  const { toast } = useToast();
  const [showBrokerageDialog, setShowBrokerageDialog] = React.useState(false);
  const [brokerageAgreed, setBrokerageAgreed] = React.useState(false);
  const [selectedListingId, setSelectedListingId] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const isOrsoneTP = !!(demand as any).isOrsoneTP;
  const isProvider = user?.role === 'Warehouse Developer';

  const [potentialMatches, setPotentialMatches] = React.useState<ListingSchema[]>([]);

  React.useEffect(() => {
      if (user?.role === 'Warehouse Developer' && user.email && demand.location) {
          const providerListings = listings.filter(l => l.developerId === user.email && l.status === 'approved');
          const [demandLat, demandLng] = demand.location.split(',').map(Number);
          
          if (!isNaN(demandLat) && !isNaN(demandLng)) {
              const matches = providerListings.filter(listing => {
                  if(!listing.latLng) return false;
                  const [listingLat, listingLng] = listing.latLng.split(',').map(Number);
                  if (!isNaN(listingLat) && !isNaN(listingLng)) {
                      const distance = haversineDistance(
                          { lat: demandLat, lon: demandLng },
                          { lat: listingLat, lon: listingLng }
                      );
                      return distance <= (demand.radius || 25); // Use demand radius or a default of 25km
                  }
                  return false;
              });
              setPotentialMatches(matches);
          }
      }
  }, [demand, listings, user]);

  const handleSubmitMatch = () => {
    if (!isOrsoneTP) return; // disabled for non-TP demands
    // Pre-select first matching listing if available
    if (potentialMatches.length > 0) setSelectedListingId(potentialMatches[0].listingId);
    else if (myListings.length > 0) setSelectedListingId(myListings[0].listingId);
    setShowBrokerageDialog(true);
  };

  const myListings = listings.filter(l => l.developerId === user?.email && l.status === 'approved');

  const handleConfirmMatch = async () => {
    if (!brokerageAgreed || !selectedListingId || !user) return;
    setSubmitting(true);
    try {
      const dealId = `LDR-MATCH-${Date.now()}`;
      // Store brokerage acknowledgement
      const ackRecord = {
        developerId: user.email,
        companyName: user.companyName,
        demandId: demand.demandId,
        listingId: selectedListingId,
        acknowledgedAt: new Date().toISOString(),
        type: 'brokerage_match_ack',
      };
      await fetch('/api/download-acknowledgments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ackRecord),
      }).catch(() => {});

      // Create transaction lead
      addRegisteredLead({
        id: dealId,
        customerId: demand.userEmail,
        leadName: demand.companyName,
        leadContact: demand.userName,
        leadEmail: demand.userEmail,
        leadPhone: demand.userPhone || '',
        requirementsSummary: `Match submitted for demand ${demand.demandId} — ${demand.size?.toLocaleString()} sft in ${demand.locationName || demand.location}`,
        registeredBy: user.email,
        providers: [{ providerEmail: user.email, properties: [{ listingId: selectedListingId, status: 'Pending' as const }] }],
        isO2OCollaborator: true,
      } as any, user.email);

      setShowBrokerageDialog(false);
      setBrokerageAgreed(false);
      toast({
        title: 'Match Submitted',
        description: 'Your listing has been submitted against this demand. ORS-ONE will connect you with the customer.',
      });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  const handleCirculateDemand = (demandToCirculate: DemandSchema) => {
    const adminPhoneNumber = "919841098170";
    const whatsappMessage = `Circulating new property demand to providers. Demand ID: ${demandToCirculate.demandId}`;
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');

    let usersFromStorage;
    try {
      usersFromStorage = localStorage.getItem('warehouseorigin_users');
    } catch (error) {
       console.error("Could not read from local storage", error);
       toast({
        variant: "destructive",
        title: "Operation Failed",
        description: "Could not retrieve provider list.",
      });
      return;
    }
    
    const allUsers = usersFromStorage ? JSON.parse(usersFromStorage) : {};

    const developerEmails = Object.values(allUsers)
      .filter((u: any) => u.role === 'SuperAdmin')
      .map((u: any) => u.email)
      .join(',');

    if (!developerEmails) {
      toast({
        variant: "destructive",
        title: "No Providers Found",
        description: "There are no registered property providers to circulate this demand to.",
      });
      return;
    }
    
    const subject = `New Property Demand Alert: ${demandToCirculate.operationType} Required`;
    const submitUrl = `${window.location.origin}/dashboard?demandId=${demandToCirculate.demandId}`;
    const body = `A new property demand has been logged that may match your portfolio.

Demand ID: ${demandToCirculate.demandId}
Operation Type: ${demandToCirculate.operationType}
Size: ${demandToCirculate.size.toLocaleString()} Sq. Ft.
Location: Near ${demandToCirculate.locationName || demandToCirculate.location} (within a ${demandToCirculate.radius} km radius)
Readiness: ${demandToCirculate.readiness}
Description: ${demandToCirculate.description || 'No additional description provided.'}
${(demandToCirculate.preferences?.nonCompromisable && demandToCirculate.preferences.nonCompromisable.length > 0) ? `\nNon-Compromisable Items: ${demandToCirculate.preferences.nonCompromisable.map(item => priorityLabels[item] || item).join(', ')}` : ''}

If you have a suitable property, please submit it using the link below:
${submitUrl}

This demand has been circulated to multiple providers.

Thank you,
WareHouse Origin
    `;

    const mailtoLink = `mailto:?bcc=${developerEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    
    setTimeout(() => {
        window.location.href = mailtoLink;
    }, 500);
  };

  const readinessColor: Record<string, {bg:string;text:string}> = {
    'Immediate':         {bg:'#e1f5ee', text:'#0f6e56'},
    'Within 45 Days':    {bg:'#faeeda', text:'#854f0b'},
    'Within 90 Days':    {bg:'#faeeda', text:'#854f0b'},
    'More than 90 Days': {bg:'#f0edfb', text:'#3b2870'},
    'BTS':               {bg:'#e6f1fb', text:'#185fa5'},
  };
  const rc = readinessColor[demand.readiness] || {bg:'#f0edfb',text:'#3b2870'};

  const specs: [string,string|undefined][] = [
    ['Size', `${demand.size?.toLocaleString()} sft`],
    ['Operation', demand.operationType],
    demand.ceilingHeight ? ['Eave height', `≥ ${demand.ceilingHeight} ${demand.ceilingHeightUnit || 'ft'}`] : ['Building', demand.buildingType || '—'],
    demand.docks ? ['Docks', `${demand.docks} min`] : demand.powerMin ? ['Power', `${demand.powerMin}–${demand.powerMax ?? '?'} kVA`] : ['Radius', `${demand.radius} km`],
  ];

  return (
    <div style={{background:'#fff',border:'0.5px solid hsl(259 30% 88%)',borderRadius:0,display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{padding:'14px 16px 10px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:8}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            <span style={{background:'#f0edfb',color:'#6141ac',fontSize:11,fontWeight:600,padding:'2px 8px'}}>{demand.operationType}</span>
            <span style={{background:rc.bg,color:rc.text,fontSize:11,fontWeight:600,padding:'2px 8px'}}>{demand.readiness}</span>
            {isOrsoneTP && <span style={{background:'#e1f5ee',color:'#0f6e56',fontSize:11,fontWeight:600,padding:'2px 8px'}}>ORS-ONE TP</span>}
            {demand.buildingType && <span style={{background:'hsl(259 30% 96%)',color:'hsl(259 15% 45%)',fontSize:11,fontWeight:500,padding:'2px 8px'}}>{demand.buildingType}</span>}
          </div>
        </div>
        <p style={{fontSize:15,fontWeight:700,color:'#1e1537',margin:'0 0 3px'}}>
          {demand.size?.toLocaleString()} sft · {demand.locationName || demand.location?.split(',')[0] || 'India'}
        </p>
        <p style={{fontSize:12,color:'hsl(259 15% 55%)',margin:0}}>
          Within {demand.radius} km · {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'recently'}
        </p>
      </div>

      {/* Specs grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,margin:'0 16px 10px',border:'0.5px solid hsl(259 30% 90%)'}}>
        {specs.map(([label, value]) => (
          <div key={label} style={{background:'hsl(259 44% 97%)',padding:'7px 10px'}}>
            <p style={{fontSize:11,color:'hsl(259 15% 55%)',margin:'0 0 1px'}}>{label}</p>
            <p style={{fontSize:13,fontWeight:500,color:'#1e1537',margin:0}}>{value}</p>
          </div>
        ))}
      </div>

      {/* Priority tags */}
      {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
        <div style={{padding:'0 16px 10px',display:'flex',flexWrap:'wrap',gap:5}}>
          {demand.preferences.nonCompromisable.map(item => (
            <span key={item} style={{fontSize:11,color:'hsl(259 15% 45%)',background:'hsl(259 30% 96%)',border:'0.5px solid hsl(259 30% 86%)',padding:'2px 7px'}}>{priorityLabels[item] || item}</span>
          ))}
        </div>
      )}

      {/* Geo-match banner for developer */}
      {potentialMatches.length > 0 && (
        <div style={{margin:'0 16px 10px',padding:'8px 10px',background:'#f0fdf4',border:'0.5px solid #bbf7d0'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#15803d',margin:'0 0 4px'}}>
            <Target className="h-3 w-3" style={{display:'inline',marginRight:4}} />
            {potentialMatches.length} listing{potentialMatches.length>1?'s':''} in your inventory match this location
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {potentialMatches.map(m => (
              <button key={m.listingId} onClick={() => { setSelectedListingId(m.listingId); handleSubmitMatch(); }}
                style={{fontSize:11,background:'#dcfce7',color:'#15803d',border:'0.5px solid #86efac',padding:'2px 8px',borderRadius:0,cursor:'pointer'}}>
                {m.listingId} — {m.name || m.location?.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {demand.description && (
        <p style={{fontSize:12,color:'hsl(259 15% 50%)',padding:'0 16px 10px',lineHeight:1.6,margin:0}}>{demand.description}</p>
      )}

      {/* Footer */}
      <div style={{marginTop:'auto',padding:'10px 16px',borderTop:'0.5px solid hsl(259 30% 90%)',display:'flex',gap:8}}>
        {isProvider ? (
          <button onClick={handleSubmitMatch} disabled={!isOrsoneTP}
            style={{flex:1,padding:'9px 0',fontSize:13,fontWeight:700,color:'#fff',background: isOrsoneTP ? '#6141ac' : 'hsl(259 30% 80%)',borderRadius:0,cursor: isOrsoneTP ? 'pointer' : 'not-allowed',border:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <Handshake className="h-4 w-4" /> Submit Matching Listing
          </button>
        ) : (
          <button onClick={() => handleCirculateDemand(demand)}
            style={{flex:1,padding:'9px 0',fontSize:13,fontWeight:600,color:'#6141ac',background:'hsl(259 44% 96%)',border:'0.5px solid hsl(259 44% 82%)',borderRadius:0,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <Mail className="h-4 w-4" /> Circulate to Providers
          </button>
        )}
      </div>

      {/* Brokerage Acknowledgement Dialog */}
      {showBrokerageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(30,21,55,0.7)'}}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{background:'#fff',boxShadow:'0 8px 40px rgba(97,65,172,0.2)'}}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'hsl(259 44% 94%)'}}>
                <Handshake className="h-5 w-5" style={{color:'#6141ac'}} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{color:'#1e1537'}}>Brokerage Acknowledgement Required</p>
                <p className="text-xs mt-1" style={{color:'hsl(259 15% 50%)',lineHeight:1.6}}>
                  This demand is facilitated by ORS-ONE as Official Transaction Partner. By submitting your listing, you formally acknowledge the brokerage obligation.
                </p>
              </div>
            </div>

            {/* Listing selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{color:'#1e1537'}}>Select Your Listing to Submit</label>
              <select value={selectedListingId} onChange={e => setSelectedListingId(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Choose a listing...</option>
                {potentialMatches.length > 0 && (
                  <optgroup label="Matching Your Inventory">
                    {potentialMatches.map(l => (
                      <option key={l.listingId} value={l.listingId}>{l.listingId} — {l.name || l.location?.split(',')[0]} ({l.sizeSqFt?.toLocaleString()} sft)</option>
                    ))}
                  </optgroup>
                )}
                {myListings.filter(l => !potentialMatches.some(m => m.listingId === l.listingId)).length > 0 && (
                  <optgroup label="Other Listings">
                    {myListings.filter(l => !potentialMatches.some(m => m.listingId === l.listingId)).map(l => (
                      <option key={l.listingId} value={l.listingId}>{l.listingId} — {l.name || l.location?.split(',')[0]} ({l.sizeSqFt?.toLocaleString()} sft)</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Brokerage T&C */}
            <div className="rounded-xl p-4" style={{background:'hsl(259 30% 97%)',border:'1px solid hsl(259 30% 88%)'}}>
              <p className="text-xs" style={{color:'hsl(259 15% 40%)',lineHeight:1.7}}>
                ORS-ONE facilitates the entire Engage &amp; Transact process — negotiations, documentation, and deal closure — on behalf of the customer. <strong style={{color:'#1e1537'}}>Industry standard brokerage is payable to ORS-ONE upon successful deal closure.</strong> This applies regardless of whether the customer has their own agent.
              </p>
            </div>

            {/* Acknowledgement checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={brokerageAgreed} onChange={e => setBrokerageAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-purple-600" />
              <span className="text-xs" style={{color:'#1e1537',lineHeight:1.6}}>
                I, <strong>{user?.userName}</strong> ({user?.companyName}), formally acknowledge that industry standard brokerage is payable to Lakshmi Balaji ORS Private Limited upon successful deal closure for demand <strong>{demand.demandId}</strong>.
              </span>
            </label>

            <div className="flex gap-3 pt-1">
              <button onClick={handleConfirmMatch} disabled={!brokerageAgreed || !selectedListingId || submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{background: brokerageAgreed && selectedListingId ? '#6141ac' : 'hsl(259 30% 80%)',cursor: brokerageAgreed && selectedListingId ? 'pointer' : 'not-allowed'}}>
                {submitting ? 'Submitting...' : 'Confirm & Submit Match'}
              </button>
              <button onClick={() => { setShowBrokerageDialog(false); setBrokerageAgreed(false); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{background:'hsl(259 30% 93%)',color:'hsl(259 15% 45%)'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}


export function DemandList() {
  const { demands, deleteDemand } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const handleDelete = (demandId: string) => {
    deleteDemand(demandId);
    setConfirmDeleteId(null);
    toast({ title: 'Demand Deleted', description: `Demand ${demandId} has been removed.` });
  };

  return (
    <div className="mt-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Demands</h2>
          <p className="text-muted-foreground mt-1 text-sm">{demands.length} demand{demands.length !== 1 ? 's' : ''} · Review, circulate to providers, or submit a match.</p>
        </div>
      </div>
      {demands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((demand) => (
            <div key={demand.demandId} className="relative">
              <DemandCard demand={demand}/>
              {isAdmin && (
                <div className="absolute top-3 right-3">
                  {confirmDeleteId === demand.demandId ? (
                    <div className="flex items-center gap-1 bg-white border border-red-200 rounded px-2 py-1 shadow-sm">
                      <span className="text-xs text-red-600 font-medium">Delete?</span>
                      <button onClick={() => handleDelete(demand.demandId)}
                        className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-medium text-gray-500 px-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(demand.demandId)}
                      className="p-1.5 rounded bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors shadow-sm"
                      title="Delete demand">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12">
            <CardTitle>No Active Demands</CardTitle>
            <CardDescription className="mt-2">New demands from customers will appear here.</CardDescription>
        </Card>
      )}
    </div>
  );
}
