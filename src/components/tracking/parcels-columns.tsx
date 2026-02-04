import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getStatusBadge } from "@/lib/parcel-status";
import { Checkbox } from "@/components/ui/checkbox";
import { FileBoxIcon, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

const baseUrl = import.meta.env.VITE_API_URL;

export interface Parcel {
   id: number;
   tracking_number?: string;
   order_id?: number;
   description?: string;
   status?: string;
   weight?: number | string;
   updated_at?: string;
   agency_id?: number;
   current_agency_id?: number;
}

export const parcelColumns: ColumnDef<Parcel>[] = [
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
      header: "Orden",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 max-w-[100px]">
               <Link
                  className="flex items-center gap-2"
                  target="_blank"
                  to={`${baseUrl}/orders/${row.original?.id}/pdf`}
               >
                  <FileBoxIcon size={16} className="shrink-0" />
                  <span className="font-mono text-xs text-muted-foreground ">{row.original?.id}</span>
               </Link>
               <Badge
                  variant="secondary"
                  className="flex items-center gap-2 w-fit font-mono text-xs text-muted-foreground "
               >
                  <Link
                     className="flex items-center gap-2"
                     target="_blank"
                     to={`${baseUrl}/orders/${row.original?.id}/labels-pdf`}
                  >
                     <TagIcon size={16} />
                  </Link>
               </Badge>
            </div>
         );
      },
      size: 80,
   },

   {
      accessorKey: "tracking_number",
      header: "Tracking",
      cell: ({ row }) => (
         <span className="text-sm font-medium truncate max-w-[100px]">{row.original.tracking_number ?? "-"}</span>
      ),
      size: 100,
   },

   {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => <span className="text-sm text-muted-foreground ">{row.original.description ?? "-"}</span>,
      size: 150,
   },
   {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.original.status ?? "IN_AGENCY"),
   },
   {
      accessorKey: "weight",
      header: "Peso",
      cell: ({ row }) => {
         const w = row.original.weight;
         const n = typeof w === "number" ? w : parseFloat(String(w ?? ""));
         return <span className="text-sm">{isNaN(n) ? "-" : n.toFixed(2)} lb</span>;
      },
   },
   {
      accessorKey: "updated_at",
      header: "Actualizado",
      cell: ({ row }) => (
         <span className="text-sm text-muted-foreground">
            {row.original.updated_at ? format(new Date(row.original.updated_at), "dd/MM/yyyy HH:mm") : "-"}
         </span>
      ),
   },
];

// Alias for backwards compatibility
export const columns = parcelColumns;
