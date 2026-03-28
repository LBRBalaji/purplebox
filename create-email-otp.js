const fs = require('fs');

// ════════════════════════════════════════
// 1. CREATE API ROUTE — /api/send-otp
// ════════════════════════════════════════
const sendOtpApi = `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in Firestore
    await db.collection('otp-verifications').doc(email).set({ otp, expiresAt, createdAt: Date.now() });

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${process.env.RESEND_API_KEY}\` },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [email],
        subject: 'Your ORS-ONE Download Verification Code',
        html: \`
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;">
            <div style="background:#0D1F3C;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">ORS-ONE</h1>
              <p style="color:#AABBD0;margin:8px 0 0;font-size:13px;">Building Transaction Ready Assets</p>
            </div>
            <div style="background:#ffffff;padding:24px;border-radius:8px;text-align:center;">
              <p style="color:#1A2B3C;font-size:16px;margin-bottom:8px;">Your download verification code is:</p>
              <div style="background:#F4F6F9;border:2px dashed #F18F01;border-radius:8px;padding:20px;margin:16px 0;">
                <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#0D1F3C;">\${otp}</span>
              </div>
              <p style="color:#6B7E92;font-size:13px;">This code expires in <strong>5 minutes</strong>.</p>
              <p style="color:#6B7E92;font-size:13px;">If you did not request this, please ignore this email.</p>
            </div>
            <p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">
              ORS-ONE &mdash; lease.orsone.app &mdash; Lakshmi Balaji ORS Private Limited
            </p>
          </div>
        \`,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
`;

// ════════════════════════════════════════
// 2. CREATE API ROUTE — /api/verify-otp
// ════════════════════════════════════════
const verifyOtpApi = `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });

    const doc = await db.collection('otp-verifications').doc(email).get();
    if (!doc.exists) return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 });

    const data = doc.data()!;

    if (Date.now() > data.expiresAt) {
      await db.collection('otp-verifications').doc(email).delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    // Delete OTP after successful verification
    await db.collection('otp-verifications').doc(email).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
`;

// ════════════════════════════════════════
// 3. CREATE EMAIL OTP DIALOG COMPONENT
// ════════════════════════════════════════
const emailOtpDialog = `'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Mail, Loader2, RefreshCw } from 'lucide-react';

type EmailOtpDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerified: () => void;
};

export function EmailOtpDialog({ isOpen, onOpenChange, email, onVerified }: EmailOtpDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = React.useState<'send' | 'verify'>('send');
  const [otp, setOtp] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) { setStep('send'); setOtp(''); setCountdown(0); }
  }, [isOpen]);

  React.useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const maskedEmail = email ? email.replace(/(.)(.*)(@.*)/, (_, a, b, c) => a + b.replace(/./g, '*') + c) : '';

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('verify');
      setCountdown(30);
      toast({ title: 'OTP Sent!', description: \`Verification code sent to \${maskedEmail}\` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send OTP.' });
    } finally { setIsSending(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit code.' }); return; }
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      toast({ title: 'Verified!', description: 'Starting your download...' });
      onVerified();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Wrong OTP', description: error.message || 'Please try again.' });
      setOtp('');
    } finally { setIsVerifying(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Verify Your Email</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {step === 'send'
              ? 'A one-time verification code will be sent to your registered email to confirm your download.'
              : \`Enter the 6-digit code sent to \${maskedEmail}\`}
          </DialogDescription>
        </DialogHeader>

        {step === 'send' ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">{maskedEmail}</span>
            </div>
            <Button className="w-full" onClick={handleSendOtp} disabled={isSending}>
              {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Verification Code'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Input
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
              className="text-center text-3xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && otp.length === 6) handleVerifyOtp(); }}
            />
            <p className="text-xs text-center text-muted-foreground">Code expires in 5 minutes</p>
            <Button className="w-full" onClick={handleVerifyOtp} disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Download'}
            </Button>
            <div className="flex items-center justify-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">Resend in {countdown}s</p>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={handleSendOtp} disabled={isSending}>
                  <RefreshCw className="h-3 w-3" /> Resend Code
                </Button>
              )}
            </div>
            <Button variant="ghost" className="w-full text-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
`;

// Write all files
fs.mkdirSync('src/app/api/send-otp', { recursive: true });
fs.mkdirSync('src/app/api/verify-otp', { recursive: true });
fs.writeFileSync('src/app/api/send-otp/route.ts', sendOtpApi);
console.log('Send OTP API created');
fs.writeFileSync('src/app/api/verify-otp/route.ts', verifyOtpApi);
console.log('Verify OTP API created');
fs.writeFileSync('src/components/email-otp-dialog.tsx', emailOtpDialog);
console.log('Email OTP dialog created');

// ════════════════════════════════════════
// 4. PATCH listings-page-component.tsx
// Replace OtpVerifyDialog with EmailOtpDialog
// ════════════════════════════════════════
let listings = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');

// Replace old OTP import with new email OTP import
listings = listings.replace(
  "import { OtpVerifyDialog } from './otp-verify-dialog';",
  "import { EmailOtpDialog } from './email-otp-dialog';"
);

// Replace OtpVerifyDialog JSX with EmailOtpDialog
listings = listings.replace(
  `            <OtpVerifyDialog
                isOpen={isOtpOpen}
                onOpenChange={setIsOtpOpen}
                phoneNumber={user?.userPhone || ''}
                onVerified={proceedWithDownload}
            />`,
  `            <EmailOtpDialog
                isOpen={isOtpOpen}
                onOpenChange={setIsOtpOpen}
                email={user?.email || ''}
                onVerified={proceedWithDownload}
            />`
);

fs.writeFileSync('src/components/listings-page-component.tsx', listings);
console.log('Listings page updated');
console.log('All done!');
