'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { ShieldCheck, Printer, ArrowRight, FileText, HardHat, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { NegotiationBoard } from '@/components/negotiation-board';
import { TenantImprovementsSheet } from '@/components/tenant-improvements-sheet';
import type { RegisteredLead } from '@/contexts/data-context';

export default function StakeholderViewPage() {
  const params = useParams();
  const token = params.token as string;
  const { user } = useAuth();
  const { registeredLeads, listings } = useData();

  const [activeTab, setActiveTab] = React.useState<'termsheet' | 'fitout'>('termsheet');
  const [pdfGenerating, setPdfGenerating] = React.useState(false);

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const element = document.querySelector('.printable-content') as HTMLElement
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
      pdf.setFillColor(30, 21, 55); pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
      pdf.text('ORS-ONE — Commercial Term Sheet (Read-Only Copy)', margin, 12);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
      pdf.text(`${invitee?.roleDescription || invitee?.role || 'Stakeholder'}: ${invitee?.name || ''}  ·  ${new Date().toLocaleDateString('en-IN')}`, pageW - margin, 12, { align: 'right' });
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
      pdf.text('Lakshmi Balaji ORS Private Limited  ·  lease.orsone.app  ·  Read-Only Stakeholder Copy', pageW / 2, pageH - 4, { align: 'center' });
      pdf.save(`ORS-ONE_TermSheet_${lead?.id || 'deal'}_${invitee?.name?.replace(/\s+/g,'_') || 'stakeholder'}.pdf`);
    } catch(e) { console.error('PDF error:', e); }
    setPdfGenerating(false);
  };
  const [loading, setLoading] = React.useState(true);
  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [invitee, setInvitee] = React.useState<any>(null);

  React.useEffect(() => {
    const found = registeredLeads.find(l =>
      (l as any).invitees?.some((inv: any) => inv.token === token)
    );
    if (found) {
      setLead(found);
      setInvitee((found as any).invitees?.find((i: any) => i.token === token));
    }
    setLoading(false);
  }, [registeredLeads, token]);

  // If registered user is a party → redirect to full workspace
  React.useEffect(() => {
    if (!user || !lead) return;
    const isParty =
      user.email === lead.customerId ||
      lead.providers.some(p => p.providerEmail === user.email) ||
      user.email === (lead as any).agentId;
    if (isParty) window.location.href = `/dashboard/leads/${lead.id}?tab=negotiation-board`;
  }, [user, lead]);

  const primaryListing = React.useMemo(() => {
    if (!lead) return null;
    return listings.find(l => l.listingId === lead.providers[0]?.properties[0]?.listingId) || null;
  }, [lead, listings]);

  const propertyBrief = primaryListing
    ? `${primaryListing.name || primaryListing.listingId} · ${primaryListing.location?.split(',')[0]}`
    : (lead as any)?.offPlatformProperty?.address || lead?.requirementsSummary || 'Property Transaction';

  const handlePrint = () => {
    const orig = document.title;
    document.title = `ORS-ONE_TermSheet_${lead?.id}_${new Date().toISOString().slice(0,10)}`;
    window.print();
    document.title = orig;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'hsl(259 30% 96%)'}}>
      <div className="text-center space-y-2">
        <div className="h-8 w-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm" style={{color:'#6141ac'}}>Loading...</p>
      </div>
    </div>
  );

  if (!lead || !invitee) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'hsl(259 30% 96%)'}}>
      <div className="text-center max-w-sm mx-auto px-6 space-y-4">
        <div className="h-14 w-14 rounded-none mx-auto flex items-center justify-center" style={{background:'hsl(259 44% 94%)'}}>
          <ShieldCheck className="h-7 w-7" style={{color:'#6141ac'}} />
        </div>
        <p className="text-lg font-bold" style={{color:'#1e1537'}}>Invalid or Expired Link</p>
        <p className="text-sm" style={{color:'hsl(259 15% 55%)'}}>This access link is invalid or has expired. Please contact the person who shared it with you.</p>
        <Link href="/" className="inline-block px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#6141ac'}}>
          Go to ORS-ONE
        </Link>
      </div>
    </div>
  );

  const isStakeholder = invitee.role === 'Stakeholder';

  return (
    <div className="min-h-screen no-print-download" style={{background:'hsl(259 30% 96%)'}}>

      {/* Top bar */}
      <div className="sticky top-0 z-40 no-print" style={{background:'#fff',borderBottom:'1px solid hsl(259 30% 90%)'}}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold" style={{color:'#1e1537'}}>ORS-ONE</span>
            <span className="text-xs font-bold px-2 py-0.5" style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
              {isStakeholder ? 'Read-Only View' : 'Deal Workspace'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs hidden sm:block" style={{color:'hsl(259 15% 55%)'}}>
              {invitee.name} · {invitee.roleDescription || invitee.role}
            </span>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2"
              style={{background:'hsl(259 44% 94%)',color:'#6141ac',borderRadius:0}}>
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button onClick={handleDownloadPDF} disabled={pdfGenerating}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2"
              style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
              <Download className="h-3.5 w-3.5" />{pdfGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <Link href="/signup" className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 text-white"
              style={{background:'#6141ac',borderRadius:0}}>
              Create Account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Deal header */}
        <div className="p-5" style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-base font-bold text-white">{propertyBrief}</p>
              <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.5)'}}>Deal ID: {lead.id}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs font-bold px-2 py-0.5"
                style={{background:'rgba(97,65,172,0.35)',color:'#c5b8e8',border:'1px solid rgba(97,65,172,0.4)'}}>
                {invitee.roleDescription || invitee.role}
              </span>
              {isStakeholder && (
                <span className="text-xs font-bold px-2 py-0.5"
                  style={{background:'rgba(245,158,11,0.2)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)'}}>
                  Read-Only Access
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Read-only notice */}
        {isStakeholder && (
          <div className="flex items-center gap-3 px-4 py-3 no-print"
            style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
            <Eye className="h-4 w-4 flex-shrink-0" style={{color:'#d97706'}} />
            <div className="flex-1">
              <p className="text-xs font-bold" style={{color:'#92400e'}}>Read-Only — View and Print Only</p>
              <p className="text-xs mt-0.5" style={{color:'#b45309'}}>
                You have been invited as {invitee.roleDescription || 'Stakeholder'} to review this Term Sheet. You can print it but cannot edit or download it. To participate actively in the transaction, create an account.
              </p>
            </div>
            <Link href="/signup" className="text-xs font-bold px-3 py-1.5 flex-shrink-0 no-print"
              style={{borderRadius:0,border:'1px solid #d97706',color:'#d97706'}}>
              Join Platform
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div style={{border:'1px solid hsl(259 30% 88%)'}}>
          <div className="flex no-print" style={{background:'hsl(259 30% 96%)'}}>
            {[
              { id: 'termsheet', label: 'Term Sheet', Icon: FileText },
              { id: 'fitout', label: 'Fit-Out', Icon: HardHat },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
                style={activeTab === tab.id
                  ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac'}
                  : {background:'transparent',color:'#888',borderBottom:'2px solid transparent'}}>
                <tab.Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5" style={{background:'#fff'}}>
            {/* Wrap in read-only overlay for stakeholders */}
            <div style={{pointerEvents: isStakeholder ? 'none' : 'auto', userSelect: isStakeholder ? 'none' : 'auto'}}>
              {activeTab === 'termsheet' && <div id="term-sheet-content"><NegotiationBoard lead={lead} primaryListing={primaryListing} /></div>}
              {activeTab === 'fitout' && <TenantImprovementsSheet leadId={lead.id} />}
            </div>
          </div>
        </div>

        {/* Platform prompt */}
        <div className="px-5 py-4 flex items-center gap-4 flex-wrap no-print"
          style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{color:'#1e1537'}}>Want to participate in this transaction?</p>
            <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
              Create a free ORS-ONE account to add comments, negotiate terms, and stay updated on this deal — all on the platform.
            </p>
          </div>
          <Link href="/signup" className="text-sm font-bold px-5 py-2.5 text-white flex-shrink-0"
            style={{background:'#6141ac',borderRadius:0}}>
            Create Free Account <ArrowRight className="ml-1.5 h-4 w-4 inline" />
          </Link>
        </div>
      </div>

      {/* Print footer */}
      <div className="print-footer hidden">
        <span>Transaction ID: {lead.id} · {invitee.roleDescription || invitee.role}: {invitee.name}</span>
        <span>ORS-ONE · Lakshmi Balaji ORS Private Limited · lease.orsone.app</span>
      </div>
    </div>
  );
}
