import {
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
import { Badge } from "@/components/ui/badge";

export const PARCEL_STATUS = {
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
   CANCELLED: "CANCELLED",
   // Partial statuses
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

export type ParcelStatus = (typeof PARCEL_STATUS)[keyof typeof PARCEL_STATUS];

interface StatusConfig {
   icon: LucideIcon;
   color: string;
   label: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
   // Base statuses
   IN_AGENCY: { icon: Building2, color: "text-blue-500", label: "En Agencia" },
   IN_PALLET: { icon: Package, color: "text-indigo-500", label: "En Pallet" },
   IN_DISPATCH: { icon: Send, color: "text-violet-500", label: "En Despacho" },
   RECEIVED_IN_DISPATCH: { icon: PackageCheck, color: "text-purple-500", label: "Recibido" },
   IN_WAREHOUSE: { icon: Warehouse, color: "text-fuchsia-500", label: "En Almacén" },
   IN_CONTAINER: { icon: Container, color: "text-cyan-500", label: "En Contenedor" },
   IN_TRANSIT: { icon: Ship, color: "text-teal-500", label: "En Tránsito" },
   AT_PORT_OF_ENTRY: { icon: Anchor, color: "text-orange-500", label: "En Puerto" },
   CUSTOMS_INSPECTION: { icon: ShieldCheck, color: "text-amber-500", label: "En Aduana" },
   RELEASED_FROM_CUSTOMS: { icon: CheckCircle2, color: "text-lime-500", label: "Liberado" },
   OUT_FOR_DELIVERY: { icon: Truck, color: "text-sky-500", label: "En Reparto" },
   FAILED_DELIVERY: { icon: XCircle, color: "text-red-500", label: "Fallo Entrega" },
   DELIVERED: { icon: CircleCheckBig, color: "text-green-500", label: "Entregado" },
   RETURNED_TO_SENDER: { icon: Undo2, color: "text-rose-500", label: "Devuelto" },
   CANCELLED: { icon: XCircle, color: "text-red-500", label: "Cancelado" },
   // Partial statuses - same icons with softer colors
   PARTIALLY_IN_PALLET: { icon: Package, color: "text-indigo-400", label: "Parcial en Pallet" },
   PARTIALLY_IN_DISPATCH: { icon: Send, color: "text-violet-400", label: "Parcial en Despacho" },
   PARTIALLY_IN_CONTAINER: { icon: Container, color: "text-cyan-400", label: "Parcial en Contenedor" },
   PARTIALLY_IN_TRANSIT: { icon: Ship, color: "text-teal-400", label: "Parcial en Tránsito" },
   PARTIALLY_AT_PORT: { icon: Anchor, color: "text-orange-400", label: "Parcial en Puerto" },
   PARTIALLY_IN_CUSTOMS: { icon: ShieldCheck, color: "text-amber-400", label: "Parcial en Aduana" },
   PARTIALLY_RELEASED: { icon: CheckCircle2, color: "text-lime-400", label: "Parcial Liberado" },
   PARTIALLY_OUT_FOR_DELIVERY: { icon: Truck, color: "text-sky-400", label: "Parcial en Reparto" },
   PARTIALLY_DELIVERED: { icon: CircleCheckBig, color: "text-green-400", label: "Parcial Entregado" },
};

export const getStatusBadge = (status: string): React.ReactNode => {
   const config = STATUS_CONFIG[status] || { icon: Package, color: "text-gray-500", label: status };
   const Icon = config.icon;

   return (
      <Badge className="w-fit gap-1" variant="secondary">
         <Icon className={`shrink-0 size-3 ${config.color}`} />
         <span className="text-nowrap font-normal text-muted-foreground text-xs">{config.label}</span>
      </Badge>
   );
};

// For backwards compatibility with order-columns.tsx
export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
   Object.entries(STATUS_CONFIG).map(([key, value]) => [key, value.label])
);

export const getOrderStatusBadge = getStatusBadge;
