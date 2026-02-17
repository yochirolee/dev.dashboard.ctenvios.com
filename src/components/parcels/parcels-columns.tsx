import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { getStatusBadge } from "@/lib/parcel-status";
import { Checkbox } from "@/components/ui/checkbox";
import { FileBoxIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
   DropdownMenu,
   DropdownMenuItem,
   DropdownMenuContent,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatFullName } from "@/lib/cents-utils";
const baseUrl = import.meta.env.VITE_API_URL;
interface ParcelPerson {
   id?: number;
   first_name?: string;
   middle_name?: string;
   last_name?: string;
   second_last_name?: string;
   mobile?: string;
   phone?: string;
   address?: string;
}

interface ParcelPersonWithPlace extends ParcelPerson {
   province?: { id: number; name: string };
   city?: { id: number; name: string };
}

export interface Parcel {
   id: number;
   tracking_number?: string;
   order_id?: number;
   description?: string;
   status?: string;
   status_details?: string;
   weight?: number | string;
   external_reference?: string;
   agency_id?: number;
   agency?: { id: number; name: string };
   service?: { id: number; name: string };
   province?: { id: number; name: string };
   city?: { id: number; name: string };
   customer?: ParcelPerson;
   receiver?: ParcelPersonWithPlace;
   /** When API returns order with nested customer/receiver (and receiver.province, receiver.city) */
   order?: {
      id?: number;
      customer?: ParcelPerson;
      receiver?: ParcelPersonWithPlace;
   };
   updated_at?: string;
   container_id?: number | null;
   pallet_id?: number | null;
   user?: {
      id: number;
      name: string;
   };
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
            <div className="flex items-center gap-2">
               <Link
                  className="flex items-center gap-2"
                  target="_blank"
                  to={`${baseUrl}/orders/${row.original?.order_id}/pdf`}
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
                     to={`${baseUrl}/orders/${row.original?.order_id}/labels-pdf`}
                  >
                     <TagIcon size={16} />
                  </Link>
               </Badge>
            </div>
         );
      },
      size: 100,
   },

   {
      accessorKey: "Tracking",
      header: "Tracking",
      cell: ({ row }) => (
         <div className="max-w-[220px] truncate" title={row.original.tracking_number ?? ""}>
            <span className="text-sm font-mono font-medium">{row.original.tracking_number ?? "-"}</span>
            <div className="max-w-[400px]  flex flex-col" title={row.original.description ?? ""}>
               <span className="text-xs text-muted-foreground truncate ">{row.original.description ?? "-"}</span>
            </div>
         </div>
      ),
   },

   {
      accessorKey: "agency",
      header: "Agencia",
      cell: ({ row }) => (
         <div className="max-w-[150px] truncate flex flex-col" title={row.original?.agency?.name}>
            <span className="text-sm">{row.original?.agency?.name ?? row.original?.agency_id ?? "-"}</span>
            {row.original?.service?.name && (
               <span className="text-[10px] text-muted-foreground">{row.original.service.name}</span>
            )}
         </div>
      ),
   },

   {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col  gap-2">
               {getStatusBadge(row.original.status ?? "IN_AGENCY")}
               <span className="text-xs text-muted-foreground">{row.original.status_details ?? "-"}</span>
            </div>
         );
      },
   },

   {
      accessorKey: "customer",
      header: "Envia",
      cell: ({ row }) => {
         const customer = row.original?.order?.customer ?? row.original?.customer;
         const fullName = formatFullName(
            customer?.first_name,
            customer?.middle_name,
            customer?.last_name,
            customer?.second_last_name,
         );
         if (!customer && !fullName) return <span className="text-sm text-muted-foreground">-</span>;
         return (
            <div className="flex items-center gap-2 min-w-0">
               <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                     {customer?.first_name?.charAt(0) ?? ""}
                     {customer?.last_name?.charAt(0) ?? ""}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                  <div className="truncate text-sm font-medium" title={fullName}>
                     {fullName || "-"}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate" title={customer?.mobile}>
                     {customer?.mobile ?? ""}
                  </div>
               </div>
            </div>
         );
      },
   },
   {
      accessorKey: "receiver",
      header: "Recibe",
      cell: ({ row }) => {
         const receiver = row.original?.order?.receiver ?? row.original?.receiver;
         const fullName = formatFullName(
            receiver?.first_name,
            receiver?.middle_name,
            receiver?.last_name,
            receiver?.second_last_name,
         );
         if (!receiver && !fullName) return <span className="text-sm text-muted-foreground">-</span>;
         return (
            <div className="flex items-center gap-2 min-w-0">
               <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                     {receiver?.first_name?.charAt(0) ?? ""}
                     {receiver?.last_name?.charAt(0) ?? ""}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                  <div className="truncate text-sm font-medium" title={fullName}>
                     {fullName || "-"}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate" title={receiver?.mobile}>
                     {receiver?.mobile ?? ""}
                  </div>
               </div>
            </div>
         );
      },
   },
   {
      accessorKey: "province",
      header: "Provincia",
      cell: ({ row }) => {
         const province = row.original?.order?.receiver?.province ?? row.original?.province;
         const city = row.original?.order?.receiver?.city ?? row.original?.city;
         return (
            <div className="flex flex-col truncate text-muted-foreground">
               <span className="text-sm">{province?.name ?? "-"}</span>
               <span className="text-xs text-muted-foreground">{city?.name ?? ""}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "weight",
      header: "Peso",
      cell: ({ row }) => {
         const w = row.original.weight;
         const n = typeof w === "number" ? w : parseFloat(String(w ?? ""));
         return (
            <span className="text-xs font-mono text-muted-foreground">
               {Number.isNaN(n) ? "-" : `${n.toFixed(2)} lb`}
            </span>
         );
      },
   },
   {
      accessorKey: "updated_at",
      header: "Fecha",
      cell: ({ row }) => (
         <div className="text-sm whitespace-nowrap flex flex-col">
            <span className="font-mono text-xs text-muted-foreground">
               {row.original.updated_at ? format(new Date(row.original.updated_at), "dd/MM/yyyy HH:mm") : "-"}
            </span>
            <span className=" text-xs text-muted-foreground ">{row.original?.user?.name ?? "-"}</span>
         </div>
      ),
   },
   {
      header: "Actions",
      cell: ({ row }) => (
         <div className="flex justify-center">
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                     <EllipsisVertical className="w-4 h-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <Link
                     to={
                        (row.original?.order_id ?? row.original?.order?.id) != null
                           ? `/orders/${row.original?.order_id ?? row.original?.order?.id}`
                           : "#"
                     }
                  >
                     <DropdownMenuItem>
                        <FileBoxIcon className="w-4 h-4 mr-2" />
                        Ver orden
                     </DropdownMenuItem>
                  </Link>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      ),
      size: 60,
      enableSorting: false,
   },
];

export const columns = parcelColumns;
