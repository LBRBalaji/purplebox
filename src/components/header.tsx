
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Building, LogOut, Sparkles, Map, LogIn, LayoutDashboard, Warehouse, BarChart, ShieldCheck, Users, Briefcase, List, ChevronDown, ClipboardCheck, UserPlus, CheckCircle, FileCheck, Calculator, UserCheck, FileText, Search as SearchIcon, Settings, Bell, HardHat, MailCheck, Eye } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useData } from '@/contexts/data-context';
import { Badge } from './ui/badge';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"
      />
    </svg>
  );

const NavLink = ({ href, children, exact = false }: { href: string, children: React.ReactNode, exact?: boolean }) => {
    const pathname = usePathname();
    const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
    
    return (
        <Link 
            href={href} 
            className={cn(
                "text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
                isActive && "text-primary"
            )}
        >
            {children}
        </Link>
    )
}

const ListingsDropdown = () => {
    const pathname = usePathname();
    const isActive = pathname === '/' || pathname.startsWith('/map-search') || pathname.startsWith('/listings');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
                     isActive && "text-primary"
                )}>
                    <Warehouse className="h-4 w-4" /> Listings <ChevronDown className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                    <Link href="/"><List className="mr-2 h-4 w-4" /> Browse Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/map-search"><Map className="mr-2 h-4 w-4" /> Map Search</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


const AnalyticsDropdown = () => {
    const pathname = usePathname();
    const isActive = pathname.startsWith('/dashboard/analytics');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
                     isActive && "text-primary"
                )}>
                    <BarChart className="h-4 w-4" /> Analytics <ChevronDown className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem asChild><Link href="/dashboard/analytics/listings-performance">Listing Performance</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/analytics/demands">Demand Analytics</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/analytics/traffic">Platform Traffic</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/predictive">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Predictive Analytics
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const ManageDropdown = ({ isSuperAdmin, isO2O }: { isSuperAdmin: boolean, isO2O: boolean }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith('/dashboard');
    
    if (!isSuperAdmin && !isO2O) return null;

    return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
                     isActive && "text-primary"
                )}>
                    <Settings className="h-4 w-4" /> Manage <ChevronDown className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                 {isSuperAdmin && (
                    <>
                        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Main Dashboard</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/dashboard/search-console"><SearchIcon className="mr-2 h-4 w-4" /> Search Console</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/dashboard/manage-users"><Users className="mr-2 h-4 w-4" /> Manage Users</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                 )}
                 <DropdownMenuItem asChild><Link href="/dashboard/transactions"><UserCheck className="mr-2 h-4 w-4" /> Manage Transactions</Link></DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const ToolsDropdown = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const isActive = pathname.startsWith('/commercial-calculator') || pathname.startsWith('/listing-comparison') || pathname.startsWith('/registration-calculator') || pathname.startsWith('/roi-calculator');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <button className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2",
                     isActive && "text-primary"
                )}>
                    <Calculator className="h-4 w-4" /> Tools <ChevronDown className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                 <DropdownMenuItem asChild>
                    <Link href="/roi-calculator">Investment ROI Calculator</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/commercial-calculator">Area & Commercials Calculator</Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                      <Link href="/listing-comparison">Commercials Comparison For Listings</Link>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem asChild>
                    <Link href="/registration-calculator">Registration Charges Calculator</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const Notifications = () => {
    const { user } = useAuth();
    const { submissions, agentLeads, registeredLeads } = useData();

    const notifications = React.useMemo(() => {
        if (!user) return [];

        const isSuperAdmin = user.role === 'SuperAdmin';
        const isO2O = user.role === 'O2O';
        const isProvider = user.role === 'Warehouse Developer';
        const isCustomer = user.role === 'User';
        const isAgent = user.role === 'Agent';
        
        let items: { text: string; href: string; icon: React.ElementType }[] = [];

        if (isO2O || isSuperAdmin) {
            const pendingSubmissions = submissions.filter(s => s.status === 'Pending').length;
            if (pendingSubmissions > 0) {
                items.push({ text: `${pendingSubmissions} new property submission(s) for approval`, href: '/dashboard?tab=approval-queue', icon: MailCheck });
            }
            const pendingAgents = agentLeads.filter(a => a.status === 'Pending').length;
            if (pendingAgents > 0) {
                items.push({ text: `${pendingAgents} new agent application(s)`, href: '/dashboard/manage-users', icon: UserPlus });
            }
        }
        
        if (isProvider) {
            const pendingLeads = registeredLeads.filter(l => l.providers.some(p => p.providerEmail === user.email && p.status === 'Pending')).length;
            if (pendingLeads > 0) {
                items.push({ text: `${pendingLeads} new lead(s) require your acknowledgment`, href: '/dashboard?tab=registered-leads', icon: UserCheck });
            }
        }

        if (isCustomer) {
            const newSubmissionCount = submissions.filter(s => s.demandUserEmail === user.email && s.isNew).length;
            if (newSubmissionCount > 0) {
                items.push({ text: `You have ${newSubmissionCount} new approved match(es)`, href: '/dashboard?tab=my-demands', icon: FileCheck });
            }
        }
        
        if (isAgent) {
             const pendingAcks = registeredLeads.filter(l => l.registeredBy === user.email && l.providers.some(p => p.status === 'Pending')).length;
             if (pendingAcks > 0) {
                 items.push({ text: `${pendingAcks} provider acknowledgment(s) are pending`, href: '/dashboard/transactions', icon: HardHat });
             }
        }
        
        return items;

    }, [user, submissions, agentLeads, registeredLeads]);

    if (!user || notifications.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                        {notifications.length}
                    </Badge>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Pending Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                        <Link href={item.href} className="flex items-start gap-3">
                             <item.icon className="h-4 w-4 mt-1 text-muted-foreground" />
                             <span className="whitespace-normal">{item.text}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isO2O = user?.role === 'O2O';

  return (
    <>
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                  <Building className="h-7 w-7 text-primary" />
                  <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
              </div>
              <div>
                  <h1 className="text-xl font-bold font-headline text-primary">Lakshmi Balaji O2O</h1>
                  <p className="text-xs text-muted-foreground">Sourcing & Leasing Simplified</p>
              </div>
          </Link>
          
          <nav className="hidden sm:flex items-center gap-6 mx-auto">
                {isLoading ? (
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                ) : (
                    <>
                        {user && !isSuperAdmin && (
                            <NavLink href="/dashboard">
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </NavLink>
                        )}
                        <ListingsDropdown />
                        <ToolsDropdown />
                         {(isSuperAdmin || isO2O) && (
                            <>
                                <AnalyticsDropdown />
                                <ManageDropdown isSuperAdmin={isSuperAdmin || false} isO2O={isO2O || false} />
                            </>
                         )}
                    </>
                )}
          </nav>

           <div className="flex items-center gap-4 flex-shrink-0">
              {user && !(isSuperAdmin || isO2O) && (
                <Link href="https://wa.me/919841098170" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                      <WhatsAppIcon className="mr-2 h-5 w-5" />
                      WhatsApp O2O Team
                  </Button>
                </Link>
              )}
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : user ? (
                <div className="flex items-center gap-2">
                   <Notifications />
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {user.role === 'Warehouse Developer' ? 'Property Provider' : user.role === 'User' ? 'Customer' : user.role}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                </div>
              )}
            </div>
        </div>
      </header>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
