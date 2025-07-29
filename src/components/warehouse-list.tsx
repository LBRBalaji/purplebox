
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { warehouses as initialWarehouses } from '@/lib/warehouse-mock-data';
import type { WarehouseSchema } from '@/lib/schema';
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
import { WarehouseForm } from './warehouse-form';


export function WarehouseList() {
  const [warehouses, setWarehouses] = React.useState<WarehouseSchema[]>(initialWarehouses);
  const { toast } = useToast();
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<WarehouseSchema | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);


  const handleToggleActive = (id: string, isActive: boolean) => {
    setWarehouses(currentWarehouses =>
      currentWarehouses.map(w =>
        w.id === id ? { ...w, isActive } : w
      )
    );
    toast({
        title: `Warehouse ${isActive ? 'Activated' : 'Deactivated'}`,
        description: `Listing ${id} is now ${isActive ? 'visible' : 'hidden'} on the public map.`,
    });
  };

  const handleDelete = (id: string) => {
    setWarehouses(currentWarehouses =>
      currentWarehouses.filter(w => w.id !== id)
    );
    toast({
        variant: "destructive",
        title: "Warehouse Deleted",
        description: `Listing ${id} has been removed.`,
    });
  };

  const handleOpenForm = (warehouse: WarehouseSchema | null) => {
    setSelectedWarehouse(warehouse);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (data: WarehouseSchema) => {
    const isEditing = !!selectedWarehouse;
    if (isEditing) {
      // Update
      setWarehouses(current => current.map(w => w.id === data.id ? data : w));
    } else {
      // Create
      setWarehouses(current => [{ ...data, id: `WH-${Date.now()}` }, ...current]);
    }

    toast({
        title: isEditing ? "Warehouse Updated" : "Warehouse Created",
        description: `Listing ${data.id} has been successfully saved.`,
    });
  };


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2" />
            Add New Warehouse
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map(warehouse => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-mono">{warehouse.id}</TableCell>
                  <TableCell className="font-medium">{warehouse.title}</TableCell>
                  <TableCell>{warehouse.address.city}, {warehouse.address.state}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`active-toggle-${warehouse.id}`}
                            checked={warehouse.isActive}
                            onCheckedChange={(checked) => handleToggleActive(warehouse.id, checked)}
                            aria-label={`Toggle visibility for ${warehouse.title}`}
                        />
                         <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                            {warehouse.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenForm(warehouse)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the warehouse listing.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(warehouse.id)}>
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

      <WarehouseForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        warehouse={selectedWarehouse}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
