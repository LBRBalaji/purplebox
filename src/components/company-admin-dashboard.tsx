'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Users, Download, MapPin, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { startOfDay } from 'date-fns';

export function CompanyAdminDashboard() {
  const { user, users, updateUser } = useAuth();
  const { downloadHistory } = useData();
  const { toast } = useToast();

  const domain = user?.email.split('@')[1]?.toLowerCase();

  const teamMembers = React.useMemo(() => {
    if (!domain) return [];
    return Object.values(users || {}).filter((u: any) =>
      u.email !== user?.email && u.email.split('@')[1]?.toLowerCase() === domain
    ) as any[];
  }, [users, user, domain]);

  const todayStart = startOfDay(new Date()).getTime();

  const getMemberUsage = (memberEmail: string) => {
    const todayDownloads = downloadHistory.filter(d => d.userId === memberEmail && d.timestamp >= todayStart);
    const cities = [...new Set(todayDownloads.map(d => d.location?.toLowerCase().trim()))].filter(Boolean);
    return { downloads: todayDownloads.length, cities: cities.length, cityList: cities };
  };

  const teamTodayDownloads = downloadHistory.filter(d =>
    (d.userId === user?.email || teamMembers.some((m: any) => m.email === d.userId)) && d.timestamp >= todayStart
  );
  const teamCities = [...new Set(teamTodayDownloads.map(d => d.location?.toLowerCase().trim()))].filter(Boolean);

  const handleRemoveMember = (memberEmail: string) => {
    const member = users[memberEmail] as any;
    if (!member) return;
    toast({ title: 'Contact ORS-ONE', description: 'To remove a team member, please contact support at balaji@lakshmibalajio2o.com' });
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
          <p className="text-amber-700 text-xs mt-1">You can monitor your team's platform usage and manage team members.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-2xl font-black text-primary">{teamMembers.length + 1}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Team Members</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-2xl font-black text-primary">{teamTodayDownloads.length}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Team Downloads Today</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-2xl font-black text-primary">{teamCities.length}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Cities Accessed Today</p>
        </div>
      </div>

      {teamCities.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Cities Accessed Today</p>
          <div className="flex flex-wrap gap-2">
            {teamCities.map(city => (
              <Badge key={city} variant="outline" className="capitalize text-xs">{city}</Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Your Team</p>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {user?.userName?.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{user?.userName} <span className="text-xs text-amber-600 font-normal">(You — Admin)</span></p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-primary">{getMemberUsage(user?.email || '').downloads} downloads today</p>
              <p className="text-xs text-muted-foreground">{getMemberUsage(user?.email || '').cities} cities</p>
            </div>
          </div>
          {teamMembers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No other team members from {domain} yet.</div>
          ) : (
            teamMembers.map((member: any) => {
              const usage = getMemberUsage(member.email);
              return (
                <div key={member.email} className="px-4 py-3 border-b border-border last:border-0 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                    {member.userName?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{member.userName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-primary">{usage.downloads} downloads today</p>
                    <p className="text-xs text-muted-foreground">{usage.cities} cities</p>
                  </div>
                  <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                    member.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    member.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {member.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                     member.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
                     <XCircle className="h-3 w-3 mr-1" />}
                    {member.status}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary" /> Add Team Members</p>
        <p className="text-xs text-muted-foreground">Team members can join by signing up with their official <strong>{domain}</strong> email address. They will automatically appear in your team once approved by ORS-ONE.</p>
      </div>
    </div>
  );
}