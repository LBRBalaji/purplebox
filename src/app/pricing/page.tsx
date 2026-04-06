'use client';
import * as React from 'react';
import Link from 'next/link';
import { Building2, PhoneCall, CheckCircle, Zap, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from '@/components/login-dialog';

const WhatsAppIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

const TIERS = [
  { name: 'Solo Connect', sub: 'Focused outreach to a single key prospect', price: '₹5,000', users: '1 user per lead', highlight: false },
  { name: 'Team Connect', sub: 'Loop in your leasing team on one lead', price: '₹10,000', users: '3 users per lead', highlight: true },
  { name: 'Full Connect', sub: 'Entire deal team — five users, one lead', price: '₹17,500', users: '5 users per lead', highlight: false },
];

const STEPS = [
  { n: '01', title: 'List your property', desc: 'Add your warehouse with specs, images, and documents. Zero listing fee.' },
  { n: '02', title: 'Customer enquires', desc: 'A verified business customer submits a demand or expresses interest.' },
  { n: '03', title: 'We notify you', desc: 'Only verified profiles reach this stage — spam filtered at source.' },
  { n: '04', title: 'Pay and connect', desc: 'Pay ₹5,000 to unlock full lead contact details and close directly.' },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [activeTier, setActiveTier] = React.useState(1);
  const isProvider = user?.role === 'Warehouse Developer';

  React.useEffect(() => {
    const timer = setInterval(() => setActiveTier(prev => (prev + 1) % 3), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(259 30% 97%)' }}>

      {/* Hero */}
      <div style={{ background: 'hsl(259 25% 10%)', borderBottom: '1px solid hsl(259 25% 18%)' }}>
        <div className="container mx-auto px-4 pt-20 pb-16 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 tracking-widest uppercase"
            style={{ background: 'hsl(259 44% 20%)', color: '#c5b8e8', border: '1px solid hsl(259 44% 30%)' }}>
            <Sparkles className="h-3 w-3" /> Transparent Pricing
          </div>
          <h1 className="font-black tracking-tight mb-4 leading-[1.1]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)', color: '#ffffff' }}>
            Enable First.
            <span style={{ color: '#9b7ee0' }}><br />Pay For Purpose.</span>
          </h1>
          <p className="text-base leading-relaxed mx-auto" style={{ color: 'hsl(259 30% 65%)', maxWidth: '480px' }}>
            Experience the full power of ORS-ONE. Pay only when you choose to take action — no subscriptions, no commitments.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">

        {/* Main Pricing Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl -mt-1" style={{ border: '1px solid hsl(259 30% 86%)' }}>

          {/* Stage 1 — List */}
          <div className="px-8 py-7" style={{ background: '#ffffff' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl flex-shrink-0"
                  style={{ background: 'hsl(259 44% 94%)', border: '1px solid hsl(259 44% 84%)' }}>
                  <span className="text-xs font-black" style={{ color: '#6141ac' }}>01</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#9b7ee0' }}>Stage 1</p>
                  <p className="text-base font-black text-foreground">List Your Warehouse</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black" style={{ color: '#6141ac' }}>₹0</p>
                <p className="text-xs" style={{ color: '#9b7ee0' }}>always free</p>
              </div>
            </div>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: 'hsl(259 15% 45%)' }}>
              Publish your listings instantly. Get in front of verified tenants with full listing details, images, and documents — no cost, no catch.
            </p>
          </div>

          <div style={{ height: '1px', background: 'hsl(259 30% 90%)' }} />

          {/* Stage 2 — Connect */}
          <div className="px-8 py-7" style={{ background: 'hsl(259 25% 10%)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl flex-shrink-0"
                style={{ background: '#6141ac' }}>
                <span className="text-xs font-black text-white">02</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#9b7ee0' }}>Stage 2 · Pay For Purpose</p>
                <p className="text-base font-black text-white">Connect With Prospect</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: 'hsl(259 30% 60%)' }}>Choose your connect plan per prospect. Pay only when you decide to engage.</p>

            <div className="grid grid-cols-3 gap-3">
              {TIERS.map((tier, i) => (
                <button key={tier.name} onClick={() => setActiveTier(i)}
                  className="rounded-2xl p-4 text-left transition-all duration-300 cursor-pointer"
                  style={i === activeTier
                    ? { background: '#6141ac', border: '2px solid #9b7ee0', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(97,65,172,0.4)' }
                    : { background: 'hsl(259 25% 16%)', border: '1px solid hsl(259 25% 24%)' }}>
                  <p className="text-xs font-bold mb-2 leading-tight"
                    style={{ color: i === activeTier ? '#ffffff' : '#c5b8e8' }}>{tier.name}</p>
                  <p className="text-xl font-black mb-1"
                    style={{ color: i === activeTier ? '#ffffff' : '#9b7ee0' }}>{tier.price}</p>
                  <p className="text-xs leading-tight"
                    style={{ color: i === activeTier ? 'rgba(255,255,255,0.7)' : 'hsl(259 25% 50%)' }}>{tier.users}</p>
                </button>
              ))}
            </div>

            {/* Active tier detail */}
            <div className="mt-4 rounded-2xl px-5 py-4"
              style={{ background: 'hsl(259 25% 7%)', border: '1px solid hsl(259 25% 20%)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#c5b8e8' }}>{TIERS[activeTier].name}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(259 30% 55%)' }}>{TIERS[activeTier].sub}</p>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {TIERS.map((_, i) => (
                <button key={i} onClick={() => setActiveTier(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === activeTier ? '20px' : '6px', height: '6px', background: i === activeTier ? '#9b7ee0' : 'hsl(259 25% 30%)' }} />
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: 'hsl(259 30% 90%)' }} />

          {/* Stage 3 — Transact */}
          <div className="px-8 py-7" style={{ background: '#ffffff' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl flex-shrink-0"
                style={{ background: 'hsl(259 44% 94%)', border: '1px solid hsl(259 44% 84%)' }}>
                <span className="text-xs font-black" style={{ color: '#6141ac' }}>03</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#9b7ee0' }}>Stage 3</p>
                <p className="text-base font-black text-foreground">Engage &amp; Transact</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              {[
                { label: 'Within threshold', desc: 'Negotiation Board, Chat, Tenant Improvements & more — fully included', free: true },
                { label: 'Beyond threshold', desc: 'Continue independently on platform fee', free: false },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                  style={{ background: row.free ? 'hsl(259 44% 96%)' : 'hsl(259 30% 96%)', border: `1px solid ${row.free ? 'hsl(259 44% 86%)' : 'hsl(259 30% 88%)'}` }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {row.free
                      ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'hsl(259 44% 88%)', color: '#6141ac' }}><CheckCircle className="h-3 w-3" /> Zero Cost</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'hsl(259 25% 18%)', color: '#9b7ee0' }}><Zap className="h-3 w-3" /> Pay For Purpose</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row.label}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'hsl(259 15% 50%)' }}>{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction Partner box */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid hsl(259 25% 22%)' }}>
              <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background: 'hsl(259 25% 11%)' }}>
                <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: '#9b7ee0' }} />
                <p className="text-sm font-bold" style={{ color: '#c5b8e8' }}>ORS-ONE as Transaction Partner</p>
              </div>
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                style={{ background: 'hsl(259 44% 97%)', borderTop: '1px solid hsl(259 30% 88%)' }}>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-foreground">3PL &amp; Logistics</p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(259 15% 50%)' }}>Industry-standard service</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: '#6141ac', color: '#ffffff' }}><Check className="h-3 w-3" /> Zero Brokerage</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Other Industries</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#6141ac' }}>Industry standard fee</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA footer */}
          <div className="px-8 py-6" style={{ background: 'hsl(259 44% 96%)', borderTop: '1px solid hsl(259 44% 88%)' }}>
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20for%20Developers" target="_blank" rel="noopener noreferrer">
              <button className="w-full rounded-2xl h-12 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: '#6141ac', color: '#ffffff' }}>
                <WhatsAppIcon /> Talk to Our Team <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs leading-relaxed mt-6 mb-16" style={{ color: 'hsl(259 15% 55%)' }}>
          All platform features are available within threshold limits. ORS-ONE reserves the right to modify access at its sole discretion.
        </p>

        {/* How it works */}
        <div className="mb-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9b7ee0' }}>The Process</p>
            <h2 className="text-3xl font-black text-foreground">How Pay For Purpose Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((item, i) => (
              <div key={item.n} className="relative rounded-2xl p-5 overflow-hidden"
                style={{ background: '#ffffff', border: '1px solid hsl(259 30% 88%)' }}>
                <div className="absolute -bottom-2 -right-1 font-black select-none leading-none"
                  style={{ fontSize: '5rem', color: 'hsl(259 44% 96%)', lineHeight: 1 }}>{item.n}</div>
                <div className="relative">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: i === 3 ? '#6141ac' : 'hsl(259 44% 92%)' }}>
                    <span className="text-xs font-black" style={{ color: i === 3 ? '#ffffff' : '#6141ac' }}>{item.n}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'hsl(259 15% 50%)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl p-10 text-center mb-20"
          style={{ background: 'hsl(259 25% 10%)', border: '1px solid hsl(259 25% 20%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9b7ee0' }}>Get Started</p>
          <h2 className="text-2xl font-black text-white mb-2">No listing fee. No commitment.</h2>
          <p className="text-sm mb-8" style={{ color: 'hsl(259 30% 55%)' }}>Experience the platform today — pay only when you're ready to connect.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <button className="h-11 px-7 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90"
                  style={{ background: '#6141ac', color: '#ffffff' }}>
                  <Building2 className="h-4 w-4" /> Create a Listing
                </button>
              </Link>
            ) : (
              <button className="h-11 px-7 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90"
                style={{ background: '#6141ac', color: '#ffffff' }}
                onClick={() => setIsLoginOpen(true)}>
                <Building2 className="h-4 w-4" /> Get Started
              </button>
            )}
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20pricing" target="_blank" rel="noopener noreferrer">
              <button className="h-11 px-7 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
                style={{ background: 'hsl(259 25% 18%)', color: '#c5b8e8', border: '1px solid hsl(259 25% 28%)' }}>
                <PhoneCall className="h-4 w-4" /> Talk to Our Team
              </button>
            </Link>
          </div>
        </div>

      </div>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}
