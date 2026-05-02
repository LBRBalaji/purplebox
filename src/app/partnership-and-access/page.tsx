'use client';
import * as React from 'react';

export default function PartnershipAndAccessPage() {
  return (
    <main className="min-h-screen" style={{background:'#f4f2fb'}}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#6141ac'}}>ORS-ONE Platform</p>
          <h1 className="text-4xl font-bold mb-4" style={{color:'#1e1537',letterSpacing:'-0.5px',lineHeight:1.15}}>
            Partnership &amp; Access
          </h1>
          <p className="text-lg" style={{color:'#666',lineHeight:1.7}}>A Unified Environment for Industrial Transactions</p>
        </div>

        <div className="rounded-2xl p-8 mb-8" style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
          <p className="text-base leading-relaxed" style={{color:'rgba(255,255,255,0.8)',lineHeight:1.8}}>
            Drawing on two decades of specialized experience in the industrial sector, <span style={{color:'#fff',fontWeight:600}}>orsone.app</span> has been developed to facilitate a more efficient exchange between market participants. As a dedicated Digital Transaction Platform, it provides a structured environment for Brokers, Clients, and Developers to manage the professional lifecycle of warehouse leasing.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-7" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'hsl(259 44% 94%)'}}>
                <svg width="18" height="18" fill="none" stroke="#6141ac" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1" style={{color:'#1e1537'}}>Inaugural Membership</h2>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>Founding Phase</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{color:'#555',lineHeight:1.8}}>
              We are currently in the Founding Phase of the ORS-ONE ecosystem. To encourage the widespread adoption of this digital framework and ensure significant market participation, access is currently provided on an <strong>Inaugural Basis</strong>.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{color:'#555',lineHeight:1.8}}>
              This period allows our partners to integrate their portfolios and experience the operational benefits of the BCD model — from initial discovery to deal execution — as we build the foundation of the marketplace.
            </p>
          </div>

          <div className="rounded-2xl p-7" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
            <div className="flex items-start gap-4 mb-5">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#f0fdf4'}}>
                <svg width="18" height="18" fill="none" stroke="#15803d" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 className="text-lg font-bold mt-1" style={{color:'#1e1537'}}>Continuity &amp; Evolution</h2>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{color:'#555',lineHeight:1.8}}>
              To support the long-term technical advancement and integrity of the platform, our participation model is designed to align with the value provided to each stakeholder:
            </p>
            <div className="space-y-3">
              {[
                {title:'Foundational Listings', body:'To maintain a transparent and verified marketplace, the ability to list property inventory will remain a primary utility for Developers.', bg:'hsl(259 30% 97%)'},
                {title:'The Digital Transaction Suite', body:'As the ecosystem matures, professional access to specialized engagement tools — including Customer-Developer Connect, the Negotiation Board, Commercial Term Sheet, and MoU modules — will transition to a membership-based structure.', bg:'hsl(259 30% 97%)'},
                {title:'Platform Maintenance', body:'A standard fee will be implemented to ensure the continuous security, hosting, and technical support of the digital workspace.', bg:'hsl(259 30% 97%)'},
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl" style={{background:item.bg}}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:'#6141ac'}}>
                    <span style={{color:'#fff',fontSize:'10px',fontWeight:700}}>{i+1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{color:'#1e1537'}}>{item.title}</p>
                    <p className="text-sm" style={{color:'#666',lineHeight:1.7}}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-7" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#fffbeb'}}>
                <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-lg font-bold mt-1" style={{color:'#1e1537'}}>Institutional Continuity</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{color:'#555',lineHeight:1.8}}>
              Any transition from the current Inaugural Access to a commercial membership model will be preceded by a <strong>90-day notice period</strong>. This ensures that our partners have sufficient foresight for institutional and budgetary planning.
            </p>
            <div className="mt-5 p-4 rounded-xl flex items-start gap-3" style={{background:'hsl(259 44% 94%)',border:'1px solid hsl(259 44% 86%)'}}>
              <svg className="flex-shrink-0 mt-0.5" width="16" height="16" fill="none" stroke="#6141ac" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-sm" style={{color:'#3b2870',lineHeight:1.7}}>
                Partners who join during this phase will be recognised with <strong>Charter Status</strong>, ensuring continuity and preferred consideration as the marketplace evolves.
              </p>
            </div>
          </div>

          <div className="text-center pt-4 pb-8">
            <p className="text-xs" style={{color:'#aaa'}}>
              Questions? Contact <a href="mailto:balaji@lakshmibalajio2o.com" style={{color:'#6141ac',textDecoration:'underline'}}>balaji@lakshmibalajio2o.com</a>
            </p>
            <p className="text-xs mt-2" style={{color:'#ccc'}}>Lakshmi Balaji ORS Private Limited · Building Transaction Ready Assets</p>
          </div>
        </div>
      </div>
    </main>
  );
}
