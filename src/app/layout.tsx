
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Lakshmi Balaji O2O: Sourcing & Leasing Simplified',
  description: 'Sourcing & Leasing Simplified',
};

function Footer() {
  return (
    <footer className="p-4 border-t bg-card">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          <span className="font-bold text-primary">Lakshmi Balaji O2O</span> | Simplifying Real Estate Transactions. All rights reserved.
        </p>
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col h-full bg-background">
        <AuthProvider>
          <DataProvider>
            <Header />
            <main className="flex-grow flex flex-col">{children}</main>
          </DataProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
