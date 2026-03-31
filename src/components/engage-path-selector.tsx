'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';

type EngagePath = 'direct' | 'orsone' | 'agent';
type Props = { leadId: string; currentPath?: EngagePath | null; onPathSelected?: (path: EngagePath) => void; };

const PATHS = [
  { id: 'direct' as EngagePath, icon: Building2, title: 'Connect Directly with Developer', desc: 'Engage and negotiate directly with the property developer on the platform. All communication stays within ORS-ONE.', badge: null, color: '' },
  { id: 'orsone' as EngagePath, icon: Users, title: 'ORS-ONE as Transaction Partner', desc: 'Let ORS-ONE facilitate the entire transaction. Our team manages negotiations, documentation and deal closure on your behalf.', badge: '3PL & Logistics: Zero Brokerage', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'agent' as EngagePath, icon: UserPlus, title: 'Engage Your Own Agent', desc: 'Invite your trusted agent to represent you on the platform. Your agent will receive an email invitation to join and assist with this transaction.', badge: null, color: '' },
];

export function EngagePathSelector({ leadId, currentPath, onPathSelected }: Props) {
  const { updateRegisteredLead, registeredLeads } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<EngagePath | null>(currentPath || null);
  const [agentEmail, setAgentEmail] = React.useState('');
  const [agentName, setAgentName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(!!currentPath);
  const lead = registeredLeads.find(l => l.id === leadId);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'AGT-' + Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleConfirm = async () => {
    if (!selected || !lead) return;
    setSubmitting(true);
    try {
      if (selected === 'agent') {
        if (!agentEmail || !agentName) {
          toast({ variant: 'destructive', title: 'Agent Details Required', description: 'Please enter your agent name and email.' });
          setSubmitting(false);
          return;
        }
        const inviteCode = generateInviteCode();
        const expiry = Date.now() + (3 * 24 * 60 * 60 * 1000);
        updateRegisteredLead({ ...lead, engagePath: selected, agentInviteCode: inviteCode, agentInviteEmail: agentEmail, agentInviteExpiry: expiry });
        await fetch('/api/send-agent-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentEmail, agentName, inviteCode, customerName: user?.userName, leadId, expiry }),
        }).catch(() => {});
        toast({ title: 'Agent Invited!', description: agentName + ' will receive an invitation. Code: ' + inviteCode + ' (valid 3 days)' });
      } else {
        updateRegisteredLead({ ...lead, engagePath: selected });
        if (selected === 'orsone') {
          try {
            const notifRes = await fetch('/api/notifications');
            const notifData = await notifRes.json();
            const existing = Array.isArray(notifData) ? notifData : Object.values(notifData);
            const newNotif = {
              id: 'notif-' + Date.now(),
              type: 'new_activity',
              title: 'ORS-ONE Transaction Partner Request',
              message: (user?.companyName || user?.userName || 'A customer') + ' has selected ORS-ONE as Official Transaction Partner for lead ' + leadId + '. Please follow up.',
              href: '/dashboard/transactions',
              timestamp: new Date().toISOString(),
              recipientEmail: 'balaji@lakshmibalajio2o.com',
              triggeredBy: user?.email || 'customer',
              isRead: false,
            };
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify([...existing, newNotif]),
            });
          } catch(e) { console.error('Notification error:', e); }
        }
        toast({ title: 'Engagement Path Selected', description: 'Your preference has been saved.' });
      }
      setConfirmed(true);
      if (onPathSelected) onPathSelected(selected);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  if (confirmed && selected) {
    const path = PATHS.find(p => p.id === selected);
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-green-800 text-sm">Engagement Path Confirmed</p>
          <p className="text-green-700 text-xs mt-0.5">{path?.title}</p>
          {lead?.agentInviteCode && <p className="text-green-700 text-xs mt-1">Agent Invite Code: <span className="font-mono font-bold">{lead.agentInviteCode}</span> · Valid 3 days</p>}
        </div>
        <button onClick={() => setConfirmed(false)} className="text-xs text-green-600 hover:underline flex-shrink-0">Change</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-foreground mb-1">How would you like to proceed with this transaction?</p>
        <p className="text-xs text-muted-foreground">Choose your preferred engagement path. You can change this later.</p>
      </div>
      <div className="space-y-3">
        {PATHS.map(path => {
          const Icon = path.icon;
          const isSelected = selected === path.id;
          return (
            <button key={path.id} onClick={() => setSelected(path.id)}
              className={"w-full text-left p-4 rounded-2xl border-2 transition-all " + (isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30')}>
              <div className="flex items-start gap-3">
                <div className={"h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 " + (isSelected ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={"text-sm font-bold " + (isSelected ? 'text-primary' : 'text-foreground')}>{path.title}</p>
                    {path.badge && <Badge variant="outline" className={"text-xs " + path.color}>{path.badge}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{path.desc}</p>
                </div>
                {isSelected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
              </div>
              {isSelected && path.id === 'agent' && (
                <div className="mt-4 space-y-2 pl-12" onClick={e => e.stopPropagation()}>
                  <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Agent full name" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" />
                  <input value={agentEmail} onChange={e => setAgentEmail(e.target.value)} placeholder="Agent email address" type="email" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <Button onClick={handleConfirm} disabled={submitting} className="w-full rounded-xl">
          {submitting ? 'Saving...' : 'Confirm & Proceed'}
        </Button>
      )}
    </div>
  );
}