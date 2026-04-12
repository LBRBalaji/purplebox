
'use client';

import * as React from 'react';
import { useAuth, type NewUser } from '@/contexts/auth-context';
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
import { Building, Sparkles, UserPlus, Mail, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/data-context';
import type { AgentLead } from '@/contexts/data-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const { addAgentLead } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState<Omit<NewUser, 'createdAt'> & { gstNumber?: string; panNumber?: string }>({
    email: '',
    companyName: '',
    userName: '',
    phone: '',
    role: 'User',
    password: '',
    industryType: '',
    gstNumber: '',
    panNumber: '',
  });
  const [taxIdType, setTaxIdType] = React.useState<'gst' | 'pan'>('gst');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [agentType, setAgentType] = React.useState<'Individual' | 'Company'>('Individual');
  const [agentAddress, setAgentAddress] = React.useState('');
  const [agentLinkedIn, setAgentLinkedIn] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [inviteError, setInviteError] = React.useState('');
  const [agentSubmitted, setAgentSubmitted] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState('');

  const BLOCKED_DOMAINS = ['gmail.com','yahoo.com','yahoo.in','hotmail.com','outlook.com','icloud.com','rediffmail.com','live.com','msn.com','aol.com','protonmail.com','ymail.com'];

  const isPersonalEmail = (email: string) => {
    if (email === 'balajispillai@gmail.com') return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return BLOCKED_DOMAINS.includes(domain);
  };

  const handleSendOtp = async () => {
    if (!formData.email) { setOtpError('Please enter your email first.'); return; }
    if (formData.role !== 'Warehouse Developer' && isPersonalEmail(formData.email)) { setOtpError('Please use your official company email address.'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      if (res.ok) { setOtpSent(true); } else { setOtpError('Failed to send OTP. Please try again.'); }
    } catch { setOtpError('Failed to send OTP. Please try again.'); }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpValue) { setOtpError('Please enter the OTP.'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp: otpValue }) });
      if (res.ok) { setOtpVerified(true); setOtpError(''); } else { setOtpError('Invalid or expired OTP. Please try again.'); }
    } catch { setOtpError('Verification failed. Please try again.'); }
    setOtpLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: 'User' | 'Warehouse Developer' | 'Agent' | 'O2O' | 'SuperAdmin') => {
    setFormData({ ...formData, role: value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'User' && !formData.industryType) {
      toast({ variant: 'destructive', title: 'Industry Type Required', description: 'Please select your industry type to continue.' });
      return;
    }
    if (formData.role === 'User' && isPersonalEmail(formData.email)) {
      toast({ variant: 'destructive', title: 'Official Email Required', description: 'Please use your official company email address to sign up.' });
      return;
    }
    if ((formData.role === 'User' || formData.role === 'Warehouse Developer') && !otpVerified) {
      toast({ variant: 'destructive', title: 'Email Verification Required', description: 'Please verify your email address before signing up.' });
      return;
    }
    if (formData.password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please re-enter your passwords.",
      });
      return;
    }
    if (formData.role === 'Agent') {
      if (inviteCode && (!inviteCode.startsWith('AGT-') || inviteCode.length < 8)) {
        setInviteError('Invalid invite code format.');
        return;
      }
      const agentLead: Omit<AgentLead, 'id' | 'status'> = {
        agentType,
        name: formData.userName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        address: agentAddress,
        socialProfileId: agentLinkedIn,
        ...(inviteCode ? { inviteCode } : {}),
      };
      addAgentLead(agentLead);
      setAgentSubmitted(true);
      toast({ title: 'Registration Received!', description: 'Thank you. We will review your details and be in touch shortly.' });
      return;
    }
    signup(formData);
  };

  if (agentSubmitted) {
    return (
      <div className="flex-grow bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Application Received!</CardTitle>
            <CardDescription className="mt-2">Thank you for applying as an Agent Partner. Our team will review your details and get back to you shortly.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full"><Link href="/">Return to Home</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex flex-col items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Building className="h-10 w-10 text-primary" />
                <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
              </div>
              <h1 className="text-3xl font-bold font-headline text-primary">ORS-ONE</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Building Transaction Ready Assets</p>
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Sign up as a customer or a property provider.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                    defaultValue="User"
                    className={`grid gap-4 ${formData.role === "Agent" ? "grid-cols-2" : "grid-cols-2"}`}
                    onValueChange={handleRoleChange}
                    value={formData.role}
                >
                    <div>
                    <RadioGroupItem value="User" id="role-user" className="peer sr-only" />
                    <Label
                        htmlFor="role-user"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        Customer (Tenant)
                    </Label>
                    </div>
                    <div>
                    <RadioGroupItem
                        value="Warehouse Developer"
                        id="role-provider"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="role-provider"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        Property Provider
                    </Label>
                    </div>
                    <div>
                    <RadioGroupItem value="Agent" id="role-agent" className="peer sr-only" />
                    <Label
                        htmlFor="role-agent"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary col-span-2"
                    >
                        Agent Partner
                    </Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Your Company LLC" required onChange={handleChange} value={formData.companyName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name</Label>
                  <Input id="userName" placeholder="John Doe" required onChange={handleChange} value={formData.userName} />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email {formData.role === 'User' ? <span className="text-xs text-muted-foreground">(official company email only)</span> : formData.role === 'Warehouse Developer' ? <span className="text-xs text-muted-foreground">(any email accepted)</span> : null}</Label>
              <div className="flex gap-2">
                <Input id="email" type="email" placeholder="you@yourcompany.com" required onChange={e => { handleChange(e); setOtpSent(false); setOtpVerified(false); setOtpError(''); }} value={formData.email} disabled={otpVerified} className="flex-1" />
                {(formData.role === 'User' || formData.role === 'Warehouse Developer') && !otpVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading || !formData.email}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap">
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Verify Email'}
                  </button>
                )}
                {otpVerified && <div className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle className="h-4 w-4" /> Verified</div>}
              </div>
              {(formData.role === 'User' || formData.role === 'Warehouse Developer') && otpSent && !otpVerified && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Input placeholder="Enter 6-digit OTP" value={otpValue} onChange={e => setOtpValue(e.target.value)} maxLength={6} className="flex-1" />
                    <button type="button" onClick={handleVerifyOtp} disabled={otpLoading}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
                      {otpLoading ? 'Verifying...' : 'Confirm'}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">OTP sent to {formData.email}. Valid for 5 minutes.</p>
                </div>
              )}
              {otpError && <p className="text-xs text-destructive">{otpError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 234 567 890" required onChange={handleChange} value={formData.phone} />
            </div>
            {formData.role === 'Warehouse Developer' && (
              <div className="space-y-2">
                <Label>GST / PAN Number <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 mb-2">
                  <button type="button"
                    onClick={() => setTaxIdType('gst')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${taxIdType === 'gst' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}>
                    GST Number
                  </button>
                  <button type="button"
                    onClick={() => setTaxIdType('pan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${taxIdType === 'pan' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}>
                    PAN (no GST)
                  </button>
                </div>
                {taxIdType === 'gst' ? (
                  <Input
                    id="gstNumber"
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                    value={formData.gstNumber || ''}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase(), panNumber: '' })}
                  />
                ) : (
                  <Input
                    id="panNumber"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={formData.panNumber || ''}
                    onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase(), gstNumber: '' })}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {taxIdType === 'gst' ? '15-character GST number. Used to verify your business identity.' : '10-character PAN. Use this only if you do not have a GST registration.'}
                </p>
              </div>
            )}
            {formData.role === 'User' && (
              <div className="space-y-2">
                <Label>Industry Type <span className="text-destructive">*</span></Label>
                <Select value={formData.industryType} onValueChange={v => setFormData({...formData, industryType: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      '3PL & Logistics',
                      'E-Commerce',
                      'FMCG',
                      'Manufacturing',
                      'Pharma & Healthcare',
                      'Retail',
                      'Automotive',
                      'Cold Chain & Food Processing',
                      'Textile & Apparel',
                      'Electronics & Technology',
                      'Chemical & Petrochemical',
                      'Agricultural & Agro Processing',
                      'Engineering & Industrial',
                      'Media & Publishing',
                      'Financial Services & Banking',
                    ].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.role === 'Agent' && (
              <>
                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <RadioGroup value={agentType} onValueChange={(v) => setAgentType(v as any)} className="grid grid-cols-2 gap-3">
                    <div>
                      <RadioGroupItem value="Individual" id="agt-individual" className="peer sr-only" />
                      <Label htmlFor="agt-individual" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 text-sm font-medium hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">Individual</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="Company" id="agt-company" className="peer sr-only" />
                      <Label htmlFor="agt-company" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 text-sm font-medium hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">Company</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentLinkedIn">LinkedIn Profile <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="agentLinkedIn" placeholder="linkedin.com/in/yourprofile" value={agentLinkedIn} onChange={e => setAgentLinkedIn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentAddress">Office Address <span className="text-destructive">*</span></Label>
                  <Textarea id="agentAddress" placeholder="123 Main St, Anytown" required={formData.role === 'Agent'} value={agentAddress} onChange={e => setAgentAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code <span className="text-xs text-muted-foreground">(optional — if invited by a client)</span></Label>
                  <Input id="inviteCode" placeholder="AGT-XXXXXX" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} maxLength={10} />
                  {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                </div>
              </>
            )}
            {formData.role !== 'Agent' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required onChange={handleChange} value={formData.password} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" required onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
            </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <a href={formData.role === 'User' ? '/terms-and-conditions/customer' : formData.role === 'Agent' ? '/terms-and-conditions/agent' : '/terms-and-conditions/developer'} target="_blank" className="text-primary underline">
                Terms and Conditions
              </a>
            </p>
            <Button type="submit" className="w-full">
{formData.role === 'Agent' ? <><UserPlus className="mr-2 h-4 w-4" /> Submit Application</> : <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
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
