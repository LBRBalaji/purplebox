const fs = require('fs');
let content = fs.readFileSync('src/app/signup/page.tsx', 'utf8');

content = content.replace(
  `import { Building, Sparkles, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';`,
  `import { Building, Sparkles, UserPlus, Mail, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';`
);

content = content.replace(
  `  const [confirmPassword, setConfirmPassword] = React.useState('');`,
  `  const [confirmPassword, setConfirmPassword] = React.useState('');
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
    if (isPersonalEmail(formData.email)) { setOtpError('Please use your official company email address.'); return; }
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
  };`
);

content = content.replace(
  `  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'User' && !formData.industryType) {
      toast({
        variant: 'destructive',
        title: 'Industry Type Required',
        description: 'Please select your industry type to continue.',
      });
      return;
    }
    if (formData.password !== confirmPassword) {`,
  `  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'User' && !formData.industryType) {
      toast({ variant: 'destructive', title: 'Industry Type Required', description: 'Please select your industry type to continue.' });
      return;
    }
    if (formData.role === 'User' && isPersonalEmail(formData.email)) {
      toast({ variant: 'destructive', title: 'Official Email Required', description: 'Please use your official company email address to sign up.' });
      return;
    }
    if (formData.role === 'User' && !otpVerified) {
      toast({ variant: 'destructive', title: 'Email Verification Required', description: 'Please verify your email address before signing up.' });
      return;
    }
    if (formData.password !== confirmPassword) {`
);

content = content.replace(
  `            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" required onChange={handleChange} value={formData.email} />
            </div>`,
  `            <div className="space-y-2">
              <Label htmlFor="email">Email {formData.role === 'User' && <span className="text-xs text-muted-foreground">(official company email only)</span>}</Label>
              <div className="flex gap-2">
                <Input id="email" type="email" placeholder="you@yourcompany.com" required onChange={e => { handleChange(e); setOtpSent(false); setOtpVerified(false); setOtpError(''); }} value={formData.email} disabled={otpVerified} className="flex-1" />
                {formData.role === 'User' && !otpVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading || !formData.email}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap">
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Verify Email'}
                  </button>
                )}
                {otpVerified && <div className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle className="h-4 w-4" /> Verified</div>}
              </div>
              {formData.role === 'User' && otpSent && !otpVerified && (
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
            </div>`
);

fs.writeFileSync('src/app/signup/page.tsx', content);
console.log('Done!');
