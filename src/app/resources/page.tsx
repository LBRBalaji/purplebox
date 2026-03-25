'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, ClipboardList, CheckSquare, Download as DownloadIcon, Users, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Section = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <section id={id} className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2">{title}</h2>
        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
            {children}
        </div>
    </section>
);

const tocItems = [
    { id: 'overview', title: '1. Product Overview' },
    { id: 'how-it-works', title: '2. How It Works' },
    { id: 'features', title: '3. Core Features & Functions' },
    { id: 'user-roles', title: '4. User Roles & Workflows' },
    { id: 'project-plan', title: '5. Conceptual Project Plan' },
];

export default function ProductReportPage() {
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center gap-4 no-print">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Product Report: PropSource AI</h1>
                <p className="text-muted-foreground mt-2">A comprehensive overview of the ORS-ONE platform.</p>
            </div>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Download / Print
            </Button>
        </div>
        
        <Card className="no-print mb-12">
            <CardHeader>
                <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {tocItems.map(item => (
                        <li key={item.id}>
                            <a href={`#${item.id}`} className="text-primary hover:underline">{item.title}</a>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        <div className="space-y-12">
            <Section id="overview" title="1. Product Overview: What is PropSource AI?">
                <p><strong>PropSource AI</strong> (branded as ORS-ONE) is a comprehensive, Online-to-Offline (O2O) platform designed to digitize and streamline the entire lifecycle of commercial real estate transactions, with a specific focus on the industrial and warehousing sector.</p>
                <ul>
                    <li><strong>Core Problem:</strong> The platform directly addresses the primary pain points of the traditional commercial real estate market: fragmentation of information, lack of standardization in property data, inefficient communication channels, and a general absence of transparency throughout the transaction process.</li>
                    <li><strong>Mission:</strong> To simplify and accelerate the sourcing, negotiation, and leasing of warehouse properties by providing a single source of truth for all stakeholders.</li>
                    <li><strong>Value Proposition:</strong> It serves as a unified ecosystem where Customers (tenants), Property Developers (providers), and Agents can connect, collaborate, and close deals with greater efficiency and data-driven confidence.</li>
                </ul>
            </Section>

            <Section id="how-it-works" title="2. How It Works: The Platform Ecosystem">
                 <p>PropSource AI transitions real estate from a manual, relationship-driven process to a data-centric, platform-driven one.</p>
                <ul>
                    <li><strong>Data-Centric Foundation:</strong> The platform's core is a standardized database of properties. Developers are guided to input detailed <strong>Technical</strong> (e.g., eave height, floor type), <strong>Commercial</strong> (rent, deposit), and <strong>Compliance</strong> (approvals, licenses) data, creating a rich, comparable dataset.</li>
                    <li><p><strong>Intelligent Sourcing Engine:</strong> The platform offers two primary methods for discovering properties:</p>
                        <ol>
                            <li><strong>Direct Search & Discovery:</strong> Users can utilize an advanced search and filtering system on the listings page. A key innovation here is the <strong>Location Circles</strong> feature, a smart backend algorithm that groups geographically and commercially similar micro-markets. A search for "Oragadam," for example, intelligently includes results from the entire "Sriperumbudur Circle," preventing users from missing opportunities in adjacent, lesser-known locales. The <strong>Map Search</strong> provides a visual, heatmap-based alternative for understanding regional supply.</li>
                            <li><strong>Demand-Led Sourcing:</strong> Instead of searching, customers can log a detailed <strong>Demand Form</strong>, specifying their exact requirements, including non-negotiable priorities. This triggers the O2O team and the platform's AI to actively source matching properties, including from off-market inventory.</li>
                        </ol>
                    </li>
                    <li><strong>Unified Transaction Management:</strong> Once a property is identified, the platform facilitates the entire deal lifecycle within a single, unified interface. This begins with a formal <strong>Lead Registration</strong> and continues through every stage of communication, negotiation, and closing, ensuring a transparent and auditable process.</li>
                </ul>
            </Section>

            <Section id="features" title="3. Core Features & Functions">
                <p>The platform is rich with features tailored to different user needs:</p>
                <ul>
                    <li><strong>Sourcing & Analysis Tools (For Customers & Agents):</strong>
                        <ul>
                            <li><strong>Advanced Listings & Map Search:</strong> To discover and visualize property supply.</li>
                            <li><strong>Demand Logging:</strong> To submit specific requirements for custom sourcing.</li>
                            <li><strong>Shortlisting & Comparison:</strong> To save favorite properties and perform side-by-side financial analysis.</li>
                            <li><strong>Financial Calculators:</strong> Tools for ROI, lease commercials, and registration charge estimations.</li>
                            <li><strong>"Search-Select-Download":</strong> A workflow to quickly download a CSV of technical, compliance, and commercial data for multiple properties at once.</li>
                        </ul>
                    </li>
                    <li><strong>Transaction Management Tools (For All Users):</strong>
                        <ul>
                            <li><strong>Role-Based Dashboards:</strong> Centralized hubs showing relevant information like "My Demands," "My Listings," or "My Transactions."</li>
                            <li><strong>Activity Log:</strong> A real-time, chronological feed of all significant deal events (site visits, feedback, proposals).</li>
                            <li><strong>Digital Negotiation Board:</strong> A structured workspace to document all commercial terms, track proposals, and record meeting outcomes with version history.</li>
                            <li><strong>Tenant Improvements Sheet:</strong> A checklist to manage and track all post-deal fit-out requirements.</li>
                            <li><strong>Global Chat:</strong> An integrated, real-time messaging system tied to specific transactions.</li>
                        </ul>
                    </li>
                    <li><strong>Supply & Admin Tools (For Developers & Admins):</strong>
                        <ul>
                            <li><strong>Listing & Portfolio Management:</strong> Create, edit, archive, and re-list properties.</li>
                            <li><strong>Lead Management:</strong> Receive, view, and formally acknowledge customer leads.</li>
                            <li><strong>Performance Analytics:</strong> Dashboards to monitor listing views, downloads, and user engagement metrics.</li>
                            <li><strong>Approval Queue:</strong> An admin-only interface to approve or reject new property submissions.</li>
                        </ul>
                    </li>
                     <li><strong>Community & Network Features:</strong>
                        <ul>
                            <li><strong>Community Hub:</strong> A content platform with articles and tutorials categorized into "Learn," "Events," and "Stories" to educate and engage users.</li>
                            <li><strong>Agent Partner Program:</strong> A complete system for real estate agents to register, join a waitlist, and eventually manage their own team of sub-agents.</li>
                        </ul>
                    </li>
                </ul>
            </Section>
            
            <Section id="user-roles" title="4. User Roles & Workflows">
                <p>Each user role has a tailored experience designed to meet their primary objectives.</p>
                <ul>
                    <li><p><strong>Customer (Tenant)</strong></p>
                        <ul>
                            <li><strong>Goal:</strong> To find and lease the perfect warehouse.</li>
                            <li><strong>Workflow:</strong> They either <strong>search/browse</strong> listings or <strong>log a specific demand</strong>. They use tools to <strong>shortlist</strong> and <strong>compare</strong> properties, then <strong>download details</strong> or <strong>request a quote</strong>, which initiates a formal transaction. They manage this transaction—scheduling site visits, chatting with the provider, and tracking negotiations—through their dashboard.</li>
                        </ul>
                    </li>
                     <li><p><strong>Warehouse Developer (Provider)</strong></p>
                        <ul>
                            <li><strong>Goal:</strong> To market and lease their properties efficiently.</li>
                            <li><strong>Workflow:</strong> They <strong>create and manage their listings</strong>. For "Premium" listings, they receive leads directly. For "Standard" listings, the O2O team facilitates the deal. They <strong>acknowledge leads</strong>, submit proposals, and use the platform's tools to negotiate and close the deal.</li>
                        </ul>
                    </li>
                     <li><p><strong>Agent Partner</strong></p>
                        <ul>
                            <li><strong>Goal:</strong> To close deals for their clients by leveraging the platform's inventory and tools.</li>
                            <li><strong>Workflow:</strong> After being approved from the <strong>waitlist</strong>, they <strong>register new client leads</strong> via their dashboard. This formally links the client to them. They then act as a facilitator, using the Activity Log, Negotiation Board, and Comparison Tools on behalf of their client. They can also build and manage a team of sub-agents under their agency's "Company Admin" account.</li>
                        </ul>
                    </li>
                     <li><p><strong>O2O Manager (Admin)</strong></p>
                        <ul>
                            <li><strong>Goal:</strong> To ensure platform quality and facilitate brokered transactions.</li>
                            <li><strong>Workflow:</strong> They <strong>approve new listings</strong> and <strong>agent applications</strong>. They manage the "Broking Desk," where they circulate demands for standard listings to the provider network. They use analytics to monitor platform health and engagement.</li>
                        </ul>
                    </li>
                     <li><p><strong>Super Admin</strong></p>
                        <ul>
                            <li><strong>Goal:</strong> Complete administrative control over the platform.</li>
                            <li><strong>Workflow:</strong> Has access to all O2O Manager functions, plus the ability to <strong>manage all users</strong> (add/edit/delete), configure <strong>platform settings</strong> (like Location Circles), and use the <strong>Admin Search Console</strong> to perform deep searches across all platform data.</li>
                        </ul>
                    </li>
                </ul>
            </Section>

            <Section id="project-plan" title="5. Conceptual Project Plan">
                <p>The platform's features suggest a logical, phased development approach.</p>
                <ul>
                    <li><strong>Phase 1: Foundation & Core Marketplace (MVP)</strong>
                        <ul>
                            <li><strong>Objective:</strong> Establish the basic supply-and-demand engine.</li>
                            <li><strong>Features:</strong> User Authentication (Customer, Developer roles), Listing Creation, Basic Search, Listing Detail Pages, and initial Data Persistence.</li>
                        </ul>
                    </li>
                    <li><strong>Phase 2: Transaction Engine & Engagement</strong>
                        <ul>
                            <li><strong>Objective:</strong> Evolve from a listings portal into a true transaction platform.</li>
                            <li><strong>Features:</strong> Demand Logging, formal Lead Registration, Role-Based Dashboards, Approval Queue for submissions, and a foundational Activity Log.</li>
                        </ul>
                    </li>
                     <li><strong>Phase 3: Advanced Tools & Collaboration</strong>
                        <ul>
                            <li><strong>Objective:</strong> Enhance user value with sophisticated tools for analysis and negotiation.</li>
                            <li><strong>Features:</strong> Global Chat, Digital Negotiation Board, Tenant Improvements Sheet, and the full suite of Financial Calculators.</li>
                        </ul>
                    </li>
                     <li><strong>Phase 4: Intelligence & Community Building</strong>
                        <ul>
                            <li><strong>Objective:</strong> Layer on data intelligence and foster a user community.</li>
                            <li><strong>Features:</strong> AI-powered Description Generation, Predictive Analytics, comprehensive Analytics Dashboards, the Community Hub, and the intelligent Map Search feature.</li>
                        </ul>
                    </li>
                     <li><strong>Phase 5: Scaling & Administration</strong>
                        <ul>
                            <li><strong>Objective:</strong> Build robust administrative capabilities and scale the user base.</li>
                            <li><strong>Features:</strong> The Agent Partner Program (including waitlisting and team management), Super Admin controls for user and platform settings, and the universal Admin Search Console.</li>
                        </ul>
                    </li>
                </ul>
            </Section>
        </div>
      </div>
    </main>
  );
}
