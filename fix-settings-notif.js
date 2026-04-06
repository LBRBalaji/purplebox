const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');

// Add Bell icon import
content = content.replace(
  `import { PlusCircle, Save, Settings, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';`,
  `import { PlusCircle, Save, Settings, Trash2, KeyRound, Eye, EyeOff, Bell } from 'lucide-react';`
);

// Add emailNotifications state
content = content.replace(
  `  const [showConfirm, setShowConfirm] = React.useState(false);`,
  `  const [showConfirm, setShowConfirm] = React.useState(false);
  const [emailNotif, setEmailNotif] = React.useState(user?.emailNotifications ?? true);
  const [savingNotif, setSavingNotif] = React.useState(false);`
);

// Add handler function
content = content.replace(
  `  const hasAccess = user?.role === 'SuperAdmin';`,
  `  const hasAccess = user?.role === 'SuperAdmin';

  const handleSaveNotifPreference = async (val: boolean) => {
    setSavingNotif(true);
    setEmailNotif(val);
    try {
      const allUsers = Object.values({});
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, emailNotifications: val }),
      });
      toast({ title: val ? 'Email notifications enabled' : 'Email notifications disabled', description: val ? 'You will receive important alerts by email.' : 'You will only see alerts in the app.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save preference.' });
    }
    setSavingNotif(false);
  };`
);

// Find the return statement and add notification card before SuperAdmin section
content = content.replace(
  `  return (
    <main className="container mx-auto p-4 md:p-8">`,
  `  return (
    <main className="container mx-auto p-4 md:p-8">`
);

// Add notification preference card - insert before the closing main tag
content = content.replace(
  `      <div className="max-w-2xl mx-auto space-y-8">`,
  `      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to receive important alerts from ORS-ONE.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive important platform alerts to your registered email address</p>
              </div>
              <button
                onClick={() => handleSaveNotifPreference(!emailNotif)}
                disabled={savingNotif}
                className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${emailNotif ? 'bg-primary' : 'bg-muted'}\`}>
                <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${emailNotif ? 'translate-x-6' : 'translate-x-1'}\`} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">You will be notified by email for: payment confirmations, new leads, account updates, and other time-sensitive alerts.</p>
          </CardContent>
        </Card>`
);

fs.writeFileSync('src/app/dashboard/settings/page.tsx', content);
console.log('Done!');
