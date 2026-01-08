import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import type { Customs } from "@/data/types";
import { Badge } from "../ui/badge";
import { centsToDollars } from "@/lib/cents-utils";

export const customsColumns = (
   handleEdit: (customsRate: Customs) => void,
   handleDelete: (customsRate: Customs) => void
): ColumnDef<Customs>[] => [
   {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
         return <span className="font-mono text-xs text-muted-foreground">{row.original?.id}</span>;
      },
   },
   {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.original?.name}</div>,
   },
   {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.original?.description}</div>,
   },
   {
      accessorKey: "custom_value",
      header: "Custom Value",
      cell: ({ row }) => (
         <span className="font-mono text-xs text-muted-foreground">{row.original?.custom_value} pts</span>
      ),
   },
   {
      accessorKey: "fee_in_cents",
      header: "Fee",
      cell: ({ row }) => (
         <span className="font-mono ">
            ${centsToDollars(row.original?.fee_in_cents).toFixed(2)}
         </span>
      ),
   },
   {
      accessorKey: "insurance_fee_in_cents",
      header: "Insurance Fee",
      
      cell: ({ row }) => (
         <span className="font-mono text-sm">
            ${centsToDollars(row.original?.insurance_fee_in_cents).toFixed(2)}
         </span>
      ),
   },

   {
      accessorKey: "max_quantity",
      header: "Max Quantity",
      cell: ({ row }) => {
         return <span className="font-mono text-xs text-muted-foreground">{row.original?.max_quantity}</span>;
      },
   },

   {
      accessorKey: "fee_type",
      header: "Fee Type",
      cell: ({ row }) => {
         return <Badge>{row.original?.fee_type}</Badge>;
      },
      size: 100,
   },
   {
      accessorKey: "min_weight",
      header: "Min Weight",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original?.min_weight}</span>,
   },

   {
      accessorKey: "max_weight",
      header: "Max Weight",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original?.max_weight}</span>,
   },

   // TODO: Add actions
   {
      accessorKey: "actions",
      header: "",
      enableResizing: false,
      size: 100,

      cell: ({ row }) => (
         <div className="flex justify-end">
            <Button asChild size="icon" variant="ghost">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => handleEdit(row.original as Customs)}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                     </DropdownMenuItem>

                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => handleDelete(row.original as Customs)}>
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </Button>
         </div>
      ),
   },
];
