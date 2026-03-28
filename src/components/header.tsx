'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Map, LogIn, LayoutDashboard, BarChart, List, ChevronDown, Calculator, Settings, Bell, Info, BookOpen, Users, Briefcase, Search as SearchIcon, Sparkles, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { useData } from '@/contexts/data-context';
import { Badge } from './ui/badge';

const WhatsAppIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"/>
  </svg>
);

const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap", isActive && "text-primary font-semibold")}>
      {children}
    </Link>
  );
};

const DropTrigger = React.forwardRef(({ children, isActive, ...props }, ref) => (
  <button ref={ref} {...props} className={cn("text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 whitespace-nowrap", isActive && "text-primary font-semibold")}>
    {children}
  </button>
));
DropTrigger.displayName = 'DropTrigger';

const ListingsDropdown = () => {
  const pathname = usePathname();
  const isActive = pathname === '/' || pathname.startsWith('/map-search') || pathname.startsWith('/listings');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><List className="h-3.5 w-3.5" /> Listings <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild><Link href="/"><List className="mr-2 h-4 w-4" /> Browse Listings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/map-search"><Map className="mr-2 h-4 w-4" /> Map Search</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/listing-comparison"><Calculator className="mr-2 h-4 w-4" /> Compare Listings</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ToolsDropdown = () => {
  const pathname = usePathname();
  const isActive = ['/commercial-calculator','/registration-calculator','/roi-calculator'].some(p => pathname.startsWith(p));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><Calculator className="h-3.5 w-3.5" /> Tools <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild><Link href="/roi-calculator">Investment ROI Calculator</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/commercial-calculator">Area & Commercials Calculator</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/registration-calculator">Registration Charges Calculator</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AnalyticsDropdown = () => {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/dashboard/analytics');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><BarChart className="h-3.5 w-3.5" /> Analytics <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/listings-performance">Listing Performance</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/customer">Customer Engagement</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/traffic">Platform Traffic</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/community">Community Analytics</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/predictive"><Sparkles className="mr-2 h-4 w-4" /> Predictive Analytics</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ManageDropdown = ({ isSuperAdmin }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/dashboard/manage') || pathname.startsWith('/dashboard/approval') || pathname.startsWith('/dashboard/settings') || pathname.startsWith('/dashboard/search');
  if (!isSuperAdmin) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><DropTrigger isActive={isActive}><Settings className="h-3.5 w-3.5" /> Manage <ChevronDown className="h-3 w-3" /></DropTrigger></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Approvals</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/approval"><ClipboardCheck className="mr-2 h-4 w-4" /> Approval Queue</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Administration</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/manage-users"><Users className="mr-2 h-4 w-4" /> Manage Users</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/search-console"><SearchIcon className="mr-2 h-4 w-4" /> Search Console</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Platform Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Operations</DropdownMenuLabel>
        <DropdownMenuItem asChild><Link href="/dashboard/transactions"><Briefcase className="mr-2 h-4 w-4" /> Broking Transactions</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Platform Oversight</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const { unreadCount } = useData();
  if (!user) return null;
  return (
    <Button asChild variant="ghost" size="icon" className="relative h-8 w-8">
      <Link href="/dashboard/notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">{unreadCount}</Badge>
        )}
      </Link>
    </Button>
  );
};


