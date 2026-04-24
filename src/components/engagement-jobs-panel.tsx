'use client';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

export function EngagementJobsPanel() {
  const { toast } = useToast();
  const [running, setRunning] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<any>(null);

  const jobs = [
    { id: 'all', label: 'Run All Jobs', desc: 'Executes every engagement job in sequence' },
    { id: 'rfq_nudge', label: 'RFQ Nudge (48hr)', desc: 'Nudge developers with unanswered RFQs + remind customers' },
    { id: 'demand_match', label: 'Demand → Developer Match', desc: 'Notify developers whose listings match active ORS-ONE TP demands' },
    { id: 'weekly_digest', label: 'Developer Weekly Digest', desc: 'Send weekly activity summary to all approved developers' },
    { id: 'site_visit', label: 'Site Visit Reminders', desc: 'Day-before reminder to both parties for scheduled visits' },
    { id: 'onboarding', label: 'Customer Onboarding Sequence', desc: 'Day 3 and Day 7 emails to newly approved customers' },
    { id: 'milestones', label: 'Deal Milestone Emails', desc: 'MoM finalised and other milestone acknowledgements' },
    { id: 'reengagement', label: 'Re-engagement (7-day)', desc: 'Nudge customers with pending transactions who have been inactive' },
    { id: 'expiry', label: 'Expiry Nudges', desc: 'Listing availability and demand 30-day expiry reminders' },
  ];

  const runJob = async (jobId: string) => {
    setRunning(jobId);
    setResults(null);
    try {
      const res = await fetch(`/api/engagement-jobs?job=${jobId}`);
      const data = await res.json();
      setResults(data);
      toast({ title: 'Job Complete', description: `Results: ${JSON.stringify(data.results)}` });
    } catch {
      toast({ variant: 'destructive', title: 'Job Failed', description: 'Check server logs.' });
    }
    setRunning(null);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 rounded-none" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
        <p className="text-sm font-bold" style={{color:'#1e1537'}}>Engagement Jobs Control Panel</p>
        <p className="text-xs mt-1" style={{color:'hsl(259 15% 55%)'}}>These jobs run automatically via Vercel cron (daily at 8am IST). You can trigger them manually here.</p>
      </div>
      {results && (
        <div className="p-4 rounded-none" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
          <p className="text-xs font-bold" style={{color:'#15803d'}}>Results: {JSON.stringify(results.results)}</p>
          <p className="text-xs" style={{color:'#15803d'}}>Run at: {results.timestamp}</p>
        </div>
      )}
      <div className="space-y-2">
        {jobs.map(job => (
          <div key={job.id} className="flex items-center gap-4 p-4" style={{background:'#fff',border:'1px solid hsl(259 30% 90%)'}}>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{color:'#1e1537'}}>{job.label}</p>
              <p className="text-xs mt-0.5" style={{color:'#888'}}>{job.desc}</p>
            </div>
            <button onClick={() => runJob(job.id)} disabled={!!running}
              className="text-xs font-bold px-4 py-2"
              style={{background: running === job.id ? 'hsl(259 30% 80%)' : '#6141ac', color:'#fff', borderRadius:0, cursor: running ? 'not-allowed' : 'pointer'}}>
              {running === job.id ? 'Running...' : 'Run Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
