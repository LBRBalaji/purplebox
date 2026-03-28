const fs = require('fs');

const newResources = `'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Zap, ExternalLink, Search, ChevronRight, FileText, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const getTitle = (html) => {
  const h1 = html.match(/<h1[^>]*>(.*?)<\\/h1>/);
  const h2 = html.match(/<h2[^>]*>(.*?)<\\/h2>/);
  const match = h1 || h2;
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : 'Untitled Resource';
};

const getExcerpt = (html, len = 180) => {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
  return text.length > len ? text.substring(0, len) + '...' : text;
};

const EXTERNAL = [
  { category: 'Market Tools', items: [
    { title: 'Find Acre Price Using Plot Price', desc: 'Calculate land value per acre from plot price data', url: 'https://lakshmibalajio2o.blogspot.com/2025/02/find-acre-price-using-plot-price.html', icon: TrendingUp },
    { title: 'Land Transaction Profit / Loss Calculator', desc: 'Evaluate profit and loss on land transactions', url: 'https://lakshmibalajio2o.blogspot.com/2025/02/lates-calculator.html', icon: Zap },
    { title: 'Real Estate Investment ROI Calculator', desc: 'Calculate return on investment for warehouse assets', url: 'https://industrialusesites.blogspot.com/p/warehouse-investment-roi.html', icon: TrendingUp },
  ]},
  { category: 'Knowledge Hub', items: [
    { title: 'Regional Real Estate Insights', desc: 'Expert articles covering Chennai, Trichy, Madurai and Bengaluru markets', url: 'https://o2ohub.blogspot.com/p/o2o-knowledge-hub.html', icon: BookOpen },
    { title: 'LBR Handbook — Agent Training Manual', desc: 'A comprehensive training manual for real estate transaction partners', url: 'https://drive.google.com/file/d/1RP0z70_XRHoZ7Lu1UKjNyxqnpZbvApwH/view', icon: FileText },
  ]},
];

const PLATFORM_TOOLS = [
  { title: 'Investment ROI Calculator', desc: 'Warehouse investment return analysis', href: '/roi-calculator', icon: TrendingUp, color: '#065A82' },
  { title: 'Area & Commercials Calculator', desc: 'Calculate chargeable area and rent', href: '/commercial-calculator', icon: Zap, color: '#2D6A4F' },
  { title: 'Registration Charges Calculator', desc: 'Estimate property registration costs', href: '/registration-calculator', icon: FileText, color: '#7C3AED' },
  { title: 'Compare Listings', desc: 'Side-by-side listing comparison', href: '/listing-comparison', icon: Users, color: '#F18F01' },
];

const StatPill = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
    <Icon className="h-5 w-5 text-[#F18F01]" />
    <div><div className="text-white font-black text-lg leading-none">{value}</div><div className="text-white/60 text-xs mt-0.5">{label}</div></div>
  </div>
);

const ResourceCard = ({ post, index }) => {
  const title = getTitle(post.text);
  const excerpt = getExcerpt(post.text);
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <Link href={'/community/' + post.id} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-[#F18F01]/30 transition-all duration-300">
        {post.imageUrl && (
          <div className="relative h-40 overflow-hidden">
            <Image src={post.imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-lg bg-[#0D1F3C] text-white text-xs font-black flex items-center justify-center flex-shrink-0">{index + 1}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#065A82]"><BookOpen className="h-3 w-3" />Learn</span>
          </div>
          <h3 className="font-bold text-[#0D1F3C] text-sm mb-2 leading-snug group-hover:text-[#F18F01] transition-colors line-clamp-2">{title}</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">{excerpt}</p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">{dateStr}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#0D1F3C] group-hover:text-[#F18F01] transition-colors">Read <ArrowRight className="h-3 w-3" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ExternalCard = ({ title, desc, url, icon: Icon }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 bg-white rounded-xl p-4 border border-slate-100 hover:border-[#F18F01]/30 hover:shadow-md transition-all duration-300">
    <div className="h-10 w-10 rounded-xl bg-[#F18F01]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F18F01]/20 transition-colors">
      <Icon className="h-5 w-5 text-[#F18F01]" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[#0D1F3C] text-sm mb-1 group-hover:text-[#F18F01] transition-colors">{title}</h4>
      <p className="text-slate-400 text-xs leading-snug">{desc}</p>
    </div>
    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-[#F18F01] transition-colors flex-shrink-0 mt-0.5" />
  </a>
);

const ToolCard = ({ title, desc, href, icon: Icon, color }) => (
  <Link href={href} className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300">
    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[#0D1F3C] text-sm mb-0.5">{title}</h4>
      <p className="text-slate-400 text-xs">{desc}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0D1F3C] transition-colors" />
  </Link>
);

const TocItem = ({ index, title, id }) => (
  <a href={'#resource-' + id} className="group flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0 hover:text-[#F18F01] transition-colors">
    <span className="h-5 w-5 rounded bg-[#0D1F3C]/5 text-[#0D1F3C] text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#F18F01]/10 group-hover:text-[#F18F01] transition-colors">{index + 1}</span>
    <span className="text-sm text-slate-600 group-hover:text-[#F18F01] transition-colors leading-snug">{title}</span>
  </a>
);

export default function ResourcesPage() {
  const { communityPosts, isLoading } = useData();
  const [search, setSearch] = React.useState('');

  const learnPosts = React.useMemo(() =>
    communityPosts.filter(p => p.category === 'Learn').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [communityPosts]
  );

  const filtered = React.useMemo(() => {
    if (!search.trim()) return learnPosts;
    const q = search.toLowerCase();
    return learnPosts.filter(p => p.text.replace(/<[^>]+>/g, '').toLowerCase().includes(q) || getTitle(p.text).toLowerCase().includes(q));
  }, [learnPosts, search]);

  if (isLoading) return (
    <div className="container mx-auto p-8 space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <section className="bg-[#0D1F3C] pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #F18F01, transparent 50%), radial-gradient(circle at 90% 20%, #7C3AED, transparent 50%)' }} />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#F18F01]/10 border border-[#F18F01]/30 rounded-full px-4 py-1.5 mb-6">
              <div className="h-2 w-2 rounded-full bg-[#F18F01]" />
              <span className="text-[#F18F01] text-xs font-bold tracking-widest uppercase">ORS-ONE Resource Centre</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">Everything You Need.<span className="block text-[#F18F01]">All in One Place.</span></h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">Guides, tools, calculators and knowledge resources to help you source, evaluate and transact warehouse properties with confidence.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <StatPill icon={BookOpen} value={String(learnPosts.length)} label="Learning Guides" />
            <StatPill icon={Zap} value="3" label="Online Calculators" />
            <StatPill icon={FileText} value="2" label="Knowledge Hubs" />
            <StatPill icon={TrendingUp} value="3" label="Market Tools" />
          </div>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guides and resources..."
              className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F18F01]/50 transition-all" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-xl bg-[#065A82]/10 flex items-center justify-center"><BookOpen className="h-4 w-4 text-[#065A82]" /></div>
                <div><h2 className="font-black text-[#0D1F3C] text-lg">Learning Guides</h2><p className="text-slate-400 text-xs">Platform tutorials and how-to guides</p></div>
              </div>
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-600 mb-1">{search ? 'No results found' : 'No guides yet'}</h3>
                  <p className="text-slate-400 text-sm">{search ? 'No guides match your search' : 'Check back soon for platform guides.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filtered.map((post, i) => <div key={post.id} id={'resource-' + post.id}><ResourceCard post={post} index={i} /></div>)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-xl bg-[#F18F01]/10 flex items-center justify-center"><Zap className="h-4 w-4 text-[#F18F01]" /></div>
                <div><h2 className="font-black text-[#0D1F3C] text-lg">Platform Tools</h2><p className="text-slate-400 text-xs">Built-in calculators and comparison tools</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLATFORM_TOOLS.map((tool, i) => <ToolCard key={i} {...tool} />)}
              </div>
            </div>

            {EXTERNAL.map((group, gi) => (
              <div key={gi}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center"><ExternalLink className="h-4 w-4 text-[#2D6A4F]" /></div>
                  <div><h2 className="font-black text-[#0D1F3C] text-lg">{group.category}</h2><p className="text-slate-400 text-xs">External resources and guides</p></div>
                </div>
                <div className="space-y-3">{group.items.map((item, ii) => <ExternalCard key={ii} {...item} />)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {learnPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20">
                <div className="flex items-center gap-2 mb-4"><FileText className="h-4 w-4 text-[#F18F01]" /><h3 className="font-bold text-[#0D1F3C] text-sm">Table of Contents</h3></div>
                {learnPosts.map((post, i) => <TocItem key={post.id} index={i} title={getTitle(post.text)} id={post.id} />)}
              </div>
            )}
            <div className="bg-[#0D1F3C] rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[{label:'Browse Listings',href:'/'},{label:'Map Search',href:'/map-search'},{label:'Community',href:'/community'},{label:'About ORS-ONE',href:'/about-us'},{label:'Agent Signup',href:'/agent-signup'}].map((link, i) => (
                  <Link key={i} href={link.href} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0 group">
                    <span className="text-white/70 text-sm group-hover:text-[#F18F01] transition-colors">{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-[#F18F01] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-[#F18F01] rounded-2xl p-5 text-center">
              <BookOpen className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="font-black text-white text-base mb-2">Have Something to Share?</h3>
              <p className="text-white/80 text-xs mb-4">Post a guide or tutorial in the community for fellow industry professionals.</p>
              <Link href="/community" className="block bg-white text-[#F18F01] font-bold text-sm py-2.5 rounded-xl hover:bg-white/90 transition-colors">Go to Community</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/resources/page.tsx', newResources);
console.log('Done!');
