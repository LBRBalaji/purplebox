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
  { name: 'haanest',  desc: 'For Industrial & Land in Acres',              url: 'www.haanest.app' },
  { name: 'ORS-ONE', desc: 'For Industrial/Warehouse Leasing',              url: 'www.orsone.app' },
  { name: 'Aaptions', desc: 'For Retail Showroom & Commercial Leasing',    url: 'aaptions.orsone.app' },
  { name: 'Howaah',  desc: 'For Residential Buy & Rentals',                url: 'howaah.orsone.app' },
];

const EXTRAS = [
  { name: 'Home of All Apps',                url: 'https://www.lakshmibalajio2o.com/' },
  { name: 'Chennai Industrial Topography Map', url: 'https://map.lakshmibalajio2o.com/' },
];

const TOUR_STEPS = [
  { num: 1, title: 'Your warehouse proposal', body: 'This document was prepared exclusively for you by Lakshmi Balaji ORS — A PropTech. It shows a curated shortlist of warehouse options that match your requirement.' },
  { num: 2, title: 'Stage 1 — Preliminary', body: 'Stage 1 covers preliminary information: location, size, basic specs and lease terms. Stage 2 covers detailed findings after owner meetings and site visits.' },
  { num: 3, title: 'How to read the table', body: 'Each column is a different warehouse site. Each row is a parameter. Data shown was auto-filled from the listing. Blank cells mean information is still being gathered.' },
  { num: 4, title: 'Risk flags', body: '🚩 Critical risk flagged by the ORS team. ⚠ Moderate note of caution. Both are highlighted in red or yellow.' },
  { num: 5, title: 'Your preference', body: 'The "Your preference" row is the only thing you can edit. Use it to tell us: Shortlisted, Under Evaluation, Selected, or Rejected. Saved instantly.' },
];

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
  const [tourStep, setTourStep] = React.useState<number | null>(null);

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
        const listingsRes = await fetch('/api/listings');
        const all: ListingSchema[] = await listingsRes.json();
        setSites((data.siteIds || []).map((id: string) => all.find(l => l.listingId === id)).filter(Boolean));
        setLoading(false);
        const seen = localStorage.getItem(`ors_docket_tour_${docketId}`);
        if (!seen) setTimeout(() => setTourStep(0), 1200);
      })
      .catch(() => { setInvalid(true); setLoading(false); });
  }, [docketId, token]);

  const closeTour = () => {
    setTourStep(null);
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

  // Table styles — no rounded corners, fixed column widths
  const td: React.CSSProperties = { padding: '10px 12px', border: '1px solid #e5e7eb', verticalAlign: 'top', fontSize: 13, width: 220, maxWidth: 220 };
  const rowLabel: React.CSSProperties = { padding: '10px 12px', border: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280', background: '#f9fafb', whiteSpace: 'normal', wordBreak: 'break-word', position: 'sticky', left: 0, width: 220, maxWidth: 220 };
  const groupTh: React.CSSProperties = { padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '.06em', background: '#f3f4f6', border: '1px solid #e5e7eb', position: 'sticky', left: 0, width: 220, maxWidth: 220 };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32,height:32,borderRadius:'50%',border:'2px solid #1e1537',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',margin:'0 auto 12px' }}/>
        <p style={{ fontSize:13,color:'#1e1537' }}>Loading proposal…</p>
      </div>
    </div>
  );

  if (invalid) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
      <div style={{ textAlign:'center', maxWidth:340, padding:'0 24px' }}>
        <p style={{ fontWeight:700, fontSize:18, color:'#1e1537', marginBottom:8 }}>Link invalid or expired</p>
        <p style={{ fontSize:13, color:'#6b7280' }}>This proposal link is no longer active. Please contact the person who shared it with you.</p>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Info bar — light purple theme ─────────────────────────────── */}
      <div style={{ background:'hsl(259 44% 96%)', borderBottom:'1px solid hsl(259 44% 84%)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <p style={{ fontSize:12, color:'#6141ac', margin:0 }}>
          <strong>You are viewing a proposal shared by Lakshmi Balaji ORS — A PropTech.</strong>
          <span style={{ margin:'0 8px', color:'#a78bfa' }}>·</span>
          You can update site status to reflect your interest. All other content is read-only.
        </p>
        <button onClick={()=>setTourStep(0)}
          style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'#6141ac', background:'rgba(255,255,255,0.8)', border:'1px solid hsl(259 44% 80%)', padding:'4px 10px', cursor:'pointer', flexShrink:0 }}>
          <Info style={{ width:12,height:12 }}/> Take a tour
        </button>
      </div>

      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <div style={{ background:'#1e1537', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontWeight:800, fontSize:14, color:'#fff', letterSpacing:'.02em' }}>ORS-ONE</span>
          <span style={{ width:1, height:14, background:'rgba(255,255,255,0.2)' }}/>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'.1em', textTransform:'uppercase' }}>Transaction Docket</span>
        </div>
        <span style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.35)' }}>{docket.docketId}</span>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px' }}>

        {/* ── Compact acquisition proposal header ───────────────────── */}
        <div style={{ background:'linear-gradient(135deg,#1e1537,#2a1b5c)', padding:'16px 24px', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'28px 28px' }}/>
          <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:'.14em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', margin:'0 0 6px' }}>Warehouse Proposal</p>
              <p style={{ fontSize:18, fontWeight:800, margin:'0 0 8px', letterSpacing:'-0.01em', lineHeight:1.2 }}>{docket.title}</p>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
                <span>Prepared for: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{docket.clientName}{docket.clientCompany?` · ${docket.clientCompany}`:''}</strong></span>
                {docket.createdAt&&<span>On: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{new Date(docket.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong></span>}
                <span>Sites: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{sites.length}</strong></span>
              </div>
            </div>
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', padding:'4px 10px', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', flexShrink:0, alignSelf:'flex-start' }}>
              STAGE 1 ACTIVE
            </span>
          </div>
        </div>

        {/* ── Selected site CTA ─────────────────────────────────────── */}
        {selectedSites.length > 0 && (
          <div style={{ background:'hsl(259 44% 97%)', border:'1px solid hsl(259 44% 85%)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontWeight:700, color:'#6141ac', margin:'0 0 2px' }}>You have selected {selectedSites.length === 1 ? 'a site' : `${selectedSites.length} sites`}</p>
              <p style={{ fontSize:12, color:'hsl(259 15% 50%)', margin:0 }}>{selectedSites.map(s=>s.location||s.listingId).join(', ')} · Ready to proceed?</p>
            </div>
            <Link href="/register-deal" style={{ background:'#6141ac', color:'#fff', padding:'8px 18px', textDecoration:'none', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              Register a Deal <ArrowRight style={{ width:14,height:14 }}/>
            </Link>
          </div>
        )}

        {/* ── Level tabs ────────────────────────────────────────────── */}
        <div style={{ borderBottom:'2px solid #e5e7eb', display:'flex', background:'#fff' }}>
          {[{l:'Level 1 – Preliminary review',v:1},{l:'Level 2 – Seller meeting, terms & legal',v:2}].map(s=>(
            <button key={s.v} onClick={()=>setActiveLevel(s.v as 1|2)}
              style={{ padding:'11px 20px', fontWeight:600, fontSize:12, border:'none', cursor:'pointer', background:'transparent',
                color:activeLevel===s.v?'#1e1537':'#9ca3af',
                borderBottom:activeLevel===s.v?'2px solid #1e1537':'2px solid transparent',
                marginBottom:'-2px' }}>
              {s.l}
            </button>
          ))}
        </div>

        {/* ── Comparison table ──────────────────────────────────────── */}
        <div style={{ background:'#fff', overflow:'auto', borderBottom:'1px solid #e5e7eb' }}>
          <table style={{ borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding:'12px', background:'#f9fafb', border:'1px solid #e5e7eb', textAlign:'left', fontSize:12, fontWeight:700, color:'#6b7280', position:'sticky', left:0, width:220, maxWidth:220 }}>Parameter</th>
                {sites.map((site,idx)=>{
                  const fc = flagCount(site.listingId);
                  return (
                    <th key={site.listingId} style={{ padding:'12px', background:'#f9fafb', border:'1px solid #e5e7eb', textAlign:'left', width:220, maxWidth:220 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#6141ac', letterSpacing:'.06em', marginBottom:2 }}>SITE {idx+1}</div>
                      <div style={{ fontFamily:'monospace', fontSize:10, color:'hsl(259 15% 55%)', marginBottom:2 }}>{site.listingId}</div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#1e1537' }}>{site.location}</div>
                      {fc>0&&<span style={{ display:'inline-block', marginTop:4, fontSize:10, padding:'1px 6px', background:'#fee2e2', color:'#b91c1c', fontWeight:700 }}>{fc} flag{fc>1?'s':''}</span>}
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
                            {flag&&<span style={{ fontSize:10,marginBottom:4,display:'block' }}>{flag==='red'?'🚩 Risk flagged':'⚠ Note flagged'}</span>}
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
                  {/* Status row — client editable */}
                  <tr style={{ background:'hsl(259 44% 97%)' }}>
                    <td style={{ ...rowLabel, fontWeight:700, color:'#1e1537', background:'hsl(259 44% 97%)', borderTop:'2px solid hsl(259 44% 86%)' }}>
                      Your preference
                      <p style={{ fontSize:10, fontWeight:400, color:'#9ca3af', margin:'2px 0 0' }}>Select your interest for each site</p>
                    </td>
                    {sites.map(site=>{
                      const sk = `${site.listingId}__L${activeLevel}`;
                      const cur = siteStatuses[sk] || 'Not Decided';
                      return (
                        <td key={site.listingId} style={{ ...td, background:'hsl(259 44% 97%)', borderTop:'2px solid hsl(259 44% 86%)', padding:'8px 10px' }}>
                          <select value={cur} onChange={e=>changeStatus(site.listingId,activeLevel,e.target.value)} disabled={saving===sk}
                            style={{ fontSize:12, width:'100%', border:'1px solid #d1d5db', padding:'6px 8px', background:'#fff', cursor:'pointer',
                              color:cur==='Selected'?'#166534':cur==='Rejected'?'#b91c1c':'#374151', fontWeight:cur==='Selected'?700:400 }}>
                            {SITE_STATUS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                          </select>
                          {saving===sk&&<p style={{ fontSize:10,color:'#6141ac',margin:'3px 0 0' }}>Saving…</p>}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Contacts — Representing Both Lessee & Lessor ──────────── */}
        {(docket.contacts?.accountOwner?.name||docket.contacts?.transactionPartner?.name)&&(
          <div style={{ background:'#fff', padding:'16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:11, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Your ORS-ONE Contact</p>
            <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
              {[docket.contacts.accountOwner, docket.contacts.transactionPartner].filter(Boolean).map((c,i)=>(
                <div key={i} style={{ fontSize:13 }}>
                  <p style={{ fontWeight:700, color:'#1e1537', margin:0 }}>{c?.name}</p>
                  {c?.representing&&(
                    <p style={{ color:'#6b7280', margin:'2px 0 0', fontSize:12 }}>
                      Representing Both Lessee &amp; Lessor
                    </p>
                  )}
                  {c?.phone&&<p style={{ color:'#374151', margin:'2px 0 0', fontSize:12 }}>{c.phone}</p>}
                  {c?.email&&<p style={{ color:'#6141ac', margin:'2px 0 0', fontSize:12 }}>{c.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Client Documents ──────────────────────────────────────── */}
        {(clientDocs.length > 0 || sites.some(s=>(siteDocsMap[s.listingId]||[]).length > 0)) && (
          <div style={{ background:'#fff', padding:'16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:11, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Documents — Google Drive Links</p>
            {clientDocs.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>CLIENT DOCUMENTS <span style={{ fontWeight:400, color:'#9ca3af' }}>Shared with you</span></p>
                {clientDocs.map((doc,i)=>(
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:'1px solid #e5e7eb', marginBottom:6, textDecoration:'none', color:'#1e1537' }}>
                    <span style={{ flex:1, fontSize:13 }}>{doc.label||doc.url}</span>
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
                          <span style={{ flex:1 }}>{doc.label||doc.url}</span>
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

        {/* ── Tasks read-only ───────────────────────────────────────── */}
        {tasks.length > 0 && (
          <div style={{ background:'#fff', padding:'16px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <p style={{ fontWeight:700, fontSize:11, color:'#9ca3af', letterSpacing:'.1em', textTransform:'uppercase', margin:'0 0 12px' }}>Tasks & Schedule</p>
            {tasks.map(task=>{
              const sc:Record<string,string>={todo:'#f3f4f6','in-progress':'#dbeafe',review:'#fef9c3',done:'#dcfce7',blocked:'#fee2e2'};
              return (
                <div key={task.taskId} style={{ padding:'10px 14px', border:'1px solid #e5e7eb', marginBottom:8, background:'#f9fafb' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
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
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div style={{ marginTop:0 }}>
        {/* Confidentiality notice — no border radius */}
        <div style={{ maxWidth:1100, margin:'24px auto 0', padding:'0 16px' }}>
          <div style={{ background:'hsl(259 44% 96%)', border:'1px solid hsl(259 44% 84%)', padding:'14px 20px' }}>
            <p style={{ fontSize:12, color:'#6141ac', margin:0, lineHeight:1.7 }}>
              Sites proposed by Lakshmi Balaji ORS are exclusively for the use of the intended client and must only be dealt through Lakshmi Balaji ORS.
              Do not share or reproduce any site information without prior written permission.
            </p>
          </div>
        </div>

        <div style={{ background:'#1e1537', marginTop:24, padding:'28px 20px 0' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:24, paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
              {/* Registered Office */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:10 }}>Registered Office</p>
                <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 5px' }}>{COMPANY.name}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', whiteSpace:'pre-line', margin:'0 0 8px', lineHeight:1.6 }}>{COMPANY.address}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:0 }}>
                  GST: <span style={{ color:'rgba(255,255,255,0.55)' }}>{COMPANY.gst}</span>&ensp;
                  CIN: <span style={{ color:'rgba(255,255,255,0.55)' }}>{COMPANY.cin}</span>
                </p>
              </div>

              {/* PropTech Platforms */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:10 }}>Our Prop-Tech Platforms</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {PLATFORMS.map(p=>(
                    <div key={p.name}>
                      <p style={{ fontWeight:700, color:'rgba(255,255,255,0.8)', fontSize:12, margin:'0 0 2px' }}>{p.name}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:'0 0 2px', lineHeight:1.4 }}>{p.desc}</p>
                      <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#a78bfa', textDecoration:'none' }}>{p.url}</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra links */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:10 }}>More from Lakshmi Balaji ORS</p>
                {EXTRAS.map(e=>(
                  <div key={e.name} style={{ marginBottom:10 }}>
                    <p style={{ fontWeight:700, color:'rgba(255,255,255,0.8)', fontSize:12, margin:'0 0 3px' }}>{e.name}</p>
                    <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#a78bfa', textDecoration:'none' }}>{e.url}</a>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:'14px 0', textAlign:'center' }}>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:'0 0 2px' }}>Prepared by Lakshmi Balaji ORS — A PropTech · orsone.app</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)', margin:0 }}>This document is confidential and intended solely for the named recipient.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Guided Tour — haanest style ───────────────────────────────── */}
      {tourStep !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.45)' }}
          onClick={e=>{ if(e.target===e.currentTarget) closeTour(); }}>

          {/* Positioned tooltip card — no border radius, matches haanest */}
          <div style={{
            position:'fixed',
            left: 20,
            bottom: 80,
            width: 320,
            background:'#fff',
            boxShadow:'0 4px 24px rgba(0,0,0,0.25)',
            zIndex:101,
          }}>
            {/* Step number beacon */}
            <div style={{ background:'#1e1537', padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'#6141ac', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0 }}>
                {tourStep + 1}
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'.1em' }}>
                STEP {tourStep + 1} OF {TOUR_STEPS.length}
              </span>
            </div>

            <div style={{ padding:'16px 20px 20px' }}>
              <p style={{ fontSize:15, fontWeight:700, color:'#1e1537', margin:'0 0 8px' }}>{TOUR_STEPS[tourStep].title}</p>
              <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.7, margin:'0 0 16px' }}>{TOUR_STEPS[tourStep].body}</p>

              {/* Dot progress */}
              <div style={{ display:'flex', gap:5, marginBottom:16 }}>
                {TOUR_STEPS.map((_,i)=>(
                  <div key={i} onClick={()=>setTourStep(i)} style={{ width:6, height:6, borderRadius:'50%', cursor:'pointer', background:i===tourStep?'#6141ac':'#e5e7eb' }}/>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <button onClick={closeTour} style={{ fontSize:12, color:'#9ca3af', background:'none', border:'none', cursor:'pointer', padding:0 }}>Skip</button>
                <div style={{ display:'flex', gap:8 }}>
                  {tourStep > 0 && (
                    <button onClick={()=>setTourStep(t=>t!-1)} style={{ fontSize:12, color:'#374151', background:'#f3f4f6', border:'none', padding:'7px 14px', cursor:'pointer' }}>Back</button>
                  )}
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <button onClick={()=>setTourStep(t=>t!+1)} style={{ fontSize:13, fontWeight:700, color:'#fff', background:'#1e1537', border:'none', padding:'7px 18px', cursor:'pointer' }}>Next →</button>
                  ) : (
                    <button onClick={closeTour} style={{ fontSize:13, fontWeight:700, color:'#fff', background:'#166534', border:'none', padding:'7px 18px', cursor:'pointer' }}>Done ✓</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
