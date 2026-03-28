const fs = require('fs');
let c = fs.readFileSync('src/components/header.tsx', 'utf8');

// Add Sheet imports for mobile drawer
c = c.replace(
  `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"`,
  `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react"`
);

// Add MobileMenu component before Header function
const mobileMenu = `
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
`;

c = c.replace(
  'export function Header() {',
  mobileMenu + '\nexport function Header() {'
);

// Add MobileMenu to header JSX — before logo
c = c.replace(
  `          <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 mr-2">`,
  `          <MobileMenu user={user} logout={logout} onLoginClick={() => setIsLoginOpen(true)} />
          <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 mr-2">`
);

fs.writeFileSync('src/components/header.tsx', c);
console.log('Done!');
