import { PropertyForm } from "@/components/property-form";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Sparkles } from 'lucide-react';

function Header() {
  return (
    <header className="p-4 border-b">
      <div className="container mx-auto flex items-center gap-2">
        <div className="relative">
          <Building className="h-7 w-7 text-primary" />
          <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-2" />
        </div>
        <h1 className="text-xl font-bold font-headline text-primary">PropSource AI</h1>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">Submit a Property</h2>
            <p className="text-muted-foreground mt-2">Fill out the form below to submit a property and get an AI-generated description.</p>
          </div>
          <PropertyForm />
        </div>
      </main>
    </div>
  );
}
