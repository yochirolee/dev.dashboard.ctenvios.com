import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash2Icon, Package, Ship, Anchor, RefreshCw, FileSpreadsheet, Pencil } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Container, ContainerStatus } from "@/data/types";
import { axiosInstance } from "@/api/api";
import { toast } from "sonner";

const statusConfig: Record<ContainerStatus, { label: string; color: string }> = {
   PENDING: { label: "Creado", color: "bg-gray-400/80 ring-gray-500/40" },
   LOADING: { label: "Cargando", color: "bg-yellow-400/80 ring-yellow-500/40" },
   SEALED: { label: "Sellado", color: "bg-blue-400/80 ring-blue-500/40" },
   DEPARTED: { label: "En Camino", color: "bg-indigo-400/80 ring-indigo-500/40" },
   IN_TRANSIT: { label: "En Tránsito", color: "bg-purple-400/80 ring-purple-500/40" },
   AT_PORT: { label: "En Puerto", color: "bg-cyan-400/80 ring-cyan-500/40" },
   CUSTOMS_HOLD: { label: "Retenido Aduana", color: "bg-orange-400/80 ring-orange-500/40" },
   CUSTOMS_CLEARED: { label: "Liberado Aduana", color: "bg-teal-400/80 ring-teal-500/40" },
   UNLOADING: { label: "Descargando", color: "bg-sky-400/80 ring-sky-500/40" },
   COMPLETED: { label: "Completado", color: "bg-emerald-400/80 ring-emerald-500/40" },
};

const containerTypeLabels: Record<string, string> = {
   DRY_20FT: "Dry 20ft",
   DRY_40FT: "Dry 40ft",
   DRY_40FT_HC: "Dry 40ft HC",
   REEFER_20FT: "Reefer 20ft",
   REEFER_40FT: "Reefer 40ft",
   REEFER_40FT_HC: "Reefer 40ft HC",
};

// Download manifest Excel file
const downloadManifest = async (containerId: number, containerName: string): Promise<void> => {
   try {
      toast.loading("Generando manifiesto...", { id: "manifest-download" });

      const response = await axiosInstance.get(`/containers/${containerId}/manifest/excel`, {
         responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `manifiesto-${containerName}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Manifiesto descargado correctamente", { id: "manifest-download" });
   } catch (error) {
      console.error("Error downloading manifest:", error);
      toast.error("Error al descargar el manifiesto", { id: "manifest-download" });
   }
};

interface ContainersColumnsProps {
   onDelete: (containerId: number) => void;
   onUpdateStatus: (container: Container) => void;
   onEditContainer: (containerId: number) => void;
}

export const containersColumns = ({
   onDelete,
   onUpdateStatus,
   onEditContainer,
}: ContainersColumnsProps): ColumnDef<Container>[] => [
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
      accessorKey: "container_name",
      header: "Contenedor",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-1 min-w-0">
               <span className="font-medium text-sm">{row.original?.container_name}</span>
               <span className="text-xs text-muted-foreground">{row.original?.container_number}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
         const status = row.original?.status;
         const config = statusConfig[status] || { label: status, color: "bg-gray-400/80 ring-gray-500/40" };
         return (
            <div className="flex flex-col items-start gap-1 min-w-0">
               <Badge className="w-fit" variant="secondary">
                  <span className={`rounded-full h-1.5 w-1.5 ring-1 ${config.color}`} />
                  <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{config.label}</span>
               </Badge>
               <span className="text-xs mx-auto text-muted-foreground">{row.original?.seal_number}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "container_type",
      header: "Tipo",
      cell: ({ row }) => {
         const type = row.original?.container_type;
         return (
            <Badge variant="outline" className="text-xs">
               {containerTypeLabels[type] || type}
            </Badge>
         );
      },
   },
   {
      accessorKey: "origin_port",
      header: "Ruta",
      cell: ({ row }) => {
         return (
            <div className="flex items-center gap-2 min-w-0">
               <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-sm">
                     <Anchor className="h-3 w-3 text-muted-foreground" />
                     <span>{row.original?.origin_port}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                     <Ship className="h-3 w-3" />
                     <span>{row.original?.destination_port}</span>
                  </div>
               </div>
            </div>
         );
      },
   },
   {
      accessorKey: "provider.name",
      header: "Proveedor",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-1 min-w-0" title={row.original?.provider?.name}>
               <Badge variant="outline">{row.original?.provider?.name}</Badge>
            </div>
         );
      },
   },
   {
      accessorKey: "forwarder.name",
      header: "Forwarder",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-1 min-w-0" title={row.original?.forwarder?.name}>
               <span className="text-sm truncate max-w-[150px]">{row.original?.forwarder?.name}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "_count.parcels",
      header: "Paquetes",
      cell: ({ row }) => {
         const parcelsCount = row.original?._count?.parcels ?? 0;
         return (
            <div className="flex items-center gap-2 min-w-0">
               <Package className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm font-medium">{parcelsCount}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "current_weight_kg",
      header: "Peso (lbs)",
      cell: ({ row }) => {
         const currentWeight = row.original?.current_weight_kg ?? "0";
         const maxWeight = row.original?.max_weight_kg;
         return (
            <div className="flex items-center gap-1 min-w-0">
               <span className="text-sm">{parseFloat(currentWeight).toFixed(2)}</span>
               {maxWeight && <span className="text-xs text-muted-foreground">/ {maxWeight}</span>}
            </div>
         );
      },
   },
   {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-1 min-w-0">
               <span className="text-sm">{format(new Date(row.original?.created_at), "dd/MM/yyyy")}</span>
               <span className="text-xs text-muted-foreground">{row.original?.created_by?.name}</span>
            </div>
         );
      },
   },
   {
      accessorKey: "updated_at",
      header: "Actualizado",
      cell: ({ row }) => {
         return (
            <div className="flex flex-col items-start gap-1 min-w-0">
               <span className="text-sm">{format(new Date(row.original?.updated_at), "dd/MM/yyyy")}</span>
               <span className="text-xs text-muted-foreground">{row.original?.created_by?.name}</span>
            </div>
         );
      },
   },
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
                     <DropdownMenuItem asChild>
                        <Link
                           className="inline-flex items-center gap-2"
                           to={`/logistics/containers/load/${row.original?.id}`}
                        >
                           <Package className="w-4 h-4 mr-2" />
                           Cargar Paquetes
                        </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onUpdateStatus(row.original)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Cambiar Estado
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => downloadManifest(row.original?.id, row.original?.container_name)}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Descargar Manifiesto
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onEditContainer(row.original?.id)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.original?.id)}>
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
