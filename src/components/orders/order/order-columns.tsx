import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatFullName } from "@/lib/cents-utils";
import {
   EllipsisVertical,
   FileBoxIcon,
   TagIcon,
   Building2,
   Package,
   Send,
   PackageCheck,
   Warehouse,
   Container,
   Ship,
   Anchor,
   ShieldCheck,
   CheckCircle2,
   Truck,
   XCircle,
   CircleCheckBig,
   Undo2,
   type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuItem,
   DropdownMenuContent,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { DeleteOrderDialog } from "@/pages/orders/delete-order-dialog";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
   id: number;
   partner_order_id: string;
   agency: {
      id: number;
      name: string;
   };
   customer: {
      id: number;
      first_name: string;
      middle_name: string;
      last_name: string;
      second_last_name: string;
      mobile: string;
   };
   receiver: {
      id: number;
      first_name: string;
      middle_name: string;
      last_name: string;
      second_last_name: string;
      mobile: string;
      province: {
         name: string;
      };
      city: {
         name: string;
      };
   };
   service: {
      id: number;
      service_type: "MARITIME" | "AIR";
   };
   payment_status: string;
   status: string;
   created_at: string;
   updated_at: string;
   total_in_cents: number;
   paid_in_cents: number;
   user: {
      id: number;
      name: string;
   };
   _count: {
      order_items: number;
   };
};

const baseUrl = import.meta.env.VITE_API_URL;
const oldBaseUrl = "https://systemcaribetravel.com/ordenes/factura_print.php?id=";

