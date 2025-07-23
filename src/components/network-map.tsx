
'use client';

import * as React from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
    { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
    { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
    { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];

function Heatmap() {
    const map = useMap();
    const [heatmap, setHeatmap] = React.useState<google.maps.visualization.HeatmapLayer | null>(null);

    React.useEffect(() => {
        if (!map) return;

        const newHeatmap = new google.maps.visualization.HeatmapLayer({
            data: generateHeatmapData(),
            map: map,
        });

        newHeatmap.set("radius", 30);
        newHeatmap.set("opacity", 0.8);
        newHeatmap.set("gradient", [
            "rgba(0, 0, 0, 0)",
            "rgba(44, 165, 141, 1)",
            "rgba(103, 218, 196, 1)",
            "rgba(255, 182, 0, 1)",
        ]);

        setHeatmap(newHeatmap);

        return () => {
            if (heatmap) {
                heatmap.setMap(null);
            }
        };
    // The dependency array is empty because we only want to initialize the map and heatmap once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    function generateHeatmapData() {
        const points = [];
        const bounds = {
            sriperumbudur_kancheepuram: [79.85, 12.85, 80.05, 13.05],
            oragadam: [79.90, 12.80, 80.05, 12.90],
            thiruvallur_industrial: [79.9, 13.1, 80.1, 13.25],
            chengalpet_south: [79.9, 12.6, 80.1, 12.75],
            sholavaram: [80.15, 13.20, 80.25, 13.30],
            periyapalayam: [80.05, 13.28, 80.15, 13.35],
            uthiramerur: [79.70, 12.58, 79.80, 12.68],
        };
        addRandomPoints(points, bounds.sriperumbudur_kancheepuram, 300);
        addRandomPoints(points, bounds.oragadam, 350);
        addRandomPoints(points, bounds.thiruvallur_industrial, 250);
        addRandomPoints(points, bounds.chengalpet_south, 200);
        addRandomPoints(points, bounds.sholavaram, 180);
        addRandomPoints(points, bounds.periyapalayam, 150);
        addRandomPoints(points, bounds.uthiramerur, 120);
        return points;
    }

    function addRandomPoints(pointsArray: google.maps.LatLng[], bounds: number[], count: number) {
        for (let i = 0; i < count; i++) {
            const lng = Math.random() * (bounds[2] - bounds[0]) + bounds[0];
            const lat = Math.random() * (bounds[3] - bounds[1]) + bounds[1];
            pointsArray.push(new google.maps.LatLng(lat, lng));
        }
    }

    return null; // The heatmap is drawn directly on the map, so this component doesn't render anything itself.
}

function Stat({ target, label, description }: { target: number, label: string, description: string }) {
    const ref = React.useRef<HTMLParagraphElement>(null);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let current = 0;
                    const duration = 2000;
                    const increment = target / (duration / 16);

                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            element.textContent = Math.ceil(current).toLocaleString();
                            requestAnimationFrame(updateCount);
                        } else {
                            element.textContent = target.toLocaleString();
                        }
                    };
                    requestAnimationFrame(updateCount);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
        
        return () => observer.disconnect();
    }, [target]);

    return (
        <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
                {label === 'Vetted Developer Partners' && <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                {label.includes('Million+ Sq. Ft.') && <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 4h4m-4 0L21 3m0 0h-4m4 0v4"></path></svg>}
            </div>
            <div>
                <p ref={ref} className="stat-number text-5xl md:text-6xl font-black text-yellow-500">0</p>
                <h3 className="text-xl font-bold mt-2">{label}</h3>
                <p className="text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    );
}


export function NetworkMapSection() {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const elements = containerRef.current?.querySelectorAll('.fade-in-up');
        elements?.forEach(el => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style jsx>{`
                #network-section-gmaps {
                    background: #0a2342;
                    color: white;
                }
                .fade-in-up { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
                .fade-in-up.is-visible { opacity: 1; transform: translateY(0); }
                #gmap-canvas {
                    width: 100%;
                    height: 500px;
                    border-radius: 1rem;
                    background-color: #0a2342;
                    border: 2px solid rgba(44, 165, 141, 0.5);
                }
            `}</style>
            <div id="network-section-gmaps" className="py-20 md:py-28" ref={containerRef}>
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-20 fade-in-up">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Our Unrivaled Network. Your Strategic Advantage.</h2>
                        <p className="text-lg md:text-xl max-w-4xl mx-auto text-gray-300">
                            Our deep-rooted partnerships with developers across key regions give you direct access to on-market and off-market opportunities, visualized below.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className="space-y-10 fade-in-up" style={{ transitionDelay: '0.2s' }}>
                            <Stat target={131} label="Vetted Developer Partners" description="Our network consists of the region's most reputable builders and landowners." />
                            <Stat target={25} label="Million+ Sq. Ft. of Potential" description="A vast pipeline of land and projects ready to be activated for your needs." />
                             <div className="flex items-start gap-5">
                                 <div className="flex-shrink-0">
                                    <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Flexible, End-to-End Solutions</h3>
                                    <ul className="list-none mt-2 space-y-1 text-gray-300">
                                        <li className="flex items-center gap-2"><span className="text-lg text-accent">✓</span> Ready-to-Occupy Facilities</li>
                                        <li className="flex items-center gap-2"><span className="text-lg text-accent">✓</span> Customised Leases & Retrofits</li>
                                        <li className="flex items-center gap-2"><span className="text-lg text-accent">✓</span> Bespoke Build-to-Suit (BTS) Projects</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="fade-in-up" style={{ transitionDelay: '0.4s' }}>
                            <div id="gmap-canvas">
                                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['visualization']}>
                                    <Map
                                        defaultCenter={{ lat: 13.0827, lng: 80.2707 }}
                                        defaultZoom={9}
                                        gestureHandling={'greedy'}
                                        disableDefaultUI={true}
                                        mapId="network-heatmap"
                                        styles={mapStyles}
                                    >
                                        <Heatmap />
                                    </Map>
                                </APIProvider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
