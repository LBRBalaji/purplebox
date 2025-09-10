
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

export const metadata: Metadata = {
  title: 'Lakshmi Balaji O2O: Sourcing & Leasing Simplified',
  description: 'Sourcing & Leasing Simplified',
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
          <span className="font-bold text-primary">Lakshmi Balaji O2O</span> | Simplifying Real Estate Transactions. All rights reserved.
        </p>
         <div className="mt-2 space-x-4">
            <Link href="/terms-and-conditions" className="hover:underline">
              Terms & Conditions
            </Link>
            <span>|</span>
            <Link href="/cookie-policy" className="hover:underline">
              Cookie Policy
            </Link>
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
          </DataProvider>
        </AuthProvider>
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}
