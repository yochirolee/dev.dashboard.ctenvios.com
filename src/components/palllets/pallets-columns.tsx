import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Pencil, Trash2Icon, Package } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Pallet } from "@/data/types";

export const palletsColumns = (handleDeletePallet: (pallet_id: number) => void): ColumnDef<Pallet>[] => [
   {
      id: "select",
      header: ({ table }) => (
         <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
         />
      ),
      cell: ({ row }) => (
         <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
         />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
   },
   {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-sm">{row.original?.id?.toString()}</span>,
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         const status = row.original?.status ?? "UNKNOWN";
         return (
            <Badge className="w-fit" variant="secondary">
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{status}</span>
            </Badge>
         );
      },
   },
   {
      accessorKey: "agency.name",
      header: "Agencia",
      cell: ({ row }) => {
         const name = row.original?.agency?.name ?? "-";
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={name}>
               <Badge variant="outline">{name}</Badge>
            </div>
         );
      },
   },
   {
      accessorKey: "_count.parcels",
      header: "Paquetes",
      cell: ({ row }) => {
         const parcelsCount = row.original?._count?.parcels ?? 0;
         return (
            <div className="flex items-center gap-2 min-w-0">
               <Package className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm font-medium">{parcelsCount}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
         <span className="text-sm">
            {row.original?.created_at ? format(new Date(row.original.created_at), "dd/MM/yyyy") : "-"}
         </span>
      ),
   },
   {
      accessorKey: "created_by.name",
      header: "Created By",
      cell: ({ row }) => <span className="text-sm">{row.original?.created_by?.name ?? "-"}</span>,
   },
   {
      header: " ",
      cell: ({ row }) => {
         return (
            <div className="flex justify-center">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EllipsisVertical className="w-4 h-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem>
                        <Link
                           className="inline-flex items-center gap-2"
                           to={`/logistics/pallets/create/${row.original?.id}`}
                        >
                           <Pencil className="w-4 h-4 mr-2" />
                           Editar
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeletePallet(row.original?.id)}
                     >
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Eliminar
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         );
      },
      size: 60,
      enableSorting: false,
   },
];
