const fs = require('fs');
let content = fs.readFileSync('src/app/agent-signup/page.tsx', 'utf8');

// Add inviteCode to state
content = content.replace(
  `  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<AgentLead, 'id' | 'status'>>({`,
  `  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [inviteCode, setInviteCode] = React.useState('');
  const [inviteError, setInviteError] = React.useState('');
  const [formData, setFormData] = React.useState<Omit<AgentLead, 'id' | 'status'>>({`
);

// Add invite code validation in handleSubmit
content = content.replace(
  `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAgentLead(formData);
    toast({
        title: "Registration Received!",
        description: "Thank you for your interest. We will review your details and be in touch.",
    });
    setIsSubmitted(true);
  };`,
  `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    if (inviteCode) {
      if (!inviteCode.startsWith('AGT-') || inviteCode.length < 8) {
        setInviteError('Invalid invite code format. Please check and try again.');
        return;
      }
      addAgentLead({ ...formData, inviteCode });
    } else {
      addAgentLead(formData);
    }
    toast({
        title: "Registration Received!",
        description: "Thank you for your interest. We will review your details and be in touch shortly.",
    });
    setIsSubmitted(true);
  };`
);

// Add invite code field before submit button
content = content.replace(
  `             <div className="space-y-2">
              <Label htmlFor="address">Office Address</Label>
              <Textarea id="address" placeholder="123 Main St, Anytown, USA" required onChange={handleChange} value={formData.address} />
            </div>`,
  `             <div className="space-y-2">
              <Label htmlFor="address">Office Address</Label>
              <Textarea id="address" placeholder="123 Main St, Anytown, USA" required onChange={handleChange} value={formData.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code <span className="text-xs text-muted-foreground">(optional — if invited by a client)</span></Label>
              <Input id="inviteCode" placeholder="AGT-XXXXXX" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} maxLength={10} />
              {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            </div>`
);

fs.writeFileSync('src/app/agent-signup/page.tsx', content);
console.log('Done!');
