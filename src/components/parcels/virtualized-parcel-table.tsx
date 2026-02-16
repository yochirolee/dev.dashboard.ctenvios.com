import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trash2Icon, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getStatusBadge } from "@/lib/parcel-status";
import QRCode from "react-qr-code";

// Generic parcel interface
export interface Parcel {
   id: number;
   tracking_number?: string;
   hbl?: string;
   order_id?: number;
   description?: string;
   status?: string;
   weight?: number | string;
   updated_at?: string;
   agency?: {
      id?: number;
      name?: string;
   };
}

export interface VirtualizedParcelTableProps<T extends Parcel> {
   // Data
   data: T[];
   total?: number;
   isLoading: boolean;

   // Infinite scroll
   hasNextPage?: boolean;
   isFetchingNextPage?: boolean;
   fetchNextPage?: () => void;

   // Header (optional)
   title?: string;
   icon?: LucideIcon;
   headerRight?: React.ReactNode;

   // Columns config
   showIcon?: boolean;
   showQR?: boolean;
   showStatus?: boolean;
   showAgency?: boolean;
   showWeight?: boolean;
   showDate?: boolean;
   showOrder?: boolean;

   // Actions
   canDelete?: boolean | ((row: T) => boolean);
   onDelete?: (trackingNumber: string) => void;
   removingTrackingNumber?: string | null;

   // Styling
   height?: string;
   emptyMessage?: string;
}

const ROW_HEIGHT = 56;
const columnHelper = createColumnHelper<Parcel>();

// Separate delete button to avoid re-renders
const DeleteButton = ({
   trackingNumber,
   onRemove,
   isRemoving,
}: {
   trackingNumber: string;
   onRemove: (tn: string) => void;
   isRemoving: boolean;
}): React.ReactElement => (
   <Button variant="ghost" size="icon" onClick={() => onRemove(trackingNumber)} disabled={isRemoving}>
      {isRemoving ? <Spinner className="h-4 w-4" /> : <Trash2Icon className="h-4 w-4" />}
   </Button>
);

