import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Shipment } from "../types";
import { normalizeStatusName, getMostRelevantEvent, getEffectiveStatus } from "../utils/status-utils";

export const shipmentColumns: ColumnDef<Shipment>[] = [
   {
      accessorKey: "envio.codigo",
      header: "Código",
      cell: ({ row }) => {
         return <div className="font-medium">{row.original.envio.codigo}</div>;
      },
   },
   {
      accessorKey: "envio.destinatario",
      header: "Destinatario",
      cell: ({ row }) => {
         return <div>{row.original.envio.destinatario}</div>;
      },
   },
   {
      accessorKey: "envio.estado",
      header: "Estado",
      cell: ({ row }) => {
         const effectiveStatus = getEffectiveStatus(row.original);
         return <Badge variant="outline">{normalizeStatusName(effectiveStatus)}</Badge>;
      },
   },
   {
      accessorKey: "ultima_actualizacion",
      header: "Última Actualización",
      cell: ({ row }) => {
         const date = new Date(row.original.ultima_actualizacion);
         return <div className="text-sm text-muted-foreground">{formatRelativeTime(date)}</div>;
      },
   },
   {
      accessorKey: "historial",
      header: "Último Evento",
      cell: ({ row }) => {
         const mostRelevantEvent = getMostRelevantEvent(row.original);
         if (!mostRelevantEvent) return <div className="text-muted-foreground">-</div>;
         return (
            <div className="space-y-1">
               <div className="font-medium text-sm">{mostRelevantEvent.evento}</div>
               <div className="text-xs text-muted-foreground line-clamp-1">{mostRelevantEvent.detalle}</div>
               <div className="text-xs text-muted-foreground">
                  {mostRelevantEvent.usuario} • {formatRelativeTime(new Date(mostRelevantEvent.fecha))}
               </div>
            </div>
         );
      },
   },
];

