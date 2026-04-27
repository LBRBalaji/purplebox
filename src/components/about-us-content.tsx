'use client';
import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Download, Users, ClipboardCheck, Award, Zap, ShieldCheck, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-black text-foreground leading-none">{value}</div>
    <div className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">{label}</div>
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
      <div className="h-12 w-12 rounded-full flex items-center justify-center text-foreground text-xs font-black flex-shrink-0" style={{ background: accent }}>{year}</div>
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
    <div className="p-5 text-foreground flex items-center gap-3" style={{ background: color }}>
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

// VideoStrip: autoplay iframe on desktop, tap-to-play poster on mobile
// iOS blocks autoplay on iframes — we show a YouTube thumbnail with play button
// that opens the video directly in YouTube when tapped
function VideoStrip() {
  const [playing, setPlaying] = React.useState(false);
  const FIRST_ID = 'm4kQF4LZPXA';
  const PLAYLIST = 'FVnvTYpESrI,hm6gBairx-M,l7j_Cjs9c24';
  const thumbUrl = `https://img.youtube.com/vi/${FIRST_ID}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${FIRST_ID}?playlist=${PLAYLIST}&autoplay=1&mute=1&loop=1&rel=0&modestbranding=1&controls=1`;
  const mobileUrl = `https://www.youtube.com/watch?v=${FIRST_ID}&list=${PLAYLIST}`;

  return (
    <div style={{position:'relative',width:'100%',paddingBottom:'42%',background:'#000',minHeight:200}}>
      {playing ? (
        <iframe
          src={embedUrl}
          title="ORS-ONE Platform in Action"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}
        />
      ) : (
        <>
          {/* Thumbnail poster */}
          <img
            src={thumbUrl}
            alt="ORS-ONE Platform in Action"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}
          />
          {/* Dark overlay */}
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)'}} />
          {/* Desktop: click to play inline */}
          <button
            onClick={() => setPlaying(true)}
            className="hidden md:flex"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',background:'transparent',border:'none',cursor:'pointer',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
            <div style={{width:64,height:64,background:'rgba(97,65,172,0.9)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <p style={{color:'#fff',fontSize:13,fontWeight:600,letterSpacing:'.03em'}}>Watch Platform Demo</p>
          </button>
          {/* Mobile: tap opens YouTube app directly */}
          <a
            href={mobileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex md:hidden"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,textDecoration:'none'}}>
            <div style={{width:64,height:64,background:'rgba(97,65,172,0.9)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <p style={{color:'#fff',fontSize:13,fontWeight:600,letterSpacing:'.03em'}}>Watch on YouTube</p>
          </a>
        </>
      )}
    </div>
  );
}

const VIDEO_CLIPS = [
  {
    id: 'clip-a',
    label: 'Clip A — Instant Download',
    youtubeId: 'l7j_Cjs9c24',
    title: 'Warehouse-Technical-Compliance-Commercials, in a single Excel',
    desc: 'Search for a warehouse, filter by corridor, and download the complete Technical Excel in one click. The #1 requirement identified in our market study.',
  },
  {
    id: 'clip-b',
    label: 'Clip B — One Connect',
    youtubeId: 'FVnvTYpESrI',
    title: 'Registering an Off-Platform Deal on ORS-ONE',
    desc: 'List excess warehouse space of Logistics Players and Manufacturers directly on the platform.',
  },
  {
    id: 'clip-c',
    label: 'Clip C — Build Transaction',
    youtubeId: 'm4kQF4LZPXA',
    title: 'Negotiation Board, Term Sheet & TI Tracker',
    desc: 'Negotiation Board, Commercial Term Sheet creation, and the Tenant Improvement (Fit-Out) tracker — all in one workspace.',
  },
  {
    id: 'walkthrough',
    label: 'Full Walkthrough (2:45)',
    youtubeId: 'hm6gBairx-M',
    title: 'Complete Platform Walkthrough',
    desc: 'End-to-end walkthrough of ORS-ONE — from sourcing to possession.',
  },
];

function VideoTabs() {
  const [active, setActive] = React.useState('clip-a');
  const clip = VIDEO_CLIPS.find(v => v.id === active)!;
  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {VIDEO_CLIPS.map(v => (
          <button key={v.id} onClick={() => setActive(v.id)}
            style={{
              padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', borderRadius:0,
              background: active === v.id ? '#6141ac' : 'rgba(255,255,255,.07)',
              color: active === v.id ? '#fff' : 'rgba(255,255,255,.5)',
              border: active === v.id ? '0.5px solid #6141ac' : '0.5px solid rgba(255,255,255,.1)',
            }}>
            {active === v.id && <span style={{marginRight:6}}>●</span>}{v.label}
          </button>
        ))}
      </div>
      {/* Video embed */}
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:16}} className="md:grid-cols-3">
        <div className="md:col-span-2" style={{background:'#000',aspectRatio:'16/9',position:'relative'}}>
          <iframe
            key={clip.youtubeId}
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${clip.youtubeId}?si=autoplay&rel=0`}
            title={clip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}
          />
        </div>
        <div style={{padding:'0 0 0 8px'}}>
          <p style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:8,lineHeight:1.4}}>{clip.title}</p>
          <p style={{fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.6,marginBottom:16}}>{clip.desc}</p>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {VIDEO_CLIPS.filter(v => v.id !== active).map(v => (
              <button key={v.id} onClick={() => setActive(v.id)}
                style={{textAlign:'left',padding:'8px 10px',background:'rgba(255,255,255,.05)',border:'0.5px solid rgba(255,255,255,.1)',cursor:'pointer',borderRadius:0}}>
                <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.6)',margin:0}}>{v.label}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,.35)',margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutUsContent() {
  return (
    <div className="flex-grow flex flex-col font-sans bg-background">
      <section className="py-16 md:py-24" style={{background:'hsl(259 30% 97%)'}}>
        <div className="container mx-auto px-4">

          {/* Top label */}
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color:'hsl(259 15% 55%)'}}>lease.orsone.app</p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{color:'#1e1537',letterSpacing:'-0.5px',lineHeight:1.1}}>
            Warehouse &amp; Industrial Building<br className="hidden md:block" /> Sourcing Platform
          </h1>

          {/* Category pill */}
          <div className="inline-flex items-center mb-5">
            <span className="text-xs font-bold tracking-widest uppercase px-3 py-1" style={{background:'#6141ac',color:'#fff',letterSpacing:'.08em'}}>Industrial</span>
          </div>

          {/* Quote */}
          <blockquote className="border-l-4 pl-4 mb-6 max-w-2xl" style={{borderColor:'#6141ac'}}>
            <p className="text-base italic" style={{color:'#1e1537'}}>"Warehouse supply and developers are accessible to a limited few. ORS-ONE makes them aggregated and accessible to everyone."</p>
          </blockquote>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-10 max-w-2xl" style={{color:'hsl(259 15% 40%)'}}>
            From first search to possession — a structured, end-to-end transaction system for warehouse and industrial buildings. Start sourcing instantly. Get a quote. Build professional term sheets. Execute MoUs. Track tenant improvements. Take possession.
          </p>

          {/* Transaction flow */}
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{color:'hsl(259 15% 55%)'}}>Source to Possession — The Complete Transaction Flow</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                {n:'1', title:'Instant Sourcing', body:'Access aggregated warehouse supply and complete technical data immediately.'},
                {n:'2', title:'Get Quote', body:'Connect directly with developers. Receive commercial terms at your dashboard.'},
                {n:'3', title:'Build Term Sheets', body:'Generate professional commercial term sheets using our structured system.'},
                {n:'4', title:'Execute MoU', body:'Finalise agreements within a unified virtual transaction board.'},
                {n:'5', title:'Track TI', body:'Monitor site readiness and tenant improvement progress in real time.'},
                {n:'6', title:'Take Possession', body:'Close the gap between signing the lease and starting operations.'},
              ].map((step) => (
                <div key={step.n} className="p-4" style={{background:'#fff',border:'0.5px solid hsl(259 30% 88%)'}}>
                  <div className="w-7 h-7 flex items-center justify-center text-xs font-black text-white mb-3" style={{background:'#1e1537',borderRadius:0}}>
                    {step.n}
                  </div>
                  <p className="text-sm font-bold mb-1" style={{color:'#1e1537'}}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{color:'hsl(259 15% 50%)'}}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{border:'0.5px solid hsl(259 30% 88%)'}}>
            {/* Direct Deal */}
            <div className="p-6" style={{background:'#fff',borderRight:'0.5px solid hsl(259 30% 88%)'}}>
              <p className="text-3xl font-black mb-1" style={{color:'#1e1537'}}>10.4M</p>
              <p className="text-xs mb-4" style={{color:'hsl(259 15% 55%)'}}>sq ft — Direct Deal</p>
              <p className="text-lg font-bold mb-2" style={{color:'#1e1537'}}>Direct Deal</p>
              <p className="text-sm leading-relaxed mb-5" style={{color:'hsl(259 15% 45%)'}}>Browse verified listings and negotiate directly with developers on your terms.</p>
              <a href="/listings" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2" style={{border:'1.5px solid #1e1537',color:'#1e1537',textDecoration:'none'}}>Browse Listings →</a>
            </div>
            {/* ORS Transact */}
            <div className="p-6" style={{background:'#1e1537',borderRight:'0.5px solid hsl(259 30% 30%)'}}>
              <p className="text-3xl font-black mb-1" style={{color:'#fff'}}>242.9M</p>
              <p className="text-xs mb-4" style={{color:'rgba(255,255,255,.5)'}}>sq ft — ORS Transact</p>
              <p className="text-lg font-bold mb-2" style={{color:'#fff'}}>ORS Transact</p>
              <p className="text-sm leading-relaxed mb-5" style={{color:'rgba(255,255,255,.6)'}}>Facilitated transaction management from quote to keys. ORS manages the full process.</p>
              <a href="/ors-transact" className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2" style={{background:'#6141ac',color:'#fff',textDecoration:'none'}}>Explore Pipeline →</a>
            </div>
            {/* Stats */}
            <div className="p-6 flex flex-col justify-center" style={{background:'#fff'}}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-black" style={{color:'#1e1537'}}>20+</p>
                  <p className="text-xs leading-tight mt-1" style={{color:'hsl(259 15% 55%)'}}>Years domain expertise</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{color:'#1e1537'}}>3.5M+</p>
                  <p className="text-xs leading-tight mt-1" style={{color:'hsl(259 15% 55%)'}}>Sq ft transacted</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{color:'#1e1537'}}>242.9M</p>
                  <p className="text-xs leading-tight mt-1" style={{color:'hsl(259 15% 55%)'}}>Sq ft aggregated</p>
                </div>
              </div>
              <a href="https://lease.orsone.app" className="text-xs font-semibold mt-6 inline-flex items-center gap-1" style={{color:'#6141ac',textDecoration:'none'}}>Open lease.orsone.app →</a>
            </div>
          </div>

        </div>
      </section>

      {/* Auto-run video strip — desktop autoplays, mobile shows poster + tap to play */}
      <section style={{background:'#0d0d0d',padding:'0'}}>
        <div style={{maxWidth:'100%',margin:0}}>
          <VideoStrip />
          {/* Clip labels strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',background:'#111'}} className="md:grid-cols-4">
            {[
              {n:'01', title:'Negotiation Board', sub:'Term Sheet & TI Tracker'},
              {n:'02', title:'Off-Platform Deal', sub:'Register on ORS-ONE'},
              {n:'03', title:'List Excess Space', sub:'Logistics & Manufacturers'},
              {n:'04', title:'Single Excel', sub:'Technical · Compliance · Commercials'},
            ].map((c,i) => (
              <div key={i} style={{padding:'10px 14px',borderRight:'0.5px solid rgba(255,255,255,.08)',borderBottom:'0.5px solid rgba(255,255,255,.05)'}}>
                <p style={{fontSize:9,fontWeight:700,color:'#6141ac',letterSpacing:'.08em',margin:'0 0 2px'}}>{c.n}</p>
                <p style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.85)',margin:'0 0 1px'}}>{c.title}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,.4)',margin:0}}>{c.sub}</p>
              </div>
            ))}
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

      {/* Video section */}
      <section className="py-16 md:py-20" style={{background:'#0d0d0d'}}>
        <div className="container mx-auto px-4">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{color:'#6141ac',letterSpacing:'.1em'}}>● Platform in Action</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{color:'#fff'}}>
            See ORS-ONE <span style={{color:'#6141ac'}}>Live.</span>
          </h2>
          <p className="text-sm mb-8 max-w-lg" style={{color:'rgba(255,255,255,.5)'}}>
            Three moments that show you exactly how the platform works — sourcing a warehouse, finding a family connection, and building a transaction.
          </p>

          {/* Tab selector */}
          <VideoTabs />
        </div>
      </section>

      <section className="py-20" style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{color:'#ffffff'}}>Ready to <span style={{color:'#c5b8e8'}}>Reach the Market?</span></h2>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{color:'rgba(255,255,255,0.7)'}}>Whether you are searching for a warehouse, listing a property, or building an agent network — your journey starts here.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-bold px-8 rounded-xl" style={{background:'#6141ac',color:'#ffffff'}}>
              <Link href="/">Browse Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold px-8 rounded-xl" style={{borderColor:'rgba(255,255,255,0.3)',color:'#ffffff',background:'transparent'}}>
              <Link href="/signup">Become a Transaction Partner <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="text-xs mt-10" style={{color:'rgba(255,255,255,0.35)'}}>Lakshmi Balaji ORS Private Limited · lease.orsone.app · Building Transaction Ready Assets</p>
        </div>
      </section>
    </div>
  );
}
