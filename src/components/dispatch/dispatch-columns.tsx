import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/cents-utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Pencil, Printer, Trash2Icon } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dispatch } from "@/data/types";

export const dispatchColumns = (handleDeleteDispatch: (dispatch_id: number) => void): ColumnDef<Dispatch>[] => [
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
         const getStatusColor = (s: string): string => {
            switch (s) {
               case "DRAFT":
                  return "bg-gray-400";
               case "LOADING":
                  return "bg-blue-400";
               case "DISPATCHED":
                  return "bg-yellow-400";
               case "RECEIVING":
                  return "bg-orange-400";
               case "RECEIVED":
                  return "bg-green-400";
               case "DISCREPANCY":
                  return "bg-red-400";
               case "CANCELLED":
                  return "bg-red-600";
               default:
                  return "bg-gray-400";
            }
         };
         const getStatusLabel = (s: string): string => {
            switch (s) {
               case "DRAFT":
                  return "Creado";
               case "LOADING":
                  return "Cargando";
               case "DISPATCHED":
                  return "Despachado";
               case "RECEIVING":
                  return "Recibiendo";
               case "RECEIVED":
                  return "Recibido";
               case "DISCREPANCY":
                  return "Discrepancia";
               case "CANCELLED":
                  return "Cancelado";
               default:
                  return s;
            }
         };
         return (
            <Badge className="w-fit" variant="secondary">
               <span className={`rounded-full h-2 w-2 ${getStatusColor(status)}`} />
               <span className="ml-1.5 text-nowrap font-normal text-xs">{getStatusLabel(status)}</span>
            </Badge>
         );
      },
   },
  
   {
      accessorKey: "sender_agency.name",
      header: "Sender",
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
      header: "Receiver",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.receiver_agency?.name}>
               {row.original?.status === "RECEIVED" ? (
                  <Badge variant="outline">{row.original?.receiver_agency?.name}</Badge>
               ) : null}
            </div>
         );
      },
   },

   {
      accessorKey: "declared_parcels_count",
      header: "Declared",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">
                  {row.original?.declared_parcels_count ?? 0} / {row.original?.declared_weight.toString()} lbs
               </span>
            </div>
         );
      },
   },
   {
      accessorKey: "received_parcels_count",
      header: "Received",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">
                  {row.original?.received_parcels_count ?? 0} / {row.original?.received_parcels_count ?? 0} lbs
               </span>
            </div>
         );
      },
   },
   {
      accessorKey: "declared_cost_in_cents",
      header: "Declared Cost",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{formatCents(row.original?.declared_cost_in_cents)}</span>
            </div>
         );
      },
   },
    {
      accessorKey: "payment_status",
      header: "Pago",
      cell: ({ row }) => {
         const paymentStatus = row.original?.payment_status;
         const getPaymentColor = (s: string): string => {
            switch (s) {
               case "PAID":
                  return "bg-green-400";
               case "PENDING":
                  return "bg-yellow-400";
               case "PARTIALLY_PAID":
                  return "bg-orange-400";
               case "FULL_DISCOUNT":
                  return "bg-blue-400";
               case "REFUNDED":
                  return "bg-purple-400";
               case "CANCELLED":
                  return "bg-red-600";
               default:
                  return "bg-gray-400";
            }
         };
         const getPaymentLabel = (s: string): string => {
            switch (s) {
               case "PAID":
                  return "Pagado";
               case "PENDING":
                  return "Pendiente";
               case "PARTIALLY_PAID":
                  return "Parcial";
               case "FULL_DISCOUNT":
                  return "Descuento";
               case "REFUNDED":
                  return "Reembolsado";
               case "CANCELLED":
                  return "Cancelado";
               default:
                  return s;
            }
         };
         return (
            <Badge className="w-fit" variant="secondary">
               <span className={`rounded-full h-2 w-2 ${getPaymentColor(paymentStatus)}`} />
               <span className="ml-1.5 text-nowrap font-normal text-xs">{getPaymentLabel(paymentStatus)}</span>
            </Badge>
         );
      },
   },

   {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{format(row.original?.created_at, "dd/MM/yyyy HH:mm")}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{format(row.original?.updated_at, "dd/MM/yyyy HH:mm")}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "created_by.name",
      header: "Created By",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{row.original?.created_by?.name}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "received_by.name",
      header: "Received By",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className="text-sm">{row.original?.received_by?.name}</span>
            </div>
         );
      },
   },
   // Actions
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
                     <DropdownMenuItem
                        onClick={() => {
                           window.open(
                              `${import.meta.env.VITE_API_URL}/dispatches/${row.original?.id}/pdf`,
                              "_blank"
                           );
                        }}
                     >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Link
                           className="inline-flex items-center gap-2"
                           to={`/logistics/dispatch/create/${row.original?.id}`}
                        >
                           <Pencil className="w-4 h-4 mr-2" />
                           Editar
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteDispatch(row.original?.id)}
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
