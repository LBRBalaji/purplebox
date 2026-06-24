'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { renderRichText, SITE_STATUS_OPTIONS } from '@/hooks/use-transaction-dockets';
import { ExternalLink, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import type { TransactionDocket, ListingSchema } from '@/lib/schema';

const COMPANY = {
  name: 'Lakshmi Balaji ORS Private Limited',
  address: '54 G-1 Sarvalakshmi Homes, Srinivasa Nagar,\nHastinapuram, Chennai\u2013600 044',
  gst: '33AADCL2986N1Z1',
  cin: 'U72900TN2017PTC116192',
};

const PLATFORMS = [
  { name: 'haanest',   desc: 'For Industrial & Land in Acres',             url: 'www.haanest.app' },
  { name: 'ORS-ONE',  desc: 'For Industrial/Warehouse Leasing',             url: 'www.orsone.app' },
  { name: 'Aaptions', desc: 'For Retail Showroom & Commercial Leasing',     url: 'aaptions.orsone.app' },
  { name: 'Howaah',   desc: 'For Residential Buy & Rentals',                url: 'howaah.orsone.app' },
];

const EXTRAS = [
  { name: 'Home of All Apps',                   url: 'https://www.lakshmibalajio2o.com/' },
  { name: 'Chennai Industrial Topography Map',  url: 'https://map.lakshmibalajio2o.com/' },
];

// Tour steps — each references a data-tour attribute on a page element
const TOUR_STEPS = [
  { target: 'header',   title: 'Your warehouse proposal',     body: 'This document was prepared exclusively for you by Lakshmi Balaji ORS — A PropTech. It lists warehouse options that match your requirement.' },
  { target: 'tabs',     title: 'Stage 1 — Preliminary',       body: 'Stage 1 covers preliminary information: location, size, specs and lease terms. Stage 2 covers detailed findings after owner meetings and site visits.' },
  { target: 'table',    title: 'How to read the table',       body: 'Each column is a different warehouse site. Each row is a parameter. Data auto-filled from the listing appears in the cell. Blank cells mean information is still being gathered.' },
  { target: 'table',    title: 'Risk flags',                  body: '🚩 means a critical risk has been flagged by the ORS team. ⚠ means a moderate caution note. Both are highlighted in red or yellow backgrounds.' },
  { target: 'pref-row', title: 'Your preference — only editable field', body: 'The "Your preference" row is the ONLY thing you can edit. Use it to tell us: Shortlisted, Under Evaluation, Selected, or Rejected. Your choice is saved instantly.' },
];

type Rect = { top: number; left: number; width: number; height: number };

export default function PublicDocketPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const docketId = params.docketId as string;
  const token = searchParams.get('v');

  const [docket, setDocket] = React.useState<TransactionDocket | null>(null);
  const [sites, setSites] = React.useState<ListingSchema[]>([]);
  const [siteStatuses, setSiteStatuses] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [invalid, setInvalid] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [expandedSiteFolders, setExpandedSiteFolders] = React.useState<Record<string,boolean>>({});
  const [activeLevel, setActiveLevel] = React.useState<1|2>(1);

  // Tour state
  const [tourStep, setTourStep] = React.useState<number | null>(null);
  const [spotlight, setSpotlight] = React.useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ top: number; left: number; below: boolean } | null>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    if (!docketId) return;
    fetch(`/api/transaction-dockets?id=${docketId}`)
      .then(r => r.json())
      .then(async data => {
        if (!data || data.message === 'Not found' || data.shareToken !== token || data.archived) {
          setInvalid(true); setLoading(false); return;
        }
        setDocket(data);
        setSiteStatuses(data.siteStatuses || {});
        const all: ListingSchema[] = await fetch('/api/listings').then(r => r.json());
        setSites((data.siteIds || []).map((id: string) => all.find(l => l.listingId === id)).filter(Boolean));
        setLoading(false);
        if (!localStorage.getItem(`ors_docket_tour_${docketId}`)) setTimeout(() => setTourStep(0), 1200);
      })
      .catch(() => { setInvalid(true); setLoading(false); });
  }, [docketId, token]);

  // ── Spotlight: find element by data-tour attr, compute position, scroll to it ──
  React.useEffect(() => {
    if (tourStep === null) { setSpotlight(null); setTooltipPos(null); return; }

    // Clear immediately so old spotlight doesn't linger while new one loads
    setSpotlight(null);
    setTooltipPos(null);

    const target = TOUR_STEPS[tourStep].target;
    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) return;

    // Scroll element into view, then wait for scroll animation to settle
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // not visible

      const pad = 10;
      setSpotlight({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });

      const mobile = window.innerWidth < 640;
      const tw = mobile ? window.innerWidth - 24 : 300;
      const th = 250; // generous height estimate

      if (mobile) {
        // On mobile: always dock to bottom so it never goes off-screen
        setTooltipPos({ top: window.innerHeight - th - 12, left: 12, below: false });
        return;
      }

      // Desktop: prefer below element, fall back to above, then clamp
      let below = r.bottom + th + 14 < window.innerHeight;
      let tTop = below ? r.bottom + 14 : r.top - th - 14;
      // Final clamp — ensure it's always within viewport
      tTop = Math.max(8, Math.min(tTop, window.innerHeight - th - 8));
      const tLeft = Math.max(12, Math.min(r.left, window.innerWidth - tw - 12));
      setTooltipPos({ top: tTop, left: tLeft, below });
    }, 620); // 620ms gives smooth scroll time to finish

    return () => clearTimeout(t);
  }, [tourStep]); // isMobile is read from window inside the callback, no stale closure issue

  const closeTour = () => {
    setTourStep(null); setSpotlight(null); setTooltipPos(null);
    if (docketId) localStorage.setItem(`ors_docket_tour_${docketId}`, 'seen');
  };

  const changeStatus = async (listingId: string, level: 1|2, value: string) => {
    if (!docket) return;
    const sk = `${listingId}__L${level}`;
    setSaving(sk);
    const updated = { ...siteStatuses, [sk]: value };
    setSiteStatuses(updated);
    const history = [...(docket.statusHistory || []), { listingId, level, from: siteStatuses[sk], to: value, by: 'client' as const, at: new Date().toISOString() }];
    await fetch('/api/transaction-dockets', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docketId: docket.docketId, updates: { siteStatuses: updated, statusHistory: history, updatedAt: new Date().toISOString() } }),
    });
    setSaving(null);
  };

  const selectedSites = sites.filter(s =>
    siteStatuses[`${s.listingId}__L1`] === 'Selected' || siteStatuses[`${s.listingId}__L2`] === 'Selected');

  const levelParams = (docket?.params || []).filter(p => p.level === activeLevel).sort((a,b) => a.order - b.order);
  const groups: Record<string, typeof levelParams> = {};
  levelParams.forEach(p => { (groups[p.groupLabel] = groups[p.groupLabel] || []).push(p); });

  const flagCount = (lid: string) => Object.entries(docket?.cellFlags || {}).filter(([k,v]) => k.includes(`__${lid}`) && v).length;

  const colW = isMobile ? 150 : 220;
  const td: React.CSSProperties = { padding: isMobile ? '8px' : '10px 12px', border: '1px solid #e5e7eb', verticalAlign: 'top', fontSize: isMobile ? 12 : 13, width: colW, maxWidth: colW };
  const rowLabel: React.CSSProperties = { padding: isMobile ? '8px' : '10px 12px', border: '1px solid #e5e7eb', fontSize: isMobile ? 11 : 12, color: '#6b7280', background: '#f9fafb', whiteSpace: 'normal', wordBreak: 'break-word', position: 'sticky', left: 0, width: isMobile ? 140 : 220, maxWidth: isMobile ? 140 : 220 };
  const groupTh: React.CSSProperties = { padding: isMobile ? '6px 8px' : '8px 12px', fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '.06em', background: '#f3f4f6', border: '1px solid #e5e7eb', position: 'sticky', left: 0, width: isMobile ? 140 : 220, maxWidth: isMobile ? 140 : 220 };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32, height:32, borderRadius:'50%', border:'2px solid #1e1537', borderTopColor:'transparent', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ fontSize:13, color:'#1e1537' }}>Loading proposal…</p>
      </div>
    </div>
  );

  if (invalid) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:320 }}>
        <p style={{ fontWeight:700, fontSize:18, color:'#1e1537', marginBottom:8 }}>Link invalid or expired</p>
        <p style={{ fontSize:13, color:'#6b7280' }}>This proposal link is no longer active. Please contact the person who shared it.</p>
        <Link href="/" style={{ display:'inline-block', marginTop:20, background:'#1e1537', color:'#fff', padding:'8px 20px', textDecoration:'none', fontSize:13 }}>Go to ORS-ONE</Link>
      </div>
    </div>
  );

  if (!docket) return null;
  const clientDocs = docket.clientDocuments || [];
  const tasks = docket.tasks || [];
  const siteDocsMap = docket.siteDocuments || {};

  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', fontFamily:'Arial,Helvetica,sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; }`}</style>

      {/* ── Info bar ─────────────────────────────────────────────────── */}
      <div style={{ background:'hsl(259 44% 96%)', borderBottom:'1px solid hsl(259 44% 84%)', padding: isMobile ? '8px 12px' : '9px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
        <p style={{ fontSize: isMobile ? 11 : 12, color:'#6141ac', margin:0, flex:1, lineHeight:1.5 }}>
          <strong>You are viewing a proposal shared by Lakshmi Balaji ORS — A PropTech.</strong>
          {!isMobile && <><span style={{ margin:'0 6px', color:'#a78bfa' }}>·</span>You can update site status to reflect your interest. All other content is read-only.</>}
        </p>
        <button onClick={()=>setTourStep(0)}
          style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'#6141ac', background:'rgba(255,255,255,0.8)', border:'1px solid hsl(259 44% 80%)', padding:'4px 10px', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
          <Info style={{ width:12,height:12 }}/> Take a tour
        </button>
      </div>

      {/* ── Top nav ──────────────────────────────────────────────────── */}
      <div style={{ background:'#1e1537', padding: isMobile ? '7px 12px' : '8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontWeight:800, fontSize: isMobile ? 13 : 14, color:'#fff' }}>ORS-ONE</span>
          {!isMobile && <><span style={{ width:1, height:14, background:'rgba(255,255,255,0.2)' }}/><span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'.1em', textTransform:'uppercase' }}>Transaction Docket</span></>}
        </div>
        <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.35)' }}>{docket.docketId}</span>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto' }}>

        {/* ── Proposal header ─────────────────────────────────────────── */}
        <div data-tour="header" style={{ background:'linear-gradient(135deg,#1e1537,#2a1b5c)', padding: isMobile ? '14px 16px' : '16px 24px', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>
          <div style={{ position:'relative' }}>
            <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.14em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', margin:'0 0 5px' }}>Warehouse Proposal</p>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
              <p style={{ fontSize: isMobile ? 15 : 18, fontWeight:800, margin:'0 0 6px', letterSpacing:'-0.01em', lineHeight:1.2, flex:1 }}>{docket.title}</p>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', padding:'3px 8px', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', flexShrink:0 }}>STAGE 1 ACTIVE</span>
            </div>
            <div style={{ display:'flex', gap: isMobile ? 10 : 20, flexWrap:'wrap', fontSize: isMobile ? 11 : 12, color:'rgba(255,255,255,0.5)' }}>
              <span>For: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{docket.clientName}{docket.clientCompany?` · ${docket.clientCompany}`:''}</strong></span>
              {docket.createdAt&&<span>On: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{new Date(docket.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong></span>}
              <span>Sites: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{sites.length}</strong></span>
            </div>
          </div>
        </div>

        {/* ── Selected site CTA ─────────────────────────────────────── */}
        {selectedSites.length > 0 && (
          <div style={{ background:'hsl(259 44% 97%)', border:'1px solid hsl(259 44% 85%)', padding: isMobile ? '12px 16px' : '12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontWeight:700, color:'#6141ac', margin:'0 0 2px', fontSize: isMobile ? 13 : 14 }}>You have selected {selectedSites.length === 1 ? 'a site' : `${selectedSites.length} sites`}</p>
              <p style={{ fontSize:12, color:'hsl(259 15% 50%)', margin:0 }}>{selectedSites.map(s=>s.location||s.listingId).join(', ')}</p>
            </div>
            <Link href="/register-deal" style={{ background:'#6141ac', color:'#fff', padding:'8px 16px', textDecoration:'none', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              Register a Deal <ArrowRight style={{ width:14,height:14 }}/>
            </Link>
          </div>
        )}

        {/* ── Level tabs ─────────────────────────────────────────────── */}
        <div data-tour="tabs" style={{ borderBottom:'2px solid #e5e7eb', display:'flex', background:'#fff', overflowX:'auto' }}>
          {[{l: isMobile ? 'Level 1 – Preliminary' : 'Level 1 – Preliminary review', v:1},{l: isMobile ? 'Level 2 – Seller meeting' : 'Level 2 – Seller meeting, terms & legal', v:2}].map(s=>(
            <button key={s.v} onClick={()=>setActiveLevel(s.v as 1|2)}
              style={{ padding: isMobile ? '10px 14px' : '11px 20px', fontWeight:600, fontSize: isMobile ? 11 : 12, border:'none', cursor:'pointer', background:'transparent', whiteSpace:'nowrap',
                color:activeLevel===s.v?'#1e1537':'#9ca3af',
                borderBottom:activeLevel===s.v?'2px solid #1e1537':'2px solid transparent',
                marginBottom:'-2px' }}>
              {s.l}
            </button>
          ))}
        </div>

        {/* ── Comparison table ──────────────────────────────────────── */}
        <div data-tour="table" style={{ background:'#fff', overflowX:'auto', borderBottom:'1px solid #e5e7eb', WebkitOverflowScrolling:'touch' } as React.CSSProperties}>
          <table style={{ borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: isMobile ? '8px' : '12px', background:'#f9fafb', border:'1px solid #e5e7eb', textAlign:'left', fontSize: isMobile ? 11 : 12, fontWeight:700, color:'#6b7280', position:'sticky', left:0, width: isMobile ? 140 : 220, maxWidth: isMobile ? 140 : 220 }}>Parameter</th>
                {sites.map((site,idx)=>{
                  const fc = flagCount(site.listingId);
                  return (
                    <th key={site.listingId} style={{ padding: isMobile ? '8px' : '12px', background:'#f9fafb', border:'1px solid #e5e7eb', textAlign:'left', width:colW, maxWidth:colW }}>
                      <div style={{ fontSize:9, fontWeight:600, color:'#6141ac', letterSpacing:'.06em', marginBottom:1 }}>SITE {idx+1}</div>
                      <div style={{ fontFamily:'monospace', fontSize:9, color:'hsl(259 15% 55%)', marginBottom:2 }}>{site.listingId}</div>
                      <div style={{ fontWeight:700, fontSize: isMobile ? 12 : 13, color:'#1e1537' }}>{site.location}</div>
                      {fc>0&&<span style={{ display:'inline-block', marginTop:3, fontSize:10, padding:'1px 5px', background:'#fee2e2', color:'#b91c1c', fontWeight:700 }}>{fc} flag{fc>1?'s':''}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([groupLabel, gParams])=>(
                <React.Fragment key={groupLabel}>
                  <tr><td colSpan={sites.length+1} style={groupTh}>{groupLabel}</td></tr>
                  {gParams.map(param=>(
                    <tr key={param.paramId}>
                      <td style={rowLabel}>{param.label}</td>
                      {sites.map(site=>{
                        const key = `${param.paramId}__${site.listingId}`;
                        const flag = (docket.cellFlags||{})[key];
                        return (
                          <td key={site.listingId} style={{ ...td, background:flag==='red'?'#fee2e2':flag==='yellow'?'#fef9c3':'#fff' }}>
                            {flag&&<span style={{ fontSize:10,marginBottom:4,display:'block' }}>{flag==='red'?'🚩 Risk flagged':'⚠ Note'}</span>}
                            <div style={{ lineHeight:1.6 }}>
                              {(docket.cellData||{})[key]
                                ? renderRichText((docket.cellData||{})[key])
                                : <span style={{ color:'#d1d5db' }}>—</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Your preference row */}
                  <tr data-tour="pref-row" style={{ background:'hsl(259 44% 97%)' }}>
                    <td style={{ ...rowLabel, fontWeight:700, color:'#1e1537', background:'hsl(259 44% 97%)', borderTop:'2px solid hsl(259 44% 86%)' }}>
                      Your preference
                      <p style={{ fontSize:10, fontWeight:400, color:'#9ca3af', margin:'2px 0 0' }}>Select your interest for each site</p>
                    </td>
                    {sites.map(site=>{
                      const sk = `${site.listingId}__L${activeLevel}`;
                      const cur = siteStatuses[sk] || 'Not Decided';
                      return (
                        <td key={site.listingId} style={{ ...td, background:'hsl(259 44% 97%)', borderTop:'2px solid hsl(259 44% 86%)', padding: isMobile ? '6px 8px' : '8px 10px' }}>
                          <select value={cur} onChange={e=>changeStatus(site.listingId,activeLevel,e.target.value)} disabled={saving===sk}
                            style={{ fontSize: isMobile ? 11 : 12, width:'100%', border:'1px solid #d1d5db', padding: isMobile ? '5px 4px' : '6px 8px', background:'#fff', cursor:'pointer',
                              color:cur==='Selected'?'#166534':cur==='Rejected'?'#b91c1c':'#374151', fontWeight:cur==='Selected'?700:400 }}>
                            {SITE_STATUS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                          </select>
                          {saving===sk&&<p style={{ fontSize:10,color:'#6141ac',margin:'2px 0 0' }}>Saving…</p>}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Contacts ─────────────────────────────────────────────────── */}
        {(docket.contacts?.accountOwner?.name||docket.contacts?.transactionPartner?.name)&&(
          <div style={{ background:'#fff', padding: isMobile ? '14px 16px' : '16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:10, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Your ORS-ONE Contact</p>
            <div style={{ display:'flex', gap: isMobile ? 16 : 28, flexWrap:'wrap' }}>
              {[docket.contacts.accountOwner, docket.contacts.transactionPartner].filter(Boolean).map((c,i)=>(
                <div key={i} style={{ fontSize:13, minWidth: isMobile ? '100%' : 180 }}>
                  <p style={{ fontWeight:700, color:'#1e1537', margin:0 }}>{c?.name}</p>
                  {c?.representing&&<p style={{ color:'#6b7280', margin:'2px 0 0', fontSize:12 }}>Representing Both Lessee &amp; Lessor</p>}
                  {c?.phone&&<p style={{ color:'#374151', margin:'2px 0 0', fontSize:12 }}>{c.phone}</p>}
                  {c?.email&&<p style={{ color:'#6141ac', margin:'2px 0 0', fontSize:12 }}>{c.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Client Documents ─────────────────────────────────────────── */}
        {(clientDocs.length > 0 || sites.some(s=>(siteDocsMap[s.listingId]||[]).length > 0)) && (
          <div style={{ background:'#fff', padding: isMobile ? '14px 16px' : '16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:10, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Documents — Google Drive Links</p>
            {clientDocs.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>CLIENT DOCUMENTS <span style={{ fontWeight:400, color:'#9ca3af' }}>Shared with you</span></p>
                {clientDocs.map((doc,i)=>(
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:'1px solid #e5e7eb', marginBottom:6, textDecoration:'none', color:'#1e1537' }}>
                    <span style={{ flex:1, fontSize:13, wordBreak:'break-all' }}>{doc.label||doc.url}</span>
                    <ExternalLink style={{ width:12,height:12,color:'#9ca3af',flexShrink:0 }}/>
                  </a>
                ))}
              </div>
            )}
            {sites.some(s=>(siteDocsMap[s.listingId]||[]).length > 0) && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>SITE-SPECIFIC FOLDERS <span style={{ fontWeight:400, color:'#9ca3af' }}>{sites.length} sites</span></p>
                {sites.map(site=>{
                  const docs = siteDocsMap[site.listingId] || [];
                  if (!docs.length) return null;
                  return (
                    <div key={site.listingId} style={{ marginBottom:8, border:'1px solid #e5e7eb', overflow:'hidden' }}>
                      <button onClick={()=>setExpandedSiteFolders(s=>({...s,[site.listingId]:!s[site.listingId]}))}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f9fafb', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, color:'#374151' }}>
                        <span>{site.location||site.listingId}</span>
                        {expandedSiteFolders[site.listingId]?<ChevronUp style={{width:14,height:14}}/>:<ChevronDown style={{width:14,height:14}}/>}
                      </button>
                      {expandedSiteFolders[site.listingId]&&docs.map((doc,i)=>(
                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', textDecoration:'none', color:'#374151', fontSize:12, borderTop:'1px solid #e5e7eb' }}>
                          <span style={{ flex:1, wordBreak:'break-all' }}>{doc.label||doc.url}</span>
                          <ExternalLink style={{ width:12,height:12,color:'#9ca3af' }}/>
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tasks read-only ──────────────────────────────────────────── */}
        {tasks.length > 0 && (
          <div style={{ background:'#fff', padding: isMobile ? '14px 16px' : '16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:10, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Tasks & Schedule</p>
            {tasks.map(task=>{
              const sc:Record<string,string>={todo:'#f3f4f6','in-progress':'#dbeafe',review:'#fef9c3',done:'#dcfce7',blocked:'#fee2e2'};
              return (
                <div key={task.taskId} style={{ padding:'10px 14px', border:'1px solid #e5e7eb', marginBottom:8, background:'#f9fafb' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:600, fontSize:13, color:'#1e1537' }}>{task.title}</span>
                    <span style={{ fontSize:10, padding:'1px 6px', background:sc[task.status]||'#f3f4f6', textTransform:'capitalize' as const }}>{task.status.replace('-',' ')}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:4, fontSize:11, color:'#9ca3af', flexWrap:'wrap' }}>
                    {task.owner&&<span>👤 {task.owner}</span>}
                    {task.dueDate&&<span>📅 {task.dueDate}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Confidentiality notice ───────────────────────────────────── */}
        <div style={{ background:'hsl(259 44% 96%)', border:'1px solid hsl(259 44% 84%)', margin: isMobile ? '16px 0' : '20px 0', padding: isMobile ? '12px 16px' : '14px 20px' }}>
          <p style={{ fontSize: isMobile ? 11 : 12, color:'#6141ac', margin:0, lineHeight:1.7 }}>
            Sites proposed by Lakshmi Balaji ORS are exclusively for the use of the intended client and must only be dealt through Lakshmi Balaji ORS.
            Do not share or reproduce any site information without prior written permission.
          </p>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div style={{ background:'#1e1537', padding:'24px 20px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 20 : 24, paddingBottom:20, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:8 }}>Registered Office</p>
              <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>{COMPANY.name}</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', whiteSpace:'pre-line', margin:'0 0 6px', lineHeight:1.6 }}>{COMPANY.address}</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:0 }}>
                GST: <span style={{ color:'rgba(255,255,255,0.5)' }}>{COMPANY.gst}</span><br/>
                CIN: <span style={{ color:'rgba(255,255,255,0.5)' }}>{COMPANY.cin}</span>
              </p>
            </div>
            <div>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:8 }}>Our Prop-Tech Platforms</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {PLATFORMS.map(p=>(
                  <div key={p.name}>
                    <p style={{ fontWeight:700, color:'rgba(255,255,255,0.8)', fontSize:12, margin:'0 0 2px' }}>{p.name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:'0 0 2px', lineHeight:1.3 }}>{p.desc}</p>
                    <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#a78bfa', textDecoration:'none' }}>{p.url}</a>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:8 }}>More from Lakshmi Balaji ORS</p>
              {EXTRAS.map(e=>(
                <div key={e.name} style={{ marginBottom:10 }}>
                  <p style={{ fontWeight:700, color:'rgba(255,255,255,0.8)', fontSize:12, margin:'0 0 3px' }}>{e.name}</p>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#a78bfa', textDecoration:'none', wordBreak:'break-all' }}>{e.url}</a>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.2)', padding:'12px 0' }}>
            Prepared by Lakshmi Balaji ORS — A PropTech · orsone.app · This document is confidential.
          </p>
        </div>
      </div>

      {/* ── Guided Tour — spotlight per element ───────────────────────── */}
      {tourStep !== null && (
        <>
          {/* Semi-transparent overlay with spotlight hole cut out */}
          {spotlight ? (
            <div style={{ position:'fixed', inset:0, zIndex:100, pointerEvents:'none',
              background:'rgba(0,0,0,0.5)',
              clipPath:`polygon(0% 0%, 0% 100%, ${spotlight.left}px 100%, ${spotlight.left}px ${spotlight.top}px, ${spotlight.left+spotlight.width}px ${spotlight.top}px, ${spotlight.left+spotlight.width}px ${spotlight.top+spotlight.height}px, ${spotlight.left}px ${spotlight.top+spotlight.height}px, ${spotlight.left}px 100%, 100% 100%, 100% 0%)`
            }}/>
          ) : (
            <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', pointerEvents:'none' }}/>
          )}

          {/* Click-away catcher */}
          <div style={{ position:'fixed', inset:0, zIndex:99 }} onClick={closeTour}/>

          {/* Bright border around highlighted element */}
          {spotlight && (
            <div style={{ position:'fixed', zIndex:102, pointerEvents:'none',
              top:spotlight.top, left:spotlight.left, width:spotlight.width, height:spotlight.height,
              border:'2px solid rgba(255,255,255,0.6)',
              boxShadow:'0 0 0 4px rgba(97,65,172,0.4)'
            }}/>
          )}

          {/* Step number beacon on highlighted element */}
          {spotlight && (
            <div style={{ position:'fixed', zIndex:103, pointerEvents:'none',
              top:spotlight.top - 14, left:spotlight.left - 14,
              width:28, height:28, borderRadius:'50%', background:'#6141ac', color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13
            }}>{tourStep + 1}</div>
          )}

          {/* Tooltip card — visible immediately even while spotlight loads */}
          {tourStep !== null && (tooltipPos || !spotlight) && (
            <div style={{ position:'fixed', zIndex:104,
              top: tooltipPos ? tooltipPos.top : window.innerHeight - 262,
              left: tooltipPos ? tooltipPos.left : 12,
              width: isMobile ? 'calc(100vw - 24px)' : 300,
              background:'#fff', boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
            }}>
              {/* Header strip */}
              <div style={{ background:'#1e1537', padding:'8px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'.1em' }}>STEP {tourStep+1} OF {TOUR_STEPS.length}</span>
                <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
                  {TOUR_STEPS.map((_,i)=>(
                    <div key={i} onClick={e=>{e.stopPropagation();setTourStep(i);}}
                      style={{ width:6, height:6, borderRadius:'50%', cursor:'pointer', background:i===tourStep?'#a78bfa':'rgba(255,255,255,0.2)' }}/>
                  ))}
                </div>
              </div>
              {/* Body */}
              <div style={{ padding:'14px 16px 16px' }}>
                {!spotlight && <p style={{ fontSize:11, color:'#a78bfa', margin:'0 0 6px' }}>↑ Scrolling to element…</p>}
                <p style={{ fontSize:14, fontWeight:700, color:'#1e1537', margin:'0 0 8px' }}>{TOUR_STEPS[tourStep].title}</p>
                <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.65, margin:'0 0 14px' }}>{TOUR_STEPS[tourStep].body}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <button onClick={e=>{e.stopPropagation();closeTour();}} style={{ fontSize:11, color:'#9ca3af', background:'none', border:'none', cursor:'pointer', padding:0 }}>Skip</button>
                  <div style={{ display:'flex', gap:6 }}>
                    {tourStep > 0 && (
                      <button onClick={e=>{e.stopPropagation();setTourStep(t=>t!-1);}} style={{ fontSize:12, color:'#374151', background:'#f3f4f6', border:'none', padding:'6px 12px', cursor:'pointer' }}>← Back</button>
                    )}
                    {tourStep < TOUR_STEPS.length - 1
                      ? <button onClick={e=>{e.stopPropagation();setTourStep(t=>t!+1);}} style={{ fontSize:12, fontWeight:700, color:'#fff', background:'#6141ac', border:'none', padding:'6px 14px', cursor:'pointer' }}>Next →</button>
                      : <button onClick={e=>{e.stopPropagation();closeTour();}} style={{ fontSize:12, fontWeight:700, color:'#fff', background:'#166534', border:'none', padding:'6px 14px', cursor:'pointer' }}>Done ✓</button>
                    }
                  </div>
                </div>
              </div>
              {/* Arrow pointer — only when tooltipPos is known */}
              {tooltipPos && !isMobile && (
                <div style={{ position:'absolute', width:0, height:0,
                  ...(tooltipPos.below
                    ? { top:-8, left:24, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderBottom:'8px solid #1e1537' }
                    : { bottom:-8, left:24, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderTop:'8px solid #fff' }
                  )
                }}/>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
