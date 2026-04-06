const fs = require('fs');

const content = `'use client';
import * as React from 'react';
import Link from 'next/link';
import { Building2, PhoneCall, CheckCircle, Zap, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from '@/components/login-dialog';

const WhatsAppIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

const TIERS = [
  { name: 'Solo Connect', sub: 'Perfect for focused outreach to a single key prospect', price: '₹5,000', users: '1 user per lead' },
  { name: 'Team Connect', sub: 'Loop in your leasing team — three decision makers on one lead', price: '₹10,000', users: '3 users per lead' },
  { name: 'Full Connect', sub: 'Entire deal team on board — five users, one powerful lead', price: '₹17,500', users: '5 users per lead' },
];

const ZeroBadge = () => (
  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
    <CheckCircle className="h-3 w-3" /> Zero Cost
  </span>
);

const PFPBadge = () => (
  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
    <Zap className="h-3 w-3" /> Pay For Purpose
  </span>
);

const StageTag = ({ n, green }: { n: string; green?: boolean }) => (
  <span className={\`text-xs font-bold px-3 py-1 rounded-full border \${green ? 'bg-green-50 text-green-700 border-green-200' : 'bg-primary/10 text-primary border-primary/20'}\`}>{n}</span>
);

const Row = ({ label, badge, note }: { label: string; badge: React.ReactNode; note?: string }) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {note && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{note}</p>}
    </div>
    <div className="flex-shrink-0 mt-0.5">{badge}</div>
  </div>
);

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isProvider = user?.role === 'Warehouse Developer';
  const [currentTier, setCurrentTier] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTier(prev => (prev + 1) % 3), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-20 text-center max-w-3xl">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-5 text-xs px-4 py-1.5 rounded-full tracking-wide">
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Enable First.<br />Pay For Purpose.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Experience the full power of ORS-ONE. Pay only when you choose to take action.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">

        {/* Two Column Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* DEVELOPER COLUMN */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="px-6 py-5" style={{background: 'hsl(259 25% 11%)'}}>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{color: '#9b7ee0'}}>For Developers</p>
              </div>
              <p className="text-xl font-black text-white">Property Providers</p>
            </div>

            <div className="p-6 space-y-6">

              {/* Stage 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StageTag n="Stage 1" green />
                  <p className="text-sm font-bold text-foreground">List Your Warehouse</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4">
                  <Row label="List &amp; publish listings" badge={<ZeroBadge />} note="No cost to list. Get your properties in front of verified tenants immediately." />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Stage 2 — animated tiers */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StageTag n="Stage 2" />
                  <p className="text-sm font-bold text-foreground">Connect With Prospect</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3 ml-1">Pay For Purpose — choose your connect plan per prospect</p>
                <div className="space-y-3">
                  {TIERS.map((tier, i) => (
                    <div key={tier.name}
                      onClick={() => setCurrentTier(i)}
                      className={\`rounded-2xl p-4 cursor-pointer transition-all \${i === currentTier ? 'border-2 border-primary bg-primary/5' : 'border border-border hover:border-primary/30'}\`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-bold text-foreground">{tier.name}</p>
                        <p className="text-base font-black text-primary">{tier.price}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{tier.sub}</p>
                      <p className="text-xs text-muted-foreground">{tier.users}</p>
                      {i === currentTier && (
                        <div className="flex justify-end mt-2">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-center gap-2 mt-2">
                    {TIERS.map((_, i) => (
                      <button key={i} onClick={() => setCurrentTier(i)}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{background: i === currentTier ? '#6141ac' : 'hsl(259 30% 80%)'}} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Stage 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StageTag n="Stage 3" />
                  <p className="text-sm font-bold text-foreground">Engage &amp; Transact</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4">
                  <Row label="Within threshold" badge={<ZeroBadge />} note="Experience &amp; enjoy — Negotiation Board, Chat, Tenant Improvements &amp; more" />
                  <Row label="Beyond threshold" badge={<PFPBadge />} note="Continue independently on platform fee" />
                </div>
                <div className="mt-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-bold text-primary">ORS-ONE as Transaction Partner</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Industry standard fee applicable on successful deal closure</p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20for%20Developers" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full rounded-xl h-11 text-sm font-bold bg-primary hover:bg-primary/90">
                    <WhatsAppIcon className="mr-2" /> Talk to Our Team
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* CUSTOMER COLUMN */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="px-6 py-5 bg-primary">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">For Customers</p>
              </div>
              <p className="text-xl font-black text-white">Tenants &amp; Occupiers</p>
            </div>

            <div className="p-6 space-y-6">

              {/* Stage 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StageTag n="Stage 1" green />
                  <p className="text-sm font-bold text-foreground">Source Listings</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4">
                  <Row label="Browse &amp; download listings" badge={<ZeroBadge />} note="Within your daily &amp; city threshold — experience the full power of ORS-ONE" />
                  <Row label="Beyond threshold" badge={<PFPBadge />} note="Expanded access on platform fee — ideal for high-volume sourcing teams" />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Stage 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StageTag n="Stage 2" />
                  <p className="text-sm font-bold text-foreground">Connect With Developer</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4">
                  <Row label="Within threshold" badge={<ZeroBadge />} note="Experience &amp; enjoy the platform — connect, chat and explore developer profiles" />
                  <Row label="Beyond threshold" badge={<PFPBadge />} note="Or engage ORS-ONE as Transaction Partner" />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Stage 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StageTag n="Stage 3" />
                  <p className="text-sm font-bold text-foreground">Engage &amp; Transact</p>
                </div>
                <div className="bg-secondary/40 rounded-2xl p-4">
                  <Row label="Within threshold" badge={<ZeroBadge />} note="Experience &amp; enjoy — Negotiation Board, Chat, Tenant Improvements &amp; more" />
                  <Row label="Beyond threshold" badge={<PFPBadge />} note="Or engage ORS-ONE as Transaction Partner" />
                </div>

                <div className="mt-3 rounded-2xl overflow-hidden border border-green-200">
                  <div className="bg-green-700 px-4 py-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-white" />
                    <p className="text-sm font-bold text-white">ORS-ONE as Transaction Partner</p>
                  </div>
                  <div className="bg-green-50 p-4">
                    <Row label="3PL &amp; Logistics" badge={<span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"><CheckCircle className="h-3 w-3" /> Zero Brokerage</span>} />
                    <Row label="Other industries" badge={<span className="text-xs font-bold text-green-800 flex-shrink-0">Industry standard fee</span>} />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {user ? (
                  <Link href="/dashboard">
                    <Button className="w-full rounded-xl h-11 text-sm font-bold bg-primary hover:bg-primary/90">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full rounded-xl h-11 text-sm font-bold bg-primary hover:bg-primary/90" onClick={() => setIsLoginOpen(true)}>
                    Get Started
                  </Button>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="bg-secondary/40 rounded-2xl p-5 text-center border border-border mb-20">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            All platform features — including the Negotiation Board, Chat and Tenant Improvements — are available to explore within threshold limits.
            ORS-ONE reserves the right to modify access to any feature at its sole discretion.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-2">How Pay For Purpose Works</h2>
            <p className="text-muted-foreground text-sm">Four steps. No complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'List your property', desc: 'Add your warehouse with specs, images, location and documents. No listing fee. No setup cost.' },
              { step: '02', title: 'Customer enquires', desc: 'A verified customer submits a demand or expresses interest in your property.' },
              { step: '03', title: 'We notify you', desc: 'Only verified business profiles reach this stage — spam and fake enquiries are filtered at source.' },
              { step: '04', title: 'Pay and connect', desc: 'Pay ₹5,000 to unlock full lead contact details and close the deal directly.' },
            ].map((item) => (
              <div key={item.step} className="relative bg-card rounded-2xl border border-border p-6 overflow-hidden">
                <div className="absolute -bottom-3 -right-2 text-7xl font-black text-primary/5 leading-none select-none">{item.step}</div>
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xs font-black text-primary">{item.step}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 rounded-3xl border border-primary/20 p-12 text-center bg-card">
          <h2 className="text-3xl font-black text-foreground mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground text-sm mb-8">No listing fee. No commitment. Experience the platform today.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Building2 className="mr-2 h-4 w-4" /> Create a Listing
                </Button>
              </Link>
            ) : (
              <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setIsLoginOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" /> Get Started
              </Button>
            )}
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20pricing" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="h-12 px-8 rounded-2xl font-semibold">
                <PhoneCall className="mr-2 h-4 w-4" /> Talk to Our Team
              </Button>
            </Link>
          </div>
        </div>

      </div>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}
`;

fs.writeFileSync('src/app/pricing/page.tsx', content);
console.log('Done! Lines:', content.split('\n').length);
