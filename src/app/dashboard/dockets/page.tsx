'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useTransactionDockets, DEFAULT_DOCKET_PARAMS, autoFillCellsFromListing } from '@/hooks/use-transaction-dockets';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileStack, Plus, Search, Archive, ExternalLink, Copy, ChevronRight, Check } from 'lucide-react';

export default function DocketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { demands } = useData();
  const { siteOptions, isLoading: sitesLoading } = useSiteOptions();
  const { dockets, isLoading, createDocket, archiveDocket } = useTransactionDockets();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => {
    if (!authLoading && !hasAccess) router.push('/dashboard');
  }, [authLoading, hasAccess, router]);

  const [search, setSearch] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Create form state
  const [form, setForm] = React.useState({ title: '', clientName: '', clientCompany: '', clientEmail: '', demandId: '' });
  const [selectedSiteIds, setSelectedSiteIds] = React.useState<string[]>([]);
  const [siteSearch, setSiteSearch] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const activeDockets = dockets.filter(d => !d.archived);
  const filtered = activeDockets.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.docketId.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.clientName.toLowerCase().includes(q) || d.clientCompany?.toLowerCase().includes(q);
  });

  const filteredSites = siteOptions.filter(s => {
    if (!siteSearch) return true;
    const q = siteSearch.toLowerCase();
    return s.listingId.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || (s.warehouseModel || '').toLowerCase().includes(q);
  }).slice(0, 20);

  const toggleSite = (id: string) =>
    setSelectedSiteIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 10 ? [...ids, id] : ids);

  const resetCreate = () => {
    setForm({ title: '', clientName: '', clientCompany: '', clientEmail: '', demandId: '' });
    setSelectedSiteIds([]);
    setSiteSearch('');
  };

  const handleCreate = async () => {
    if (!form.title || !form.clientName || selectedSiteIds.length === 0 || !user) return;
    setCreating(true);
    try {
      const paramIds = DEFAULT_DOCKET_PARAMS.map(p => p.paramId);
      const cellData: Record<string, string> = {};
      selectedSiteIds.forEach(id => {
        const listing = siteOptions.find(s => s.listingId === id);
        if (listing) Object.assign(cellData, autoFillCellsFromListing(listing, paramIds));
      });
      const shareToken = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
      const docketId = await createDocket({
        title: form.title,
        clientName: form.clientName,
        clientCompany: form.clientCompany || undefined,
        clientEmail: form.clientEmail || undefined,
        demandId: form.demandId || undefined,
        siteIds: selectedSiteIds,
        params: DEFAULT_DOCKET_PARAMS,
        cellData,
        cellFlags: {},
        siteStatuses: {},
        statusHistory: [],
        stage: 1,
        shareToken,
        contacts: { coPartners: [] },
        clientDocuments: [],
        generalDocuments: [],
        siteDocuments: {},
        tasks: [],
        archived: false,
        createdBy: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsCreateOpen(false);
      resetCreate();
      toast({ title: 'Docket created' });
      router.push(`/dashboard/dockets/${docketId}`);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create docket. Try again.' });
    }
    setCreating(false);
  };

  const copyShareLink = (d: typeof dockets[0]) => {
    const url = `${window.location.origin}/docket/${d.docketId}?v=${d.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(d.docketId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: 'Link copied', description: 'Share this link with your client — no login needed.' });
    });
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this docket? It will be hidden from the list.')) return;
    await archiveDocket(id);
    toast({ title: 'Docket archived' });
  };

  const canCreate = form.title && form.clientName && selectedSiteIds.length > 0;

  if (authLoading || !hasAccess) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px 28px 56px', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileStack style={{ width: 14, height: 14, color: '#6141ac' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Transaction Dockets</p>
              <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>Shareable warehouse comparison proposals for clients</p>
            </div>
          </div>
          <Button onClick={() => { resetCreate(); setIsCreateOpen(true); }} style={{ background: '#6141ac' }}>
            <Plus className="mr-2 h-4 w-4" /> New docket
          </Button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 360, marginBottom: 16 }}>
          <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
          <Input placeholder="Search dockets..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
        </div>

        {/* Docket cards */}
        {isLoading ? (
          <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>Loading dockets...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)' }}>
            <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>No dockets yet.</p>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 65%)', marginTop: 6 }}>
              Create a docket to share a warehouse comparison proposal with a client — no login needed on their end.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(d => {
              const demand = demands.find(dem => dem.demandId === d.demandId);
              const selectedSites = d.siteIds.filter(id =>
                (d.siteStatuses[id + '__L1'] === 'Selected' || d.siteStatuses[id + '__L2'] === 'Selected'));
              return (
                <div key={d.docketId} style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#1e1537', margin: 0 }}>{d.title}</p>
                      {selectedSites.length > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                          {selectedSites.length} Selected
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>
                      {d.clientName}{d.clientCompany ? ` · ${d.clientCompany}` : ''} · {d.siteIds.length} site{d.siteIds.length !== 1 ? 's' : ''}
                      {demand ? ` · Demand #${demand.demandId}` : ''}
                    </p>
                    <p style={{ fontSize: 11, color: 'hsl(259 15% 65%)', margin: '4px 0 0', fontFamily: 'monospace' }}>{d.docketId}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => copyShareLink(d)}
                      title="Copy client link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '5px 10px', border: '0.5px solid hsl(259 30% 85%)', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: copiedId === d.docketId ? '#166534' : 'hsl(259 15% 50%)' }}>
                      {copiedId === d.docketId ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                      {copiedId === d.docketId ? 'Copied' : 'Share link'}
                    </button>
                    <button
                      onClick={() => handleArchive(d.docketId)}
                      title="Archive"
                      style={{ color: 'hsl(259 15% 60%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Archive style={{ width: 14, height: 14 }} />
                    </button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/dockets/${d.docketId}`)}
                      style={{ background: '#6141ac', gap: 4 }}>
                      Open <ChevronRight style={{ width: 12, height: 12 }} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create docket modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Transaction Docket</DialogTitle>
            <DialogDescription>Select the sites you want to compare and enter the client details. Level 1 cells will be auto-filled from listing data.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Docket title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Warehouse proposal for Meridian Logistics" className="mt-1 h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Client name <span className="text-destructive">*</span></Label>
                  <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Contact person name" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Client company</Label>
                  <Input value={form.clientCompany} onChange={e => setForm(f => ({ ...f, clientCompany: e.target.value }))} placeholder="Company name" className="mt-1 h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Client email</Label>
                  <Input type="email" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="client@company.com" className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Link to demand (optional)</Label>
                  <select value={form.demandId} onChange={e => setForm(f => ({ ...f, demandId: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {demands.map(d => <option key={d.demandId} value={d.demandId}>#{d.demandId} · {d.companyName} · {d.location}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Select sites to compare <span className="text-destructive">*</span> <span style={{ color: 'hsl(259 15% 60%)' }}>(max 10)</span></Label>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
                  <Input placeholder="Search sites..." value={siteSearch} onChange={e => setSiteSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
                </div>
                <div style={{ marginTop: 6, border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
                  {sitesLoading ? (
                    <p style={{ padding: 10, fontSize: 12, color: 'hsl(259 15% 60%)' }}>Loading sites...</p>
                  ) : filteredSites.length === 0 ? (
                    <p style={{ padding: 10, fontSize: 12, color: 'hsl(259 15% 60%)' }}>No sites found.</p>
                  ) : filteredSites.map(s => (
                    <label key={s.listingId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)', cursor: 'pointer' }}>
                      <Checkbox checked={selectedSiteIds.includes(s.listingId)} onCheckedChange={() => toggleSite(s.listingId)} />
                      <div>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 11 }}>{s.listingId}</span>
                        <span style={{ color: 'hsl(259 15% 55%)', marginLeft: 6 }}>{s.location} · {s.sizeSqFt?.toLocaleString()} sft</span>
                        {s.status === 'sourced' && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#FAEEDA', color: '#854F0B' }}>Sourced</span>}
                      </div>
                    </label>
                  ))}
                </div>
                {selectedSiteIds.length > 0 && (
                  <p style={{ fontSize: 11, color: '#6141ac', marginTop: 6 }}>{selectedSiteIds.length} site{selectedSiteIds.length !== 1 ? 's' : ''} selected</p>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!canCreate || creating} style={{ background: '#6141ac' }}>
              {creating ? 'Creating...' : 'Create docket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
