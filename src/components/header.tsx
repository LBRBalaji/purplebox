
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Building, LogOut, Sparkles, Map, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/login-dialog';

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
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
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
      </header>
      <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
