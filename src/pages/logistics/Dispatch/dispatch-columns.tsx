import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/cents-utils";
import { format } from "date-fns";

export interface Dispatch {
   id: number;
   status: "PENDING" | "RECEIVED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
   sender_agency: {
      id: number;
      name: string;
   };
   receiver_agency: {
      id: number;
      name: string;
   };
   user: {
      id: number;
      name: string;
   };
   weight: number;
   total_in_cents: number;
   created_at: string;
   updated_at: string;
   _count: {
      items: number;
   };
}

export const dispatchColumns: ColumnDef<Dispatch>[] = [
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
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0">
               <span className="text-sm">{row.original?.id.toString()}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         const status = row.original?.status;
         const color = status === "RECEIVED" ? "bg-green-400/80 ring-green-500/40" : "bg-red-400/80 ring-red-500/40";
         return (
            <Badge className="w-fit  " variant="secondary">
               <span
                  className={`  rounded-full bg-${color}-400/80 text-white text-xs h-1.5 ring-1 ring-${color}-500/40 w-1.5 flex items-center justify-center`}
               />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{status}</span>
            </Badge>
         );
      },
   },
   {
      accessorKey: "sender_agency.name",
      header: "Sender Agency",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.sender_agency?.name}>
               <Badge variant="outline">{row.original?.sender_agency?.name}</Badge>
            </div>
         );
      },
   },
   {
      accessorKey: "receiver_agency.name",
      header: "Receiver Agency",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.receiver_agency?.name}>
               <Badge variant="outline">{row.original?.receiver_agency?.name}</Badge>
            </div>
         );
      },
   },

   {
      accessorKey: "_count",
      header: "Count",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{row.original?._count?.items ?? 0}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{row.original?.weight.toString()} lbs</span>
            </div>
         );
      },
   },
   {
      accessorKey: "total_in_cents",
      header: "Total",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{formatCents(row.original?.total_in_cents)}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{format(row.original?.created_at, "dd/MM/yyyy")}</span>
            </div>
         );
      },
   },
];
