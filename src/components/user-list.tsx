
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { User, NewUser } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Pencil, PlusCircle, Trash2, Shield, Users, Search, Building, Scaling, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/contexts/auth-context';
import { UserForm } from './user-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Input } from './ui/input';

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

type ProviderSummary = {
  [email: string]: {
    listingCount: number;
    totalSize: number;
  };
};

export function UserList() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [providerSummary, setProviderSummary] = React.useState<ProviderSummary>({});

  React.useEffect(() => {
    async function fetchProviderSummary() {
      try {
        const response = await fetch('/api/provider-summary');
        if (response.ok) {
          const data = await response.json();
          setProviderSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch provider summary:", error);
      }
    }
    fetchProviderSummary();
  }, [users]); // Re-fetch if users change

  const { filteredUsers, roleCounts } = React.useMemo(() => {
    const allUsers = Object.values(users).filter(u => u.email !== 'admin@example.com');
    
    const counts = {
        'O2O Super Admin': 0,
        'O2O Platform Manager': 0,
        'Warehouse Developer': 0,
        'Customer (Demand)': 0,
        'Agent': 0,
    };

    allUsers.forEach(user => {
        switch(user.role) {
            case 'SuperAdmin': counts['O2O Super Admin']++; break;
            case 'O2O': counts['O2O Platform Manager']++; break;
            case 'Warehouse Developer': counts['Warehouse Developer']++; break;
            case 'User': counts['Customer (Demand)']++; break;
            case 'Agent': counts['Agent']++; break;
        }
    });

    const filtered = allUsers.filter(user => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      return (
        user.userName.toLowerCase().includes(lowerCaseSearch) ||
        user.companyName.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch)
      );
    });

    return { filteredUsers: filtered, roleCounts: counts };
  }, [users, searchTerm]);

  const handleDelete = (email: string) => {
    deleteUser(email);
    toast({
        variant: "destructive",
        title: "User Deleted",
        description: `The user account for ${email} has been removed.`,
    });
  };

  const handleOpenForm = (user: User | null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: Partial<NewUser> & { email: string }, isEditing: boolean) => {
    if (isEditing) {
      updateUser(data);
    } else {
      // The 'password' field is guaranteed to be present for new users by the form validation
      addUser(data as NewUser);
    }

    toast({
        title: isEditing ? "User Updated" : "User Created",
        description: `The user account for ${data.email} has been successfully saved.`,
    });
  };


  const handleApprove = async (u: User) => {
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
      <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Super Admins" value={roleCounts['O2O Super Admin']} icon={Users} />
        <StatCard title="O2O Managers" value={roleCounts['O2O Platform Manager']} icon={Users} />
        <StatCard title="Providers" value={roleCounts['Warehouse Developer']} icon={Users} />
        <StatCard title="Customers" value={roleCounts['Customer (Demand)']} icon={Users} />
        <StatCard title="Agents" value={roleCounts['Agent']} icon={Users} />
      </div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name, company, or email..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2" />
            Add New User
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active Listings</TableHead>
                <TableHead>Total Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => {
                const summary = providerSummary[user.email];
                return (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {user.userName}
                      {user.isCompanyAdmin && (
                          <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger>
                                      <Shield className="h-4 w-4 text-primary" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Company Admin</p>
                                  </TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>{user.companyName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.phone || "-"}</TableCell>
                    <TableCell>
                       <Badge variant={user.role === 'SuperAdmin' ? "destructive" : user.role === 'O2O' ? 'default' : "outline"}>
                          {user.role === 'SuperAdmin' ? 'O2O Super Admin' : user.role === 'O2O' ? 'O2O Manager' : user.role === 'Warehouse Developer' ? 'Provider' : user.role === 'User' ? 'Customer' : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {summary ? (
                        <div className="flex items-center gap-2">
                           <Building className="h-4 w-4 text-muted-foreground" />
                           {summary.listingCount}
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                     <TableCell>
                      {summary ? (
                        <div className="flex items-center gap-2">
                           <Scaling className="h-4 w-4 text-muted-foreground" />
                           {summary.totalSize.toLocaleString()} sqft
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
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
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="icon" disabled={user.email === currentUser?.email}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this user account.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.email)}>
                                  Continue
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
           {filteredUsers.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                <p>No users found matching your search criteria.</p>
            </div>
           )}
        </CardContent>
      </Card>

      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
