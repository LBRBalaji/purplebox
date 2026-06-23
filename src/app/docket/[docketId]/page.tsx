'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { renderRichText, SITE_STATUS_OPTIONS, POSSESSION_OPTIONS } from '@/hooks/use-transaction-dockets';
import { ExternalLink, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { TransactionDocket, ListingSchema } from '@/lib/schema';

const COMPANY = {
  name: 'Lakshmi Balaji ORS Private Limited',
  address: '54 G-1 Sarvalakshmi Homes, Srinivasa Nagar,\nHastinapuram, Chennai\u2013600 044',
  gst: '33AADCL2986N1Z1',
  cin: 'U72900TN2017PTC116192',
};

const PLATFORMS = [
  { name: 'haanest', desc: 'For Industrial & Land in Acres', url: 'www.haanest.app' },
  { name: 'ORS-ONE', desc: 'For Industrial/Warehouse Leasing', url: 'www.orsone.app' },
  { name: 'Aaptions', desc: 'For Retail Showroom & Commercial Leasing', url: 'aaptions.orsone.app' },
  { name: 'Howaah', desc: 'For Residential Buy & Rentals', url: 'howaah.orsone.app' },
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
        const allListings: ListingSchema[] = await listingsRes.json();
        setSites((data.siteIds || []).map((id: string) => allListings.find((l: ListingSchema) => l.listingId === id)).filter(Boolean));
        setLoading(false);
      })
      .catch(() => { setInvalid(true); setLoading(false); });
  }, [docketId, token]);

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
  const td: React.CSSProperties = { padding: '10px 12px', border: '0.5px solid hsl(259 30% 92%)', verticalAlign: 'top', fontSize: 13, minWidth: 180 };
  const rowLabel: React.CSSProperties = { padding: '10px 12px', border: '0.5px solid hsl(259 30% 92%)', fontSize: 12, color: 'hsl(259 15% 45%)', background: 'hsl(259 30% 98%)', whiteSpace: 'nowrap', position: 'sticky', left: 0, minWidth: 220 };
  const groupTh: React.CSSProperties = { padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6141ac', textTransform: 'uppercase' as const, letterSpacing: '.06em', background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 30% 90%)', position: 'sticky', left: 0 };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'hsl(259 30% 96%)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32,height:32,borderRadius:'50%',border:'2px solid #6141ac',borderTopColor:'transparent',animation:'spin 0.8s linear infinite',margin:'0 auto 12px' }}/>
        <p style={{ fontSize:13,color:'#6141ac' }}>Loading proposal…</p>
      </div>
    </div>
  );

  if (invalid) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'hsl(259 30% 96%)' }}>
      <div style={{ textAlign:'center', maxWidth:340, padding:'0 24px' }}>
        <p style={{ fontWeight:700, fontSize:18, color:'#1e1537', marginBottom:8 }}>Link invalid or expired</p>
        <p style={{ fontSize:13, color:'hsl(259 15% 55%)' }}>This proposal link is no longer active. Please contact the person who shared it.</p>
        <Link href="/" style={{ display:'inline-block', marginTop:20, background:'#6141ac', color:'#fff', padding:'8px 20px', borderRadius:8, textDecoration:'none', fontSize:13 }}>Go to ORS-ONE</Link>
      </div>
    </div>
  );

  if (!docket) return null;

  const clientDocs = docket.clientDocuments || [];
  const tasks = docket.tasks || [];
  const siteDocsMap = docket.siteDocuments || {};

  return (
    <div style={{ minHeight:'100vh', background:'hsl(259 30% 96%)', fontFamily:'Arial,Helvetica,sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ background:'#fff', borderBottom:'0.5px solid hsl(259 30% 90%)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontWeight:700, fontSize:14, color:'#1e1537' }}>ORS-ONE <span style={{ fontSize:10, fontWeight:600, background:'hsl(259 44% 94%)', color:'#6141ac', padding:'2px 7px', borderRadius:999, marginLeft:4 }}>Proposal</span></span>
        <Link href="/signup" style={{ fontSize:12, fontWeight:600, color:'#6141ac', textDecoration:'none', border:'0.5px solid #6141ac', padding:'5px 12px', borderRadius:6 }}>Create account</Link>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px 0' }}>

        {/* Dark header */}
        <div style={{ background:'linear-gradient(135deg,#1e1537,#2a1b5c)', borderRadius:16, padding:'24px 28px', marginBottom:16, color:'#fff' }}>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>Transaction Docket</p>
          <p style={{ fontSize:22, fontWeight:800, margin:'0 0 8px', letterSpacing:'-0.01em' }}>{docket.title}</p>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', fontSize:12, color:'rgba(255,255,255,0.55)' }}>
            <span>Client: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{docket.clientName}{docket.clientCompany?` · ${docket.clientCompany}`:''}</strong></span>
            {docket.demandId&&<span>Demand: <strong style={{ color:'rgba(255,255,255,0.85)' }}>#{docket.demandId}</strong></span>}
            <span>Created: <strong style={{ color:'rgba(255,255,255,0.85)' }}>{docket.createdAt?new Date(docket.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</strong></span>
            <span><strong style={{ color:'rgba(255,255,255,0.85)' }}>{sites.length}</strong> sites shortlisted</span>
          </div>
        </div>

        {/* Selected site CTA */}
        {selectedSites.length > 0 && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontWeight:700, color:'#166534', margin:'0 0 4px' }}>You've selected {selectedSites.length === 1 ? 'a site' : `${selectedSites.length} sites`}</p>
              <p style={{ fontSize:12, color:'#166534', margin:0 }}>{selectedSites.map(s=>s.location||s.listingId).join(', ')} · Ready to proceed?</p>
            </div>
            <Link href="/register-deal" style={{ background:'#166534', color:'#fff', padding:'8px 16px', borderRadius:8, textDecoration:'none', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              Register a Deal <ArrowRight style={{ width:14,height:14 }}/>
            </Link>
          </div>
        )}

        {/* Instruction */}
        <div style={{ background:'hsl(259 44% 96%)', border:'1px solid hsl(259 44% 86%)', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#6141ac' }}>
          <strong>How to use:</strong> Review the comparison table. Use the "Your preference" dropdowns to indicate your choice for each site. Your selections are saved instantly and shared with the ORS-ONE team.
        </div>

        {/* Stage tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:10, overflow:'hidden', border:'0.5px solid hsl(259 30% 88%)', marginBottom:12 }}>
          {[{l:'Stage 1 — Preliminary',v:1},{l:'Stage 2 — Detailed',v:2}].map(s=>(
            <button key={s.v} onClick={()=>setActiveLevel(s.v as 1|2)}
              style={{ padding:'10px', fontWeight:700, fontSize:12, border:'none', cursor:'pointer', background:activeLevel===s.v?'#1e1537':'#fff', color:activeLevel===s.v?'#fff':'hsl(259 15% 55%)' }}>
              {s.l}
            </button>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid hsl(259 30% 88%)', overflow:'auto', marginBottom:20 }}>
          <table style={{ borderCollapse:'collapse', width:'100%' }}>
            <thead>
              <tr>
                <th style={{ padding:'12px', background:'hsl(259 30% 97%)', border:'0.5px solid hsl(259 30% 88%)', textAlign:'left', fontSize:12, fontWeight:600, color:'hsl(259 15% 55%)', position:'sticky', left:0, minWidth:220 }}>Parameter</th>
                {sites.map(site=>{
                  const fc = flagCount(site.listingId);
                  return (
                    <th key={site.listingId} style={{ padding:'12px', background:'hsl(259 30% 97%)', border:'0.5px solid hsl(259 30% 88%)', textAlign:'left', minWidth:180 }}>
                      <p style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#1e1537', margin:0 }}>{site.listingId}</p>
                      <p style={{ fontSize:11, color:'hsl(259 15% 55%)', margin:'2px 0 0' }}>{site.location}</p>
                      {fc>0&&<span style={{ display:'inline-block', marginTop:4, fontSize:10, padding:'1px 6px', borderRadius:4, background:'#fee2e2', color:'#b91c1c', fontWeight:700 }}>{fc} flag{fc>1?'s':''}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([groupLabel, gParams])=>(
                <React.Fragment key={groupLabel}>
                  <tr><td colSpan={sites.length+1} style={groupTh}>Level {activeLevel} — {groupLabel}</td></tr>
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
                                : <span style={{ color:'hsl(259 15% 72%)' }}>—</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Status (client-editable) */}
                  <tr style={{ background:'hsl(259 44% 97%)' }}>
                    <td style={{ ...rowLabel, fontWeight:700, color:'#1e1537', background:'hsl(259 44% 97%)' }}>
                      Your preference — Level {activeLevel}
                      <p style={{ fontSize:10, fontWeight:400, color:'hsl(259 15% 60%)', margin:'2px 0 0' }}>Select your preference</p>
                    </td>
                    {sites.map(site=>{
                      const sk = `${site.listingId}__L${activeLevel}`;
                      const cur = siteStatuses[sk] || 'Not Decided';
                      return (
                        <td key={site.listingId} style={{ ...td, background:'hsl(259 44% 97%)', padding:'8px 10px' }}>
                          <select value={cur} onChange={e=>changeStatus(site.listingId,activeLevel,e.target.value)} disabled={saving===sk}
                            style={{ fontSize:12, width:'100%', border:'0.5px solid hsl(259 30% 82%)', borderRadius:6, padding:'6px 8px', background:'#fff', cursor:'pointer',
                              color:cur==='Selected'?'#166534':cur==='Rejected'?'#b91c1c':'#1e1537', fontWeight:cur==='Selected'?700:400 }}>
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

        {/* ── Contacts ──────────────────────────────────────────────────── */}
        {(docket.contacts?.accountOwner?.name||docket.contacts?.transactionPartner?.name)&&(
          <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid hsl(259 30% 88%)', padding:'16px 20px', marginBottom:20 }}>
            <p style={{ fontWeight:700, fontSize:12, color:'hsl(259 15% 45%)', letterSpacing:'.08em', textTransform:'uppercase', margin:'0 0 12px' }}>Your ORS-ONE Team</p>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {[docket.contacts.accountOwner, docket.contacts.transactionPartner].filter(Boolean).map((c,i)=>(
                <div key={i} style={{ fontSize:12 }}>
                  <p style={{ fontWeight:600,color:'#1e1537',margin:0 }}>{c?.name}</p>
                  {c?.representing&&<p style={{ color:'hsl(259 15% 55%)',margin:'2px 0 0' }}>{c.representing}</p>}
                  {c?.email&&<p style={{ color:'#6141ac',margin:'2px 0 0' }}>{c.email}</p>}
                  {c?.phone&&<p style={{ color:'hsl(259 15% 55%)',margin:'2px 0 0' }}>{c.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Documents (client-facing: only clientDocuments + siteDocuments) ── */}
        {(clientDocs.length > 0 || sites.some(s=>(siteDocsMap[s.listingId]||[]).length > 0)) && (
          <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid hsl(259 30% 88%)', padding:'16px 20px', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:10, borderBottom:'0.5px solid hsl(259 30% 92%)' }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'hsl(259 15% 55%)' }}>DOCUMENTS — GOOGLE DRIVE LINKS</span>
              <span style={{ fontSize:11, color:'hsl(259 15% 65%)' }}>Access managed in Drive</span>
            </div>

            {clientDocs.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'#6141ac', margin:'0 0 8px' }}>CLIENT DOCUMENTS <span style={{ fontWeight:400, color:'hsl(259 15% 60%)', textTransform:'none' }}>Shared with you</span></p>
                {clientDocs.map((doc,i)=>(
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, border:'0.5px solid hsl(259 30% 88%)', marginBottom:6, textDecoration:'none', color:'#1e1537' }}>
                    <span style={{ flex:1, fontSize:13 }}>{doc.label || doc.url}</span>
                    <ExternalLink style={{ width:13,height:13,color:'hsl(259 15% 55%)',flexShrink:0 }}/>
                  </a>
                ))}
              </div>
            )}

            {/* Site-specific folders */}
            {sites.some(s=>(siteDocsMap[s.listingId]||[]).length > 0) && (
              <div>
                <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', color:'hsl(259 15% 45%)', margin:'0 0 8px' }}>SITE-SPECIFIC FOLDERS</p>
                {sites.map(site=>{
                  const docs = siteDocsMap[site.listingId] || [];
                  if (docs.length === 0) return null;
                  return (
                    <div key={site.listingId} style={{ marginBottom:8, border:'0.5px solid hsl(259 30% 90%)', borderRadius:8, overflow:'hidden' }}>
                      <button onClick={()=>setExpandedSiteFolders(s=>({...s,[site.listingId]:!s[site.listingId]}))}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'hsl(259 30% 97%)', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, color:'#1e1537' }}>
                        <span>{site.location||site.listingId}</span>
                        {expandedSiteFolders[site.listingId]?<ChevronUp style={{width:14,height:14}}/>:<ChevronDown style={{width:14,height:14}}/>}
                      </button>
                      {expandedSiteFolders[site.listingId]&&(
                        <div style={{ padding:'8px 12px' }}>
                          {docs.map((doc,i)=>(
                            <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                              style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', textDecoration:'none', color:'#1e1537', fontSize:12 }}>
                              <span style={{ flex:1 }}>{doc.label||doc.url}</span>
                              <ExternalLink style={{ width:12,height:12,color:'hsl(259 15% 55%)' }}/>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tasks (read-only for client) ───────────────────────────── */}
        {tasks.length > 0 && (
          <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid hsl(259 30% 88%)', padding:'16px 20px', marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'hsl(259 15% 55%)', margin:'0 0 12px', paddingBottom:10, borderBottom:'0.5px solid hsl(259 30% 92%)' }}>
              TASKS & SCHEDULE <span style={{ fontWeight:400, textTransform:'none', color:'hsl(259 15% 65%)' }}>{tasks.length} task{tasks.length!==1?'s':''}</span>
            </p>
            {tasks.map(task=>{
              const statusColors:Record<string,string>={todo:'hsl(259 30% 90%)','in-progress':'#dbeafe',review:'#fef9c3',done:'#dcfce7',blocked:'#fee2e2'};
              return (
                <div key={task.taskId} style={{ padding:'10px 14px', borderRadius:8, border:'0.5px solid hsl(259 30% 90%)', marginBottom:8, background:'hsl(259 30% 98%)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:600, fontSize:13, color:'#1e1537' }}>{task.title}</span>
                    <span style={{ fontSize:10, padding:'1px 6px', borderRadius:4, background:statusColors[task.status]||'hsl(259 30% 90%)', textTransform:'capitalize' as const }}>{task.status.replace('-',' ')}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:4, fontSize:11, color:'hsl(259 15% 55%)', flexWrap:'wrap' }}>
                    {task.owner&&<span>👤 {task.owner}</span>}
                    {task.dueDate&&<span>📅 {task.dueDate}</span>}
                  </div>
                  {task.notes&&<p style={{ fontSize:11, color:'hsl(259 15% 60%)', margin:'4px 0 0' }}>{task.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Registered Office footer ──────────────────────────────────────── */}
      <div style={{ marginTop:40, background:'#1e1537', padding:'28px 20px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:24, paddingBottom:24, borderBottom:'0.5px solid rgba(255,255,255,0.12)' }}>
            {/* Registered office */}
            <div>
              <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:10 }}>Registered Office</p>
              <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:'0 0 6px' }}>{COMPANY.name}</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', whiteSpace:'pre-line', margin:'0 0 8px', lineHeight:1.6 }}>{COMPANY.address}</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0 }}>
                GST: <span style={{ color:'rgba(255,255,255,0.6)' }}>{COMPANY.gst}</span>&ensp;
                CIN: <span style={{ color:'rgba(255,255,255,0.6)' }}>{COMPANY.cin}</span>
              </p>
            </div>

            {/* PropTech platforms */}
            <div>
              <p style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:10 }}>Our Prop-Tech Platforms</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {PLATFORMS.map(p=>(
                  <div key={p.name}>
                    <p style={{ fontWeight:700, color:'rgba(255,255,255,0.85)', fontSize:13, margin:'0 0 2px' }}>{p.name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:'0 0 2px', lineHeight:1.4 }}>{p.desc}</p>
                    <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#a78bfa', textDecoration:'none' }}>{p.url}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.25)', padding:'16px 0' }}>
            This proposal is confidential and prepared exclusively for {docket.clientName}.
            Powered by ORS-ONE · Lakshmi Balaji ORS Private Limited.
          </p>
        </div>
      </div>
    </div>
  );
}
