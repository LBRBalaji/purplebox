
'use client';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
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


export function UserList() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const allUsers = React.useMemo(() => {
    // Don't show the main admin in this list
    return Object.values(users).filter(u => u.email !== 'admin@example.com');
  }, [users]);

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

  const handleFormSubmit = (data: NewUser, isEditing: boolean) => {
    if (isEditing) {
      updateUser(data);
    } else {
      addUser(data);
    }

    toast({
        title: isEditing ? "User Updated" : "User Created",
        description: `The user account for ${data.email} has been successfully saved.`,
    });
  };


  return (
    <>
      <div className="flex justify-end mb-4">
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map(user => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.userName}</TableCell>
                  <TableCell>{user.companyName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                     <Badge variant={user.role === 'SuperAdmin' ? "secondary" : user.role === 'O2O' ? 'default' : "outline"}>
                        {user.role === 'SuperAdmin' ? 'Provider' : user.role === 'O2O' ? 'O2O' : 'Customer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
              ))}
            </TableBody>
          </Table>
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
