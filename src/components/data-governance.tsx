'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Building2, RefreshCw, UserX, Tag, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Op = 'transfer-listings' | 'transfer-leads' | 'merge-accounts' | 'deactivate-reassign' | 'company-rebrand';

const OPS: { id: Op; icon: React.ElementType; title: string; desc: string; color: string }[] = [
  { id: 'transfer-listings', icon: Building2, title: 'Transfer Listings', desc: 'Move all listings from one developer to another', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'transfer-leads', icon: Users, title: 'Transfer Leads', desc: 'Move active leads and negotiations between accounts', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'merge-accounts', icon: RefreshCw, title: 'Merge Accounts', desc: 'Combine duplicate accounts into one', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'deactivate-reassign', icon: UserX, title: 'Deactivate & Reassign', desc: 'Deactivate a user and move their assets to another', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'company-rebrand', icon: Tag, title: 'Company Rebrand', desc: 'Update company name across all listings and leads', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export function DataGovernance() {
  const { users } = useAuth();
  const { listings, registeredLeads } = useData();
  const { toast } = useToast();
  const [activeOp, setActiveOp] = React.useState<Op | null>(null);
  React.useEffect(() => { reset(); }, [activeOp]);
  const [fromUser, setFromUser] = React.useState('');
  const [toUser, setToUser] = React.useState('');
  const [newCompanyName, setNewCompanyName] = React.useState('');
  const [preview, setPreview] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);

  const allUsers = React.useMemo(() => Object.values(users || {}), [users]);
  const developers = allUsers.filter(u => u.role === 'Warehouse Developer');

  const fromUserData = allUsers.find(u => u.email === fromUser);
  const toUserData = allUsers.find(u => u.email === toUser);

  const generatePreview = () => {
    if (!fromUser) return;
    setIsDone(false);

    if (activeOp === 'transfer-listings' || activeOp === 'merge-accounts' || activeOp === 'deactivate-reassign') {
      const affected = listings.filter(l => l.developerId === fromUser);
      setPreview(affected.map(l => ({ id: l.listingId, label: l.listingId + ' — ' + l.location, type: 'listing' })));
    } else if (activeOp === 'transfer-leads') {
      const affected = registeredLeads.filter(l =>
        l.properties?.some((p: any) => listings.find(x => x.listingId === p.listingId && x.developerId === fromUser))
      );
      setPreview(affected.map(l => ({ id: l.id, label: l.requirementsSummary || l.id, type: 'lead' })));
    } else if (activeOp === 'company-rebrand') {
      const affected = listings.filter(l => l.developerId === fromUser);
      const leads = registeredLeads.filter(l =>
        l.properties?.some((p: any) => listings.find(x => x.listingId === p.listingId && x.developerId === fromUser))
      );
      setPreview([
        ...affected.map(l => ({ id: l.listingId, label: l.listingId + ' — listing', type: 'listing' })),
        ...leads.map(l => ({ id: l.id, label: l.id + ' — lead', type: 'lead' })),
      ]);
    }
  };

  const execute = async () => {
    if (!fromUser || preview.length === 0) return;
    if ((activeOp !== 'company-rebrand') && !toUser && activeOp !== 'deactivate-reassign') return;
    setIsLoading(true);
    try {
      if (activeOp === 'transfer-listings' || activeOp === 'merge-accounts') {
        await Promise.all(preview.map(item => {
          const listing = listings.find(l => l.listingId === item.id);
          return fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...listing, developerId: toUser }),
          });
        }));
        toast({ title: 'Done!', description: preview.length + ' listings transferred to ' + toUserData?.userName });
      } else if (activeOp === 'deactivate-reassign') {
        await Promise.all(preview.map(item => {
          const listing = listings.find(l => l.listingId === item.id);
          return fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...listing, developerId: toUser }),
          });
        }));
        // Also update user status via API
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(
          Object.values(users).map(u => u.email === fromUser ? { ...u, status: 'deactivated' } : u)
        )});
        toast({ title: 'Done!', description: fromUserData?.userName + ' deactivated. ' + preview.length + ' listings reassigned.' });
      } else if (activeOp === 'company-rebrand') {
        const listingItems = preview.filter(p => p.type === 'listing');
        await Promise.all(listingItems.map(item => {
          const listing = listings.find(l => l.listingId === item.id);
          return fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...listing, developerName: newCompanyName }),
          });
        }));
        // Update user company name
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(
          Object.values(users).map(u => u.email === fromUser ? { ...u, companyName: newCompanyName } : u)
        )});
        toast({ title: 'Done!', description: 'Company rebranded to ' + newCompanyName + ' across ' + listingItems.length + ' listings.' });
      } else if (activeOp === 'transfer-leads') {
        toast({ title: 'Note', description: 'Lead transfer requires manual reassignment in the leads section. ' + preview.length + ' leads identified.' });
      }
      setIsDone(true);
      setPreview([]);
      setFromUser(''); setToUser(''); setNewCompanyName('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally { setIsLoading(false); }
  };

  const reset = () => { setPreview([]); setFromUser(''); setToUser(''); setNewCompanyName(''); setIsDone(false); };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-foreground">Data Governance</h3>
        <p className="text-sm text-muted-foreground mt-1">Manage account migrations, transfers and company rebranding.</p>
      </div>

      {/* Operation selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPS.map(op => (
          <button key={op.id} onClick={() => { setActiveOp(op.id); reset(); }}
            className={cn('flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md',
              activeOp === op.id ? op.color + ' shadow-md' : 'bg-card border-border hover:border-primary/30'
            )}>
            <op.icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${activeOp === op.id ? '' : 'text-primary'}`} />
            <div>
              <p className="font-bold text-sm">{op.title}</p>
              <p className={`text-xs mt-0.5 ${activeOp === op.id ? 'opacity-80' : 'text-muted-foreground'}`}>{op.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Operation form */}
      {activeOp && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              {React.createElement(OPS.find(o => o.id === activeOp)!.icon, { className: 'h-4 w-4 text-primary' })}
            </div>
            <h4 className="font-bold text-foreground">{OPS.find(o => o.id === activeOp)!.title}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From user */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {activeOp === 'company-rebrand' ? 'Select User / Company' : 'From Account'}
              </label>
              <Select value={fromUser} onValueChange={v => { setFromUser(v); setPreview([]); setIsDone(false); }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select user..." /></SelectTrigger>
                <SelectContent>
                  {allUsers.filter(u => u.role === 'Warehouse Developer' || u.role === 'User').map(u => (
                    <SelectItem key={u.email} value={u.email}>{u.userName} — {u.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromUserData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs">{fromUserData.role === 'Warehouse Developer' ? 'Provider' : fromUserData.role}</Badge>
                  <span>{listings.filter(l => l.developerId === fromUser).length} listings</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', fromUserData.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>{fromUserData.status}</span>
                </div>
              )}
            </div>

            {/* To user or new name */}
            {activeOp === 'company-rebrand' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Company Name</label>
                <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="Enter new company name..." className="rounded-xl" />
              </div>
            ) : activeOp !== 'deactivate-reassign' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To Account</label>
                <Select value={toUser} onValueChange={v => { setToUser(v); setPreview([]); setIsDone(false); }}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select target user..." /></SelectTrigger>
                  <SelectContent>
                    {allUsers.filter(u => u.email !== fromUser && (u.role === 'Warehouse Developer' || u.role === 'User')).map(u => (
                      <SelectItem key={u.email} value={u.email}>{u.userName} — {u.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {toUserData && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs">{toUserData.role === 'Warehouse Developer' ? 'Provider' : toUserData.role}</Badge>
                    <span>{listings.filter(l => l.developerId === toUser).length} existing listings</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reassign Assets To (Optional)</label>
                <Select value={toUser} onValueChange={setToUser}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select user to receive assets..." /></SelectTrigger>
                  <SelectContent>
                    {allUsers.filter(u => u.email !== fromUser && u.role === 'Warehouse Developer').map(u => (
                      <SelectItem key={u.email} value={u.email}>{u.userName} — {u.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Preview button */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={generatePreview} disabled={!fromUser || (activeOp === 'company-rebrand' && !newCompanyName)} className="rounded-xl gap-2">
              Preview Changes
            </Button>
            {preview.length > 0 && (
              <Button onClick={execute} disabled={isLoading || (activeOp !== 'company-rebrand' && activeOp !== 'deactivate-reassign' && !toUser)} className="rounded-xl gap-2 bg-primary text-white">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Executing...</> : <><CheckCircle className="h-4 w-4" /> Execute ({preview.length} items)</>}
              </Button>
            )}
          </div>

          {/* Preview list */}
          {preview.length > 0 && (
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{preview.length} items will be affected:</p>
              {preview.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground truncate">{item.label}</span>
                  <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">{item.type}</Badge>
                </div>
              ))}
            </div>
          )}

          {isDone && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold">
              <CheckCircle className="h-4 w-4" /> Operation completed successfully!
            </div>
          )}

          {/* Warning */}
          {activeOp === 'merge-accounts' && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Merging accounts will transfer all listings to the target account. The source account will remain active — deactivate it manually after merging.</span>
            </div>
          )}
          {activeOp === 'deactivate-reassign' && (
            <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>This will deactivate the account and prevent the user from logging in. This action can be reversed by an admin.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
