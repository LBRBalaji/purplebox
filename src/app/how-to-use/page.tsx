'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ChevronDown, ChevronUp, Building2, Eye, Users, BarChart2, MessageSquare, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    id: 1,
    icon: Building2,
    title: 'Add Your Listings',
    duration: '5 minutes',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    summary: 'Create detailed warehouse listings to attract qualified tenants.',
    steps: [
      'Go to Dashboard → My Listings → Click "Create New Listing"',
      'Fill in the required details: Location, Size, Rent per sq.ft, Availability',
      'Add building specifications: Eve Height, Docks, Roof Type, Crane availability',
      'Upload property documents and images for better visibility',
      'Complete the Certificates & Approvals section (Fire NOC, Park Approval etc.)',
      'Submit for admin approval — you will be notified once approved',
    ],
    tip: 'Listings with complete details and documents receive 3x more enquiries.',
  },
  {
    id: 2,
    icon: Eye,
    title: 'Monitor Your Dashboard',
    duration: '2 minutes daily',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    summary: 'Track views, downloads and leads in real time from your dashboard.',
    steps: [
      'Log in to see your Portfolio Overview at the top of your dashboard',
      'Check Active Listings, Total Views, Downloads and New Leads at a glance',
      'Review Listing Completeness scores — improve incomplete listings',
      'See which listing is your Top Performer by views',
      'Expand "Viewed By" on any listing to see which companies are interested',
      'Expand "Downloaded By" to identify serious prospects',
    ],
    tip: 'Multiple downloads from the same company = high purchase intent. Follow up immediately.',
  },
  {
    id: 3,
    icon: Users,
    title: 'View & Unmask Leads',
    duration: '3 minutes per lead',
    color: 'bg-green-50 text-green-700 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    summary: 'Access qualified tenant enquiries matched to your properties.',
    steps: [
      'Click "My Leads & Proposals" tab on your dashboard',
      'Review each lead — size requirement, location preference, readiness timeline',
      'Click on a lead to open the full detail view',
      'Click "Acknowledge" to unmask the customer full contact details',
      'You will see their name, company, phone number and email address',
      'Contact the customer directly or use the platform negotiation tools',
    ],
    tip: 'Respond to leads within 24 hours — faster response rates lead to higher conversion.',
  },
  {
    id: 4,
    icon: MessageSquare,
    title: 'Engage via Negotiation Board',
    duration: 'Ongoing per deal',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    summary: 'Manage deal discussions, terms and progress in one structured place.',
    steps: [
      'Open a lead and click the "Negotiation Board" tab',
      'Log each discussion session with date, notes and agreed terms',
      'Track deal status from Initial Contact → Negotiation → Agreement → Closure',
      'Use the Tenant Improvements tab to log any fit-out commitments',
      'Both parties have a transparent record of all discussions',
      'Once deal is closed, mark the listing as Leased via the listing menu',
    ],
    tip: 'Documenting negotiations protects both parties and speeds up deal closure.',
  },
  {
    id: 5,
    icon: BarChart2,
    title: 'Use Analytics to Improve',
    duration: '10 minutes weekly',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    summary: 'Use engagement data to optimise your listings and strategy.',
    steps: [
      'Check which listings have high views but low downloads — improve their descriptions',
      'Identify the locations getting most interest from the platform analytics',
      'Compare your listing completeness score — aim for 80%+',
      'Review the type of companies viewing your listings to understand your audience',
      'Listings with low engagement should be reviewed for pricing or spec gaps',
      'Contact the ORS-ONE team for market insights and pricing benchmarks',
    ],
    tip: 'Listings priced within 10% of market rate receive 2x more serious enquiries.',
  },
];

function StepCard({ step, isOpen, onToggle }: { step: typeof steps[0]; isOpen: boolean; onToggle: () => void }) {
  const Icon = step.icon;
  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-md border-primary/20' : 'border-border hover:border-primary/20 hover:shadow-sm'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left bg-card">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.iconBg}`}>
          <Icon className={`h-5 w-5 ${step.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-muted-foreground">STEP {step.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${step.color}`}>{step.duration}</span>
          </div>
          <p className="font-bold text-foreground">{step.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{step.summary}</p>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-border bg-secondary/20">
          <div className="pt-4 space-y-2">
            {step.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-primary">{i+1}</span>
                </div>
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary font-medium">{step.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HowToUsePage() {
  const { user } = useAuth();
  const [openStep, setOpenStep] = React.useState<number | null>(1);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Building2 className="h-4 w-4" /> Developer Guide
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">How To Use ORS-ONE</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A step-by-step guide to getting the most out of your developer account on lease.orsone.app
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Steps to get started', value: '5' },
            { label: 'Minutes to first listing', value: '15' },
            { label: 'Avg. time to first lead', value: '48h' },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 text-center">
              <p className="text-2xl font-black text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map(step => (
            <StepCard
              key={step.id}
              step={step}
              isOpen={openStep === step.id}
              onToggle={() => setOpenStep(openStep === step.id ? null : step.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl p-8 text-center">
          <CheckCircle className="h-10 w-10 text-white mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2">Ready to Get Started?</h3>
          <p className="text-white/70 text-sm mb-6">Your first listing takes less than 15 minutes. Our team approves listings within 24 hours.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/community" className="inline-flex items-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors">
              Join Community
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center pb-8">
          <p className="text-sm text-muted-foreground">Need help? Contact the ORS-ONE team at</p>
          <a href="mailto:balaji@lakshmibalajio2o.com" className="text-primary font-semibold text-sm hover:underline">balaji@lakshmibalajio2o.com</a>
          <span className="text-muted-foreground text-sm"> · </span>
          <a href="tel:+919841098170" className="text-primary font-semibold text-sm hover:underline">+91 98410 98170</a>
        </div>

      </div>
    </main>
  );
}