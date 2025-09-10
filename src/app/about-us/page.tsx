
// src/app/about-us/page.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Building, CheckCircle, ClipboardCheck, Download, Handshake, Search, Users, Zap, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

const ValuePill = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="text-center p-6 bg-card rounded-xl border">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground font-headline">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
);

const FeatureCard = ({ icon: Icon, title, description, image, hint }: { icon: React.ElementType, title:string, description:string, image:string, hint:string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16">
        <div className="md:order-2">
             <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">{title}</h3>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
        <div className="md:order-1">
             <Image 
                src={image}
                alt={title}
                width={600}
                height={400}
                className="rounded-xl object-cover shadow-lg"
                data-ai-hint={hint}
            />
        </div>
    </div>
);


export default function AboutUsPage() {
    return (
        <div className="flex-grow flex flex-col font-sans">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 bg-secondary/30">
                 <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom_1px_center"></div>
                 <div className="container mx-auto text-center relative">
                    <div className="mx-auto max-w-4xl">
                        <p className="font-bold text-primary font-headline tracking-widest">OUR MISSION</p>
                        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">
                           Simplifying Real Estate Transactions
                        </h1>
                        <p className="mt-6 text-lg text-foreground max-w-3xl mx-auto">
                           <strong>O2O</strong> - A Warehouse Lease Transaction Platform.
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Values Section */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-primary">
                           A Platform From Lakshmi Balaji Realty
                           <span className="block text-foreground mt-2">Built For Everyone.</span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Our commitment is to deliver targeted value to every user in the ecosystem.
                        </p>
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValuePill icon={CheckCircle} title="Easier Transactions" description="For our Customers, we transform a complex process into a simple, transparent experience." />
                        <ValuePill icon={Zap} title="Faster Transactions" description="For our Developer partners, we accelerate the journey from listing to signed lease." />
                        <ValuePill icon={Handshake} title="More Transactions" description="For our Agent network, we provide the tools and inventory to scale success." />
                    </div>
                </div>
            </section>
            
             <Separator />

             {/* Customer Section */}
             <section id="customers" className="py-20 md:py-28 bg-secondary/30">
                <div className="container mx-auto">
                     <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-primary">
                            For Our Customers: Your Journey, Simplified
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Imagine your next warehouse proposal, ready in minutes. We've built a platform that partners with you, transforming a complex process into your competitive advantage.
                        </p>
                     </div>

                     <div className="space-y-20">
                        <FeatureCard 
                            icon={Download}
                            title="The Instant Advantage: Search, Select, Download."
                            description="This is where your journey begins. We provide what you need most upfront: a vast selection of properties with <strong class='text-foreground'>unconditional access to their Technical, Compliance, and Commercial data</strong>. Download a clean, structured CSV in seconds. This isn’t just data; it's the power to build a winning proposal faster than anyone else."
                            image="https://picsum.photos/seed/about1/600/400"
                            hint="data analytics dashboard"
                        />
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Collaborate Seamlessly with Your Team.</h3>
                                </div>
                                <p className="text-muted-foreground text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: "We know leasing is a team decision. O2O eliminates messy email trails by providing a <strong class='text-foreground'>central hub for the entire transaction</strong>. With role-based access, you can keep every stakeholder—from logistics to legal to leadership—informed and engaged in real-time." }}></p>
                            </div>
                            <div>
                                 <Image 
                                    src="https://picsum.photos/seed/about2/600/400"
                                    alt="Team Collaboration"
                                    width={600}
                                    height={400}
                                    className="rounded-xl object-cover shadow-lg"
                                    data-ai-hint="team meeting collaboration"
                                />
                            </div>
                        </div>

                         <FeatureCard 
                            icon={ClipboardCheck}
                            title="Master the Full Transaction Lifecycle."
                            description="O2O is your advantage from start to finish. Our platform helps you manage every critical activity: schedule site visits, share improvement lists, use a detailed commercial terms sheet, generate meeting minutes, draft the MoU, and track execution right up to possession. <strong class='text-foreground'>We handle the process, so you can focus on your core business.</strong>"
                            image="https://picsum.photos/seed/about3/600/400"
                            hint="checklist planning board"
                        />
                     </div>
                </div>
            </section>
            
            <section className="py-20 md:py-28 bg-background">
                 <div className="container mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-2xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-3">
                            <Award className="h-7 w-7"/> Our Origin Story
                        </h2>
                         <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                            In 2014, we were grappling with the inefficiencies of the warehouse lease transactions. So, we built something for ourselves: a powerful application called <strong className="text-foreground">FOLLOWPROP</strong>. It was our own solution, born out of a real-world need.
                        </p>
                        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                            A decade later, we've taken everything we learned and built a complete warehouse lease transaction platform, <strong className="text-foreground">Lakshmi Balaji O2O</strong>, for everyone. We believe our hands-on experience allows us to truly understand and solve the challenges our customers face.
                        </p>
                    </div>

                    <Card className="bg-primary text-primary-foreground text-center p-8">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold font-headline">Ready to Get Started?</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                                Whether you're looking for a space, have a property to list, or want to join our agent network, your journey begins here.
                            </p>
                        </CardContent>
                        <CardContent>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button asChild size="lg" variant="secondary">
                                    <Link href="/">Browse Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                                 <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                                    <Link href="/agent-signup">Become an <strong className="mx-1">O2O</strong> Agent Partner <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </section>
        </div>
    )
}
