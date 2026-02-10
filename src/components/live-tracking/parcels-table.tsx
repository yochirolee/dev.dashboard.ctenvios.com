import {
   type ColumnDef,
   flexRender,
   getCoreRowModel,
   getPaginationRowModel,
   useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "../ui/data-table-pagination";
import { AlertTriangleIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
   columns: ColumnDef<TData, TValue>[];
   data: TData[];
   isLoading?: boolean;
   isError?: boolean;
}

export function ParcelsTable<TData, TValue>({ columns, data, isLoading, isError }: DataTableProps<TData, TValue>) {
   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
   });

   if (isError) {
      return (
         <div className="flex flex-col gap-4">
            <div className="grid gap-4 rounded-md border pb-2  ">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center"></TableCell>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                           <AlertTriangleIcon />
                           <p>Error al cargar los paquetes</p>
                        </TableCell>
                     </TableRow>
                  </TableBody>
               </Table>
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-4">
         <div className="grid gap-4 rounded-md border pb-2  ">
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                           return (
                              <TableHead key={header.id} className="bg-card">
                                 {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                           );
                        })}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {table.getRowModel().rows?.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                           {isLoading ? "Cargando paquetes..." : "No se encontraron paquetes."}
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
            <DataTablePagination table={table} />
         </div>
      </div>
   );
}
