'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useTransactionDockets, SITE_STATUS_OPTIONS, POSSESSION_OPTIONS, renderRichText } from '@/hooks/use-transaction-dockets';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, Flag, Plus, Trash2, Pencil, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { TransactionDocket, DocketParam, DocketTask, ListingSchema } from '@/lib/schema';

const FLAG_COLORS: Record<string, string> = { red: '#fee2e2', yellow: '#fef9c3' };
const flagStyle = (f?: string) => ({
  fontSize: 9, padding: '1px 4px', borderRadius: 3, border: 'none', cursor: 'pointer',
  ...(f === 'red' ? { background: '#fee2e2', color: '#b91c1c' }
    : f === 'yellow' ? { background: '#fef9c3', color: '#854d0e' }
    : { background: 'hsl(259 30% 94%)', color: 'hsl(259 15% 55%)' }),
} as React.CSSProperties);

const td: React.CSSProperties = { border: '0.5px solid hsl(259 30% 92%)', verticalAlign: 'top', fontSize: 12, minWidth: 160 };
const th: React.CSSProperties = { padding: '8px 10px', background: 'hsl(259 30% 97%)', border: '0.5px solid hsl(259 30% 88%)', minWidth: 160, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 };
const rowLabel: React.CSSProperties = { padding: '7px 10px', border: '0.5px solid hsl(259 30% 92%)', fontSize: 12, background: 'hsl(259 30% 98%)', position: 'sticky', left: 0, zIndex: 2, minWidth: 200 };
const groupTh: React.CSSProperties = { padding: '5px 10px', fontSize: 10, fontWeight: 700, color: '#6141ac', textTransform: 'uppercase' as const, letterSpacing: '.06em', background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 30% 90%)', position: 'sticky', left: 0 };

