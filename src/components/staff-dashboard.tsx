'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Shield, Building2, Users, DollarSign, BarChart, List, Settings, FileText } from 'lucide-react';

export function StaffDashboard() {
  const { user } = useAuth();
  const privileges: string[] = (user as any)?.privileges || [];
  const staffRole = (user as any)?.staffRole || 'Staff';

  const has = (p: string) => privileges.includes(p);

  const availableModules = [
    { id: 'create_listings', label: 'Create Listing', desc: 'Draft a new listing on behalf of a developer', icon: Building2, href: '/dashboard?tab=create-listing', color: 'bg-primary/10 text-primary' },
    { id: 'view_all_listings', label: 'All Listings', desc: 'View and manage all platform listings', icon: List, href: '/dashboard?tab=all-listings', color: 'bg-primary/10 text-primary' },
    { id: 'approve_users', label: 'User Approvals', desc: 'Approve or reject pending user accounts', icon: Users, href: '/dashboard/manage-users?tab=users', color: 'bg-amber-50 text-amber-700' },
    { id: 'view_payments', label: 'Payment Requests', desc: 'View all developer payment requests', icon: DollarSign, href: '/dashboard/manage-users?tab=payments', color: 'bg-green-50 text-green-700' },
    { id: 'confirm_payments', label: 'Confirm Payments', desc: 'Review and confirm pending payments', icon: DollarSign, href: '/dashboard/manage-users?tab=payments', color: 'bg-green-50 text-green-700' },
    { id: 'view_leads', label: 'All Leads', desc: 'View all registered leads and transactions', icon: FileText, href: '/dashboard/manage-users', color: 'bg-primary/10 text-primary' },
    { id: 'view_analytics', label: 'Analytics', desc: 'View platform performance and analytics', icon: BarChart, href: '/dashboard/analytics', color: 'bg-primary/10 text-primary' },
    { id: 'data_governance', label: 'Data Governance', desc: 'Access data governance and management tools', icon: Settings, href: '/dashboard/manage-users?tab=governance', color: 'bg-primary/10 text-primary' },
    { id: 'manage_users_readonly', label: 'View Users', desc: 'Browse and view all platform user accounts', icon: Users, href: '/dashboard/manage-users?tab=users', color: 'bg-primary/10 text-primary' },
  ];

  const myModules = availableModules.filter(m => has(m.id));
  const uniqueModules = myModules.filter((m, i, arr) => arr.findIndex(x => x.href === m.href) === i);

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-black text-foreground text-lg">{user?.userName}</p>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">ORS-ONE Staff</span>
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full">{staffRole}</span>
          </div>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">{privileges.length} privilege{privileges.length !== 1 ? 's' : ''} assigned by SuperAdmin</p>
        </div>
      </div>

      {uniqueModules.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="font-bold text-foreground">No privileges assigned yet</p>
          <p className="text-sm text-muted-foreground mt-2">Contact your SuperAdmin to assign privileges to your account.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-foreground mb-4">Your Access Modules</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueModules.map(m => {
              const Icon = m.icon;
              return (
                <a key={m.id} href={m.href}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{m.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-secondary/40 rounded-2xl p-4 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          You are logged in as an internal ORS-ONE staff member. Your actions are logged for audit purposes.
          Contact <span className="text-primary font-semibold">balaji@lakshmibalajio2o.com</span> for any access queries.
        </p>
      </div>
    </div>
  );
}