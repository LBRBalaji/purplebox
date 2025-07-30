
// src/app/agent-signup/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Building, Sparkles, UserPlus, ClipboardCheck, Star, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import type { AgentLead } from '@/contexts/data-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AgentSignupPage() {
  const { addAgentLead } = useData();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<AgentLead, 'id'>>({
    agentType: 'Individual',
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    socialProfileId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleTypeChange = (value: 'Individual' | 'Company') => {
    setFormData({ ...formData, agentType: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAgentLead(formData);
    toast({
        title: "Registration Received!",
        description: "Thank you for your interest. We will review your details and be in touch.",
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
        <div className="flex-grow bg-background flex items-center justify-center p-4">
             <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex flex-col items-center mb-4">
                       <ClipboardCheck className="h-16 w-16 text-green-500 mb-4" />
                       <CardTitle className="text-2xl">Thank You!</CardTitle>
                       <CardDescription className="mt-2">
                        Your registration has been submitted successfully. Our team will review your information and get back to you shortly.
                       </CardDescription>
                    </div>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-grow bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex flex-col items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Building className="h-10 w-10 text-primary" />
                <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
              </div>
              <h1 className="text-3xl font-bold font-headline text-primary">Agent Registration</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Join the WareHouse Origin Network</p>
          </div>
          <CardTitle className="text-2xl">Become an Agent Partner</CardTitle>
          <Alert className="mt-4 text-left bg-primary/5 border-primary/20">
            <Star className="h-5 w-5 text-primary/80" />
            <AlertTitle className="font-semibold text-primary/90">Waitlist Registration</AlertTitle>
            <AlertDescription className="text-primary/80">
                Register your interest and we'll add you to our waitlist for platform onboarding.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup
                    defaultValue="Individual"
                    className="grid grid-cols-2 gap-4"
                    onValueChange={handleTypeChange}
                    value={formData.agentType}
                >
                    <div>
                    <RadioGroupItem value="Individual" id="type-individual" className="peer sr-only" />
                    <Label
                        htmlFor="type-individual"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        Individual Agent
                    </Label>
                    </div>
                    <div>
                    <RadioGroupItem
                        value="Company"
                        id="type-company"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="type-company"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        Company
                    </Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" required onChange={handleChange} value={formData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Your Agency LLC" required={formData.agentType === 'Company'} onChange={handleChange} value={formData.companyName} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Official Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@agency.com" required onChange={handleChange} value={formData.email} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 234 567 890" required onChange={handleChange} value={formData.phone} />
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="socialProfileId">Social Profile ID (LinkedIn)</Label>
              <Input id="socialProfileId" placeholder="linkedin.com/in/yourprofile" onChange={handleChange} value={formData.socialProfileId} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="address">Office Address</Label>
              <Textarea id="address" placeholder="123 Main St, Anytown, USA" required onChange={handleChange} value={formData.address} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Submit Registration
            </Button>
            <div className="text-sm text-center text-muted-foreground">
                Already have a user account?{' '}
                <Link href="/" className="underline text-primary">
                    Log In
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
