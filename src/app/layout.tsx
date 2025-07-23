
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';

export const metadata: Metadata = {
  title: 'WareHouse Origin: Sourcing Simplified',
  description: 'Sourcing Simplified',
};

function Footer() {
  return (
    <footer className="p-4 border-t bg-card">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>
          Lakshmi Balaji <span className="font-bold text-primary">O2O</span> | Simplifying Real Estate Transactions. All rights reserved.
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <DataProvider>
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </DataProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
