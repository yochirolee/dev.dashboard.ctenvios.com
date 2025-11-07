import { type ColumnDef } from "@tanstack/react-table";
import { type Item } from "@/data/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const dispatchColumns: ColumnDef<Item>[] = [
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
      accessorKey: "hbl",
      header: "Envia",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0">
               <span className="text-sm">{row.original?.hbl}</span>
               <div className="text-xs text-muted-foreground truncate" title={row.original?.description}>
                  {row.original?.description}
               </div>
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
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">Received</span>
            </Badge>
         );
      },
   },
   {
      accessorKey: "agency.name",
      header: "Agencia",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.agency?.name}>
               <Badge variant="outline">{row.original?.agency?.name}</Badge>
            </div>
         );
      },
   },
   {
      accessorKey: "weight",
      header: "Peso",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{parseFloat(row.original?.weight.toString()).toFixed(2)} lbs</span>
            </div>
         );
      },
   },
];
