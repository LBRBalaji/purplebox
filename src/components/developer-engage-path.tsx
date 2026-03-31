'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake, DollarSign, CheckCircle, ArrowRight, FileText } from 'lucide-react';

type DevPath = 'independent' | 'orsone-partner';

type Props = {
  leadId: string;
  currentPath?: DevPath | null;
};

export function DeveloperEngagePath({ leadId, currentPath }: Props) {
  const { updateRegisteredLead, registeredLeads } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<DevPath | null>(currentPath || null);
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(!!currentPath);
  const lead = registeredLeads.find(l => l.id === leadId);

  const FREE_TRANSACTION_LIMIT = 3;
  const usedTransactions = React.useMemo(() => {
    return registeredLeads.filter(l =>
      l.providers.some(p => p.providerEmail === user?.email) &&
      l.developerEngagePath !== null &&
      l.developerEngagePath !== undefined &&
      l.id !== leadId
    ).length;
  }, [registeredLeads, user, leadId]);

  const isLimitReached = usedTransactions >= FREE_TRANSACTION_LIMIT;
  const remaining = Math.max(0, FREE_TRANSACTION_LIMIT - usedTransactions);

  const PATHS = [
    {
      id: 'independent' as DevPath,
      icon: DollarSign,
      title: 'Path 1 — Pay Platform Fee & Proceed Independently',
      desc: 'Pay the prescribed platform fee and manage the Engage & Transact stages independently. You retain full control of the deal while using ORS-ONE tools — Negotiation Board, Tenant Improvements and more.',
      badge: 'Fee Applicable',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      tcNote: 'By choosing this path, you agree to pay the applicable platform fee before proceeding. The fee will be communicated by ORS-ONE team.',
    },
    {
      id: 'orsone-partner' as DevPath,
      icon: Handshake,
      title: 'Path 2 — ORS-ONE as Official Transaction Partner',
      desc: 'No upfront fee. ORS-ONE facilitates the entire Engage & Transact process on your behalf — negotiations, documentation, and deal closure. Industry standard brokerage applies on successful deal closure.',
      badge: 'No Upfront Fee',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      tcNote: 'By choosing this path, you agree to pay ORS-ONE the industry standard brokerage fee upon successful deal closure. This applies regardless of whether the customer has their own agent.',
    },
  ];

  const handleConfirm = async () => {
    if (!selected || !lead) return;
    if (selected === 'orsone-partner' && !agreed) {
      toast({ variant: 'destructive', title: 'Agreement Required', description: 'Please agree to the Terms & Conditions to proceed.' });
      return;
    }
    setSubmitting(true);
    try {
      updateRegisteredLead({ ...lead, developerEngagePath: selected });
      // Notify SuperAdmin
      try {
        const notifRes = await fetch('/api/notifications');
        const notifData = await notifRes.json();
        const existing = Array.isArray(notifData) ? notifData : Object.values(notifData);
        const newNotif = {
          id: 'notif-' + Date.now(),
          type: 'new_activity',
          title: selected === 'orsone-partner' ? 'Developer chose ORS-ONE as Transaction Partner' : 'Developer chose Independent Path',
          message: (user?.companyName || user?.email) + ' selected ' + (selected === 'orsone-partner' ? 'ORS-ONE as Official Transaction Partner' : 'Independent Path (Platform Fee)') + ' for lead ' + leadId,
          href: '/dashboard/transactions',
          timestamp: new Date().toISOString(),
          recipientEmail: 'balaji@lakshmibalajio2o.com',
          triggeredBy: user?.email || 'developer',
          isRead: false,
        };
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([...existing, newNotif]),
        });
      } catch(e) { console.error('Notification error:', e); }
      setConfirmed(true);
      toast({ title: 'Path Selected', description: 'Your engagement path has been confirmed. ORS-ONE team has been notified.' });
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
          <p className="text-green-600 text-xs mt-1">ORS-ONE team has been notified and will follow up shortly.</p>
        </div>
        <button onClick={() => setConfirmed(false)} className="text-xs text-green-600 hover:underline flex-shrink-0">Change</button>
      </div>
    );
  }

  if (isLimitReached && !currentPath) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">You've used your 3 free Engage & Transact transactions</p>
          <p className="text-xs text-muted-foreground mt-1">You have experienced ORS-ONE's full transaction capability. To continue with more transactions, please contact our team to activate your plan.</p>
        </div>
        <a href="https://wa.me/919841098170?text=I%20would%20like%20to%20activate%20my%20ORS-ONE%20transaction%20plan" target="_blank"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          Talk to Our Team
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div>
        <p className="text-sm font-bold text-foreground mb-1">Stage 2 & 3 — Choose Your Engagement Path</p>
        <p className="text-xs text-muted-foreground">You have successfully connected with this prospect. Now choose how you would like to proceed with the Engage and Transact stages.</p>
        {!currentPath && remaining <= 3 && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
            You have <strong>{remaining} free transaction{remaining !== 1 ? 's' : ''}</strong> remaining. Experience ORS-ONE's full capability — upgrade when you're ready.
          </div>
        )}
      </div>
      <div className="space-y-3">
        {PATHS.map(path => {
          const Icon = path.icon;
          const isSelected = selected === path.id;
          return (
            <button key={path.id} onClick={() => { setSelected(path.id); setAgreed(false); }}
              className={"w-full text-left p-4 rounded-2xl border-2 transition-all " + (isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30')}>
              <div className="flex items-start gap-3">
                <div className={"h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 " + (isSelected ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={"text-sm font-bold " + (isSelected ? 'text-primary' : 'text-foreground')}>{path.title}</p>
                    <Badge variant="outline" className={"text-xs " + path.badgeColor}>{path.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{path.desc}</p>
                </div>
                {isSelected && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
              </div>
              {isSelected && (
                <div className="mt-3 pl-12">
                  <div className="bg-secondary/50 rounded-xl p-3 flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{path.tcNote}</p>
                  </div>
                  {path.id === 'orsone-partner' && (
                    <label className="flex items-center gap-2 mt-3 cursor-pointer" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="h-4 w-4 accent-primary" />
                      <span className="text-xs text-foreground">I agree to pay ORS-ONE the industry standard brokerage fee upon successful deal closure.</span>
                    </label>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <Button onClick={handleConfirm} disabled={submitting} className="w-full rounded-xl">
          {submitting ? 'Confirming...' : <><ArrowRight className="mr-2 h-4 w-4" /> Confirm Path & Notify ORS-ONE</>}
        </Button>
      )}
    </div>
  );
}