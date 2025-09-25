

'use client';

import * as React from 'react';
import { TransactionsPage as BrokingTransactionsPage } from '@/components/transactions-page';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderLeads } from '@/components/provider-leads';
import { RegisterLeadForm } from './register-lead-form';


export function TransactionsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillFromLead = searchParams.get('prefillFromLead');

  const isAgent = user?.role === 'Agent';
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  
  const defaultTab = prefillFromLead && isSuperAdmin ? 'register' : 'activity';
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  
  React.useEffect(() => {
    // This effect ensures that if the URL param is present, the tab is switched.
    if (prefillFromLead && isSuperAdmin) {
        setActiveTab('register');
    }
  }, [prefillFromLead, isSuperAdmin]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If we switch away from the register tab, clean up the URL.
    if (value !== 'register' && prefillFromLead) {
       router.replace('/dashboard/transactions', { scroll: false });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Transactions</h2>
            <p className="text-muted-foreground mt-2">
              {isAgent
                ? 'Register new business leads or manage the activity for existing ones.'
                : 'Manage ongoing brokered transactions and register new business leads.'
              }
            </p>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">
                    {isAgent ? 'My Registered Leads' : (isSuperAdmin ? 'All Transactions' : 'My Acknowledged Leads')}
                </TabsTrigger>
                <TabsTrigger value="register">Register New Lead</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-6">
                <ProviderLeads view={isSuperAdmin ? 'all' : 'default'} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
                <RegisterLeadForm />
            </TabsContent>
        </Tabs>
      </div>
  );
}

export default function DashboardTransactionsPage() {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <TransactionsPage />
        </main>
    );
}
