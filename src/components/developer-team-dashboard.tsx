'use client';
import * as React from 'react';
import { useAuth, type DeveloperSubRole } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Building2, Eye, Download, CheckCircle, Clock, XCircle, AlertCircle, ShieldCheck, ShieldOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { startOfDay } from 'date-fns';

export function DeveloperTeamDashboard() {
  const { user, users } = useAuth();
  const [savingRole, setSavingRole] = React.useState<string | null>(null);
  const { listings, listingAnalytics, downloadHistory } = useData();
  const { toast } = useToast();

  const domain = user?.email.split('@')[1]?.toLowerCase();

  const teamMembers = React.useMemo(() => {
    if (!domain) return [];
    return Object.values(users || {}).filter((u: any) =>
      u.email !== user?.email && u.email.split('@')[1]?.toLowerCase() === domain
    ) as any[];
  }, [users, user, domain]);

  const todayStart = startOfDay(new Date()).getTime();

  const teamListings = React.useMemo(() => {
    const teamEmails = [user?.email, ...teamMembers.map((m: any) => m.email)].filter(Boolean);
    return listings.filter(l => teamEmails.includes(l.developerId));
  }, [listings, user, teamMembers]);

  const teamAnalytics = React.useMemo(() => {
    return listingAnalytics.filter(a => teamListings.some(l => l.listingId === a.listingId));
  }, [listingAnalytics, teamListings]);

  const getMemberStats = (memberEmail: string) => {
    const memberListings = listings.filter(l => l.developerId === memberEmail);
    const memberAnalytics = listingAnalytics.filter(a => memberListings.some(l => l.listingId === a.listingId));
    const totalViews = memberAnalytics.reduce((s, a) => s + a.views, 0);
    const totalDownloads = memberAnalytics.reduce((s, a) => s + a.downloads, 0);
    return { listings: memberListings.length, views: totalViews, downloads: totalDownloads };
  };

  const handleUpdateSubRoles = async (memberEmail: string, subRoles: DeveloperSubRole[], deactivated: boolean) => {
    setSavingRole(memberEmail);
    try {
      const member = (Object.values(users || {}) as any[]).find(u => u.email === memberEmail);
      if (!member) return;
      const updated = { ...member, approvedSubRoles: subRoles, developerSubRoles: subRoles, subRoleDeactivated: deactivated };
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      // Reload
      window.location.reload();
    } catch { }
    setSavingRole(null);
  };

  const SUB_ROLES: DeveloperSubRole[] = ['Inventory In-Charge', 'Transaction In-Charge'];

  const teamStats = {
    totalListings: teamListings.length,
    approvedListings: teamListings.filter(l => l.status === 'approved').length,
    totalViews: teamAnalytics.reduce((s, a) => s + a.views, 0),
    totalDownloads: teamAnalytics.reduce((s, a) => s + a.downloads, 0),
  };

  if (!user?.isCompanyAdmin) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center mt-5">
        <Crown className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="font-bold text-foreground">Company Admin Access Required</p>
        <p className="text-sm text-muted-foreground mt-2">This section is only available to designated Company Admins. Contact ORS-ONE to upgrade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-5">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <Crown className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-800 text-sm">You are the Company Admin for {domain}</p>
          <p className="text-amber-700 text-xs mt-1">Monitor your team's listings, views and prospect activity across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: teamMembers.length + 1, icon: Users },
          { label: 'Total Listings', value: teamStats.totalListings, icon: Building2 },
          { label: 'Total Views', value: teamStats.totalViews, icon: Eye },
          { label: 'Total Downloads', value: teamStats.totalDownloads, icon: Download },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
            <p className="text-2xl font-black text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Your Team
        </p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {user?.userName?.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{user?.userName} <span className="text-xs text-amber-600">(You — Admin)</span></p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="text-right flex-shrink-0 text-xs">
              {(() => { const s = getMemberStats(user?.email || ''); return (
                <div>
                  <p className="font-bold text-primary">{s.listings} listings</p>
                  <p className="text-muted-foreground">{s.views} views · {s.downloads} downloads</p>
                </div>
              ); })()}
            </div>
          </div>
          {teamMembers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No other team members from {domain} yet.</div>
          ) : (
            teamMembers.map((member: any) => {
              const stats = getMemberStats(member.email);
              return (
                <div key={member.email} className="px-4 py-4 border-b border-border last:border-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                      {member.userName?.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{member.userName}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0 text-xs">
                      <p className="font-bold text-primary">{stats.listings} listings</p>
                      <p className="text-muted-foreground">{stats.views}v · {stats.downloads}dl</p>
                    </div>
                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                      member.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      member.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {member.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1 inline" /> :
                       member.status === 'pending' ? <Clock className="h-3 w-3 mr-1 inline" /> :
                       <XCircle className="h-3 w-3 mr-1 inline" />}
                      {member.status}
                    </Badge>
                  </div>

                  {/* Sub-role management */}
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold" style={{color:'#6141ac'}}>Functional Role</p>
                      {member.developerSubRoles?.length > 0 && !member.approvedSubRoles?.length && (
                        <span className="text-xs px-1.5 py-0.5 rounded-sm" style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
                          Pending your approval
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUB_ROLES.map(role => {
                        const isApproved = (member.approvedSubRoles || []).includes(role);
                        const isRequested = (member.developerSubRoles || []).includes(role);
                        const isDeactivated = member.subRoleDeactivated && isApproved;
                        return (
                          <div key={role} className="flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-semibold"
                            style={{
                              background: isApproved && !isDeactivated ? 'hsl(259 44% 94%)' : isRequested ? '#fffbeb' : '#f9f9f9',
                              borderColor: isApproved && !isDeactivated ? '#6141ac' : isRequested ? '#f59e0b' : '#e5e7eb',
                              color: isApproved && !isDeactivated ? '#6141ac' : isRequested ? '#b45309' : '#aaa',
                            }}>
                            {isApproved && !isDeactivated ? <ShieldCheck className="h-3 w-3 mr-1" /> : isRequested ? <Clock className="h-3 w-3 mr-1" /> : null}
                            {role}
                            {isRequested && (
                              <span className="text-xs ml-1" style={{color:'#888'}}>
                                {isApproved ? '(active)' : '(requested)'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {!member.developerSubRoles?.length && !member.approvedSubRoles?.length && (
                        <span className="text-xs" style={{color:'#aaa'}}>No sub-role requested</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Approve requested roles */}
                      {member.developerSubRoles?.length > 0 && (
                        <button
                          disabled={savingRole === member.email}
                          onClick={() => handleUpdateSubRoles(member.email, member.developerSubRoles, false)}
                          className="text-xs font-semibold px-3 py-1.5 transition-all"
                          style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
                          {savingRole === member.email ? 'Saving...' : '✓ Approve Requested Roles'}
                        </button>
                      )}
                      {/* Assign Inventory In-Charge */}
                      <button
                        disabled={savingRole === member.email}
                        onClick={() => {
                          const current = member.approvedSubRoles || [];
                          const has = current.includes('Inventory In-Charge');
                          const next = has ? current.filter((r: string) => r !== 'Inventory In-Charge') : [...current, 'Inventory In-Charge'];
                          handleUpdateSubRoles(member.email, next as DeveloperSubRole[], member.subRoleDeactivated || false);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 border transition-all"
                        style={{borderRadius:0,borderColor:'#6141ac',color:'#6141ac',background:(member.approvedSubRoles||[]).includes('Inventory In-Charge')?'hsl(259 44% 94%)':'#fff'}}>
                        {(member.approvedSubRoles||[]).includes('Inventory In-Charge') ? '− Remove Inventory' : '+ Inventory In-Charge'}
                      </button>
                      {/* Assign Transaction In-Charge */}
                      <button
                        disabled={savingRole === member.email}
                        onClick={() => {
                          const current = member.approvedSubRoles || [];
                          const has = current.includes('Transaction In-Charge');
                          const next = has ? current.filter((r: string) => r !== 'Transaction In-Charge') : [...current, 'Transaction In-Charge'];
                          handleUpdateSubRoles(member.email, next as DeveloperSubRole[], member.subRoleDeactivated || false);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 border transition-all"
                        style={{borderRadius:0,borderColor:'#6141ac',color:'#6141ac',background:(member.approvedSubRoles||[]).includes('Transaction In-Charge')?'hsl(259 44% 94%)':'#fff'}}>
                        {(member.approvedSubRoles||[]).includes('Transaction In-Charge') ? '− Remove Transaction' : '+ Transaction In-Charge'}
                      </button>
                      {/* Deactivate/Reactivate */}
                      {(member.approvedSubRoles||[]).length > 0 && (
                        <button
                          disabled={savingRole === member.email}
                          onClick={() => handleUpdateSubRoles(member.email, member.approvedSubRoles || [], !member.subRoleDeactivated)}
                          className="text-xs font-semibold px-3 py-1.5 border transition-all"
                          style={{borderRadius:0,borderColor: member.subRoleDeactivated?'#15803d':'#dc2626',color:member.subRoleDeactivated?'#15803d':'#dc2626',background:'#fff'}}>
                          {member.subRoleDeactivated
                            ? <><ToggleRight className="h-3 w-3 inline mr-1" />Reactivate Roles</>
                            : <><ToggleLeft className="h-3 w-3 inline mr-1" />Deactivate Roles</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" /> Add Team Members
        </p>
        <p className="text-xs text-muted-foreground">Team members can join by signing up with their official <strong>{domain}</strong> email address. They will automatically appear in your team once approved by ORS-ONE.</p>
      </div>
    </div>
  );
}