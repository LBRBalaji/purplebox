const fs = require('fs');

const otpDialog = `'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Phone, Loader2, RefreshCw } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global { interface Window { recaptchaVerifier?: any; confirmationResult?: any; } }

type OtpVerifyDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onVerified: () => void;
};

export function OtpVerifyDialog({ isOpen, onOpenChange, phoneNumber, onVerified }: OtpVerifyDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = React.useState('send');
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

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
    if (cleaned.length === 10) return '+91' + cleaned;
    return phone.startsWith('+') ? phone : '+' + cleaned;
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} });
    }
  };

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      setupRecaptcha();
      const formatted = formatPhone(phoneNumber);
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      window.confirmationResult = result;
      setStep('verify');
      setCountdown(30);
      toast({ title: 'OTP Sent', description: 'Verification code sent to your mobile number.' });
    } catch (error: any) {
      const msg = error.code === 'auth/invalid-phone-number' ? 'Invalid phone number. Please update your profile.' :
                  error.code === 'auth/too-many-requests' ? 'Too many attempts. Please try after some time.' :
                  'Failed to send OTP. Please try again.';
      toast({ variant: 'destructive', title: 'Error', description: msg });
      if (window.recaptchaVerifier) { try { window.recaptchaVerifier.clear(); } catch(e){} window.recaptchaVerifier = undefined; }
    } finally { setIsSending(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit code.' }); return; }
    setIsVerifying(true);
    try {
      await window.confirmationResult.confirm(otp);
      toast({ title: 'Verified!', description: 'Phone verified. Starting your download...' });
      onVerified();
      onOpenChange(false);
    } catch {
      toast({ variant: 'destructive', title: 'Wrong OTP', description: 'The code entered is incorrect. Please try again.' });
      setOtp('');
    } finally { setIsVerifying(false); }
  };

  const last4 = phoneNumber ? phoneNumber.slice(-4) : '????';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Verify Your Phone</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {step === 'send'
              ? 'A one-time password will be sent to your registered mobile number to confirm your download.'
              : 'Enter the 6-digit code sent to your mobile number ending in ' + last4}
          </DialogDescription>
        </DialogHeader>

        <div id="recaptcha-container" />

        {step === 'send' ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">Mobile ending in ...{last4}</span>
            </div>
            <Button className="w-full" onClick={handleSendOtp} disabled={isSending}>
              {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send OTP to My Mobile'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && otp.length === 6) handleVerifyOtp(); }}
            />
            <Button className="w-full" onClick={handleVerifyOtp} disabled={isVerifying || otp.length !== 6}>
              {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Download'}
            </Button>
            <div className="flex items-center justify-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">Resend OTP in {countdown}s</p>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={handleSendOtp} disabled={isSending}>
                  <RefreshCw className="h-3 w-3" /> Resend OTP
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

fs.writeFileSync('src/components/otp-verify-dialog.tsx', otpDialog);
console.log('OTP dialog created');

let listings = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');

// Add import
listings = listings.replace(
  "import { DownloadTermsDialog } from './download-terms-dialog';",
  "import { DownloadTermsDialog } from './download-terms-dialog';\nimport { OtpVerifyDialog } from './otp-verify-dialog';"
);

// Add OTP state
listings = listings.replace(
  "    const [isTermsOpen, setIsTermsOpen] = React.useState(false);",
  "    const [isTermsOpen, setIsTermsOpen] = React.useState(false);\n    const [isOtpOpen, setIsOtpOpen] = React.useState(false);"
);

// Route through OTP when already acknowledged terms
listings = listings.replace(
  "        if (hasAcknowledged) {\n            proceedWithDownload();",
  "        if (hasAcknowledged) {\n            setIsOtpOpen(true);"
);

// Route through OTP after terms acceptance
listings = listings.replace(
  "    const handleTermsAccept = () => {\n        setIsTermsOpen(false);\n        proceedWithDownload();",
  "    const handleTermsAccept = () => {\n        setIsTermsOpen(false);\n        setIsOtpOpen(true);"
);

// Add OTP dialog to JSX
listings = listings.replace(
  "            <DownloadTermsDialog\n                isOpen={isTermsOpen}\n                onOpenChange={setIsTermsOpen}\n                onAccept={handleTermsAccept}\n            />",
  "            <DownloadTermsDialog\n                isOpen={isTermsOpen}\n                onOpenChange={setIsTermsOpen}\n                onAccept={handleTermsAccept}\n            />\n            <OtpVerifyDialog\n                isOpen={isOtpOpen}\n                onOpenChange={setIsOtpOpen}\n                phoneNumber={user?.userPhone || ''}\n                onVerified={proceedWithDownload}\n            />"
);

fs.writeFileSync('src/components/listings-page-component.tsx', listings);
console.log('Listings page patched');
console.log('All done!');
