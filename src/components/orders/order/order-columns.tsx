import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatFullName } from "@/lib/cents-utils";
import { EllipsisVertical, FileBoxIcon, TagIcon } from "lucide-react";
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
import { RestoreOrderButton } from "@/pages/orders/restore-order-button";
import {
   PARCEL_STATUS,
   STATUS_CONFIG,
   STATUS_LABELS,
   getStatusBadge as getOrderStatusBadge,
   type ParcelStatus,
} from "@/lib/parcel-status";
import { useAppStore } from "@/stores/app-store";

const ADMIN_ROLES = ["AGENCY_ADMIN", "ADMINISTRATOR", "ROOT"] as const;

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

const OrderActionsCell = ({ order }: { order: Order }): React.ReactElement => {
   const user = useAppStore((state) => state.user);
   const canDeleteOrRestore = user?.role && ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);

   return (
      <div className="flex justify-center">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                  <EllipsisVertical className="w-4 h-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <Link to={`/orders/${order.id}`}>
                  <DropdownMenuItem>
                     <FileBoxIcon className="w-4 h-4 mr-2" />
                     Details
                  </DropdownMenuItem>
               </Link>
               {canDeleteOrRestore && (
                  <>
                     <DropdownMenuSeparator />
                     {order.status !== "CANCELLED" ? (
                        <DropdownMenuItem className="text-destructive" asChild>
                           <DeleteOrderDialog order_id={order.id} />
                        </DropdownMenuItem>
                     ) : (
                        <DropdownMenuItem asChild>
                           <RestoreOrderButton order_id={order.id} />
                        </DropdownMenuItem>
                     )}
                  </>
               )}
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
   );
};

// Re-export for backward compatibility
export const ORDER_STATUS = PARCEL_STATUS;
export type OrderStatus = ParcelStatus;
export { getOrderStatusBadge, STATUS_CONFIG, STATUS_LABELS };

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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         return getOrderStatusBadge(row.original?.status);
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
            customer?.second_last_name,
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
            receiver?.second_last_name,
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
      cell: ({ row }) => <OrderActionsCell order={row.original} />,
      size: 60,
      enableSorting: false,
   },
];

const getPaymentStatusColor = (status: string): string => {
   switch (status) {
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

const getPaymentStatusLabel = (status: string): string => {
   switch (status) {
      case "PAID":
         return "Pagado";
      case "PENDING":
         return "Pendiente";
      case "PARTIALLY_PAID":
         return "Pago Parcial";
      case "FULL_DISCOUNT":
         return "Descuento";
      case "REFUNDED":
         return "Reembolsado";
      case "CANCELLED":
         return "Cancelado";
      default:
         return status;
   }
};

const paymentStatus = (payment_status: string) => {
   return (
      <Badge className="w-fit" variant="secondary">
         <span className={`rounded-full h-2 w-2 ${getPaymentStatusColor(payment_status)}`} />
         <span className="ml-1.5 text-nowrap font-normal text-xs">{getPaymentStatusLabel(payment_status)}</span>
      </Badge>
   );
};
