const fs = require('fs');

// Step 1: Add Company Admin designation button to user-list.tsx
let content = fs.readFileSync('src/components/user-list.tsx', 'utf8');

content = content.replace(
  `import { Pencil, PlusCircle, Trash2, Shield, Users, Search, Building, Scaling, CheckCircle, XCircle, Clock } from 'lucide-react';`,
  `import { Pencil, PlusCircle, Trash2, Shield, Users, Search, Building, Scaling, CheckCircle, XCircle, Clock, Crown } from 'lucide-react';`
);

content = content.replace(
  `  const handleApprove = async (u: User) => {`,
  `  const handleDesignateAdmin = async (u: User) => {
    if (u.plan !== 'Paid_Premium') {
      toast({ variant: 'destructive', title: 'Paid Plan Required', description: 'Company Admin can only be designated for Paid Premium users.' });
      return;
    }
    const domain = u.email.split('@')[1]?.toLowerCase();
    const allUsersList = Object.values(users) as User[];
    // Remove admin from any existing admin in same domain
    const existingAdmin = allUsersList.find(x => x.email !== u.email && x.isCompanyAdmin && x.email.split('@')[1]?.toLowerCase() === domain);
    if (existingAdmin) {
      updateUser({ ...existingAdmin, isCompanyAdmin: false });
    }
    updateUser({ ...u, isCompanyAdmin: !u.isCompanyAdmin });
    toast({ title: u.isCompanyAdmin ? 'Admin Removed' : 'Company Admin Designated', description: u.userName + ' is now ' + (u.isCompanyAdmin ? 'a regular user' : 'the Company Admin for ' + domain) });
    // Notify all team members
    if (!u.isCompanyAdmin) {
      const teamMembers = allUsersList.filter(x => x.email !== u.email && x.email.split('@')[1]?.toLowerCase() === domain);
      teamMembers.forEach(member => {
        fetch('/api/send-notification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: member.email,
            userName: member.userName,
            title: 'Your Company Admin has been assigned',
            message: u.userName + ' has been designated as the Company Admin for your team on ORS-ONE. They can now manage your team account and usage.',
            href: '/dashboard',
          }),
        }).catch(() => {});
      });
    }
  };

  const handleApprove = async (u: User) => {`
);

// Add Crown button in actions column
content = content.replace(
  `                        {user.status === 'pending' && (
                          <>
                            <Button size="sm" className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white h-8 px-3" onClick={() => handleApprove(user)}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-3" onClick={() => handleReject(user)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}`,
  `                        {user.status === 'pending' && (
                          <>
                            <Button size="sm" className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white h-8 px-3" onClick={() => handleApprove(user)}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-3" onClick={() => handleReject(user)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {user.status === 'approved' && user.role === 'User' && (
                          <Button size="sm" variant="outline"
                            className={\`rounded-lg text-xs h-8 px-3 \${user.isCompanyAdmin ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-border'}\`}
                            onClick={() => handleDesignateAdmin(user)}>
                            <Crown className="h-3.5 w-3.5 mr-1" />
                            {user.isCompanyAdmin ? 'Co. Admin' : 'Set Admin'}
                          </Button>
                        )}`
);

fs.writeFileSync('src/components/user-list.tsx', content);
console.log('Step 1 done!');
