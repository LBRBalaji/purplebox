
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';

export const metadata: Metadata = {
  title: 'WareHouse Origin: Sourcing Simplified',
  description: 'Sourcing Simplified',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
