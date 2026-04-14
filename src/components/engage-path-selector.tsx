'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Building2, UserPlus, CheckCircle, ChevronDown, Handshake } from 'lucide-react';

const ORS_ADMIN = 'balaji@lakshmibalajio2o.com';

type TransactionMode = 'direct' | 'ors-tp' | 'agent';
type Props = {
  leadId: string;
  onPathSelected?: (mode: TransactionMode) => void;
};

export function EngagePathSelector({ leadId, onPathSelected }: Props) {
  const { registeredLeads, updateRegisteredLead, addTransactionActivity } = useData();
  const { user, users } = useAuth();
  const { toast } = useToast();
  const lead = registeredLeads.find(l => l.id === leadId);

  const [mode, setMode] = React.useState<TransactionMode | null>(null);
  const [tpChoice, setTpChoice] = React.useState<'ors' | 'agent'>('ors');
  const [agentName, setAgentName] = React.useState('');
  const [agentEmail, setAgentEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(!!(lead as any)?.transactionMode);

  // Already set
  if (confirmed && (lead as any)?.transactionMode) {
    const m = (lead as any).transactionMode as TransactionMode;
    const broker = (lead as any).brokerName;
    return (
      <div className="flex items-center gap-3 px-4 py-3" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
        <CheckCircle className="h-4 w-4 flex-shrink-0" style={{color:'#6141ac'}} />
        <div className="flex-1">
          <p className="text-xs font-bold" style={{color:'#1e1537'}}>
            {m === 'direct' ? 'Direct Engagement — ORS-ONE Transaction Partner' :
             m === 'ors-tp' ? 'ORS-ONE as Transaction Partner' :
             `Agent Represented — ${broker}`}
          </p>
          <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
            {m === 'agent' ? 'Your agent will represent you. Brokerage payable by developer to your agent.' :
             'ORS-ONE facilitates this transaction. No cost to you.'}
          </p>
        </div>
        <button onClick={() => setConfirmed(false)}
          className="text-xs font-semibold px-3 py-1.5" style={{color:'#6141ac',borderRadius:0,border:'1px solid hsl(259 44% 82%)'}}>
          Change
        </button>
      </div>
    );
  }

  const generateInviteCode = () =>
    'AGT-' + Array.from({length: 6}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

  const handleConfirm = async () => {
    if (!mode || !lead) return;
    if (mode === 'agent' && tpChoice === 'agent' && (!agentName || !agentEmail)) {
      toast({ variant: 'destructive', title: 'Agent details required', description: 'Please enter your agent\'s name and email.' });
      return;
    }
    setSubmitting(true);
    try {
      const finalMode: TransactionMode = mode === 'direct' ? 'direct' : tpChoice === 'ors' ? 'ors-tp' : 'agent';
      const brokerEmail = finalMode === 'agent' ? agentEmail : ORS_ADMIN;
      const brokerName = finalMode === 'agent' ? agentName : 'ORS-ONE';

      const updatedLead = {
        ...lead,
        transactionMode: finalMode,
        brokerEmail,
        brokerName,
        isO2OCollaborator: finalMode !== 'agent',
        engagePath: finalMode === 'agent' ? 'agent' as const : 'orsone' as const,
        brokerAcknowledged: false,
      };
      updateRegisteredLead(updatedLead);

      // Log activity
      addTransactionActivity({
        leadId,
        activityType: 'Lead Acknowledged',
        details: {
          message: finalMode === 'direct'
            ? `${user?.companyName} chose direct engagement. ORS-ONE is Transaction Partner by default.`
            : finalMode === 'ors-tp'
            ? `${user?.companyName} appointed ORS-ONE as Transaction Partner.`
            : `${user?.companyName} appointed ${agentName} (${agentEmail}) as Transaction Agent.`,
        },
        createdBy: user?.email || '',
      });

      // Notify developer immediately
      const developerEmail = lead.providers[0]?.providerEmail;
      if (developerEmail && developerEmail !== ORS_ADMIN) {
        const devMsg = finalMode === 'agent'
          ? `${user?.companyName} has appointed ${agentName} as their Transaction Agent for deal ${leadId}. Brokerage is payable to ${agentName} (${agentEmail}) upon successful deal closure. ORS-ONE is not a commercial party in this transaction.`
          : `${user?.companyName} has confirmed ORS-ONE as Transaction Partner for deal ${leadId}. Brokerage is payable to ORS-ONE upon successful deal closure. Please acknowledge in your Transaction Workspace.`;

        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            id: `notif-tp-${leadId}-dev-${Date.now()}`,
            type: 'new_activity',
            title: finalMode === 'agent' ? `Agent Appointed: ${leadId}` : `Brokerage Acknowledgement Required: ${leadId}`,
            message: devMsg,
            href: `/dashboard/leads/${leadId}`,
            recipientEmail: developerEmail,
            timestamp: new Date().toISOString(),
            triggeredBy: user?.email || '',
            isRead: false,
          }]),
        }).catch(() => {});
      }

      // If agent — send invite
      if (finalMode === 'agent') {
        const inviteCode = generateInviteCode();
        const expiry = Date.now() + (3 * 24 * 60 * 60 * 1000);
        updateRegisteredLead({ ...updatedLead, agentInviteCode: inviteCode, agentInviteEmail: agentEmail, agentInviteExpiry: expiry });
        await fetch('/api/send-agent-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentEmail, agentName, inviteCode, customerName: user?.userName, leadId, expiry }),
        }).catch(() => {});
        toast({ title: 'Agent Invited', description: `${agentName} has been sent an invitation. Invite code: ${inviteCode} (valid 3 days)` });
      } else {
        toast({ title: 'Transaction Partner Confirmed', description: 'ORS-ONE will facilitate this transaction. No cost to you.' });
      }

      setConfirmed(true);
      if (onPathSelected) onPathSelected(finalMode);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-0" style={{border:'1px solid hsl(259 44% 82%)'}}>
      {/* Header */}
      <div className="px-4 py-3" style={{background:'hsl(259 44% 96%)'}}>
        <p className="text-sm font-bold" style={{color:'#1e1537'}}>How would you like to proceed with this transaction?</p>
        <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>Choose your engagement path. You can change this later.</p>
      </div>

      {/* Option 1 — Direct */}
      <button type="button" onClick={() => setMode('direct')}
        className="w-full flex items-start gap-3 px-4 py-4 text-left transition-all"
        style={{
          background: mode === 'direct' ? 'hsl(259 44% 96%)' : '#fff',
          borderTop: '1px solid hsl(259 30% 90%)',
          borderLeft: mode === 'direct' ? '3px solid #6141ac' : '3px solid transparent',
        }}>
        <div className="h-9 w-9 flex items-center justify-center flex-shrink-0"
          style={{background: mode === 'direct' ? '#6141ac' : 'hsl(259 30% 93%)'}}>
          <Building2 className="h-4 w-4" style={{color: mode === 'direct' ? '#fff' : '#888'}} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{color: mode === 'direct' ? '#1e1537' : '#555'}}>Proceed Directly</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{color:'hsl(259 15% 55%)'}}>
            Engage the developer directly on the platform. ORS-ONE will facilitate this transaction as Transaction Partner at no cost to you.
          </p>
          {mode === 'direct' && (
            <div className="mt-2 px-3 py-2 text-xs font-semibold" style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
              ORS-ONE will be Transaction Partner by default. No cost to you.
            </div>
          )}
        </div>
        {mode === 'direct' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{color:'#6141ac'}} />}
      </button>

      {/* Option 2 — Appoint TP */}
      <button type="button" onClick={() => setMode('agent')}
        className="w-full flex items-start gap-3 px-4 py-4 text-left transition-all"
        style={{
          background: mode === 'agent' ? 'hsl(259 44% 96%)' : '#fff',
          borderTop: '1px solid hsl(259 30% 90%)',
          borderLeft: mode === 'agent' ? '3px solid #6141ac' : '3px solid transparent',
        }}>
        <div className="h-9 w-9 flex items-center justify-center flex-shrink-0"
          style={{background: mode === 'agent' ? '#6141ac' : 'hsl(259 30% 93%)'}}>
          <Handshake className="h-4 w-4" style={{color: mode === 'agent' ? '#fff' : '#888'}} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{color: mode === 'agent' ? '#1e1537' : '#555'}}>Appoint a Transaction Partner</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{color:'hsl(259 15% 55%)'}}>
            Choose ORS-ONE or your own trusted agent/broker to represent you in this transaction.
          </p>

          {/* TP sub-options — shown when this option selected */}
          {mode === 'agent' && (
            <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
              {/* ORS-ONE — top, recommended */}
              <label className="flex items-start gap-3 p-3 cursor-pointer"
                style={{
                  background: tpChoice === 'ors' ? 'hsl(259 44% 92%)' : '#fff',
                  border: `1px solid ${tpChoice === 'ors' ? '#6141ac' : 'hsl(259 30% 88%)'}`,
                }}>
                <input type="radio" name="tpchoice" value="ors" checked={tpChoice === 'ors'}
                  onChange={() => setTpChoice('ors')} className="mt-0.5 accent-purple-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{color:'#1e1537'}}>ORS-ONE</p>
                    <span className="text-xs font-bold px-1.5 py-0.5" style={{background:'#6141ac',color:'#fff'}}>Recommended</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
                    ORS-ONE manages the full transaction on your behalf. Zero cost to you — brokerage is payable by the developer upon deal closure.
                  </p>
                </div>
              </label>

              {/* Own agent */}
              <label className="flex items-start gap-3 p-3 cursor-pointer"
                style={{
                  background: tpChoice === 'agent' ? 'hsl(259 44% 92%)' : '#fff',
                  border: `1px solid ${tpChoice === 'agent' ? '#6141ac' : 'hsl(259 30% 88%)'}`,
                }}>
                <input type="radio" name="tpchoice" value="agent" checked={tpChoice === 'agent'}
                  onChange={() => setTpChoice('agent')} className="mt-0.5 accent-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{color:'#1e1537'}}>My Own Agent / Broker</p>
                  <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
                    Your trusted agent/broker will represent you. Brokerage arrangements are between you and your agent.
                  </p>
                  {tpChoice === 'agent' && (
                    <div className="mt-2 space-y-2">
                      <input value={agentName} onChange={e => setAgentName(e.target.value)}
                        placeholder="Agent / Broker full name" onClick={e => e.stopPropagation()}
                        className="w-full px-3 py-2 text-sm" style={{border:'1px solid hsl(259 30% 85%)',borderRadius:0}} />
                      <input value={agentEmail} onChange={e => setAgentEmail(e.target.value)}
                        placeholder="Agent / Broker email address" type="email" onClick={e => e.stopPropagation()}
                        className="w-full px-3 py-2 text-sm" style={{border:'1px solid hsl(259 30% 85%)',borderRadius:0}} />
                      <p className="text-xs" style={{color:'hsl(259 15% 60%)'}}>
                        Your agent will receive an email invite to join ORS-ONE and access this transaction workspace.
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>
        {mode === 'agent' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{color:'#6141ac'}} />}
      </button>

      {/* Confirm button */}
      {mode && (
        <div className="px-4 py-3" style={{borderTop:'1px solid hsl(259 30% 90%)'}}>
          <button onClick={handleConfirm} disabled={submitting}
            className="w-full py-2.5 text-sm font-bold text-white transition-all"
            style={{background: submitting ? 'hsl(259 30% 70%)' : '#6141ac', borderRadius: 0}}>
            {submitting ? 'Saving...' : 'Confirm & Proceed'}
          </button>
        </div>
      )}
    </div>
  );
}
