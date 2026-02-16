import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/cents-utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PackagePlusIcon, DollarSign, EllipsisVertical, Printer, Trash2Icon } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dispatch } from "@/data/types";

export const dispatchColumns = (
   handleDeleteDispatch: (dispatch_id: number) => void,
   isAdmin: boolean,
): ColumnDef<Dispatch>[] => [
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
               case "PARTIAL_RECEIVED":
                  return "bg-orange-400";
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
               case "PARTIAL_RECEIVED":
                  return "Parcial";
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
      header: "Created",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.sender_agency?.name}>
               <Badge variant="outline">{row.original?.sender_agency?.name}</Badge>
               <span className="text-xs pl-1 text-muted-foreground">{row.original?.created_by?.name}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "receiver_agency.name",
      header: "Received",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-2 min-w-0" title={row.original?.receiver_agency?.name}>
               {row.original?.status === "RECEIVED" ? (
                  <Badge variant="outline">{row.original?.receiver_agency?.name}</Badge>
               ) : null}
               <span className="text-xs pl-1 text-muted-foreground">{row.original?.received_by?.name}</span>
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
                  {row.original?.received_parcels_count ?? 0} / {row.original?.weight ?? 0} lbs
               </span>
            </div>
         );
      },
   },

   {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-muted-foreground">
               <span className="whitespace-nowrap">{format(row.original?.created_at, "dd/MM/yyyy HH:mm")}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-muted-foreground   ">
               <span className="whitespace-nowrap">{format(row.original?.updated_at, "dd/MM/yyyy HH:mm")}</span>
            </div>
         );
      },
   },

   {
      accessorKey: "payment_status",
      header: "Payment",
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
      accessorKey: "paid_in_cents",
      header: "Total",
      cell: ({ row }) => {
         return (
            <div className="text-right font-mono text-sm text-mute whitespace-nowrap flex flex-col items-end">
               {formatCents(row.original?.cost_in_cents ?? 0)}
               <span className="font-mono text-xs text-muted-foreground">
                  {(row.original?.cost_in_cents - row.original?.paid_in_cents) / 100 !== 0 &&
                     ` ${formatCents(row.original?.cost_in_cents - row.original?.paid_in_cents)}`}
               </span>
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
                           window.open(`${import.meta.env.VITE_API_URL}/dispatches/${row.original?.id}/pdf`, "_blank");
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
                           <PackagePlusIcon className="w-4 h-4 mr-2" />
                           Cargar Paquetes
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link
                           className="inline-flex items-center gap-2 w-full"
                           to={`/logistics/dispatch/${row.original?.id}`}
                        >
                           <DollarSign className="w-4 h-4 mr-2" />
                           Pagos
                        </Link>
                     </DropdownMenuItem>
                     {isAdmin && (
                        <DropdownMenuItem
                           className="text-destructive"
                           onClick={() => handleDeleteDispatch(row.original?.id)}
                        >
                           <Trash2Icon className="w-4 h-4 mr-2" />
                           Eliminar
                        </DropdownMenuItem>
                     )}
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         );
      },
      size: 60,
      enableSorting: false,
   },
];
