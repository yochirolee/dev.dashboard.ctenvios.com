import type { ColumnDef } from "@tanstack/react-table";
import type { DailyClosingOrder } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FileBoxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (cents: number): string => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
   }).format(cents / 100);
};

const formatPaymentMethod = (method: string): string => {
   const methods: Record<string, string> = {
      CASH: "Efectivo",
      CREDIT_CARD: "Tarjeta",
      ZELLE: "Zelle",
      TRANSFER: "Transferencia",
      CHECK: "Cheque",
   };
   return methods[method] || method;
};

const getPaymentStatusBadge = (status: string): React.ReactNode => {
   switch (status) {
      case "PAID":
         return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Pagado</Badge>;
      case "PARTIALLY_PAID":
         return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Parcial</Badge>;
      default:
         return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Pendiente</Badge>;
   }
};

export const dailyClosureColumns: ColumnDef<DailyClosingOrder>[] = [
   {
      accessorKey: "order_id",
      header: "Orden",
      cell: ({ row }) => (
         <Link className="flex items-center gap-2 text-primary hover:underline" to={`/orders/${row.original.order_id}`}>
            <FileBoxIcon size={16} className="shrink-0" />
            <span className="font-mono text-xs">{row.original.order_id}</span>
         </Link>
      ),
      size: 80,
   },
   {
      accessorKey: "created_at",
      header: "Hora",
      cell: ({ row }) => (
         <span className="font-mono text-xs text-muted-foreground">
            {format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm")}
         </span>
      ),
      size: 60,
   },
   {
      accessorKey: "customer.name",
      header: "Cliente",
      cell: ({ row }) => (
         <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[150px]">{row.original.customer.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.customer.phone}</span>
         </div>
      ),
      size: 150,
   },
   {
      accessorKey: "receiver.name",
      header: "Receptor",
      cell: ({ row }) => (
         <div className="flex flex-col">
            <span className="text-sm truncate max-w-[150px]">{row.original.receiver.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.receiver.city}</span>
         </div>
      ),
      size: 150,
   },
   {
      accessorKey: "service",
      header: "Servicio",
      cell: ({ row }) => (
         <Badge variant="outline" className="text-xs">
            {row.original.service}
         </Badge>
      ),
      size: 80,
   },
   {
      accessorKey: "hbl_count",
      header: "HBLs",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.hbl_count}</span>,
      size: 50,
   },
   {
      accessorKey: "total_weight_lbs",
      header: "Peso",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.total_weight_lbs} lbs</span>,
      size: 80,
   },
   {
      accessorKey: "total_in_cents",
      header: "Total",
      cell: ({ row }) => (
         <span className="font-mono text-sm font-medium">{formatCurrency(row.original.total_in_cents)}</span>
      ),
      size: 100,
    },
   {
      accessorKey: "discounts_in_cents",
      header: "Descuento",
      cell: ({ row }) => (
         <span className= {cn("font-mono text-sm font-medium", row.original.discounts_in_cents > 0 ? "text-red-600" : "text-muted-foreground")}>{formatCurrency(row.original.discounts_in_cents)}</span>
      ),
      size: 100,
   },
   {
      accessorKey: "paid_in_cents",
      header: "Pagado",
      cell: ({ row }) => (
         <span className="font-mono text-sm text-green-600">{formatCurrency(row.original.paid_in_cents)}</span>
      ),
      size: 100,
   },
   {
      accessorKey: "pending_in_cents",
      header: "Pendiente",
      cell: ({ row }) => (
         <span
            className={`font-mono text-sm ${
               row.original.pending_in_cents > 0 ? "text-red-600" : "text-muted-foreground"
            }`}
         >
            {formatCurrency(row.original.pending_in_cents)}
         </span>
      ),
      size: 100,
   },
   {
      accessorKey: "payment_status",
      header: "Estado",
      cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
      size: 100,
   },
   {
      accessorKey: "payment_methods",
      header: "Métodos",
      cell: ({ row }) => (
         <div className="flex flex-wrap gap-1">
            {row.original.payment_methods.map((method) => (
               <Badge key={method} variant="secondary" className="text-xs">
                  {formatPaymentMethod(method)}
               </Badge>
            ))}
            {row.original.payment_methods.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
         </div>
      ),
      size: 120,
   },
];
