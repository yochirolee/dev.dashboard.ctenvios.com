import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderItem } from "@/data/types";
import { formatCents, calculate_row_subtotal } from "@/lib/cents-utils";

interface ItemsTableProps {
   items: OrderItem[];
}

export function ItemsTable({ items }: ItemsTableProps) {
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead className="w-20 text-muted-foreground">HBL</TableHead>
               <TableHead className="w-full text-muted-foreground">Descripción</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Seguro</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Cargo</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Arancel</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Rate</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Peso</TableHead>
               <TableHead className="text-right w-14 text-muted-foreground">Subtotal</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {items.map((item, index) => (
               <TableRow key={index}>
                  <TableCell>{item.hbl}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{formatCents(item.insurance_fee_in_cents)}</TableCell>
                  <TableCell className="text-right">{formatCents(item.delivery_fee_in_cents)}</TableCell>
                  <TableCell className="text-right">{formatCents(item.customs_fee_in_cents)}</TableCell>
                  <TableCell className="text-right">{formatCents(item.rate_in_cents)}</TableCell>
                  <TableCell className="text-right">{item.weight.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                     {formatCents(
                        calculate_row_subtotal(
                           item.rate_in_cents,
                           item.weight,
                           item.customs_fee_in_cents,
                           item.charge_fee_in_cents,
                           item.insurance_fee_in_cents,
                           item.rate.rate_type
                        )
                     )}
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
}
