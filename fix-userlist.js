const fs = require('fs');
let content = fs.readFileSync('src/components/user-list.tsx', 'utf8');

// Add CheckCircle and XCircle to imports
content = content.replace(
  `import { Pencil, PlusCircle, Trash2, Shield, Users, Search, Building, Scaling } from 'lucide-react';`,
  `import { Pencil, PlusCircle, Trash2, Shield, Users, Search, Building, Scaling, CheckCircle, XCircle, Clock } from 'lucide-react';`
);

// Add handleApprove function before return
content = content.replace(
  `  return (
    <>
      <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">`,
  `  const handleApprove = async (u: User) => {
    updateUser({ ...u, status: 'approved' });
    try {
      await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, userName: u.userName }),
      });
      toast({ title: 'User Approved', description: u.userName + ' has been approved and notified by email.' });
    } catch {
      toast({ title: 'User Approved', description: u.userName + ' approved. Email notification may have failed.' });
    }
  };

  const handleReject = (u: User) => {
    updateUser({ ...u, status: 'rejected' });
    toast({ title: 'User Rejected', description: u.userName + ' has been rejected.' });
  };

  return (
    <>
      <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">`
);

// Add Status column header
content = content.replace(
  `                <TableHead className="text-right">Actions</TableHead>`,
  `                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>`
);

// Add Status column cell and Approve/Reject buttons
content = content.replace(
  `                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(user)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>`,
  `                    <TableCell>
                      {user.status === 'pending' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                      ) : user.status === 'rejected' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'pending' && (
                          <>
                            <Button size="sm" className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white h-8 px-3" onClick={() => handleApprove(user)}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-3" onClick={() => handleReject(user)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleOpenForm(user)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>`
);

fs.writeFileSync('src/components/user-list.tsx', content);
console.log('Done!');
