'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Users, FileText, CheckCircle, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4;
type InviteeRole = 'Customer' | 'Developer' | 'Agent';

interface Invitee { name: string; email: string; role: InviteeRole; }
interface PropertyDetails {
  linkedListingId: string;
  address: string;
  area: string;
  buildingType: string;
  indicativeRent: string;
  securityDeposit: string;
  leasePeriod: string;
  notes: string;
}

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function RegisterDealPage() {
  const { user, isLoading } = useAuth();
  const { listings, addRegisteredLead, addTransactionActivity } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [listingSearch, setListingSearch] = React.useState('');
  const [property, setProperty] = React.useState<PropertyDetails>({
    linkedListingId: '', address: '', area: '', buildingType: 'PEB',
    indicativeRent: '', securityDeposit: '', leasePeriod: '3 years', notes: '',
  });
  const [invitees, setInvitees] = React.useState<Invitee[]>([{ name: '', email: '', role: 'Developer' }]);

  React.useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  const myRole = user?.role === 'Warehouse Developer' ? 'Developer' : user?.role === 'Agent' ? 'Agent' : 'Customer';
  const approvedListings = listings.filter(l => l.status === 'approved');
  const filteredListings = listingSearch
    ? approvedListings.filter(l =>
        l.listingId.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.location?.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.name?.toLowerCase().includes(listingSearch.toLowerCase()))
    : [];

  const canProceedStep1 = property.linkedListingId || (property.address && property.area);
  const canProceedStep2 = invitees.every(i => i.name && i.email);

  const addInvitee = () => {
    const takenRoles = invitees.map(i => i.role);
    const nextRole: InviteeRole = !takenRoles.includes('Developer') ? 'Developer' : !takenRoles.includes('Customer') ? 'Customer' : 'Agent';
    setInvitees([...invitees, { name: '', email: '', role: nextRole }]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dealId = `DEAL-${Date.now()}`;
      const inviteesWithTokens = invitees
        .filter(i => i.name && i.email)
        .map(i => ({
          ...i,
          token: generateToken(),
          invitedAt: new Date().toISOString(),
          registered: false,
        }));

      const linked = property.linkedListingId
        ? approvedListings.find(l => l.listingId === property.linkedListingId)
        : null;

      const propertyBrief = linked
        ? `${linked.name || linked.listingId} · ${linked.location?.split(',')[0]} · ${linked.sizeSqFt?.toLocaleString()} sft`
        : `${property.address} · ${property.area} sft`;

      const newLead = {
        id: dealId,
        customerId: myRole === 'Customer' ? user!.email : (invitees.find(i => i.role === 'Customer')?.email || user!.email),
        agentId: myRole === 'Agent' ? user!.email : undefined,
        leadName: user!.companyName || user!.userName,
        leadContact: user!.userName,
        leadEmail: user!.email,
        leadPhone: user!.phone || '',
        requirementsSummary: propertyBrief,
        registeredBy: user!.email,
        providers: [{
          providerEmail: myRole === 'Developer' ? user!.email : (invitees.find(i => i.role === 'Developer')?.email || 'pending'),
          properties: [{ listingId: property.linkedListingId || dealId, status: 'Pending' as const }],
        }],
        isOffPlatform: true,
        offPlatformProperty: property.linkedListingId ? undefined : {
          address: property.address,
          area: parseFloat(property.area) || 0,
          buildingType: property.buildingType,
          indicativeRent: parseFloat(property.indicativeRent) || undefined,
          securityDeposit: parseFloat(property.securityDeposit) || undefined,
          leasePeriod: property.leasePeriod,
          notes: property.notes,
        },
        invitees: inviteesWithTokens,
        dealRegisteredAt: new Date().toISOString(),
        isO2OCollaborator: false,
      };

      addRegisteredLead(newLead as any, user!.email);

      // Log Deal Registered activity
      addTransactionActivity({
        leadId: dealId,
        activityType: 'Lead Registered',
        details: { message: `Off-platform deal registered by ${user!.companyName || user!.userName}. Property: ${propertyBrief}` },
        createdBy: user!.email,
      });

      // Send email invites
      for (const inv of inviteesWithTokens) {
        const magicLink = `${window.location.origin}/deal/${inv.token}`;
        try {
          await fetch('/api/send-deal-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inviteeName: inv.name,
              inviteeEmail: inv.email,
              inviteeRole: inv.role,
              initiatorName: user!.companyName || user!.userName,
              initiatorRole: myRole,
              propertyBrief,
              dealId,
              magicLink,
            }),
          });
        } catch {}
      }

      setStep(4);
      setTimeout(() => router.push(`/dashboard/leads/${dealId}?tab=negotiation-board`), 2500);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not register deal. Please try again.' });
    }
    setSubmitting(false);
  };

  if (isLoading) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: 'hsl(259 30% 96%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs mb-4" style={{ color: '#6141ac' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: '#6141ac' }}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1e1537', letterSpacing: '-0.3px' }}>Register a Deal</h1>
              <p className="text-xs" style={{ color: 'hsl(259 15% 55%)' }}>Bring an off-platform transaction into ORS-ONE</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="flex items-center gap-0 mb-8">
            {[
              { n: 1, label: 'Property' },
              { n: 2, label: 'Parties' },
              { n: 3, label: 'Confirm' },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={step > s.n ? { background: '#6141ac', color: '#fff' } : step === s.n ? { background: '#6141ac', color: '#fff' } : { background: 'hsl(259 30% 88%)', color: '#aaa' }}>
                    {step > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: step >= s.n ? '#6141ac' : '#aaa' }}>{s.label}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 mb-4 mx-2" style={{ background: step > s.n ? '#6141ac' : 'hsl(259 30% 88%)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-6 space-y-5" style={{ background: '#fff', border: '1px solid hsl(259 30% 88%)' }}>

          {/* Step 1 — Property */}
          {step === 1 && (
            <>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#1e1537' }}>Step 1 — Property Details</p>
                <p className="text-xs" style={{ color: 'hsl(259 15% 55%)' }}>Search for an existing ORS-ONE listing, or enter the property details manually.</p>
              </div>

              {/* Search existing listing */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Search Existing ORS-ONE Listing (optional)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: '#aaa' }} />
                  <Input
                    placeholder="Search by listing ID, location or name..."
                    value={listingSearch}
                    onChange={e => setListingSearch(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                {filteredListings.length > 0 && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(259 30% 88%)' }}>
                    {filteredListings.slice(0, 5).map(l => (
                      <button key={l.listingId} type="button"
                        onClick={() => {
                          setProperty(p => ({ ...p, linkedListingId: l.listingId, address: l.location || '', area: String(l.sizeSqFt || ''), buildingType: (Array.isArray(l.buildingSpecifications?.buildingType) ? l.buildingSpecifications.buildingType[0] : l.buildingSpecifications?.buildingType) || 'PEB', indicativeRent: String(l.rentPerSqFt || ''), securityDeposit: String(l.rentalSecurityDeposit || '') }));
                          setListingSearch('');
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-purple-50 transition-colors"
                        style={{ borderBottom: '1px solid hsl(259 30% 93%)' }}>
                        <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: '#6141ac' }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1e1537' }}>{l.listingId} — {l.name || l.location?.split(',')[0]}</p>
                          <p className="text-xs" style={{ color: '#aaa' }}>{l.sizeSqFt?.toLocaleString()} sft · ₹{l.rentPerSqFt}/sft</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {property.linkedListingId && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 86%)' }}>
                    <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#6141ac' }} />
                    <p className="text-xs font-semibold" style={{ color: '#6141ac' }}>Linked: {property.linkedListingId}</p>
                    <button type="button" onClick={() => setProperty(p => ({ ...p, linkedListingId: '' }))} className="ml-auto">
                      <X className="h-3.5 w-3.5" style={{ color: '#aaa' }} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: 'hsl(259 30% 90%)' }} />
                <span className="text-xs" style={{ color: '#aaa' }}>or enter manually</span>
                <div className="flex-1 h-px" style={{ background: 'hsl(259 30% 90%)' }} />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">Property Address {!property.linkedListingId && <span className="text-destructive">*</span>}</Label>
                  <Input placeholder="e.g. Plot 12, SIPCOT Industrial Park, Oragadam, Chennai" value={property.address} onChange={e => setProperty(p => ({ ...p, address: e.target.value }))} className="mt-1 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Area (sq ft) {!property.linkedListingId && <span className="text-destructive">*</span>}</Label>
                    <Input type="number" placeholder="e.g. 50000" value={property.area} onChange={e => setProperty(p => ({ ...p, area: e.target.value }))} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Building Type</Label>
                    <select value={property.buildingType} onChange={e => setProperty(p => ({ ...p, buildingType: e.target.value }))}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {['PEB', 'RCC', 'Hybrid', 'Cold Storage', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Indicative Rent (₹/sft)</Label>
                    <Input type="number" placeholder="e.g. 28" value={property.indicativeRent} onChange={e => setProperty(p => ({ ...p, indicativeRent: e.target.value }))} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Security Deposit (months)</Label>
                    <Input type="number" placeholder="e.g. 6" value={property.securityDeposit} onChange={e => setProperty(p => ({ ...p, securityDeposit: e.target.value }))} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Lease Period</Label>
                    <Input placeholder="e.g. 3 years + 3 years" value={property.leasePeriod} onChange={e => setProperty(p => ({ ...p, leasePeriod: e.target.value }))} className="mt-1 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Additional Notes</Label>
                  <Textarea placeholder="Any context about this deal..." value={property.notes} onChange={e => setProperty(p => ({ ...p, notes: e.target.value }))} className="mt-1 text-sm" rows={2} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1} style={{ background: '#6141ac' }}>
                  Next: Add Parties <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 2 — Parties / Invitees */}
          {step === 2 && (
            <>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#1e1537' }}>Step 2 — Invite Other Parties</p>
                <p className="text-xs" style={{ color: 'hsl(259 15% 55%)' }}>
                  You are registering as <strong>{myRole}</strong>. Add the other parties — they'll receive a magic link to access the deal workspace without needing to sign up first.
                </p>
              </div>

              {/* Initiator info */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 86%)' }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: '#6141ac', color: '#fff' }}>
                  {(user?.companyName || user?.userName || '').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e1537' }}>{user?.companyName || user?.userName}</p>
                  <p className="text-xs" style={{ color: '#6141ac' }}>You · {myRole} (Registered)</p>
                </div>
              </div>

              <div className="space-y-3">
                {invitees.map((inv, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-xl" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 90%)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold" style={{ color: '#1e1537' }}>Party {i + 2}</p>
                      {invitees.length > 1 && (
                        <button type="button" onClick={() => setInvitees(invitees.filter((_, idx) => idx !== i))}>
                          <X className="h-4 w-4" style={{ color: '#aaa' }} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-semibold">Role</Label>
                        <select value={inv.role} onChange={e => setInvitees(invitees.map((x, idx) => idx === i ? { ...x, role: e.target.value as InviteeRole } : x))}
                          className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                          {(['Customer', 'Developer', 'Agent'] as InviteeRole[]).map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold">Name <span className="text-destructive">*</span></Label>
                        <Input placeholder="Full name / Company" value={inv.name} onChange={e => setInvitees(invitees.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} className="mt-1 text-sm h-9" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Email <span className="text-destructive">*</span></Label>
                      <Input type="email" placeholder="their@email.com" value={inv.email} onChange={e => setInvitees(invitees.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))} className="mt-1 text-sm h-9" />
                      <p className="text-xs mt-1" style={{ color: 'hsl(259 15% 60%)' }}>A magic link will be sent — no ORS-ONE account needed to access the workspace. Download is gated behind registration.</p>
                    </div>
                  </div>
                ))}

                {invitees.length < 2 && (
                  <button type="button" onClick={addInvitee}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border-dashed border-2 transition-colors hover:bg-purple-50"
                    style={{ borderColor: 'hsl(259 44% 80%)', color: '#6141ac' }}>
                    + Add Another Party
                  </button>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2} style={{ background: '#6141ac' }}>
                  Review & Confirm <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#1e1537' }}>Step 3 — Review & Register</p>
                <p className="text-xs" style={{ color: 'hsl(259 15% 55%)' }}>Confirm the deal details. Once registered, invites will be sent and the Term Sheet workspace will be created.</p>
              </div>

              <div className="space-y-3">
                {/* Property summary */}
                <div className="p-4 rounded-xl" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 90%)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6141ac' }}>Property</p>
                  {property.linkedListingId ? (
                    <p className="text-sm font-semibold" style={{ color: '#1e1537' }}>Linked to ORS-ONE Listing: {property.linkedListingId}</p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold" style={{ color: '#1e1537' }}>{property.address}</p>
                      <p className="text-xs mt-1" style={{ color: '#aaa' }}>{parseFloat(property.area).toLocaleString()} sft · {property.buildingType}{property.indicativeRent ? ` · ₹${property.indicativeRent}/sft` : ''}</p>
                    </>
                  )}
                </div>

                {/* Parties summary */}
                <div className="p-4 rounded-xl" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 90%)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6141ac' }}>Parties</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#6141ac' }} />
                      <p className="text-sm" style={{ color: '#1e1537' }}><strong>{user?.companyName || user?.userName}</strong> — {myRole} (You, registered)</p>
                    </div>
                    {invitees.filter(i => i.name && i.email).map((inv, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ background: 'hsl(259 44% 88%)', border: '1px dashed #6141ac' }} />
                        <p className="text-sm" style={{ color: '#1e1537' }}><strong>{inv.name}</strong> — {inv.role} (invite pending)</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Journey preview */}
                <div className="p-4 rounded-xl" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 86%)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6141ac' }}>Transaction Journey</p>
                  <div className="flex items-center gap-0">
                    {['Deal Registered', 'Term Sheet', 'Fit-Out', 'MoU'].map((stage, i, arr) => (
                      <React.Fragment key={stage}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={i === 0 ? { background: '#6141ac', color: '#fff' } : { background: 'hsl(259 30% 90%)', color: '#aaa' }}>
                            {i === 0 ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                          </div>
                          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: i === 0 ? '#6141ac' : '#aaa', fontSize: '10px' }}>{stage}</span>
                        </div>
                        {i < arr.length - 1 && <div className="flex-1 h-0.5 mb-4 mx-1" style={{ background: 'hsl(259 30% 88%)' }} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} style={{ background: '#6141ac' }}>
                  {submitting ? 'Registering...' : 'Register Deal & Send Invites'}
                  {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'hsl(259 44% 94%)' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#6141ac' }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: '#1e1537' }}>Deal Registered</p>
                <p className="text-sm mt-1" style={{ color: 'hsl(259 15% 55%)' }}>
                  Invites sent. Opening your Transaction Workspace now...
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center pt-2">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#6141ac' }} />
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#6141ac', animationDelay: '0.2s' }} />
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#6141ac', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

        </div>

        {/* Info footer */}
        {step < 4 && (
          <div className="mt-6 p-4 rounded-xl text-xs" style={{ background: 'hsl(259 30% 93%)', color: 'hsl(259 15% 50%)' }}>
            <strong style={{ color: '#6141ac' }}>About off-platform deals:</strong> The invited parties can view and edit the Commercial Term Sheet without registering. To download the Term Sheet or Draft MoU, they'll need to create a free ORS-ONE account. All edits are versioned and tracked.
          </div>
        )}

      </div>
    </main>
  );
}
