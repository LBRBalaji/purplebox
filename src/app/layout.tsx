
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
          <span className="font-bold text-primary">O2O</span> | Simplifying Real Estate Transactions. All rights reserved.
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
