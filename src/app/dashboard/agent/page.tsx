'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemandForm } from '@/components/demand-form';
import { TransactionsPage } from '@/components/transactions-page';
import { GeneralShortlist } from '@/components/general-shortlist';

export default function AgentDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editDemandId = searchParams.get('editDemandId');
  const defaultTab = editDemandId ? 'create-demand' : (searchParams.get('tab') || 'transactions');
  const [tab, setTab] = React.useState(defaultTab);

  React.useEffect(() => {
    if (editDemandId) setTab('create-demand');
  }, [editDemandId]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.userName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-4">
      <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
        style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
        <div>
          <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.companyName} · Transaction Agent</p>
        </div>
        <Link href="/register-deal" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
          <FileText className="h-4 w-4" /> Register a Deal
        </Link>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="create-demand">Create Demand</TabsTrigger>
          <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions"><TransactionsPage /></TabsContent>
        <TabsContent value="create-demand"><DemandForm onDemandLogged={() => setTab('transactions')} isAdminMode /></TabsContent>
        <TabsContent value="my-shortlist"><GeneralShortlist /></TabsContent>
      </Tabs>
    </div>
  );
}
