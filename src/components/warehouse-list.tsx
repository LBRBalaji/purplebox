
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

export function WarehouseList() {
  const [warehouses, setWarehouses] = React.useState<WarehouseSchema[]>(initialWarehouses);
  const { toast } = useToast();

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

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warehouse ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Size (sq. ft.)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Publicly Visible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map(warehouse => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.id}</TableCell>
                <TableCell>{warehouse.title}</TableCell>
                <TableCell>{warehouse.address.city}, {warehouse.address.state}</TableCell>
                <TableCell>{warehouse.size.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={warehouse.isActive}
                    onCheckedChange={(checked) => handleToggleActive(warehouse.id, checked)}
                    aria-label={`Toggle visibility for ${warehouse.title}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
