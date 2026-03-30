'use client';
import * as React from 'react';
import Link from 'next/link';
import { Check, X, Zap, Building2, PhoneCall, BadgeCheck } from 'lucide-react';
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
  <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${included ? 'bg-primary/10' : 'bg-muted'}`}>
      {included ? <Check className="h-3 w-3 text-primary" /> : <X className="h-3 w-3 text-muted-foreground" />}
    </div>
    <span className={`text-sm ${included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{text}</span>
  </div>
);

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isProvider = user?.role === 'Warehouse Developer';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-4 text-xs px-3 py-1">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
            Reduce Vacancy. Lease Faster.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No monthly fees. No subscriptions. No surprises. ORS-ONE operates on a pure <strong className="text-foreground">pay-per-lead</strong> model — you only pay when a real customer reaches out about your property.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-card rounded-2xl border border-border p-8 flex flex-col h-full">
            <div className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Standard Listing</h2>
              
            </div>
            <div className="flex-1 mb-8">
              <PlanFeature text="List up to 3 warehouse properties" included={true} />
              <PlanFeature text="Full listing page with specs, images and documents" included={true} />
              <PlanFeature text="Listing completeness score" included={true} />
              <PlanFeature text="Appear in platform search and browse" included={true} />
              <PlanFeature text="Basic analytics (views count)" included={true} />
              <PlanFeature text="Community access" included={true} />
              <PlanFeature text="ROI and commercial calculators" included={true} />
              <PlanFeature text="Lead contact details" included={false} />
              <PlanFeature text="Respond to customer leads" included={false} />
              <PlanFeature text="Submit proposals to active demands" included={false} />
              <PlanFeature text="Priority listing approval" included={false} />
            </div>
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-semibold">
                  <Building2 className="mr-2 h-4 w-4" /> Go to My Listings
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-semibold" onClick={() => setIsLoginOpen(true)}>
                Get Started Free
              </Button>
            )}
          </div>

          <div className="bg-card rounded-2xl border-2 border-primary p-8 flex flex-col h-full relative shadow-lg shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold shadow-sm">
                Recommended
              </Badge>
            </div>
            <div className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Pay For Purpose</h2>
              <p className="text-muted-foreground text-sm mt-1">Only pay when you get a real enquiry</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-black text-primary">₹5,000</span>
                <span className="text-muted-foreground mb-2 text-sm">per lead</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
                No monthly commitment. Pay only when a verified customer enquiry comes in for your property.
              </p>
            </div>
            <div className="flex-1 mb-8">
              <PlanFeature text="Everything in Free Listing" included={true} />
              <PlanFeature text="Full lead contact details (name, phone, email)" included={true} />
              <PlanFeature text="Acknowledge and respond to customer leads" included={true} />
              <PlanFeature text="Submit proposals to active demands" included={true} />
              <PlanFeature text="Detailed analytics (views, downloads, companies)" included={true} />
              <PlanFeature text="Priority listing approval within 24 hrs" included={true} />
              <PlanFeature text="Negotiation board access" included={true} />
              <PlanFeature text="Dedicated O2O support for deal facilitation" included={true} />
              <PlanFeature text="Zero brokerage on closed deals" included={true} />
            </div>
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20the%20Pay%20Per%20Lead%20plan%20on%20ORS-ONE" target="_blank" rel="noopener noreferrer">
              <Button className="w-full rounded-xl h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                <WhatsAppIcon className="mr-2" /> Talk to Us
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-2">How Pay Per Lead Works</h2>
          <p className="text-muted-foreground text-center text-sm mb-10">Simple, fair, and completely transparent</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'List your property', desc: 'Add your warehouse with specs, images, location and documents. Completely free.' },
              { step: '02', title: 'Customer enquires', desc: 'A verified customer submits a demand or expresses interest in your property.' },
              { step: '03', title: 'We notify you', desc: 'You get notified of the lead. We verify the enquiry before passing it to you.' },
              { step: '04', title: 'Pay and connect', desc: 'Pay Rs.5,000 to unlock the lead contact details and close the deal directly.' },
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-2xl border border-border p-6 relative">
                <span className="text-4xl font-black text-primary/10 absolute top-4 right-4">{item.step}</span>
                <h3 className="font-bold text-foreground text-sm mb-2 mt-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-primary/5 rounded-2xl border border-primary/10 p-10 text-center">
          <BadgeCheck className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-foreground mb-3">Why Property Providers Choose ORS-ONE</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            We built ORS-ONE to eliminate brokerage friction in industrial and warehousing real estate. You list, we find the customers, you close the deal directly with zero brokerage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'No monthly fees', desc: 'Never pay just to keep your listing live. Free listings stay live as long as you want.' },
              { title: 'Verified leads only', desc: 'Every customer enquiry is reviewed by our O2O team before being passed to you. No junk leads.' },
              { title: 'Zero brokerage', desc: 'Once you unlock the lead, deal directly with the customer. We take no commission on the transaction.' },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl border border-border p-5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-black text-foreground mb-3">Ready to list your warehouse?</h2>
          <p className="text-muted-foreground text-sm mb-6">Start for free. No credit card required.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Building2 className="mr-2 h-4 w-4" /> Create a Listing
                </Button>
              </Link>
            ) : (
              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setIsLoginOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" /> List Your Property Free
              </Button>
            )}
            <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20ORS-ONE%20pricing" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="h-12 px-8 rounded-xl font-semibold">
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