// Order Status Constants
export const ORDER_STATUS = {
   // Estados base
   IN_AGENCY: "IN_AGENCY",
   IN_PALLET: "IN_PALLET",
   IN_DISPATCH: "IN_DISPATCH",
   RECEIVED_IN_DISPATCH: "RECEIVED_IN_DISPATCH",
   IN_WAREHOUSE: "IN_WAREHOUSE",
   IN_CONTAINER: "IN_CONTAINER",
   IN_TRANSIT: "IN_TRANSIT",
   AT_PORT_OF_ENTRY: "AT_PORT_OF_ENTRY",
   CUSTOMS_INSPECTION: "CUSTOMS_INSPECTION",
   RELEASED_FROM_CUSTOMS: "RELEASED_FROM_CUSTOMS",
   OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
   FAILED_DELIVERY: "FAILED_DELIVERY",
   DELIVERED: "DELIVERED",
   RETURNED_TO_SENDER: "RETURNED_TO_SENDER",
   // Estados parciales
   PARTIALLY_IN_PALLET: "PARTIALLY_IN_PALLET",
   PARTIALLY_IN_DISPATCH: "PARTIALLY_IN_DISPATCH",
   PARTIALLY_IN_CONTAINER: "PARTIALLY_IN_CONTAINER",
   PARTIALLY_IN_TRANSIT: "PARTIALLY_IN_TRANSIT",
   PARTIALLY_AT_PORT: "PARTIALLY_AT_PORT",
   PARTIALLY_IN_CUSTOMS: "PARTIALLY_IN_CUSTOMS",
   PARTIALLY_RELEASED: "PARTIALLY_RELEASED",
   PARTIALLY_OUT_FOR_DELIVERY: "PARTIALLY_OUT_FOR_DELIVERY",
   PARTIALLY_DELIVERED: "PARTIALLY_DELIVERED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Labels para UI
export const STATUS_LABELS: Record<OrderStatus, string> = {
   IN_AGENCY: "En agencia",
   IN_PALLET: "En pallet",
   IN_DISPATCH: "En despacho",
   RECEIVED_IN_DISPATCH: "Recibido en despacho",
   IN_WAREHOUSE: "En almacén",
   IN_CONTAINER: "En contenedor",
   IN_TRANSIT: "En tránsito",
   AT_PORT_OF_ENTRY: "En puerto",
   CUSTOMS_INSPECTION: "En aduana",
   RELEASED_FROM_CUSTOMS: "Liberado de aduana",
   OUT_FOR_DELIVERY: "En camino",
   FAILED_DELIVERY: "Entrega fallida",
   DELIVERED: "Entregado",
   RETURNED_TO_SENDER: "Devuelto",
   PARTIALLY_IN_PALLET: "Parcial en pallet",
   PARTIALLY_IN_DISPATCH: "Parcial en despacho",
   PARTIALLY_IN_CONTAINER: "Parcial en contenedor",
   PARTIALLY_IN_TRANSIT: "Parcial en tránsito",
   PARTIALLY_AT_PORT: "Parcial en puerto",
   PARTIALLY_IN_CUSTOMS: "Parcial en aduana",
   PARTIALLY_RELEASED: "Parcial liberado",
   PARTIALLY_OUT_FOR_DELIVERY: "Parcial en camino",
   PARTIALLY_DELIVERED: "Parcial entregado",
};

// Configuración de iconos y colores para cada estado
interface StatusConfig {
   icon: LucideIcon;
   color: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
   // Estados base - Flujo normal
   IN_AGENCY: { icon: Building2, color: "text-blue-500" },
   IN_PALLET: { icon: Package, color: "text-indigo-500" },
   IN_DISPATCH: { icon: Send, color: "text-violet-500" },
   RECEIVED_IN_DISPATCH: { icon: PackageCheck, color: "text-purple-500" },
   IN_WAREHOUSE: { icon: Warehouse, color: "text-fuchsia-500" },
   IN_CONTAINER: { icon: Container, color: "text-cyan-500" },
   IN_TRANSIT: { icon: Ship, color: "text-teal-500" },
   AT_PORT_OF_ENTRY: { icon: Anchor, color: "text-orange-500" },
   CUSTOMS_INSPECTION: { icon: ShieldCheck, color: "text-amber-500" },
   RELEASED_FROM_CUSTOMS: { icon: CheckCircle2, color: "text-lime-500" },
   OUT_FOR_DELIVERY: { icon: Truck, color: "text-sky-500" },
   FAILED_DELIVERY: { icon: XCircle, color: "text-red-500" },
   DELIVERED: { icon: CircleCheckBig, color: "text-green-500" },
   RETURNED_TO_SENDER: { icon: Undo2, color: "text-rose-500" },
   // Estados parciales - Mismos iconos con colores más suaves
   PARTIALLY_IN_PALLET: { icon: Package, color: "text-indigo-400" },
   PARTIALLY_IN_DISPATCH: { icon: Send, color: "text-violet-400" },
   PARTIALLY_IN_CONTAINER: { icon: Container, color: "text-cyan-400" },
   PARTIALLY_IN_TRANSIT: { icon: Ship, color: "text-teal-400" },
   PARTIALLY_AT_PORT: { icon: Anchor, color: "text-orange-400" },
   PARTIALLY_IN_CUSTOMS: { icon: ShieldCheck, color: "text-amber-400" },
   PARTIALLY_RELEASED: { icon: CheckCircle2, color: "text-lime-400" },
   PARTIALLY_OUT_FOR_DELIVERY: { icon: Truck, color: "text-sky-400" },
   PARTIALLY_DELIVERED: { icon: CircleCheckBig, color: "text-green-400" },
};

export const getOrderStatusBadge = (status: string): React.ReactNode => {
   const config = STATUS_CONFIG[status as OrderStatus] || { icon: Package, color: "text-gray-500" };
   const label = STATUS_LABELS[status as OrderStatus] || status;
   const Icon = config.icon;

   return (
      <Badge className={`"w-fit gap-1.5"`} variant="secondary">
         <Icon className={`shrink-0 min-w-4 min-h-4 mr-1 ${config.color}`} />
         <span className="text-nowrap font-normal text-muted-foreground text-xs">{label}</span>
      </Badge>
   );
};

export const orderColumns: ColumnDef<Order>[] = [
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
            <Link className="flex items-center gap-2" target="_blank" to={`${baseUrl}/orders/${row.original?.id}/pdf`}>
               <FileBoxIcon size={16} className="shrink-0" />
               <span className="font-mono text-xs text-muted-foreground ">{row.original?.id}</span>
            </Link>
         );
      },
      size: 100,
   },
   {
      accessorKey: "_count",
      header: "Labels",
      cell: ({ row }) => {
         return (
            <Badge
               variant="secondary"
               className="flex items-center gap-2 w-fit font-mono text-xs text-muted-foreground "
            >
               <Link
                  className="flex items-center gap-2"
                  target="_blank"
                  to={`${baseUrl}/orders/${row.original?.id}/labels-pdf`}
               >
                  <span>{row?.original?._count?.order_items || 0}</span>
                  <TagIcon size={16} />
               </Link>
            </Badge>
         );
      },
      size: 80,
   },

   {
      accessorKey: "agency.name",
      header: "Agencia",
      cell: ({ row }) => {
         return (
            <div className="max-w-[1500px] truncate flex flex-col" title={row.original?.agency?.name}>
               <span className="text-sm">{row.original?.agency?.name}</span>
               <div
                  className="w-fit text-[10px] text-muted-foreground font-light"
                  title={row.original?.service?.service_type}
               >
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-muted-foreground">{row.original?.service?.service_type}</span>
                     {row.original?.partner_order_id && (
                        <Link
                           className="text-[10px] text-muted-foreground"
                           target="_blank"
                           to={`${oldBaseUrl}${row.original?.partner_order_id}`}
                        >
                           ({row.original?.partner_order_id})
                        </Link>
                     )}
                  </div>
               </div>
            </div>
         );
      },
      size: 150,
   },

   {
      accessorKey: "customer",
      header: "Envia",
      cell: ({ row }) => {
         const customer = row.original?.customer;
         const fullName = formatFullName(
            customer?.first_name,
            customer?.middle_name,
            customer?.last_name,
            customer?.second_last_name
         );

         return (
            <div className="flex items-center gap-2 min-w-0">
               <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                     {customer?.first_name?.charAt(0) || ""}
                     {customer?.last_name?.charAt(0) || ""}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                  <div className="truncate text-sm font-medium" title={fullName}>
                     {fullName}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate" title={customer?.mobile}>
                     {customer?.mobile}
                  </div>
               </div>
            </div>
         );
      },
      size: 200,
   },
   {
      accessorKey: "receiver",
      header: "Recibe",
      cell: ({ row }) => {
         const receiver = row.original?.receiver;
         const fullName = formatFullName(
            receiver?.first_name,
            receiver?.middle_name,
            receiver?.last_name,
            receiver?.second_last_name
         );

         return (
            <div className="flex items-center gap-2 min-w-0">
               <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                     {receiver?.first_name?.charAt(0) || ""}
                     {receiver?.last_name?.charAt(0) || ""}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0 ">
                  <div className="truncate text-sm font-medium" title={fullName}>
                     {fullName}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate" title={receiver?.mobile}>
                     {receiver?.mobile}
                  </div>
               </div>
            </div>
         );
      },
      size: 200,
   },
   {
      accessorKey: "receiver.province.name",
      header: "Provincia",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col text-muted-foreround truncate">
               <span className="text-sm">{row.original?.receiver?.province?.name} </span>
               <span className="text-xs text-muted-foreground">{row.original?.receiver?.city?.name}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         return getOrderStatusBadge(row.original?.status);
      },
      size: 150,
   },
   {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => {
         return (
            <div className="text-sm whitespace-nowrap flex flex-col ">
               <span className="font-mono text-xs text-muted-foreground ">
                  {format(new Date(row.original?.created_at), "dd/MM/yyyy HH:mm a")}
               </span>
               <span className=" text-xs text-muted-foreground ">{row.original?.user?.name}</span>
            </div>
         );
      },
      size: 150,
   },

   {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }) => {
         return paymentStatus(row.original?.payment_status);
      },
      size: 100,
   },

   {
      accessorKey: "subtotal",
      header: "Total",
      cell: ({ row }) => {
         return (
            <div className="text-right font-mono text-sm text-mute whitespace-nowrap flex flex-col items-end">
               ${(row.original?.total_in_cents / 100).toFixed(2)}
               <span className="font-mono text-xs text-muted-foreground">
                  {(row.original?.total_in_cents - row.original?.paid_in_cents) / 100 !== 0 &&
                     ` ${((row.original?.total_in_cents - row.original?.paid_in_cents) / 100).toFixed(2)}`}
               </span>
            </div>
         );
      },
      size: 100,
   },
   {
      header: "Actions",
      cell: ({ row }) => {
         return (
            <div className="flex justify-center">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EllipsisVertical className="w-4 h-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <Link to={`/orders/${row.original.id}`}>
                        <DropdownMenuItem>
                           <FileBoxIcon className="w-4 h-4 mr-2" />
                           Details
                        </DropdownMenuItem>
                     </Link>
                     <DropdownMenuSeparator />

                     <DropdownMenuItem className="text-destructive" asChild>
                        <DeleteOrderDialog order_id={row.original.id} />
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

const paymentStatus = (payment_status: string) => {
   switch (payment_status) {
      case "PAID":
         return (
            <Badge className="w-fit  " variant="secondary">
               <span className="  rounded-full bg-green-400/80 text-white text-xs h-1.5 ring-1 ring-green-500/40 w-1.5 flex items-center justify-center" />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">Paid</span>
            </Badge>
         );
      case "PARTIALLY_PAID":
         return (
            <Badge className="w-fit  " variant="secondary">
               <span className="  rounded-full bg-yellow-400/80 text-white text-xs h-1.5 ring-1 ring-yellow-500/40 w-1.5 flex items-center justify-center" />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">Partial</span>
            </Badge>
         );
      case "FULL_DISCOUNT":
         return (
            <Badge className="w-fit  " variant="secondary">
               <span className="  rounded-full bg-sky-400/50 text-white text-xs h-1.5 ring-1 ring-sky-500/40 w-1.5 flex items-center justify-center" />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">Discounted</span>
            </Badge>
         );
      default:
         return (
            <Badge className="w-fit  " variant="secondary">
               <span className="  rounded-full bg-red-400/80 text-white text-xs h-1.5 ring-1 ring-red-500/40 w-1.5 flex items-center justify-center" />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">Pending</span>
            </Badge>
         );
   }
};
