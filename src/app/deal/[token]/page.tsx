'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { NegotiationBoard } from '@/components/negotiation-board';
import { TenantImprovementsSheet } from '@/components/tenant-improvements-sheet';
import { ShieldCheck, Download, FileText, HardHat, ArrowRight, Clock, CheckCircle, Building2, Printer } from 'lucide-react';
import Link from 'next/link';
import type { RegisteredLead } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';

export default function DealMagicLinkPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { registeredLeads, listings, transactionActivities } = useData();
  const { toast } = useToast();
  const token = params.token as string;

  const [activeTab, setActiveTab] = React.useState<'overview' | 'termsheet' | 'fitout'>('overview');
  const [pdfGenerating, setPdfGenerating] = React.useState(false);

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const element = document.querySelector('.printable-content') as HTMLElement
        || document.querySelector('[data-pdf-content]') as HTMLElement
        || document.getElementById('term-sheet-content') as HTMLElement;
      if (!element) { setPdfGenerating(false); return; }
      const noPrint = document.querySelectorAll<HTMLElement>('.no-print');
      noPrint.forEach(el => el.style.display = 'none');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      noPrint.forEach(el => el.style.display = '');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210; const margin = 12; const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      const pageH = 297; const contentH = pageH - 30;
      pdf.setFillColor(30, 21, 55);
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
      pdf.text('ORS-ONE — Commercial Term Sheet', margin, 12);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
      pdf.text(`Deal ID: ${lead?.id || ''}  ·  ${new Date().toLocaleDateString('en-IN')}`, pageW - margin, 12, { align: 'right' });
      let yPos = 22; let remaining = imgH; let page = 0;
      while (remaining > 0) {
        if (page > 0) { pdf.addPage(); yPos = 12; }
        const sliceH = Math.min(remaining, contentH);
        const srcY = page * (canvas.height * contentH / imgH);
        const srcH = sliceH * canvas.height / imgH;
        const sc = document.createElement('canvas');
        sc.width = canvas.width; sc.height = Math.round(srcH);
        sc.getContext('2d')!.drawImage(canvas, 0, srcY, canvas.width, Math.round(srcH), 0, 0, canvas.width, Math.round(srcH));
        pdf.addImage(sc.toDataURL('image/png'), 'PNG', margin, yPos, usableW, sliceH);
        remaining -= sliceH; page++;
      }
      pdf.setFillColor(244, 242, 251); pdf.rect(0, pageH - 10, pageW, 10, 'F');
      pdf.setTextColor(97, 65, 172); pdf.setFontSize(7);
      pdf.text('Lakshmi Balaji ORS Private Limited  ·  lease.orsone.app', pageW / 2, pageH - 4, { align: 'center' });
      pdf.save(`ORS-ONE_TermSheet_${lead?.id || 'deal'}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch(e) { console.error('PDF error:', e); }
    setPdfGenerating(false);
  };
  const [inviteeData, setInviteeData] = React.useState<any>(null);
  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Find lead with this token
    const foundLead = registeredLeads.find(l =>
      (l as any).invitees?.some((inv: any) => inv.token === token)
    );
    if (foundLead) {
      setLead(foundLead);
      const inv = (foundLead as any).invitees?.find((i: any) => i.token === token);
      setInviteeData(inv);
    }
    setLoading(false);
  }, [registeredLeads, token]);

  // If user is logged in and is a party to this deal, redirect to full workspace
  React.useEffect(() => {
    if (user && lead) {
      const isParty = user.email === lead.customerId ||
        lead.providers.some(p => p.providerEmail === user.email) ||
        user.email === (lead as any).agentId;
      if (isParty) {
        router.replace(`/dashboard/leads/${lead.id}?tab=negotiation-board`);
      }
    }
  }, [user, lead, router]);

  const primaryListing = React.useMemo(() => {
    if (!lead) return null;
    const listingId = lead.providers[0]?.properties[0]?.listingId;
    return listings.find(l => l.listingId === listingId) || null;
  }, [lead, listings]);

  const offPlatformProp = (lead as any)?.offPlatformProperty;
  const propertyBrief = primaryListing
    ? `${primaryListing.name || primaryListing.listingId} · ${primaryListing.location?.split(',')[0]} · ${primaryListing.sizeSqFt?.toLocaleString()} sft`
    : offPlatformProp
    ? `${offPlatformProp.address} · ${offPlatformProp.area?.toLocaleString()} sft`
    : lead?.requirementsSummary || 'Property Transaction';

  const leadActivities = lead ? transactionActivities.filter((a: any) => a.leadId === lead.id) : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(259 30% 96%)' }}>
      <div className="text-center space-y-2">
        <div className="h-8 w-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm" style={{ color: '#6141ac' }}>Loading deal workspace...</p>
      </div>
    </div>
  );

  if (!lead || !inviteeData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(259 30% 96%)' }}>
      <div className="text-center max-w-sm mx-auto px-6 space-y-4">
        <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'hsl(259 44% 94%)' }}>
          <ShieldCheck className="h-7 w-7" style={{ color: '#6141ac' }} />
        </div>
        <p className="text-lg font-bold" style={{ color: '#1e1537' }}>Invalid or Expired Link</p>
        <p className="text-sm" style={{ color: 'hsl(259 15% 55%)' }}>This deal invite link is invalid or has expired. Please contact the person who invited you.</p>
        <Button asChild style={{ background: '#6141ac' }}><Link href="/">Go to ORS-ONE</Link></Button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', Icon: Building2 },
    { id: 'termsheet', label: 'Term Sheet', Icon: FileText },
    { id: 'fitout', label: 'Fit-Out', Icon: HardHat },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: 'hsl(259 30% 96%)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b" style={{ background: '#fff', borderColor: 'hsl(259 30% 90%)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold" style={{ color: '#1e1537' }}>ORS-ONE</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'hsl(259 44% 94%)', color: '#6141ac' }}>Deal Workspace</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(259 15% 55%)' }}>
            <span>Viewing as: <strong style={{ color: '#1e1537' }}>{inviteeData.name}</strong> · {inviteeData.role}</span>
          </div>
          <Button asChild size="sm" style={{ background: '#6141ac' }}>
            <Link href="/signup">Create Account <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Off-platform badge + deal header */}
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#1e1537,#3b2870)', border: '1px solid hsl(259 30% 25%)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,158,117,0.2)', color: '#1d9e75', border: '1px solid rgba(29,158,117,0.3)' }}>
                  Off-Platform Deal
                </span>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{lead.id}</span>
              </div>
              <p className="text-base font-bold text-white">{propertyBrief}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Registered {new Date((lead as any).dealRegisteredAt || lead.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {/* Mini 4-stage journey */}
            <div className="flex items-center gap-0">
              {['Deal\nRegistered', 'Term\nSheet', 'Fit-Out', 'MoU'].map((stage, i, arr) => (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={i === 0 ? { background: '#6141ac', color: '#fff' } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                      {i === 0 ? <CheckCircle className="h-3 w-3" /> : i + 1}
                    </div>
                    <span style={{ color: i === 0 ? '#9b7ee0' : 'rgba(255,255,255,0.3)', fontSize: '9px', whiteSpace: 'pre', textAlign: 'center', lineHeight: 1.2 }}>{stage}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-6 h-0.5 mb-3" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Download gate banner */}
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 82%)' }}>
          <ShieldCheck className="h-5 w-5 flex-shrink-0" style={{ color: '#6141ac' }} />
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: '#1e1537' }}>Create a free account to download the Term Sheet or Draft MoU</p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(259 15% 55%)' }}>Your edits and activity are already saved. Register to unlock downloads and full platform access.</p>
          </div>
          <Button asChild size="sm" variant="outline" style={{ borderColor: '#6141ac', color: '#6141ac', flexShrink: 0 }}>
            <Link href={`/signup?invite=${token}`}>Register Free</Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid hsl(259 30% 88%)' }}>
          <div className="flex" style={{ background: 'hsl(259 30% 96%)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
                style={activeTab === tab.id
                  ? { background: '#fff', color: '#6141ac', borderBottom: '2px solid #6141ac' }
                  : { background: 'transparent', color: '#888', borderBottom: '2px solid transparent' }}>
                <tab.Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '20px' }}>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <p className="text-sm font-bold" style={{ color: '#1e1537' }}>Deal Overview</p>

                {/* Property details */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 91%)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6141ac' }}>Property</p>
                  {primaryListing ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold" style={{ color: '#1e1537' }}>{primaryListing.name || primaryListing.listingId}</p>
                      <p style={{ color: '#888' }}>{primaryListing.location}</p>
                      <p style={{ color: '#888' }}>{primaryListing.sizeSqFt?.toLocaleString()} sq ft · {Array.isArray(primaryListing.buildingSpecifications?.buildingType) ? primaryListing.buildingSpecifications.buildingType.join(', ') : primaryListing.buildingSpecifications?.buildingType}</p>
                    </div>
                  ) : offPlatformProp ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold" style={{ color: '#1e1537' }}>{offPlatformProp.address}</p>
                      <p style={{ color: '#888' }}>{offPlatformProp.area?.toLocaleString()} sq ft · {offPlatformProp.buildingType}</p>
                      {offPlatformProp.indicativeRent && <p style={{ color: '#888' }}>₹{offPlatformProp.indicativeRent}/sft · {offPlatformProp.securityDeposit} months deposit · {offPlatformProp.leasePeriod}</p>}
                      {offPlatformProp.notes && <p style={{ color: '#888' }}>{offPlatformProp.notes}</p>}
                    </div>
                  ) : null}
                </div>

                {/* Parties */}
                <div className="rounded-xl p-4 space-y-2" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 91%)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6141ac' }}>Parties</p>
                  {(lead as any).invitees?.map((inv: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: inv.registered ? '#6141ac' : 'hsl(259 30% 88%)', color: inv.registered ? '#fff' : '#aaa' }}>
                        {inv.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#1e1537' }}>{inv.name}</p>
                        <p className="text-xs" style={{ color: '#aaa' }}>{inv.role} · {inv.registered ? 'Registered' : 'Invite sent'}</p>
                      </div>
                      {inv.token === token && (
                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'hsl(259 44% 94%)', color: '#6141ac' }}>You</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Activity log summary */}
                {leadActivities.length > 0 && (
                  <div className="rounded-xl p-4 space-y-2" style={{ background: 'hsl(259 30% 97%)', border: '1px solid hsl(259 30% 91%)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6141ac' }}>Recent Activity</p>
                    {leadActivities.slice(-3).reverse().map((a: any) => (
                      <div key={a.activityId} className="flex items-start gap-2.5">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: '#aaa' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#1e1537' }}>{a.activityType}</p>
                          <p className="text-xs" style={{ color: '#aaa' }}>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center pt-2">
                  <button onClick={() => setActiveTab('termsheet')}
                    className="text-xs font-bold flex items-center gap-1.5 mx-auto px-5 py-2.5 rounded-xl"
                    style={{ background: '#6141ac', color: '#fff' }}>
                    <FileText className="h-3.5 w-3.5" /> Open Term Sheet
                  </button>
                </div>
              </div>
            )}

            {/* Term Sheet */}
            {activeTab === 'termsheet' && lead && (
              <div>
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 82%)' }}>
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#6141ac' }} />
                  <p className="text-xs" style={{ color: '#1e1537' }}>
                    You can edit and annotate this term sheet. All changes are versioned. <strong>Download is available after registration.</strong>
                  </p>
                </div>
                <NegotiationBoard lead={lead} primaryListing={primaryListing} hideDownload={true} />
              </div>
            )}

            {/* Fit-Out */}
            {activeTab === 'fitout' && lead && (
              <div>
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 82%)' }}>
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#6141ac' }} />
                  <p className="text-xs" style={{ color: '#1e1537' }}>
                    Define fit-out and tenant improvement requirements. <strong>Download is available after registration.</strong>
                  </p>
                </div>
                <TenantImprovementsSheet leadId={lead.id} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
