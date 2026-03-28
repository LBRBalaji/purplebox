'use client';
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
      setCountdown(60);
      toast({ title: 'OTP Sent!', description: `Verification code sent to ${maskedEmail}` });
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
              : `Enter the 6-digit code sent to ${maskedEmail}`}
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
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
