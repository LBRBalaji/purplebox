'use client';
import * as React from 'react';
import Link from 'next/link';
import { Building2, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { LoginDialog } from '@/components/login-dialog';

const WhatsAppIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isProvider = user?.role === 'Warehouse Developer';
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-20 text-center max-w-3xl">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-5 text-xs px-4 py-1.5 rounded-full tracking-wide">
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-black text-foreground tracking-tight mb-5 leading-tight">
            Reduce Vacancy.<br />Lease Faster.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            No monthly fees. No subscriptions. You only pay when a real customer reaches out about your property.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="rounded-2xl overflow-hidden border border-border flex flex-col md:flex-row">
          <div className="flex-1 bg-card p-10 flex flex-col border-b md:border-b-0 md:border-r border-border">
            <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">Standard</div>
            <div className="text-3xl font-black text-foreground mb-2">Standard Listing</div>
            <div className="text-sm text-muted-foreground mb-8">Let's Grow Together</div>
            <div className="border-t border-border pt-6 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">No listing fee</span>
            </div>
            <div className="mt-auto">
              {isProvider ? (
                <Link href="/dashboard?tab=my-listings&createNew=true">
                  <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-bold">
                    <Building2 className="mr-2 h-4 w-4" /> Go to My Listings
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-bold" onClick={() => setIsLoginOpen(true)}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 p-10 flex flex-col relative" style={{background: 'hsl(259 25% 11%)'}}>
            <div className="absolute top-0 right-8 bg-primary text-primary-foreground text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-b-xl">
              Recommended
            </div>
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{color: '#9b7ee0'}}>Pay For Purpose</div>
            <div className="text-3xl font-black mb-2" style={{color: '#ffffff'}}>Pay For Purpose</div>
            <div className="text-sm mb-8" style={{color: '#9b7ee0'}}>Connect with Every Prospect — From Every City</div>
            <div className="pt-6 mb-8" style={{borderTop: '1px solid hsl(259 25% 22%)'}}>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black" style={{color: '#8b68d4'}}>&#8377;5,000</span>
                <span className="text-sm" style={{color: '#7a60b8'}}>per lead</span>
              </div>
            </div>
            <div className="mt-auto">
              <Link href="https://wa.me/919841098170?text=I%20want%20to%20know%20more%20about%20Pay%20For%20Purpose%20on%20ORS-ONE" target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-xl h-12 text-sm font-bold" style={{background: '#ffffff', color: '#6141ac'}}>
                  <WhatsAppIcon className="mr-2" /> Talk to Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-2">How Pay For Purpose Works</h2>
            <p className="text-muted-foreground text-sm">Four steps. No complexity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'List your property', desc: 'Add your warehouse with specs, images, location and documents. No listing fee. No setup cost.' },
              { step: '02', title: 'Customer enquires', desc: 'A verified customer submits a demand or expresses interest in your property.' },
              { step: '03', title: 'We notify you', desc: 'Only verified business profiles reach this stage — spam and fake enquiries are filtered at source.' },
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
        <div className="mt-24 rounded-3xl border border-primary/20 p-12 text-center bg-card">
          <h2 className="text-3xl font-black text-foreground mb-3">Ready to list your warehouse?</h2>
          <p className="text-muted-foreground text-sm mb-8">No listing fee. No commitment. Your property, your terms.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isProvider ? (
              <Link href="/dashboard?tab=my-listings&createNew=true">
                <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Building2 className="mr-2 h-4 w-4" /> Create a Listing
                </Button>
              </Link>
            ) : (
              <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setIsLoginOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" /> List Your Property
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
