
'use client';

import * as React from 'react';

export function HowItWorksSection() {

    React.useEffect(() => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.2 });
        timelineItems.forEach(item => { observer.observe(item); });
        
        return () => {
            timelineItems.forEach(item => { observer.unobserve(item); });
        };
    }, []);

  return (
    <>
      <style jsx>{`
        #how-it-works-container {
            font-family: 'Inter', sans-serif;
            background-color: #1e3a5f; /* Primary navy blue */
            color: #FFFFFF; /* Secondary white */
            position: relative;
            overflow: hidden;
        }
        :root {
            --color-primary: #0a2342;
            --color-secondary: #FFFFFF;
            --color-accent: #2ca58d; /* Teal/Aqua */
            --color-highlight: #ffb600; /* Gold/Orange */
        }
        .timeline-item {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .timeline-item.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .timeline-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 3px;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.15);
            z-index: 1;
        }
        .clipboard-outline { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw-in 2s ease-out forwards; }
        .clipboard-checkmark { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw-in 1s ease-out 1s forwards; }
        .is-visible .clipboard-outline, .is-visible .clipboard-checkmark { animation-play-state: running; }
        @keyframes draw-in { to { stroke-dashoffset: 0; } }
        .network-pulse { animation: pulse 2s infinite ease-in-out; }
        .is-visible .network-pulse { animation-play-state: running; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.7; } }
        .dashboard-card { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .is-visible .dashboard-card-1 { transition-delay: 0.3s; }
        .is-visible .dashboard-card-2 { transition-delay: 0.5s; }
        .is-visible .dashboard-card-3 { transition-delay: 0.7s; }
        .is-visible .dashboard-card { opacity: 1; transform: translateY(0); }
        .handshake-left, .handshake-right { transform: translateX(-100%); transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
        .handshake-right { transform: translateX(100%); }
        .is-visible .handshake-left, .is-visible .handshake-right { transform: translateX(0); }
        .handshake-circle { stroke-dasharray: 1000; stroke-dashoffset: 250; transition: stroke-dashoffset 1s ease-out 0.8s; }
        .is-visible .handshake-circle { stroke-dashoffset: 0; }
      `}</style>
      <div id="how-it-works-container" className="antialiased">
        <div className="text-center py-16 px-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{color: "var(--color-highlight)"}}>Warehouse Origin-Source Warehouse</h1>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">How It Works</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
                Our streamlined process transforms a complex search into a simple, confident journey. We connect your precise needs with our exclusive network to deliver unparalleled results.
            </p>
        </div>

        <div className="relative container mx-auto px-6 py-12">
            <div className="timeline-container relative">
                
                <div className="timeline-item mb-16 flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-5/12">
                        <div className="bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-6">
                                <span className="text-6xl font-bold text-white/50">01</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Define Your Need.</h3>
                                    <p className="font-semibold" style={{color: "var(--color-accent)"}}>One form, ten minutes, unlocks the entire market.</p>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-300">
                                Our intelligent, guided form makes it simple to capture your precise operational requirements—from ceiling height and dock doors to power load and location strategy. Submit your needs confidently in a single, secure step.
                            </p>
                        </div>
                    </div>
                    <div className="w-2/12 hidden md:flex justify-center">
                        <div className="w-12 h-12 bg-white rounded-full z-10 flex items-center justify-center shadow-2xl">
                            <svg className="w-7 h-7" style={{color: "var(--color-primary)"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path className="clipboard-outline" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect className="clipboard-outline" x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                <path className="clipboard-checkmark" d="m9 14 2 2 4-4"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="w-full md:w-5/12"></div>
                </div>

                <div className="timeline-item mb-16 flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-5/12 order-1 md:order-3">
                        <div className="bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-6 md:justify-end">
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold text-white mb-1">Activate Our Network.</h3>
                                    <p className="font-semibold" style={{color: "var(--color-accent)"}}>Your requirement is confidentially routed to our vetted network.</p>
                                </div>
                                <span className="text-6xl font-bold text-white/50">02</span>
                            </div>
                            <p className="mt-4 text-gray-300 text-right">
                                We don't list properties; we query partners. Your anonymized requirement is instantly sent to our exclusive network of developers in key industrial corridors like Sriperumbudur and Oragadam.
                            </p>
                        </div>
                    </div>
                    <div className="w-2/12 hidden md:flex justify-center order-2">
                        <div className="w-12 h-12 bg-white rounded-full z-10 flex items-center justify-center shadow-2xl">
                            <svg className="w-7 h-7" style={{color: "var(--color-primary)"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" className="network-pulse" style={{fill: "var(--color-accent)", stroke: "none"}}></circle>
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="w-full md:w-5/12 order-3 md:order-1"></div>
                </div>

                <div className="timeline-item mb-16 flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-5/12">
                        <div className="bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-6">
                                <span className="text-6xl font-bold text-white/50">03</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Receive Curated Options.</h3>
                                    <p className="font-semibold" style={{color: "var(--color-accent)"}}>No noise. Just 3-5 qualified, actionable proposals.</p>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-300">
                                Forget sifting through hundreds of unsuitable listings. You'll receive a concise shortlist from serious developers who have confirmed their ability to meet your needs. Compare clear, 'apples-to-apples' options in one place.
                            </p>
                        </div>
                    </div>
                    <div className="w-2/12 hidden md:flex justify-center">
                        <div className="w-12 h-12 bg-white rounded-full z-10 flex items-center justify-center shadow-2xl">
                            <svg className="w-7 h-7" style={{color: "var(--color-primary)"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                               <path className="dashboard-card dashboard-card-1" d="M7 8h10" style={{stroke: "var(--color-highlight)", strokeWidth: "3"}}></path>
                               <path className="dashboard-card dashboard-card-2" d="M7 12h10" style={{stroke: "var(--color-accent)", strokeWidth: "3"}}></path>
                               <path className="dashboard-card dashboard-card-3" d="M7 16h5" style={{stroke: "var(--color-primary)", strokeWidth: "3"}}></path>
                            </svg>
                        </div>
                    </div>
                    <div className="w-full md:w-5/12"></div>
                </div>

                <div className="timeline-item mb-16 flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-5/12 order-1 md:order-3">
                        <div className="bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-6 md:justify-end">
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold text-white mb-1">Close with Confidence.</h3>
                                    <p className="font-semibold" style={{color: "var(--color-accent)"}}>Our experts guide you from shortlisting to signing.</p>
                                </div>
                                <span className="text-6xl font-bold text-white/50">04</span>
                            </div>
                            <p className="mt-4 text-gray-300 text-right">
                               This is where our expertise makes the difference. Our team provides hands-on advisory for site visits, technical due diligence, and commercial negotiations, ensuring you secure the ideal space at the most competitive terms.
                            </p>
                        </div>
                    </div>
                    <div className="w-2/12 hidden md:flex justify-center order-2">
                        <div className="w-12 h-12 bg-white rounded-full z-10 flex items-center justify-center shadow-2xl overflow-hidden">
                            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                               <circle className="handshake-circle" cx="16" cy="16" r="14" stroke="var(--color-accent)" strokeWidth="2.5"></circle>
                               <g clipPath="url(#clip0_105_2)">
                                   <path className="handshake-left" d="M12.48,19.99 C10.93,18.82 10,17.01 10,15 C10,11.69 12.69,9 16,9 C17.01,9 17.93,9.25 18.75,9.68" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                   <path className="handshake-right" d="M19.52,12.01 C21.07,13.18 22,14.99 22,17 C22,20.31 19.31,23 16,23 C14.99,23 14.07,22.75 13.25,22.32" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                   <path className="handshake-left" d="M4.5,15.5 L12.48,19.99" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                   <path className="handshake-right" d="M27.5,16.5 L19.52,12.01" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                               </g>
                               <defs><clipPath id="clip0_105_2"><rect width="32" height="32" fill="white"/></clipPath></defs>
                            </svg>
                        </div>
                    </div>
                    <div className="w-full md:w-5/12 order-3 md:order-1"></div>
                </div>

            </div>
        </div>
        
        <div className="h-48"></div>
    </div>
    </>
  );
}
