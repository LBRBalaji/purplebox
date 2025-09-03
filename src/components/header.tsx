
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Building, LogOut, Sparkles, Map, LogIn, LayoutDashboard, Warehouse, BarChart, ShieldCheck, Users, Briefcase, List, ChevronDown, ClipboardCheck, UserPlus, CheckCircle, FileCheck, Calculator, UserCheck } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu"


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
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/listings">Listing Analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/demands">Demand Analytics</Link>
                </DropdownMenuItem>
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

const ToolsDropdown = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const isActive = pathname.startsWith('/commercial-calculator') || pathname.startsWith('/listing-comparison');

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
                    <Link href="/commercial-calculator">Area & Commercials Calculator</Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                      <Link href="/listing-comparison">Commercials Comparison For Listings</Link>
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isAdmin = user?.email === 'admin@example.com';
  const isO2O = user?.role === 'O2O';
  const isProvider = user?.role === 'SuperAdmin';
  const isCustomer = user?.role === 'User';

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
                        {user && (
                            <NavLink href="/dashboard">
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </NavLink>
                        )}
                        <NavLink href="/" exact={true}>
                            <List className="h-4 w-4" /> Browse Listings
                        </NavLink>
                        <NavLink href="/map-search">
                            <Map className="h-4 w-4" /> Map Search
                        </NavLink>
                         <ToolsDropdown />
                         {!user && (
                            <NavLink href="/agent-signup">
                                <UserPlus className="h-4 w-4" /> Agent Signup
                            </NavLink>
                        )}
                        {isAdmin && (
                            <>
                                <NavLink href="/dashboard/register-lead"><UserCheck className="h-4 w-4" /> Register a Lead</NavLink>
                                <NavLink href="/dashboard/manage-users"><Users className="h-4 w-4" /> Manage Users</NavLink>
                                <NavLink href="/dashboard/manage-listings"><FileCheck className="h-4 w-4" /> Manage Listings</NavLink>
                                <AnalyticsDropdown />
                            </>
                        )}
                         {(isO2O && !isAdmin) && (
                            <>
                                <NavLink href="/dashboard/register-lead"><UserCheck className="h-4 w-4" /> Register a Lead</NavLink>
                                <NavLink href="/dashboard/manage-listings"><FileCheck className="h-4 w-4" /> Manage Listings</NavLink>
                            </>
                         )}
                         {isProvider && !isAdmin && (
                            <NavLink href="/dashboard/manage-warehouses"><Warehouse className="h-4 w-4" /> Manage Warehouses</NavLink>
                         )}
                    </>
                )}
          </nav>

           <div className="flex items-center gap-4 flex-shrink-0">
              {user && user.email !== 'admin@example.com' && user?.role !== 'O2O' && (
                <Link href="https://wa.me/919841098170" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                      <WhatsAppIcon className="mr-2 h-5 w-5" />
                      WhatsApp O2O
                  </Button>
                </Link>
              )}
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {user.role === 'SuperAdmin' ? 'Property Provider' : user.role === 'User' ? 'Customer' : user.role}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                 <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              )}
            </div>
        </div>
      </header>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
