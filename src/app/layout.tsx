
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';
import { Header } from '@/components/header';
import Link from 'next/link';
import { CookieBanner } from '@/components/cookie-banner';
import { GoogleAnalytics } from '@/components/google-analytics';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalChatWidget } from '@/components/global-chat';

export const metadata: Metadata = {
  title: 'ORS-ONE: Building Transaction Ready Assets',
  description: 'Warehouse & Industrial Building Sourcing Platform — Sourcing Simplified.',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon-32.png',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

function Footer() {
  return (
    <footer className="p-4 border-t bg-card">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          <span className="font-bold text-primary">ORS-ONE</span> | Simplifying Real Estate Transactions. All rights reserved.
        </p>
         <div className="mt-2 flex items-center justify-center flex-wrap gap-x-4 gap-y-1">
            <Link href="/terms-and-conditions/customer" className="hover:underline">Customer T&C</Link>
            <span>|</span>
            <Link href="/terms-and-conditions/developer" className="hover:underline">Developer T&C</Link>
            <span>|</span>
            <Link href="/terms-and-conditions/agent" className="hover:underline">Agent T&C</Link>
            <span>|</span>
            <Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link>
          </div>
          <div className="mt-4 text-xs text-muted-foreground/80">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 mx-auto hover:text-foreground transition-colors">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Disclaimer: O2O Data can be in-accurate, so check with developer.</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-sm text-left">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none flex items-center gap-2"><Info className="h-4 w-4"/>Data Accuracy</h4>
                    <p className="text-sm text-muted-foreground">
                      The information on this platform is provided by third parties. While we strive for accuracy, we do not independently verify all data. Users are encouraged to conduct their own due diligence.
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
      </div>
    </footer>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("antialiased flex flex-col h-full bg-background font-sans", inter.variable)}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <GoogleAnalytics />}
        <AuthProvider>
          <DataProvider>
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
            <GlobalChatWidget />
          </DataProvider>
        </AuthProvider>
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}