export function VirtualizedParcelTable<T extends Parcel>({
   data,
   total,
   isLoading,
   hasNextPage,
   isFetchingNextPage,
   fetchNextPage,
   title,
   icon: Icon,
   headerRight,
   showIcon = true,
   showQR = false,
   showStatus = true,
   showAgency = true,
   showWeight = true,
   showDate = true,
   showOrder = true,
   canDelete = false,
   onDelete,
   removingTrackingNumber: externalRemovingTrackingNumber,
   height = "h-[calc(100vh-300px)]",
   emptyMessage = "No hay paquetes",
}: VirtualizedParcelTableProps<T>): React.ReactElement {
   const parentRef = useRef<HTMLDivElement>(null);
   const [internalRemovingTrackingNumber, setInternalRemovingTrackingNumber] = useState<string | null>(null);

   // Use external state if provided, otherwise use internal
   const removingTrackingNumber = externalRemovingTrackingNumber ?? internalRemovingTrackingNumber;

   const handleRemove = useCallback(
      (trackingNumber: string): void => {
         if (!onDelete) return;
         if (externalRemovingTrackingNumber === undefined) {
            setInternalRemovingTrackingNumber(trackingNumber);
         }
         onDelete(trackingNumber);
      },
      [onDelete, externalRemovingTrackingNumber],
   );

   // Reset internal removing state when data changes (deletion complete)
   const prevDataLength = useRef(data.length);
   if (data.length !== prevDataLength.current) {
      prevDataLength.current = data.length;
      if (internalRemovingTrackingNumber) {
         setInternalRemovingTrackingNumber(null);
      }
   }

   // Helper to check if a row can be deleted
   const canDeleteRow = useCallback(
      (row: Parcel): boolean => {
         if (typeof canDelete === "function") {
            return canDelete(row as T);
         }
         return canDelete;
      },
      [canDelete],
   );

   const columns = useMemo<ColumnDef<Parcel, any>[]>(() => {
      const cols: ColumnDef<Parcel, any>[] = [];

      if (showIcon) {
         cols.push(
            columnHelper.display({
               id: "icon",
               cell: () => <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
               meta: { flex: "none", width: "32px" },
            }),
         );
      }

      if (showQR) {
         cols.push(
            columnHelper.display({
               id: "qr",
               cell: ({ row }) => {
                  const trackingNumber = row.original.tracking_number || row.original.hbl;
                  return trackingNumber ? (
                     <div className="flex-shrink-0 p-1 bg-white rounded">
                        <QRCode value={trackingNumber} size={40} bgColor="#FFFFFF" fgColor="#000000" />
                     </div>
                  ) : null;
               },
               meta: { flex: "none", width: "56px" },
            }),
         );
      }

      cols.push(
         columnHelper.accessor((row) => row.tracking_number || row.hbl, {
            id: "tracking",
            header: "Tracking",
            cell: (info) => (
               <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{info.getValue()}</span>
                  <span className="text-xs text-muted-foreground truncate" title={info.row.original.description ?? ""}>
                     {info.row.original.description ?? "-"}
                  </span>
               </div>
            ),
            meta: { flex: "1", minWidth: "80px" },
         }),
      );

      if (showOrder) {
         cols.push(
            columnHelper.accessor("order_id", {
               id: "order_id",
               header: "Orden",
               cell: (info) => (
                  <Badge variant="outline" className="text-xs text-muted-foreground truncate block">
                     Orden: {info.row.original.order_id}
                  </Badge>
               ),
               meta: { flex: "1", minWidth: "80px" },
            }),
         );
      }

      if (showAgency) {
         cols.push(
            columnHelper.accessor((row) => row.agency?.name, {
               id: "agency",
               header: "Agencia",
               cell: (info) => (
                  <Badge variant="secondary" className="max-w-full truncate text-xs">
                     {info.getValue() || "-"}
                  </Badge>
               ),
               meta: { flex: "1", minWidth: "80px" },
            }),
         );
      }

      if (showStatus) {
         cols.push(
            columnHelper.accessor("status", {
               header: "Estado",
               cell: (info) => (
                  <div className="flex flex-col gap-0.5 min-w-0">
                     <span className="text-xs text-muted-foreground truncate block">
                        {getStatusBadge(info.getValue() || "")}
                     </span>
                     <span className="text-xs text-muted-foreground truncate block">
                        {info.row.original.updated_at
                           ? format(new Date(info.row.original.updated_at), "dd/MM/yy HH:mm")
                           : "-"}
                     </span>
                  </div>
               ),
               meta: { flex: "1", minWidth: "90px" },
            }),
         );
      }

      if (showWeight) {
         cols.push(
            columnHelper.accessor("weight", {
               header: "Peso",
               cell: (info) => {
                  const weight = info.getValue();
                  return (
                     <span className="text-xs text-muted-foreground truncate block">
                        {weight ? `${Number(weight).toFixed(2)} lbs` : "-"}
                     </span>
                  );
               },
               meta: { flex: "1", minWidth: "64px" },
            }),
         );
      }

      // Add delete column if canDelete is true or a function
      const hasDeleteColumn = canDelete === true || typeof canDelete === "function";
      if (hasDeleteColumn && onDelete) {
         cols.push(
            columnHelper.display({
               id: "actions",
               cell: ({ row, table }) => {
                  const trackingNumber = row.original.tracking_number || row.original.hbl || "";
                  const tableMeta = table.options.meta as
                     | {
                          removingTrackingNumber: string | null;
                          onRemove: (tn: string) => void;
                          canDeleteRow: (row: Parcel) => boolean;
                       }
                     | undefined;

                  // Check if this specific row can be deleted
                  const rowCanDelete = tableMeta?.canDeleteRow?.(row.original) ?? true;
                  if (!rowCanDelete) {
                     return <div className="w-8" />; // Empty placeholder for alignment
                  }

                  const isRemoving = tableMeta?.removingTrackingNumber === trackingNumber;
                  return (
                     <DeleteButton
                        trackingNumber={trackingNumber}
                        onRemove={tableMeta?.onRemove || (() => {})}
                        isRemoving={isRemoving}
                     />
                  );
               },
               meta: { flex: "none", width: "48px" },
            }),
         );
      }

      return cols;
   }, [showIcon, showQR, showStatus, showAgency, showWeight, showDate, showOrder, canDelete, onDelete]);

   const table = useReactTable({
      data: data as Parcel[],
      columns,
      getCoreRowModel: getCoreRowModel(),
      meta: {
         removingTrackingNumber,
         canDeleteRow,
         onRemove: handleRemove,
      },
   });

   const { rows } = table.getRowModel();

   const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => ROW_HEIGHT,
      overscan: 10,
   });

   const virtualRows = virtualizer.getVirtualItems();
   const totalSize = virtualizer.getTotalSize();

   // Auto-fetch more when scrolling near end (avoid firing on initial mount)
   const lastVirtualRow = virtualRows[virtualRows.length - 1];
   useEffect(() => {
      if (!lastVirtualRow || !hasNextPage || isFetchingNextPage || !fetchNextPage) return;
      const scrollEl = parentRef.current;
      if (!scrollEl || scrollEl.scrollTop <= 0) return;
      if (lastVirtualRow.index >= rows.length - 10) {
         fetchNextPage();
      }
   }, [lastVirtualRow?.index, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

   const hasHeader = title || Icon || headerRight;

   return (
      <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none">
         {hasHeader && (
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
               <div className="flex flex-col gap-2">
                  {(title || Icon) && (
                     <CardTitle className="text-lg flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5" />}
                        {title}
                     </CardTitle>
                  )}
                  {total !== undefined && total > 0 && (
                     <Badge variant="outline">
                        {data.length} de {total} paquetes
                     </Badge>
                  )}
               </div>
               {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
            </CardHeader>
         )}
         <CardContent className={`flex-1 overflow-hidden ${hasHeader ? "p-0" : "p-0"}`}>
            {isLoading ? (
               <div className="flex items-center justify-center h-full py-8">
                  <Spinner />
               </div>
            ) : data.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">{emptyMessage}</div>
            ) : (
               <div ref={parentRef} className={`${height} overflow-auto`}>
                  <div style={{ height: `${totalSize}px`, width: "100%", position: "relative" }}>
                     {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return (
                           <div
                              key={row.id}
                              data-index={virtualRow.index}
                              ref={virtualizer.measureElement}
                              style={{
                                 position: "absolute",
                                 top: 0,
                                 left: 0,
                                 width: "100%",
                                 transform: `translateY(${virtualRow.start}px)`,
                              }}
                              className="flex items-center px-4 py-2 border-b border-border hover:bg-muted/50 transition-colors"
                           >
                              {row.getVisibleCells().map((cell) => {
                                 const meta = cell.column.columnDef.meta as
                                    | {
                                         flex?: string;
                                         width?: string;
                                         minWidth?: string;
                                      }
                                    | undefined;
                                 return (
                                    <div
                                       key={cell.id}
                                       style={{
                                          flex: meta?.flex || "none",
                                          width: meta?.width,
                                          minWidth: meta?.minWidth,
                                       }}
                                       className={`px-1 overflow-hidden ${meta?.flex === "1" ? "min-w-0" : ""}`}
                                    >
                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                 );
                              })}
                           </div>
                        );
                     })}
                  </div>
                  {isFetchingNextPage && (
                     <div className="absolute bottom-0 left-0 right-0 flex justify-center py-2 bg-background/80">
                        <Spinner />
                     </div>
                  )}
               </div>
            )}
         </CardContent>
      </Card>
   );
}
