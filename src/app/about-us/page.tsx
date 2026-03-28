'use client';
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Download, Users, ClipboardCheck, Award, Zap, ShieldCheck, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-black text-primary-foreground leading-none">{value}</div>
    <div className="text-sm text-primary-foreground/70 mt-2 font-medium tracking-wide">{label}</div>
  </div>
);

const Pillar = ({ icon: Icon, title, body }) => (
  <div className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary hover:shadow-xl transition-all duration-300">
    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
      <Icon className="h-6 w-6 text-primary group-hover:text-primary transition-colors" />
    </div>
    <h3 className="text-lg font-bold text-primary mb-3">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
  </div>
);

const TimelineItem = ({ year, title, body, accent }) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground text-xs font-black flex-shrink-0" style={{ background: accent }}>{year}</div>
      <div className="w-0.5 bg-slate-200 flex-1 mt-3" />
    </div>
    <div className="pb-10">
      <h4 className="text-lg font-bold text-primary mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
    </div>
  </div>
);

const StakeholderCard = ({ label, icon: Icon, points, color }) => (
  <div className="rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow">
    <div className="p-5 text-primary-foreground flex items-center gap-3" style={{ background: color }}>
      <Icon className="h-5 w-5" />
      <span className="font-bold tracking-wide text-sm uppercase">{label}</span>
    </div>
    <div className="bg-card p-6 space-y-3">
      {points.map((pt, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + '20' }}>
            <div className="h-2 w-2 rounded-full" style={{ background: color }} />
          </div>
          <p className="text-foreground/80 text-sm leading-snug">{pt}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function AboutUsPage() {
  return (
    <div className="flex-grow flex flex-col font-sans bg-background">
      <section className="bg-primary py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6141ac 0%, transparent 60%), radial-gradient(circle at 80% 20%, #5B3FA8 0%, transparent 50%)' }} />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-primary text-xs font-bold tracking-widest uppercase">About ORS-ONE</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-tight mb-6">
              Building Transaction
              <span className="block text-primary">Ready Assets.</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              India's dedicated marketplace for industrial warehouse leasing — connecting developers, tenants and brokers on one transparent platform.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-primary-foreground/10 pt-12">
            <Stat value="68+" label="Verified Listings" />
            <Stat value="20+" label="Years of Domain Expertise" />
            <Stat value="3.5M+" label="Sq Ft Transacted" />
            <Stat value="1" label="Platform. All Stakeholders." />
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight mb-6">
                Not a Database. Not a Portal.
                <span className="block text-primary">A Marketplace.</span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">After 15 years of studying the market — including building Followprop, aggregating 8,000+ warehouses — we discovered what the market truly needs.</p>
              <p className="text-muted-foreground text-base leading-relaxed">The market does not want a database of properties. It needs a marketplace — to source supplies, engage with stakeholders, and execute transactions from start to finish.</p>
              <p className="text-primary font-bold text-base mt-6">That insight became ORS-ONE.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Download, label: "Instant Download", sub: "#1 requirement identified in our market study" },
                { icon: Users, label: "Direct Connect", sub: "Developer to tenant — no information loss" },
                { icon: ClipboardCheck, label: "Execute the Deal", sub: "Negotiate, track and close on platform" },
                { icon: MapPin, label: "Reach the Market", sub: "Every agent, every city, every tenant" },
              ].map((item, i) => (
                <div key={i} className="bg-background rounded-xl p-5 border border-border">
                  <item.icon className="h-6 w-6 text-primary mb-3" />
                  <p className="font-bold text-primary text-sm">{item.label}</p>
                  <p className="text-muted-foreground/70 text-xs mt-1 leading-snug">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">The BCD Model</p>
            <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight">One Platform. Three Stakeholders. Complete Transaction.</h2>
            <p className="text-muted-foreground mt-4 text-base">Broker — Client — Developer. All connected, engaged and transacting on ORS-ONE.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <StakeholderCard label="B — Broker / Agent" icon={Users} color="#6141ac" points={["Access all verified warehouse listings in one place","Submit professional proposals instantly","Earn commissions on closed transactions","Any agent — any city — any sector"]} />
            <StakeholderCard label="C — Client / Tenant" icon={Building2} color="#6141ac" points={["Search, filter and find the right warehouse in minutes","Download complete specs instantly — no waiting","Compare listings side by side","Connect directly with developers — no broker filter"]} />
            <StakeholderCard label="D — Developer" icon={TrendingUp} color="#6141ac" points={["Reach tenants across every city — not just your network","Receive verified corporate leads only","Track views, downloads and enquiries per listing","Negotiate and close deals on the platform"]} />
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight">Built for Every Stage of the Transaction</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Pillar icon={Download} title="Instant Download" body="Download complete technical, commercial and compliance data for any listing in one click. The #1 requirement identified in our 2010-2024 market study." />
            <Pillar icon={ShieldCheck} title="Verified Listings" body="Every listing is reviewed and approved by ORS-ONE before going live. Standardised specs — building type, eave height, floor type, certifications and more." />
            <Pillar icon={MapPin} title="Location Intelligence" body="Google Maps integration with location circle grouping — Sriperumbudur, Karanodai, Thiruvallur, Mappedu and more. Find by corridor, not just city." />
            <Pillar icon={ClipboardCheck} title="Full Transaction Lifecycle" body="Negotiation board, lead management, tenant improvement tracking, document management and activity logs — everything to close the deal on platform." />
            <Pillar icon={Users} title="Community Platform" body="Industry discussions, market insights, events and stories — building a connected community of warehouse market professionals across India." />
            <Pillar icon={Zap} title="AI-Powered Insights" body="Predictive demand trend analytics powered by Google Gemini AI. Understand where warehouse demand is heading before the market does." />
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">The Story Behind ORS-ONE</p>
              <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight">20 Years in the Field. Built From Experience.</h2>
              <p className="text-muted-foreground mt-4 text-base">Not built in a lab — built from two decades of warehouse leasing transactions in Chennai.</p>
            </div>
            <TimelineItem year="2002" title="Lakshmi Balaji Realty — The Foundation" body="Started real estate broking specialising in industrial buildings and warehouse leasing in Chennai. Over 20+ years, successfully completed lease of over 3.5 million sq ft across Tamil Nadu." accent="#6141ac" />
            <TimelineItem year="2014" title="Followprop — First Digital Attempt" body="Built and operated Followprop — an online platform aggregating 8,000+ warehouses with detailed field inspection reports. A pioneering effort that taught us what the market truly responds to." accent="#6141ac" />
            <TimelineItem year="2019" title="Six Years of Deep Market Study" body="Conducted extensive research from 2010 to 2024. The finding was clear: the market does not want a database of aggregated warehouse supplies. It needs a marketplace — to source, engage and transact." accent="#6141ac" />
            <TimelineItem year="2025" title="ORS-ONE — The Marketplace is Born" body="Launched lease.orsone.app — India's dedicated warehouse leasing marketplace. Built on 20 years of domain expertise, 15 years of market study, and the lessons of Followprop." accent="#6141ac" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-4">Ready to <span className="text-primary">Reach the Market?</span></h2>
          <p className="text-primary-foreground/60 text-lg max-w-xl mx-auto mb-10">Whether you are searching for a warehouse, listing a property, or building an agent network — your journey starts here.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl">
              <Link href="/">Browse Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-card hover:text-primary font-bold px-8 rounded-xl bg-transparent">
              <Link href="/agent-signup">Become a Transaction Partner <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="text-primary-foreground/30 text-xs mt-10">Lakshmi Balaji ORS Private Limited  ·  lease.orsone.app  ·  Building Transaction Ready Assets</p>
        </div>
      </section>
    </div>
  );
}