export default function DocketBuilderPage() {
  const params = useParams();
  const docketId = params.docketId as string;
  const { user, isLoading: authLoading } = useAuth();
  const { siteOptions } = useSiteOptions();
  const { dockets, updateDocket } = useTransactionDockets();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => { if (!authLoading && !hasAccess) router.push('/dashboard'); }, [authLoading, hasAccess, router]);

  const docket = dockets.find(d => d.docketId === docketId);

  // Local editable state — pushed to Firestore on change
  const [localParams, setLocalParams] = React.useState<DocketParam[]>([]);
  const [cellData, setCellData] = React.useState<Record<string, string>>({});
  const [cellFlags, setCellFlags] = React.useState<Record<string, 'red' | 'yellow'>>({});
  const [siteStatuses, setSiteStatuses] = React.useState<Record<string, string>>({});
  const [clientDocs, setClientDocs] = React.useState<{label:string;url:string}[]>([]);
  const [generalDocs, setGeneralDocs] = React.useState<{label:string;url:string}[]>([]);
  const [siteDocs, setSiteDocs] = React.useState<Record<string,{label:string;url:string}[]>>({});
  const [tasks, setTasks] = React.useState<DocketTask[]>([]);

  const [activeLevel, setActiveLevel] = React.useState<1|2>(1);
  const [editingCell, setEditingCell] = React.useState<string|null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [editingParamId, setEditingParamId] = React.useState<string|null>(null);
  const [editParamLabel, setEditParamLabel] = React.useState('');
  const [addFieldSection, setAddFieldSection] = React.useState<string|null>(null);
  const [newFieldLabel, setNewFieldLabel] = React.useState('');
  const [addSectionName, setAddSectionName] = React.useState('');
  const [showAddSection, setShowAddSection] = React.useState(false);
  const [newDocLabel, setNewDocLabel] = React.useState('');
  const [newDocUrl, setNewDocUrl] = React.useState('');
  const [addDocType, setAddDocType] = React.useState<'client'|'general'|null>(null);
  const [newSiteDocLabel, setNewSiteDocLabel] = React.useState('');
  const [newSiteDocUrl, setNewSiteDocUrl] = React.useState('');
  const [addSiteDocId, setAddSiteDocId] = React.useState<string|null>(null);
  const [expandedSiteFolders, setExpandedSiteFolders] = React.useState<Record<string,boolean>>({});
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [taskForm, setTaskForm] = React.useState({ title:'', owner:'', dueDate:'', priority:'medium' as DocketTask['priority'], status:'todo' as DocketTask['status'], notes:'' });
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!docket) return;

    // ── Auto-migrate old dockets ────────────────────────────────────────────
    // Dockets created before the June 2026 param update carry stale params
    // (Ownership type present, no LEASE TERMS section). Detect and fix silently.
    let params = [...(docket.params || [])];
    let migrated = false;

    // 1. Remove stale Ownership type param if present
    const ownershipIdx = params.findIndex(p => p.paramId === 'L1_ownership');
    if (ownershipIdx !== -1) {
      params.splice(ownershipIdx, 1);
      migrated = true;
    }

    // 2. Rename stale label keys to current labels
    const renames: Record<string, string> = {
      'L1_distance': 'Distance From Client Location-if any',
      'L1_access':   'Approach Road Access for 40 Feet Container Movement',
      'L1_area':     'Leasable Area (SFT)',
      'L1_docks':    'Docks Ratio',
    };
    params = params.map(p => {
      if (renames[p.paramId] && p.label !== renames[p.paramId]) {
        migrated = true;
        return { ...p, label: renames[p.paramId] };
      }
      return p;
    });

    // 3. Add LEASE TERMS params if the section is missing entirely
    const hasLeaseSec = params.some(p => p.paramId === 'L1_possession');
    if (!hasLeaseSec) {
      const POSSESSION_OPTS = ['Ready To Occupy', 'In 1 Month', 'In 3 Months', 'Under Construction', 'BTS - Built To Suit'];
      const baseOrder = Math.max(...params.filter(p => p.level === 1).map(p => p.order), 6);
      params.push(
        { paramId: 'L1_possession',        label: 'Warehouse Possession',                    groupLabel: 'Lease Terms', level: 1, order: baseOrder + 1, paramType: 'dropdown', dropdownOptions: POSSESSION_OPTS },
        { paramId: 'L1_quoted_rent',        label: 'Quoted Rent (Per SFT/Per Month)',          groupLabel: 'Lease Terms', level: 1, order: baseOrder + 2 },
        { paramId: 'L1_security_deposit',   label: 'Rental Security Deposit (Number of Months)', groupLabel: 'Lease Terms', level: 1, order: baseOrder + 3 },
        { paramId: 'L1_rental_escalation',  label: 'Rental Escalation',                       groupLabel: 'Lease Terms', level: 1, order: baseOrder + 4 },
      );
      migrated = true;
    }

    setLocalParams(params);

    // Persist the migration immediately so it's fixed for good
    if (migrated) {
      updateDocket(docket.docketId, { params, updatedAt: new Date().toISOString() });
    }
    // ───────────────────────────────────────────────────────────────────────

    setCellData(docket.cellData || {});
    setCellFlags(docket.cellFlags || {});
    setSiteStatuses(docket.siteStatuses || {});
    setClientDocs(docket.clientDocuments || []);
    setGeneralDocs(docket.generalDocuments || []);
    setSiteDocs(docket.siteDocuments || {});
    setTasks(docket.tasks || []);
  }, [docket?.docketId]);

  const sites = React.useMemo(() =>
    (docket?.siteIds || []).map(id => siteOptions.find(s => s.listingId === id)).filter(Boolean) as ListingSchema[],
    [docket?.siteIds, siteOptions]);

  const save = async (updates: Partial<TransactionDocket>) => {
    if (!docket) return;
    setSaving(true);
    await updateDocket(docket.docketId, { ...updates, updatedAt: new Date().toISOString() });
    setSaving(false);
  };

  const cellKey = (paramId: string, listingId: string) => `${paramId}__${listingId}`;

  const openEdit = (key: string) => { setEditingCell(key); setEditValue(cellData[key] || ''); };

  const commitEdit = async () => {
    if (!editingCell || !docket) return;
    const updated = { ...cellData, [editingCell]: editValue };
    setCellData(updated);
    setEditingCell(null);
    await save({ cellData: updated });
  };

  const toggleFlag = async (key: string) => {
    if (!docket) return;
    const cur = cellFlags[key];
    const next = cur === 'red' ? 'yellow' : cur === 'yellow' ? undefined : 'red';
    const updated = { ...cellFlags };
    if (next) updated[key] = next; else delete updated[key];
    setCellFlags(updated);
    await save({ cellFlags: updated });
  };

  const changeStatus = async (listingId: string, level: 1|2, value: string) => {
    if (!docket) return;
    const sk = `${listingId}__L${level}`;
    const updated = { ...siteStatuses, [sk]: value };
    setSiteStatuses(updated);
    const history = [...(docket.statusHistory || []), { listingId, level, from: siteStatuses[sk], to: value, by: 'admin' as const, at: new Date().toISOString() }];
    await save({ siteStatuses: updated, statusHistory: history });
  };

  const saveParams = async (updated: DocketParam[]) => {
    setLocalParams(updated);
    await save({ params: updated });
  };

  const renameParam = async (paramId: string, label: string) => {
    const updated = localParams.map(p => p.paramId === paramId ? { ...p, label } : p);
    await saveParams(updated);
    setEditingParamId(null);
  };

  const deleteParam = async (paramId: string) => {
    if (!confirm('Remove this field? Its data will be lost.')) return;
    await saveParams(localParams.filter(p => p.paramId !== paramId));
    const updatedCells = { ...cellData };
    Object.keys(updatedCells).forEach(k => { if (k.startsWith(paramId + '__')) delete updatedCells[k]; });
    setCellData(updatedCells);
    await save({ params: localParams.filter(p => p.paramId !== paramId), cellData: updatedCells });
  };

  const addField = async (groupLabel: string, level: 1|2) => {
    if (!newFieldLabel.trim()) return;
    const existing = localParams.filter(p => p.groupLabel === groupLabel && p.level === level);
    const newParam: DocketParam = {
      paramId: 'custom_' + Date.now(),
      label: newFieldLabel.trim(),
      groupLabel,
      level,
      order: existing.length > 0 ? Math.max(...existing.map(p => p.order)) + 1 : 0,
    };
    await saveParams([...localParams, newParam]);
    setNewFieldLabel('');
    setAddFieldSection(null);
  };

  const addSection = async () => {
    if (!addSectionName.trim()) return;
    const newParam: DocketParam = {
      paramId: 'custom_' + Date.now(),
      label: 'New field',
      groupLabel: addSectionName.trim(),
      level: activeLevel,
      order: 0,
    };
    await saveParams([...localParams, newParam]);
    setAddSectionName('');
    setShowAddSection(false);
  };

  const addDoc = async (type: 'client'|'general') => {
    if (!newDocUrl.trim()) return;
    const doc = { label: newDocLabel.trim() || 'Document', url: newDocUrl.trim() };
    if (type === 'client') {
      const updated = [...clientDocs, doc];
      setClientDocs(updated);
      await save({ clientDocuments: updated });
    } else {
      const updated = [...generalDocs, doc];
      setGeneralDocs(updated);
      await save({ generalDocuments: updated });
    }
    setNewDocLabel(''); setNewDocUrl(''); setAddDocType(null);
  };

  const removeDoc = async (type: 'client'|'general', idx: number) => {
    if (type === 'client') {
      const updated = clientDocs.filter((_,i)=>i!==idx);
      setClientDocs(updated); await save({ clientDocuments: updated });
    } else {
      const updated = generalDocs.filter((_,i)=>i!==idx);
      setGeneralDocs(updated); await save({ generalDocuments: updated });
    }
  };

  const addSiteDoc = async (listingId: string) => {
    if (!newSiteDocUrl.trim()) return;
    const doc = { label: newSiteDocLabel.trim() || 'Document', url: newSiteDocUrl.trim() };
    const updated = { ...siteDocs, [listingId]: [...(siteDocs[listingId]||[]), doc] };
    setSiteDocs(updated); await save({ siteDocuments: updated });
    setNewSiteDocLabel(''); setNewSiteDocUrl(''); setAddSiteDocId(null);
  };

  const removeSiteDoc = async (listingId: string, idx: number) => {
    const updated = { ...siteDocs, [listingId]: (siteDocs[listingId]||[]).filter((_,i)=>i!==idx) };
    setSiteDocs(updated); await save({ siteDocuments: updated });
  };

  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    const newTask: DocketTask = { taskId: 'task_'+Date.now(), ...taskForm };
    const updated = [...tasks, newTask];
    setTasks(updated); await save({ tasks: updated });
    setTaskForm({ title:'', owner:'', dueDate:'', priority:'medium', status:'todo', notes:'' });
    setShowAddTask(false);
  };

  const removeTask = async (taskId: string) => {
    const updated = tasks.filter(t=>t.taskId!==taskId);
    setTasks(updated); await save({ tasks: updated });
  };

  const updateTaskStatus = async (taskId: string, status: DocketTask['status']) => {
    const updated = tasks.map(t=>t.taskId===taskId?{...t,status}:t);
    setTasks(updated); await save({ tasks: updated });
  };

  const copyShareLink = () => {
    if (!docket) return;
    const url = `${window.location.origin}/docket/${docket.docketId}?v=${docket.shareToken}`;
    navigator.clipboard.writeText(url).then(()=>{ setCopiedLink(true); setTimeout(()=>setCopiedLink(false),2500); toast({ title:'Link copied', description:'Share with your client — no login needed.' }); });
  };

  const levelParams = localParams.filter(p=>p.level===activeLevel).sort((a,b)=>a.order-b.order);
  const groups: Record<string,DocketParam[]> = {};
  levelParams.forEach(p=>{ (groups[p.groupLabel]=groups[p.groupLabel]||[]).push(p); });

  const flagCount = (lid: string) => Object.entries(cellFlags).filter(([k,v])=>k.includes(`__${lid}`)&&v).length;

  if (authLoading || !hasAccess) return null;
  if (!docket) return (
    <div style={{display:'flex',minHeight:'100vh',background:'hsl(259 30% 96%)'}}>
      <AdminSidebar/>
      <div style={{flex:1,padding:40,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <p style={{fontSize:14,color:'hsl(259 15% 55%)'}}>Loading docket…</p>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'hsl(259 30% 96%)'}}>
      <AdminSidebar/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Top bar */}
        <div style={{padding:'12px 20px',borderBottom:'0.5px solid hsl(259 30% 90%)',background:'#fff',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <button onClick={()=>router.push('/dashboard/dockets')} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'hsl(259 15% 55%)',background:'none',border:'none',cursor:'pointer'}}>
            <ArrowLeft style={{width:14,height:14}}/> All Dockets
          </button>
          <div style={{width:1,height:20,background:'hsl(259 30% 88%)'}}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:700,fontSize:14,color:'#1e1537',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{docket.title}</p>
            <p style={{fontSize:11,color:'hsl(259 15% 55%)',margin:0}}>{docket.clientName}{docket.clientCompany?` · ${docket.clientCompany}`:''} · {sites.length} site{sites.length!==1?'s':''}</p>
          </div>
          {saving&&<span style={{fontSize:11,color:'#6141ac'}}>Saving…</span>}
          <Button onClick={copyShareLink} variant="outline" size="sm" style={{gap:4,borderColor:'#6141ac',color:'#6141ac'}}>
            {copiedLink?<Check style={{width:12,height:12}}/>:<Copy style={{width:12,height:12}}/>}
            {copiedLink?'Copied':'Share with client'}
          </Button>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflow:'auto',padding:'20px 20px 60px'}}>

          {/* Stage selector */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,marginBottom:12,borderRadius:12,overflow:'hidden',border:'0.5px solid hsl(259 30% 88%)'}}>
            {[{label:'Stage 1 — Preliminary',lvl:1},{label:'Stage 2 — Detailed',lvl:2}].map(s=>(
              <button key={s.lvl} onClick={()=>setActiveLevel(s.lvl as 1|2)}
                style={{padding:'12px 0',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',
                  background:activeLevel===s.lvl?'#1e1537':'hsl(259 30% 96%)',
                  color:activeLevel===s.lvl?'#fff':'hsl(259 15% 50%)'}}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{display:'flex',gap:16,alignItems:'center',fontSize:11,color:'hsl(259 15% 60%)',marginBottom:12,flexWrap:'wrap'}}>
            <span>Click any cell to edit · Esc or click outside to save</span>
            <span>🚩 critical · ⚠ moderate · click flag icon to cycle</span>
            <span>**bold** · - bullet · 1. numbered</span>
          </div>

          {/* Comparison table */}
          <div style={{background:'#fff',borderRadius:12,border:'0.5px solid hsl(259 30% 88%)',overflow:'auto',marginBottom:20}}>
            <table style={{borderCollapse:'collapse',width:'100%'}}>
              <thead>
                <tr>
                  <th style={{...th,minWidth:200,position:'sticky',left:0,zIndex:3}}>Parameter</th>
                  {sites.map(site=>{
                    const fc=flagCount(site.listingId);
                    return (
                      <th key={site.listingId} style={th}>
                        <div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:'#1e1537'}}>{site.listingId}</div>
                        <div style={{fontSize:11,color:'hsl(259 15% 55%)',marginTop:2}}>{site.location}</div>
                        {fc>0&&<span style={{display:'inline-block',marginTop:4,fontSize:10,padding:'1px 6px',borderRadius:4,background:'#fee2e2',color:'#b91c1c',fontWeight:700}}>{fc} flag{fc>1?'s':''}</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([groupLabel, gParams])=>(
                  <React.Fragment key={groupLabel}>
                    {/* Section header */}
                    <tr>
                      <td colSpan={sites.length+1} style={groupTh}>{groupLabel}</td>
                    </tr>

                    {/* Param rows */}
                    {gParams.map(param=>(
                      <tr key={param.paramId}>
                        <td style={rowLabel}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            {editingParamId===param.paramId ? (
                              <div style={{display:'flex',gap:4,flex:1}}>
                                <input autoFocus value={editParamLabel} onChange={e=>setEditParamLabel(e.target.value)}
                                  onKeyDown={e=>{if(e.key==='Enter')renameParam(param.paramId,editParamLabel);if(e.key==='Escape')setEditingParamId(null);}}
                                  style={{flex:1,fontSize:12,border:'1px solid #6141ac',borderRadius:4,padding:'2px 6px'}}/>
                                <button onClick={()=>renameParam(param.paramId,editParamLabel)} style={{color:'#6141ac',background:'none',border:'none',cursor:'pointer',fontSize:10}}>✓</button>
                                <button onClick={()=>setEditingParamId(null)} style={{color:'hsl(259 15% 55%)',background:'none',border:'none',cursor:'pointer',fontSize:10}}>✕</button>
                              </div>
                            ) : (
                              <>
                                <span style={{flex:1,lineHeight:1.4}}>{param.label}</span>
                                <button onClick={()=>{setEditingParamId(param.paramId);setEditParamLabel(param.label);}} title="Rename" style={{opacity:0,transition:'opacity .15s',color:'hsl(259 15% 60%)',background:'none',border:'none',cursor:'pointer',padding:'2px'}} className="param-edit-btn">
                                  <Pencil style={{width:10,height:10}}/>
                                </button>
                                <button onClick={()=>deleteParam(param.paramId)} title="Remove field" style={{opacity:0,transition:'opacity .15s',color:'#b91c1c',background:'none',border:'none',cursor:'pointer',padding:'2px'}} className="param-edit-btn">
                                  <X style={{width:10,height:10}}/>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        {sites.map(site=>{
                          const key=cellKey(param.paramId,site.listingId);
                          const flag=cellFlags[key];
                          const isEditing=editingCell===key;
                          const isDropdown=param.paramType==='dropdown';
                          return (
                            <td key={site.listingId}
                              style={{...td,background:flag?FLAG_COLORS[flag]:'#fff',cursor:'pointer',padding:'6px 8px',position:'relative'}}
                              onClick={()=>!isEditing&&openEdit(key)}>
                              {isEditing ? (
                                isDropdown ? (
                                  <select autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)}
                                    onBlur={commitEdit}
                                    style={{width:'100%',fontSize:12,border:'1px solid #6141ac',borderRadius:4,padding:'4px'}}>
                                    <option value="">— Select —</option>
                                    {(param.dropdownOptions||POSSESSION_OPTIONS).map(o=><option key={o}>{o}</option>)}
                                  </select>
                                ) : (
                                  <textarea autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)}
                                    onBlur={commitEdit}
                                    onKeyDown={e=>{if(e.key==='Escape')setEditingCell(null);if(e.key==='Enter'&&e.metaKey)commitEdit();}}
                                    style={{width:'100%',minHeight:56,fontSize:12,border:'1px solid #6141ac',borderRadius:4,padding:4,resize:'vertical',outline:'none'}}/>
                                )
                              ) : (
                                <div style={{minHeight:24,lineHeight:1.5}}>
                                  {cellData[key]?renderRichText(cellData[key]):<span style={{color:'hsl(259 15% 75%)'}}>Click to fill</span>}
                                </div>
                              )}
                              <button onClick={e=>{e.stopPropagation();toggleFlag(key);}} title="Flag" style={{...flagStyle(flag),position:'absolute',top:3,right:3}}>
                                {flag==='red'?'🚩':flag==='yellow'?'⚠':'·'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* + Add field to this section */}
                    <tr>
                      <td colSpan={sites.length+1} style={{...td,background:'hsl(259 44% 98%)',padding:'4px 8px'}}>
                        {addFieldSection===groupLabel ? (
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            <input autoFocus placeholder="Field label…" value={newFieldLabel} onChange={e=>setNewFieldLabel(e.target.value)}
                              onKeyDown={e=>{if(e.key==='Enter')addField(groupLabel,activeLevel);if(e.key==='Escape'){setAddFieldSection(null);setNewFieldLabel('');}}}
                              style={{flex:1,fontSize:12,border:'1px solid #6141ac',borderRadius:4,padding:'4px 8px',outline:'none'}}/>
                            <button onClick={()=>addField(groupLabel,activeLevel)} style={{fontSize:11,color:'#fff',background:'#6141ac',border:'none',borderRadius:4,padding:'4px 10px',cursor:'pointer'}}>Add</button>
                            <button onClick={()=>{setAddFieldSection(null);setNewFieldLabel('');}} style={{fontSize:11,color:'hsl(259 15% 55%)',background:'none',border:'none',cursor:'pointer'}}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={()=>{setAddFieldSection(groupLabel);setNewFieldLabel('');}}
                            style={{fontSize:11,color:'#6141ac',background:'none',border:'none',cursor:'pointer',padding:'2px 0'}}>
                            + Add field to {groupLabel}
                          </button>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* Status row */}
                <tr style={{background:'hsl(259 44% 97%)'}}>
                  <td style={{...rowLabel,fontWeight:700,color:'#1e1537',background:'hsl(259 44% 97%)'}}>Status — Level {activeLevel}</td>
                  {sites.map(site=>{
                    const sk=`${site.listingId}__L${activeLevel}`;
                    const cur=siteStatuses[sk]||'Not Decided';
                    return (
                      <td key={site.listingId} style={{...td,background:'hsl(259 44% 97%)',padding:'6px 8px'}}>
                        <select value={cur} onChange={e=>changeStatus(site.listingId,activeLevel,e.target.value)}
                          style={{fontSize:12,width:'100%',border:'0.5px solid hsl(259 30% 82%)',borderRadius:6,padding:'5px 6px',background:'#fff',
                            color:cur==='Selected'?'#166534':cur==='Rejected'?'#b91c1c':'#1e1537',fontWeight:cur==='Selected'?700:400}}>
                          {SITE_STATUS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>

                {/* + Add new section */}
                <tr>
                  <td colSpan={sites.length+1} style={{...td,background:'hsl(259 30% 98%)',padding:'6px 10px'}}>
                    {showAddSection ? (
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <input autoFocus placeholder="New section name…" value={addSectionName} onChange={e=>setAddSectionName(e.target.value)}
                          onKeyDown={e=>{if(e.key==='Enter')addSection();if(e.key==='Escape'){setShowAddSection(false);setAddSectionName('');}}}
                          style={{flex:1,fontSize:12,border:'1px solid #6141ac',borderRadius:4,padding:'4px 8px',outline:'none'}}/>
                        <button onClick={addSection} style={{fontSize:11,color:'#fff',background:'#6141ac',border:'none',borderRadius:4,padding:'4px 10px',cursor:'pointer'}}>Create</button>
                        <button onClick={()=>{setShowAddSection(false);setAddSectionName('');}} style={{fontSize:11,color:'hsl(259 15% 55%)',background:'none',border:'none',cursor:'pointer'}}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>setShowAddSection(true)}
                        style={{fontSize:11,color:'hsl(259 15% 50%)',background:'none',border:'1px dashed hsl(259 30% 80%)',borderRadius:6,padding:'5px 14px',cursor:'pointer',width:'100%'}}>
                        + Add new section with fields
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Documents ──────────────────────────────────────────────── */}
          <div style={{background:'#fff',borderRadius:12,border:'0.5px solid hsl(259 30% 88%)',padding:'16px 20px',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:10,borderBottom:'0.5px solid hsl(259 30% 92%)'}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',color:'hsl(259 15% 55%)'}}>DOCUMENTS — GOOGLE DRIVE LINKS</span>
              <span style={{fontSize:11,color:'hsl(259 15% 65%)'}}>Access managed in Drive</span>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              {/* Client docs */}
              <div>
                <p style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',color:'#6141ac',margin:'0 0 4px'}}>CLIENT DOCUMENTS <span style={{fontWeight:400,color:'hsl(259 15% 60%)',textTransform:'none'}}>Shared with client</span></p>
                {clientDocs.map((doc,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{flex:1,fontSize:12,color:'#0c447c',textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.label||doc.url}</a>
                    <ExternalLink style={{width:11,height:11,color:'hsl(259 15% 55%)',flexShrink:0}}/>
                    <button onClick={()=>removeDoc('client',i)} style={{color:'#b91c1c',background:'none',border:'none',cursor:'pointer',flexShrink:0}}><X style={{width:12,height:12}}/></button>
                  </div>
                ))}
                {addDocType==='client' ? (
                  <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
                    <input placeholder="Label" value={newDocLabel} onChange={e=>setNewDocLabel(e.target.value)} style={{fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                    <div style={{display:'flex',gap:4}}>
                      <input placeholder="https://drive.google.com/…" value={newDocUrl} onChange={e=>setNewDocUrl(e.target.value)} style={{flex:1,fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                      <button onClick={()=>addDoc('client')} style={{background:'#6141ac',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>+</button>
                      <button onClick={()=>setAddDocType(null)} style={{background:'none',border:'none',cursor:'pointer',color:'hsl(259 15% 55%)'}}><X style={{width:14,height:14}}/></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>{setAddDocType('client');setNewDocLabel('');setNewDocUrl('');}} style={{fontSize:11,color:'#6141ac',background:'hsl(259 44% 96%)',border:'0.5px solid hsl(259 44% 86%)',borderRadius:4,padding:'4px 10px',cursor:'pointer',marginTop:4}}>+ Add link</button>
                )}
              </div>

              {/* General docs */}
              <div>
                <p style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',color:'hsl(259 15% 45%)',margin:'0 0 4px'}}>GENERAL DOCUMENTS <span style={{fontWeight:400,color:'hsl(259 15% 60%)',textTransform:'none'}}>Internal team</span></p>
                {generalDocs.map((doc,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{flex:1,fontSize:12,color:'#0c447c',textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.label||doc.url}</a>
                    <ExternalLink style={{width:11,height:11,color:'hsl(259 15% 55%)',flexShrink:0}}/>
                    <button onClick={()=>removeDoc('general',i)} style={{color:'#b91c1c',background:'none',border:'none',cursor:'pointer',flexShrink:0}}><X style={{width:12,height:12}}/></button>
                  </div>
                ))}
                {addDocType==='general' ? (
                  <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
                    <input placeholder="Label" value={newDocLabel} onChange={e=>setNewDocLabel(e.target.value)} style={{fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                    <div style={{display:'flex',gap:4}}>
                      <input placeholder="https://drive.google.com/…" value={newDocUrl} onChange={e=>setNewDocUrl(e.target.value)} style={{flex:1,fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                      <button onClick={()=>addDoc('general')} style={{background:'#6141ac',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>+</button>
                      <button onClick={()=>setAddDocType(null)} style={{background:'none',border:'none',cursor:'pointer',color:'hsl(259 15% 55%)'}}><X style={{width:14,height:14}}/></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>{setAddDocType('general');setNewDocLabel('');setNewDocUrl('');}} style={{fontSize:11,color:'hsl(259 15% 50%)',background:'hsl(259 30% 96%)',border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 10px',cursor:'pointer',marginTop:4}}>+ Add link</button>
                )}
              </div>
            </div>

            {/* Site-specific folders */}
            <div style={{borderTop:'0.5px solid hsl(259 30% 92%)',paddingTop:12}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',color:'hsl(259 15% 45%)',margin:'0 0 8px'}}>SITE-SPECIFIC FOLDERS <span style={{fontWeight:400,color:'hsl(259 15% 65%)',textTransform:'none'}}>{sites.length} sites</span></p>
              {sites.map(site=>(
                <div key={site.listingId} style={{marginBottom:8,border:'0.5px solid hsl(259 30% 90%)',borderRadius:8,overflow:'hidden'}}>
                  <button onClick={()=>setExpandedSiteFolders(s=>({...s,[site.listingId]:!s[site.listingId]}))}
                    style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'hsl(259 30% 97%)',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,color:'#1e1537'}}>
                    <span>{site.location || site.listingId} <span style={{fontFamily:'monospace',fontSize:10,color:'hsl(259 15% 55%)',fontWeight:400}}>({site.listingId})</span></span>
                    {expandedSiteFolders[site.listingId]?<ChevronUp style={{width:14,height:14}}/>:<ChevronDown style={{width:14,height:14}}/>}
                  </button>
                  {expandedSiteFolders[site.listingId]&&(
                    <div style={{padding:'8px 12px'}}>
                      {(siteDocs[site.listingId]||[]).map((doc,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{flex:1,fontSize:12,color:'#0c447c',textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.label||doc.url}</a>
                          <ExternalLink style={{width:11,height:11,color:'hsl(259 15% 55%)'}}/>
                          <button onClick={()=>removeSiteDoc(site.listingId,i)} style={{color:'#b91c1c',background:'none',border:'none',cursor:'pointer'}}><X style={{width:12,height:12}}/></button>
                        </div>
                      ))}
                      {addSiteDocId===site.listingId ? (
                        <div style={{display:'flex',flexDirection:'column',gap:4}}>
                          <input placeholder="Label" value={newSiteDocLabel} onChange={e=>setNewSiteDocLabel(e.target.value)} style={{fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                          <div style={{display:'flex',gap:4}}>
                            <input placeholder="https://drive.google.com/…" value={newSiteDocUrl} onChange={e=>setNewSiteDocUrl(e.target.value)} style={{flex:1,fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'4px 6px'}}/>
                            <button onClick={()=>addSiteDoc(site.listingId)} style={{background:'#6141ac',color:'#fff',border:'none',borderRadius:4,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>+</button>
                            <button onClick={()=>setAddSiteDocId(null)} style={{background:'none',border:'none',cursor:'pointer',color:'hsl(259 15% 55%)'}}><X style={{width:14,height:14}}/></button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={()=>{setAddSiteDocId(site.listingId);setNewSiteDocLabel('');setNewSiteDocUrl('');}} style={{fontSize:11,color:'#6141ac',background:'none',border:'none',cursor:'pointer',padding:0}}>+ Add document</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Tasks & Schedule ────────────────────────────────────────── */}
          <div style={{background:'#fff',borderRadius:12,border:'0.5px solid hsl(259 30% 88%)',padding:'16px 20px',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,paddingBottom:10,borderBottom:'0.5px solid hsl(259 30% 92%)'}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:'.1em',color:'hsl(259 15% 55%)'}}>TASKS & SCHEDULE <span style={{fontSize:10,fontWeight:400,color:'hsl(259 15% 65%)',textTransform:'none'}}>{tasks.length} task{tasks.length!==1?'s':''}</span></span>
              <button onClick={()=>setShowAddTask(true)} style={{fontSize:11,color:'#fff',background:'#6141ac',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer'}}>+ Add Task</button>
            </div>

            {tasks.length===0&&!showAddTask&&<p style={{fontSize:13,color:'hsl(259 15% 60%)',textAlign:'center',padding:'16px 0'}}>No tasks yet. Click "+ Add Task" to create one.</p>}

            {tasks.map(task=>{
              const overdue=task.dueDate&&task.status!=='done'&&new Date(task.dueDate)<new Date();
              const statusColors:Record<string,string>={todo:'hsl(259 30% 90%)',  'in-progress':'#dbeafe', review:'#fef9c3', done:'#dcfce7', blocked:'#fee2e2'};
              return (
                <div key={task.taskId} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:8,border:'0.5px solid hsl(259 30% 90%)',marginBottom:8,background:'hsl(259 30% 98%)'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontWeight:600,fontSize:13,color:'#1e1537'}}>{task.title}</span>
                      {overdue&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:999,background:'#fee2e2',color:'#b91c1c',fontWeight:700}}>Overdue</span>}
                    </div>
                    <div style={{display:'flex',gap:10,marginTop:4,flexWrap:'wrap'}}>
                      {task.owner&&<span style={{fontSize:11,color:'hsl(259 15% 55%)'}}>👤 {task.owner}</span>}
                      {task.dueDate&&<span style={{fontSize:11,color:overdue?'#b91c1c':'hsl(259 15% 55%)'}}>📅 {task.dueDate}</span>}
                      <span style={{fontSize:11,padding:'1px 6px',borderRadius:4,background:statusColors[task.status]||'hsl(259 30% 90%)',textTransform:'capitalize'}}>{task.status.replace('-',' ')}</span>
                      <span style={{fontSize:11,color:task.priority==='high'?'#b91c1c':task.priority==='medium'?'#854d0e':'hsl(259 15% 55%)',textTransform:'capitalize'}}>{task.priority}</span>
                    </div>
                    {task.notes&&<p style={{fontSize:11,color:'hsl(259 15% 55%)',margin:'4px 0 0'}}>{task.notes}</p>}
                  </div>
                  <select value={task.status} onChange={e=>updateTaskStatus(task.taskId,e.target.value as DocketTask['status'])} style={{fontSize:11,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'3px 5px',flexShrink:0}}>
                    {(['todo','in-progress','review','done','blocked'] as DocketTask['status'][]).map(s=><option key={s} value={s}>{s.replace('-',' ')}</option>)}
                  </select>
                  <button onClick={()=>removeTask(task.taskId)} style={{color:'#b91c1c',background:'none',border:'none',cursor:'pointer',flexShrink:0,padding:'2px'}}><Trash2 style={{width:13,height:13}}/></button>
                </div>
              );
            })}

            {showAddTask&&(
              <div style={{background:'hsl(259 44% 97%)',borderRadius:8,border:'0.5px solid hsl(259 44% 85%)',padding:14,marginTop:8}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <Input placeholder="Task title *" value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} className="h-8 text-sm"/>
                  </div>
                  <Input placeholder="Owner" value={taskForm.owner} onChange={e=>setTaskForm(f=>({...f,owner:e.target.value}))} className="h-8 text-sm"/>
                  <Input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))} className="h-8 text-sm"/>
                  <select value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value as any}))} style={{fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'5px 8px'}}>
                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                  <select value={taskForm.status} onChange={e=>setTaskForm(f=>({...f,status:e.target.value as any}))} style={{fontSize:12,border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'5px 8px'}}>
                    <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option><option value="blocked">Blocked</option>
                  </select>
                  <div style={{gridColumn:'1/-1'}}>
                    <Input placeholder="Notes (optional)" value={taskForm.notes} onChange={e=>setTaskForm(f=>({...f,notes:e.target.value}))} className="h-8 text-sm"/>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  <button onClick={()=>setShowAddTask(false)} style={{fontSize:11,color:'hsl(259 15% 55%)',background:'none',border:'0.5px solid hsl(259 30% 85%)',borderRadius:4,padding:'5px 10px',cursor:'pointer'}}>Cancel</button>
                  <button onClick={addTask} style={{fontSize:11,color:'#fff',background:'#6141ac',border:'none',borderRadius:4,padding:'5px 12px',cursor:'pointer'}}>Save task</button>
                </div>
              </div>
            )}
          </div>

          <p style={{fontSize:11,color:'hsl(259 15% 60%)'}}>
            Last updated: {new Date(docket.updatedAt||docket.createdAt||'').toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* hover-reveal CSS for param edit buttons */}
      <style>{`tr:hover .param-edit-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}
