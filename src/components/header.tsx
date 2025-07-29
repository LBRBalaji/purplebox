
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Building, LogOut, Sparkles, Map, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';

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

export function Header() {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <>
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
              <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                  <div className="relative">
                      <Building className="h-7 w-7 text-primary" />
                      <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
                  </div>
                  <div>
                      <h1 className="text-xl font-bold font-headline text-primary">WareHouse Origin</h1>
                      <p className="text-xs text-muted-foreground">Sourcing Simplified</p>
                  </div>
              </Link>
              <nav className="hidden sm:flex items-center gap-4">
                   {user && (
                      <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                  )}
                  <Link href="/map-search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <Map className="h-4 w-4" /> Map Search
                  </Link>
                  {user?.role === 'SuperAdmin' && (
                      <Link href="/dashboard/manage-warehouses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                          Manage Warehouses
                      </Link>
                  )}
              </nav>
          </div>
           <div className="flex items-center gap-4">
              <Link href="https://wa.me/919841098170" target="_blank" rel="noopener noreferrer">
                 <Button variant="outline">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    WhatsApp O2O
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">{user.companyName} ({user.role})</p>
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
