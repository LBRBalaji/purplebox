'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X, CheckCircle, Clock, Eye } from 'lucide-react';
import type { RegisteredLead } from '@/contexts/data-context';

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2,'0')).join('');
}

const ROLE_SUGGESTIONS = [
  'Legal Counsel', 'Finance Team', 'Bank / Lender', 'Management',
  'Procurement', 'Operations Head', 'Director / Partner', 'Consultant', 'Other',
];

export function StakeholderInvite({ lead }: { lead: RegisteredLead }) {
  const { user } = useAuth();
  const { updateRegisteredLead } = useData();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleDesc, setRoleDesc] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const existingStakeholders = ((lead as any).invitees || [])
    .filter((i: any) => i.role === 'Stakeholder');

  const propertyBrief = lead.requirementsSummary || lead.id;

  const handleInvite = async () => {
    if (!name || !email || !roleDesc) {
      toast({ variant: 'destructive', title: 'All fields required', description: 'Please fill in name, email and role.' });
      return;
    }
    setSubmitting(true);
    try {
      const token = generateToken();
      const newInvitee = {
        name,
        email,
        role: 'Stakeholder' as const,
        roleDescription: roleDesc,
        token,
        invitedAt: new Date().toISOString(),
        invitedBy: user?.email,
        accessType: 'readonly' as const,
        registered: false,
      };

      const updatedLead = {
        ...lead,
        invitees: [...((lead as any).invitees || []), newInvitee],
      };
      updateRegisteredLead(updatedLead as any);

      const viewUrl = `${window.location.origin}/view/${token}`;

      await fetch('/api/send-stakeholder-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholderName: name,
          stakeholderEmail: email,
          roleDescription: roleDesc,
          inviterName: user?.companyName || user?.userName,
          inviterRole: user?.role === 'Warehouse Developer' ? 'Property Developer'
            : user?.role === 'User' ? 'Customer' : user?.role,
          dealId: lead.id,
          propertyBrief,
          viewUrl,
        }),
      }).catch(() => {});

      toast({ title: 'Stakeholder Invited', description: `${name} has been sent access to view the Term Sheet.` });
      setName(''); setEmail(''); setRoleDesc(''); setOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">

      {/* Existing stakeholders */}
      {existingStakeholders.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{color:'hsl(259 15% 55%)'}}>Stakeholders with Access</p>
          {existingStakeholders.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5"
              style={{background:'hsl(259 30% 97%)',border:'1px solid hsl(259 30% 90%)'}}>
              <div className="h-7 w-7 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{background:'hsl(259 44% 90%)',color:'#6141ac'}}>
                {s.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{color:'#1e1537'}}>{s.name}</p>
                <p className="text-xs" style={{color:'#aaa'}}>{s.roleDescription} · {s.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Eye className="h-3 w-3" style={{color:'#aaa'}} />
                <span className="text-xs" style={{color:'#aaa'}}>Read-only</span>
                {s.lastAccessedAt
                  ? <CheckCircle className="h-3 w-3" style={{color:'#15803d'}} />
                  : <Clock className="h-3 w-3" style={{color:'#d97706'}} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-dashed border-2 transition-colors hover:bg-purple-50"
          style={{borderColor:'hsl(259 44% 80%)',color:'#6141ac',borderRadius:0}}>
          <UserPlus className="h-3.5 w-3.5" /> Invite Stakeholder
        </button>
      )}

      {/* Invite form */}
      {open && (
        <div className="space-y-3 p-4" style={{background:'hsl(259 44% 97%)',border:'1px solid hsl(259 44% 82%)'}}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold" style={{color:'#1e1537'}}>Invite a Stakeholder</p>
            <button onClick={() => setOpen(false)}><X className="h-4 w-4" style={{color:'#aaa'}} /></button>
          </div>
          <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>
            Stakeholders receive read-only access to the Term Sheet and MoU Draft. They can print but not edit or download.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{color:'#1e1537'}}>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Arun Sharma"
                className="w-full px-3 py-2 text-sm" style={{border:'1px solid hsl(259 30% 85%)',borderRadius:0}} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{color:'#1e1537'}}>Email *</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="their@email.com"
                className="w-full px-3 py-2 text-sm" style={{border:'1px solid hsl(259 30% 85%)',borderRadius:0}} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{color:'#1e1537'}}>Their Role in This Transaction *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ROLE_SUGGESTIONS.map(r => (
                <button key={r} type="button" onClick={() => setRoleDesc(r)}
                  className="text-xs px-2 py-1 transition-all"
                  style={{
                    background: roleDesc === r ? '#6141ac' : 'hsl(259 30% 93%)',
                    color: roleDesc === r ? '#fff' : '#666',
                    borderRadius: 0,
                    border: `1px solid ${roleDesc === r ? '#6141ac' : 'hsl(259 30% 85%)'}`,
                  }}>
                  {r}
                </button>
              ))}
            </div>
            <input value={roleDesc} onChange={e => setRoleDesc(e.target.value)}
              placeholder="Or type a custom role..."
              className="w-full px-3 py-2 text-sm" style={{border:'1px solid hsl(259 30% 85%)',borderRadius:0}} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleInvite} disabled={submitting}
              className="flex-1 py-2.5 text-sm font-bold text-white"
              style={{background: submitting ? 'hsl(259 30% 75%)' : '#6141ac', borderRadius: 0}}>
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
            <button onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold"
              style={{background:'hsl(259 30% 93%)',color:'#666',borderRadius:0}}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
