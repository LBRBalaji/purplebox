'use client';
import * as React from 'react';
import Link from 'next/link';
import { Check, X, Zap, Building2, PhoneCall, BadgeCheck, ShieldCheck, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from '@/components/login-dialog';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

const PlanFeature = ({ text, included }: { text: string; included: boolean }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${included ? 'bg-primary/10' : 'bg-muted'}`}>
      {included ? <Check className="h-3 w-3 text-primary" /> : <X className="h-3 w-3 text-muted-foreground" />}
    </div>
    <span className={`text-sm leading-snug ${included ? 'text-foreground' : 'text-muted-foreground line-through decoration-muted-foreground/40'}`}>{text}</span>
  </div>
);

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isProvider = user?.role === 'Warehouse Developer';

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border" style={{background: 'linear-gradient(135deg, hsl(259 44% 46% / 0.06) 0%, hsl(259 30% 96%) 60%)'}}>
        <div className="container mx-auto px-4 py-20 text-center max-w-3xl relative z-10">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-5 text-xs px-4 py-1.5 rounded-full tracking-wide">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Reduce Vacancy.<br/>Lease Faster.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            No monthly fees. No subscriptions. No surprises. ORS-ONE operates on a pure <strong className="text-foreground font-semibold">pay-per-lead</strong> model — you only pay when a real customer reaches out about your property.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-card rounded-3xl border border-border p-8 flex flex-col">
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-1">Standard Listing</h2>
              <p className="text-sm text-muted-foreground">Establish your presence on the platform</p>
              <div className="mt-6 pt-6 border-t border-border">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">No listing fee</span>
              </div>
            </div>
            <div className="flex-1 mb-8">
              <PlanFeature text="Full listing page with specs, images and documents" included={true} />
              <PlanFeature text="Listing completeness score" included={true} />
              <PlanFeature text="Appear in platform search and browse" included={true} />
              <PlanFeature text="Basic analytics — views count" included={true} />
              <PlanFeature text="Community access" included={true} />
              <PlanFeature text="ROI and commercial calculators" included={true} />
              <PlanFeature text="Lead contact details" included={false} />
              <PlanFeature text="Respond to customer leads" included={false} />
              <PlanFeature text="Submit proposals to active demands" included={false} />
              <PlanFeature text="Priority listing approval" included={false} />
            </div>
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-semibold border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <Building2 className="mr-2 h-4 w-4" /> Go to My Listings
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-semibold border-border hover:border-primary/40 hover:bg-primary/5 transition-all" onClick={() => setIsLoginOpen(true)}>
                Get Started
              </Button>
            )}
          </div>

          <div className="rounded-3xl border-2 border-primary p-8 flex flex-col relative" style={{background: 'linear-gradient(160deg, hsl(259 44% 46% / 0.04) 0%, hsl(259 30% 99%) 100%)'}}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-md tracking-wide">
                RECOMMENDED
              </span>
            </div>
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground mb-1">Pay For Purpose</h2>
              <p className="text-sm text-muted-foreground">Connect with serious, verified buyers</p>
              <div className="mt-6 pt-6 border-t border-primary/10 flex items-end gap-2">
                <span className="text-5xl font-black text-primary leading-none">₹5,000</span>
                <span className="text-muted-foreground text-sm mb-1">per lead</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 bg-primary/5 rounded-xl px-4 py-3 border border-primary/10 leading-relaxed">
                No monthly commitment. Pay only when a verified customer enquiry comes in for your property.
              </p>
            </div>
            <div className="flex-1 mb-8">
              <PlanFeature text="Everything in Standard Listing" included={true} />
              <PlanFeature text="Full lead contact details — name, phone, email" included={true} />
              <PlanFeature text="Acknowledge and respond to customer leads" included={true} />
              <PlanFeature text="Submit proposals to active demands" included={true} />
              <PlanFeature text="Detailed analytics — views, downloads, companies" included={true} />
              <PlanFeature text="Priority listing approval within 24 hrs" included={true} />
              <PlanFeature text="Negotiation board access" included={true} />
              <PlanFeature text="Dedicated O2O support for deal facilitation" included={true} />
              <PlanFeature text="Zero brokerage on closed deals" included={true} />
            </div>
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20Pay%20For%20Purpose%20on%20ORS-ONE" target="_blank" rel="noopener noreferrer">
              <Button className="w-full rounded-2xl h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all">
                <WhatsAppIcon className="mr-2" /> Talk to Us
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-2">How Pay For Purpose Works</h2>
            <p className="text-muted-foreground text-sm">Four steps. No complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'List your property', desc: 'Add your warehouse with specs, images, location and documents. No listing fee. No setup cost.' },
              { step: '02', title: 'Customer enquires', desc: 'A verified customer submits a demand or expresses interest in your property.' },
              { step: '03', title: 'We notify you', desc: 'You are notified of the lead. Only verified business profiles reach this stage — spam and fake enquiries are filtered at source.' },
              { step: '04', title: 'Pay and connect', desc: 'Pay Rs.5,000 to unlock full lead contact details and close the deal directly.' },
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

        <div className="mt-24">
          <div className="text-center mb-12">
            <BadgeCheck className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-black text-foreground mb-2">Why Property Providers Choose ORS-ONE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: TrendingDown, title: 'No monthly fees', desc: 'Your Standard Listing stays live with no time limit and no listing fee. Pay only when you choose to engage a lead.' },
              { icon: ShieldCheck, title: 'Verified profiles only', desc: 'We admit only verified business profiles as customers on the platform — filtering out spam and fake enquiries at the source, before they ever reach you.' },
              { icon: BadgeCheck, title: 'Zero brokerage', desc: 'Once you unlock a lead, deal directly with the customer. We take no commission on the transaction.' },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-2xl border border-border p-7 flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 rounded-3xl border border-primary/20 p-12 text-center" style={{background: 'linear-gradient(135deg, hsl(259 44% 46% / 0.06) 0%, hsl(259 30% 98%) 100%)'}}>
          <h2 className="text-3xl font-black text-foreground mb-3">Ready to list your warehouse?</h2>
          <p className="text-muted-foreground text-sm mb-8">No listing fee. No commitment. Your property, your terms.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all">
                  <Building2 className="mr-2 h-4 w-4" /> Create a Listing
                </Button>
              </Link>
            ) : (
              <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all" onClick={() => setIsLoginOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" /> List Your Property
              </Button>
            )}
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20pricing" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="h-12 px-8 rounded-2xl font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all">
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