const MobileMenu = ({ user, logout, onLoginClick }: { user: any, logout: () => void, onLoginClick: () => void }) => {
  const pathname = usePathname();
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isO2O = user?.role === 'O2O';
  const roleLabel = user?.role === 'Warehouse Developer' ? 'Property Provider' : user?.role === 'User' ? 'Customer' : user?.role;

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <SheetClose asChild>
      <Link href={href} className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
        pathname === href || pathname.startsWith(href + '/') ? "bg-[#0D1F3C] text-white" : "text-slate-600 hover:bg-slate-100"
      )}>
        <Icon className="h-4 w-4" /> {label}
      </Link>
    </SheetClose>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
        {/* Header */}
        <div className="bg-[#0D1F3C] p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg font-bold text-white">ORS-ONE</span>
            <span className="text-xs border border-amber-400 text-amber-400 bg-amber-400/10 px-1 rounded">Beta</span>
          </div>
          <p className="text-xs text-white/50">Building Transaction Ready Assets</p>
          {user && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm font-semibold text-white">{user.userName}</p>
              <p className="text-xs text-white/50">{roleLabel}</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {user && !isSuperAdmin && <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />}
          <NavItem href="/" icon={List} label="Browse Listings" />
          <NavItem href="/map-search" icon={Map} label="Map Search" />
          <NavItem href="/listing-comparison" icon={Calculator} label="Compare Listings" />

          <div className="pt-2 pb-1 px-4">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Tools</p>
          </div>
          <NavItem href="/roi-calculator" icon={Calculator} label="ROI Calculator" />
          <NavItem href="/commercial-calculator" icon={Calculator} label="Commercial Calculator" />
          <NavItem href="/registration-calculator" icon={Calculator} label="Registration Calculator" />

          <div className="pt-2 pb-1 px-4">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Explore</p>
          </div>
          <NavItem href="/resources" icon={BookOpen} label="Resources" />
          <NavItem href="/about-us" icon={Info} label="About Us" />
          <NavItem href="/community" icon={Users} label="Community" />

          {(isSuperAdmin || isO2O) && (
            <>
              <div className="pt-2 pb-1 px-4">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Admin</p>
              </div>
              <NavItem href="/dashboard/approval" icon={ClipboardCheck} label="Approval Queue" />
              <NavItem href="/dashboard/manage-users" icon={Users} label="Manage Users" />
              <NavItem href="/dashboard/analytics/listings-performance" icon={BarChart} label="Analytics" />
              <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          {user ? (
            <SheetClose asChild>
              <Button variant="outline" className="w-full rounded-xl" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Button className="w-full rounded-xl bg-[#0D1F3C] hover:bg-[#132840] text-white" onClick={onLoginClick}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isO2O = user?.role === 'O2O';
  const roleLabel = user?.role === 'Warehouse Developer' ? 'Property Provider' : user?.role === 'User' ? 'Customer' : user?.role;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <MobileMenu user={user} logout={logout} onLoginClick={() => setIsLoginOpen(true)} />
          <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 mr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary">ORS-ONE</span>
              <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50 py-0 px-1">Beta</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-none">Building Transaction Ready Assets</p>
          </Link>
          <nav className="hidden md:flex items-center gap-5 flex-1">
            {isLoading ? (
              <div className="flex items-center gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
            ) : (
              <>
                {user && !isSuperAdmin && (<NavLink href="/dashboard"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</NavLink>)}
                <ListingsDropdown />
                <ToolsDropdown />
                <NavLink href="/resources"><BookOpen className="h-3.5 w-3.5" /> Resources</NavLink>
                <NavLink href="/about-us"><Info className="h-3.5 w-3.5" /> About Us</NavLink>
                <NavLink href="/community"><Users className="h-3.5 w-3.5" /> Community</NavLink>
                {(isSuperAdmin || isO2O) && <AnalyticsDropdown />}
                {isSuperAdmin && <ManageDropdown isSuperAdmin={isSuperAdmin} />}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {(!user || (!isSuperAdmin && !isO2O)) && (
              <Link href="https://wa.me/919841098170?text=need%20O2O%20support%20call%20me%20back%20please" target="_blank" rel="noopener noreferrer" className="hidden lg:block">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><WhatsAppIcon /> Ask a Call Back</Button>
              </Link>
            )}
            {isLoading ? (<Skeleton className="h-8 w-20" />) : user ? (
              <div className="flex items-center gap-2">
                <NotificationsBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 max-w-[180px]">
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-xs font-semibold truncate leading-none max-w-[120px]">{user.userName}</span>
                        <span className="text-xs text-muted-foreground leading-none mt-0.5">{roleLabel}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 flex-shrink-0 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Signed in as</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-semibold text-sm py-0">{user.userName}</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-xs text-muted-foreground py-0 font-normal">{roleLabel}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button size="sm" className="h-8" onClick={() => setIsLoginOpen(true)}><LogIn className="mr-2 h-4 w-4" /> Login</Button>
            )}
          </div>
        </div>
      </header>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
