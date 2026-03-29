'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, RefreshCw, UserX, Tag, AlertCircle, CheckCircle, Loader2, Copy, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type Op = 'transfer-listings' | 'transfer-leads' | 'merge-accounts' | 'deactivate-reassign' | 'company-rebrand';
type ItemAction = 'keep' | 'archive' | 'delete';

const OPS = [
  { id: 'transfer-listings' as Op, icon: Building2, title: 'Transfer Listings', desc: 'Copy listings from one developer to another' },
  { id: 'transfer-leads' as Op, icon: Users, title: 'Transfer Leads', desc: 'Move active leads between accounts' },
  { id: 'merge-accounts' as Op, icon: RefreshCw, title: 'Merge Accounts', desc: 'Combine duplicate accounts into one' },
  { id: 'deactivate-reassign' as Op, icon: UserX, title: 'Deactivate & Reassign', desc: 'Deactivate a user and reassign their assets' },
  { id: 'company-rebrand' as Op, icon: Tag, title: 'Company Rebrand', desc: 'Update company name across all listings and leads' },
];

export function DataGovernance() {
  const { users } = useAuth();
  const { listings, registeredLeads } = useData();
  const { toast } = useToast();
  const [activeOp, setActiveOp] = React.useState<Op | null>(null);
  const [fromUser, setFromUser] = React.useState('');
  const [toUser, setToUser] = React.useState('');
  const [newCompanyName, setNewCompanyName] = React.useState('');
  const [preview, setPreview] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [phase, setPhase] = React.useState<'setup'|'preview'|'copied'|'done'>('setup');
  const [itemActions, setItemActions] = React.useState<Record<string, ItemAction>>({});
  const [completedItems, setCompletedItems] = React.useState<Record<string, boolean>>({});

  const allUsers = React.useMemo(() => Object.values(users || {}), [users]);
  const fromUserData = allUsers.find(u => u.email === fromUser);
  const toUserData = allUsers.find(u => u.email === toUser);

  const reset = React.useCallback(() => {
    setPreview([]); setFromUser(''); setToUser(''); setNewCompanyName('');
    setPhase('setup'); setItemActions({}); setCompletedItems({});
  }, []);

  React.useEffect(() => { reset(); }, [activeOp]);

  const generatePreview = () => {
    let items: any[] = [];
    if (activeOp === 'transfer-listings' || activeOp === 'merge-accounts' || activeOp === 'deactivate-reassign') {
      items = listings.filter(l => l.developerId === fromUser).map(l => ({
        id: l.listingId, label: l.listingId,
        sublabel: l.location + ' · ' + (l.sizeSqFt?.toLocaleString() || 0) + ' sqft',
        type: 'listing', data: l,
      }));
    } else if (activeOp === 'transfer-leads') {
      items = registeredLeads.filter(l =>
        l.properties?.some((p: any) => listings.find(x => x.listingId === p.listingId && x.developerId === fromUser))
      ).map(l => ({ id: l.id, label: l.id, sublabel: l.requirementsSummary || '', type: 'lead', data: l }));
    } else if (activeOp === 'company-rebrand') {
      items = listings.filter(l => l.developerId === fromUser).map(l => ({
        id: l.listingId, label: l.listingId, sublabel: l.location, type: 'listing', data: l,
      }));
    }
    const actions: Record<string, ItemAction> = {};
    items.forEach(i => { actions[i.id] = 'keep'; });
    setItemActions(actions);
    setPreview(items);
    setPhase('preview');
  };

  const setAllActions = (action: ItemAction) => {
    const a: Record<string, ItemAction> = {};
    preview.forEach(i => { a[i.id] = action; });
    setItemActions(a);
  };

  const patchListing = (listingId: string, updates: any) =>
    fetch('/api/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, updates }),
    });

  const executeCopy = async () => {
    setIsLoading(true);
    try {
      if (activeOp === 'company-rebrand') {
        await Promise.all(preview.map(item => patchListing(item.id, { developerName: newCompanyName })));
        const updatedUsers = Object.values(users).map(u => u.email === fromUser ? { ...u, companyName: newCompanyName } : u);
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedUsers) });
        toast({ title: 'Rebranded!', description: preview.length + ' listings updated to ' + newCompanyName });
        setPhase('done');
        return;
      }
      await Promise.all(preview.map(item => patchListing(item.id, { _copiedTo: toUser, _copyStatus: 'pending' })));
      // Create copies under new account
      await Promise.all(preview.map(item => {
        const newListing = { ...item.data, developerId: toUser, listingId: item.id + '-T', status: 'pending', _copiedFrom: item.id };
        return patchListing(item.id + '-T', newListing);
      }));
      toast({ title: preview.length + ' listings copied!', description: 'Now decide what to do with the originals.' });
      setPhase('copied');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally { setIsLoading(false); }
  };

  const executeOriginalActions = async () => {
    setIsLoading(true);
    try {
      await Promise.all(preview.map(async item => {
        const action = itemActions[item.id];
        if (action === 'archive') await patchListing(item.id, { status: 'leased', archivedReason: 'Transferred to ' + toUserData?.companyName });
        else if (action === 'delete') await patchListing(item.id, { status: 'rejected', deletedReason: 'Transferred to ' + toUserData?.companyName });
        setCompletedItems(prev => ({ ...prev, [item.id]: true }));
      }));
      if (activeOp === 'deactivate-reassign') {
        const updatedUsers = Object.values(users).map(u => u.email === fromUser ? { ...u, status: 'deactivated' } : u);
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedUsers) });
      }
      toast({ title: 'All done!', description: 'Transfer completed successfully.' });
      setPhase('done');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-foreground">Data Governance</h3>
        <p className="text-sm text-muted-foreground mt-1">Safely migrate, transfer and rebrand accounts with full control.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPS.map(op => (
          <button key={op.id} onClick={() => setActiveOp(op.id)}
            className={cn('flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md',
              activeOp === op.id ? 'bg-primary/5 border-primary/30 shadow-md' : 'bg-card border-border hover:border-primary/20')}>
            <op.icon className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
            <div>
              <p className={cn('font-bold text-sm', activeOp === op.id ? 'text-primary' : 'text-foreground')}>{op.title}</p>
              <p className="text-xs mt-0.5 text-muted-foreground">{op.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {activeOp && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-2">
            {React.createElement(OPS.find(o => o.id === activeOp)!.icon, { className: 'h-5 w-5 text-primary' })}
            <h4 className="font-bold text-foreground">{OPS.find(o => o.id === activeOp)!.title}</h4>
            {phase !== 'setup' && <button onClick={reset} className="ml-auto text-xs text-muted-foreground hover:text-primary">← Start over</button>}
          </div>

          {phase === 'setup' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">From Account</label>
                  <Select value={fromUser} onValueChange={v => { setFromUser(v); setPreview([]); }}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select user..." /></SelectTrigger>
                    <SelectContent>
                      {allUsers.filter(u => u.role === 'Warehouse Developer' || u.role === 'User').map(u => (
                        <SelectItem key={u.email} value={u.email}>{u.userName} — {u.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromUserData && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{fromUserData.role === 'Warehouse Developer' ? 'Provider' : fromUserData.role}</Badge>
                      <span>{listings.filter(l => l.developerId === fromUser).length} listings</span>
                      <span className={cn('px-1.5 py-0.5 rounded font-medium', fromUserData.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>{fromUserData.status}</span>
                    </div>
                  )}
                </div>
                {activeOp === 'company-rebrand' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Company Name</label>
                    <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="Enter new company name..." className="rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To Account</label>
                    <Select value={toUser} onValueChange={setToUser}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select target user..." /></SelectTrigger>
                      <SelectContent>
                        {allUsers.filter(u => u.email !== fromUser && (u.role === 'Warehouse Developer' || u.role === 'User')).map(u => (
                          <SelectItem key={u.email} value={u.email}>{u.userName} — {u.companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {toUserData && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{toUserData.role === 'Warehouse Developer' ? 'Provider' : toUserData.role}</Badge>
                        <span>{listings.filter(l => l.developerId === toUser).length} existing listings</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {activeOp === 'deactivate-reassign' && (
                <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>This will deactivate the source account after transfer. The user will no longer be able to log in.</span>
                </div>
              )}
              <Button onClick={generatePreview}
                disabled={!fromUser || (activeOp !== 'company-rebrand' && !toUser) || (activeOp === 'company-rebrand' && !newCompanyName)}
                className="rounded-xl gap-2">
                Preview Changes →
              </Button>
            </div>
          )}

          {phase === 'preview' && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm font-bold text-foreground">
                  {activeOp === 'company-rebrand'
                    ? preview.length + ' listings will be rebranded to "' + newCompanyName + '"'
                    : preview.length + ' listings will be copied: ' + fromUserData?.companyName + ' → ' + toUserData?.companyName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeOp === 'company-rebrand'
                    ? 'Company name will be updated on all listings and the user account.'
                    : 'Originals stay intact. After copying you decide: Keep, Archive or Delete each original.'}
                </p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No items found for this account.</p>}
                {preview.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                ))}
              </div>
              {preview.length > 0 && (
                <div className="flex gap-3">
                  <Button onClick={executeCopy} disabled={isLoading} className="rounded-xl gap-2">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Copy className="h-4 w-4" /> {activeOp === 'company-rebrand' ? 'Apply Rebrand' : 'Copy ' + preview.length + ' Items'}</>}
                  </Button>
                  <Button variant="outline" onClick={reset} className="rounded-xl">Cancel</Button>
                </div>
              )}
            </div>
          )}

          {phase === 'copied' && (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-bold text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Copied to {toUserData?.companyName} successfully!</p>
                <p className="text-xs text-green-600 mt-1">Now decide what to do with each original:</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground">Apply to all:</span>
                {(['keep','archive','delete'] as ItemAction[]).map(a => (
                  <button key={a} onClick={() => setAllActions(a)}
                    className={cn('text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors capitalize',
                      a === 'keep' ? 'bg-secondary border-border hover:border-primary/30' :
                      a === 'archive' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                      'bg-red-50 text-red-700 border-red-200 hover:bg-red-100')}>
                    {a} All
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {preview.map((item, i) => (
                  <div key={item.id} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all',
                    completedItems[item.id] ? 'bg-green-50 border-green-200' : 'bg-card border-border')}>
                    {completedItems[item.id]
                      ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      : <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">{i+1}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                    </div>
                    {!completedItems[item.id] && (
                      <div className="flex gap-1">
                        {(['keep','archive','delete'] as ItemAction[]).map(a => (
                          <button key={a} onClick={() => setItemActions(prev => ({ ...prev, [item.id]: a }))}
                            className={cn('text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors capitalize',
                              itemActions[item.id] === a
                                ? a === 'keep' ? 'bg-primary text-white border-primary'
                                  : a === 'archive' ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-red-500 text-white border-red-500'
                                : 'bg-card border-border hover:border-primary/30')}>
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground flex-1">
                  {Object.values(itemActions).filter(a => a === 'keep').length} keep ·
                  {Object.values(itemActions).filter(a => a === 'archive').length} archive ·
                  {Object.values(itemActions).filter(a => a === 'delete').length} delete
                </p>
                <Button onClick={executeOriginalActions} disabled={isLoading} className="rounded-xl gap-2">
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><CheckSquare className="h-4 w-4" /> Confirm Actions</>}
                </Button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <p className="font-bold text-green-700 text-lg">Operation Completed!</p>
                <p className="text-sm text-green-600 mt-1">All changes saved successfully.</p>
              </div>
              <Button onClick={reset} variant="outline" className="w-full rounded-xl">Start Another Operation</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}