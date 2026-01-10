import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
   CalendarIcon,
   Package,
   CreditCard,
   TrendingDownIcon,
   TrendingUpIcon,
   Users,
   Receipt,
   Loader2,
   Scale,
   Building2,
   UserIcon,
   FilterX,
   BoxIcon,
   FileSpreadsheet,
} from "lucide-react";
import { useDailyClosing } from "@/hooks/use-daily-closing";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { dailyClosureColumns } from "@/components/finances/daily-closure-columns";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { DailyClosingOrder } from "@/data/types";
import { useAgencies } from "@/hooks/use-agencies";
import { useAppStore } from "@/stores/app-store";
import { ROLE_GROUPS } from "@/lib/rbac";
import { axiosInstance } from "@/api/api";
import { toast } from "sonner";

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

// Open daily closure PDF report in new tab
interface SalesReportFilters {
   date: string;
   user_id?: string;
   agency_id?: number;
}

const openSalesReport = async (filters: SalesReportFilters): Promise<void> => {
   try {
      toast.loading("Generando reporte...", { id: "sales-report" });

      const response = await axiosInstance.get("/financial-reports/sales-report/pdf", {
         params: filters,
         responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      toast.dismiss("sales-report");
   } catch (error) {
      console.error("Error opening sales report:", error);
      toast.error("Error al generar el reporte", { id: "sales-report" });
   }
};

function OrdersTable({ orders }: { orders: DailyClosingOrder[] }) {
   const table = useReactTable({
      data: orders,
      columns: dailyClosureColumns,
      getCoreRowModel: getCoreRowModel(),
   });

   return (
      <div className="rounded-md border">
         <Table>
            <TableHeader>
               {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                     {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="bg-muted/50">
                           {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                     ))}
                  </TableRow>
               ))}
            </TableHeader>
            <TableBody>
               {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                     <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                           <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                           </TableCell>
                        ))}
                     </TableRow>
                  ))
               ) : (
                  <TableRow>
                     <TableCell colSpan={dailyClosureColumns.length} className="h-24 text-center">
                        No hay órdenes para mostrar.
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
   );
}

export default function DailyClosurePage() {
   const [date, setDate] = useState<Date>(new Date());
   const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
   const [selectedAgencyId, setSelectedAgencyId] = useState<number | undefined>(undefined);
   const today = new Date();

   // Get current user and check if admin
   const user = useAppStore((state) => state.user);
   const userRole = (user as any)?.role as string;
   const isAdmin = ROLE_GROUPS.SYSTEM_ADMINS.includes(userRole as any);

   // Fetch agencies for admin users
   const { data: agencies } = useAgencies.get();

   // Format date for API - use local date components to avoid timezone issues
   const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
   ).padStart(2, "0")}`;

   // Build filters object
   const filters = useMemo(
      () => ({
         date: formattedDate,
         user_id: selectedUserId,
         agency_id: selectedAgencyId,
      }),
      [formattedDate, selectedUserId, selectedAgencyId]
   );

   const { data, isLoading, isError } = useDailyClosing(filters);

   // Get users from the data for the user filter
   const availableUsers = data?.users || [];

   // Clear filters
   const clearFilters = (): void => {
      setSelectedUserId(undefined);
      setSelectedAgencyId(undefined);
   };

   const hasActiveFilters = selectedUserId || selectedAgencyId;

   return (
      <div className="p-4 md:p-6 space-y-6">
         {/* Header */}
         <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div className="flex flex-col">
                  <h3 className=" font-bold">Finanzas</h3>
                  <p className="text-sm text-gray-500 "> Resumen de ventas y cobros</p>
               </div>
               <Popover>
                  <PopoverTrigger asChild>
                     <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, "PPP", { locale: es })}
                     </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        disabled={(d) => d > today}
                        initialFocus
                     />
                  </PopoverContent>
               </Popover>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
               {/* Agency Filter (Admin only) */}
               {isAdmin && agencies && (
                  <Select
                     value={selectedAgencyId?.toString() || "all"}
                     onValueChange={(value) => {
                        setSelectedAgencyId(value === "all" ? undefined : parseInt(value));
                        setSelectedUserId(undefined); // Reset user when agency changes
                     }}
                  >
                     <SelectTrigger className="w-[200px]">
                        <Building2 className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Todas las agencias" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Todas las agencias</SelectItem>
                        {agencies.map((agency: any) => (
                           <SelectItem key={agency.id} value={agency.id.toString()}>
                              {agency.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               )}

               {/* User Filter */}
               <Select
                  value={selectedUserId || "all"}
                  onValueChange={(value) => setSelectedUserId(value === "all" ? undefined : value)}
               >
                  <SelectTrigger className="w-[220px]">
                     <UserIcon className="mr-2 h-4 w-4" />
                     <SelectValue placeholder="Todos los usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todos los usuarios</SelectItem>
                     {availableUsers.map((u) => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                           {u.user_name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {/* Clear Filters */}
               {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                     <FilterX className="mr-2 h-4 w-4" />
                     Limpiar filtros
                  </Button>
               )}

               {/* Active filters badges */}
               {selectedAgencyId && (
                  <Badge variant="secondary" className="text-xs">
                     Agencia: {agencies?.find((a: any) => a.id === selectedAgencyId)?.name}
                  </Badge>
               )}
               {selectedUserId && (
                  <Badge variant="secondary" className="text-xs">
                     Usuario: {availableUsers.find((u) => u.user_id === selectedUserId)?.user_name}
                  </Badge>
               )}
            </div>
         </div>

         {isLoading && (
            <div className="flex items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         )}

         {isError && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
               <p>Error al cargar los datos del cierre diario</p>
            </div>
         )}

         {data && (
            <>
               {/* Summary Cards */}
               <div className="*:data-[slot=card]:shadow-xs grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Órdenes */}
                  <Card className="@container/card">
                     <CardHeader className="relative">
                        <CardDescription>Órdenes del Día</CardDescription>
                        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                           {data.totals.total_orders}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                           <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                              <Package className="size-3" />
                              {data.totals.total_hbls} HBLs
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex items-center gap-2 font-medium">
                           <BoxIcon className="size-4" />
                           {data.totals.total_hbls} HBLs
                        </div>
                        <div className="text-muted-foreground">{data.users.length} usuarios activos</div>
                     </CardFooter>
                  </Card>

                  {/* Facturado */}
                  <Card className="@container/card">
                     <CardHeader className="relative">
                        <CardDescription>Total Facturado</CardDescription>
                        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                           {formatCurrency(data.totals.total_billed_cents)}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                           <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                              <Receipt className="size-3" />
                              facturas
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex items-center gap-2 font-medium">
                           <Scale className="size-4" />
                           {data.totals.total_weight_lbs} lbs
                        </div>
                        <div className="text-muted-foreground">Peso total facturado</div>
                     </CardFooter>
                  </Card>

                  {/* Cobrado */}
                  <Card className="@container/card">
                     <CardHeader className="relative">
                        <CardDescription>Total Cobrado</CardDescription>
                        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-green-600">
                           {formatCurrency(data.totals.grand_total_collected_cents)}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                           <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-green-600">
                              <TrendingUpIcon className="size-3" />
                              cobrado
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex items-center gap-2 font-medium">
                           {formatCurrency(data.totals.total_charges_cents)} cargos
                        </div>
                        <div className="text-muted-foreground">
                           Pagado: {formatCurrency(data.totals.total_paid_cents)}
                        </div>
                     </CardFooter>
                  </Card>

                  {/* Pendiente */}
                  <Card className="@container/card">
                     <CardHeader className="relative">
                        <CardDescription>Total Pendiente</CardDescription>
                        <CardTitle
                           className={cn(
                              "@[250px]/card:text-3xl text-2xl font-semibold tabular-nums",
                              data.totals.total_pending_cents > 0 ? "text-red-600/70" : "text-muted-foreground"
                           )}
                        >
                           {formatCurrency(data.totals.total_pending_cents)}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                           <Badge
                              variant="outline"
                              className={cn(
                                 "flex gap-1 rounded-lg text-xs",
                                 data.totals.total_pending_cents > 0 ? "text-red-600/70" : "text-muted-foreground"
                              )}
                           >
                              <TrendingDownIcon className="size-3" />
                              pendiente
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                           Por cobrar <TrendingDownIcon className="size-4" />
                        </div>
                        <div className="text-muted-foreground">Pendiente de pago</div>
                     </CardFooter>
                  </Card>
               </div>

               {/* Payment Breakdown */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Métodos de Pago
                     </CardTitle>
                     <CardDescription>Desglose por método de pago del día</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                        {data.totals.payment_breakdown.map((payment) => (
                           <div key={payment.method} className="flex flex-col p-4 border rounded-lg">
                              <span className="text-sm text-muted-foreground">
                                 {formatPaymentMethod(payment.method)}
                              </span>
                              <span className="text-xl font-bold">
                                 {formatCurrency(payment.total_amount_cents + payment.total_charges_cents)}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="secondary" className="text-xs">
                                    {payment.total_payments} pagos
                                 </Badge>
                              </div>
                           </div>
                        ))}
                        {data.totals.payment_breakdown.length === 0 && (
                           <p className="text-muted-foreground col-span-full text-center py-4">
                              No hay pagos registrados
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>

               {/* Users Accordion with Orders */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Detalle por Usuario
                     </CardTitle>
                     <CardDescription>Órdenes y cobros por cada usuario</CardDescription>
                     <div className="flex justify-end">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={() =>
                              openSalesReport({
                                 date: formattedDate,
                                 user_id: selectedUserId,
                                 agency_id: selectedAgencyId,
                              })
                           }
                        >
                           <FileSpreadsheet className="w-4 h-4 mr-2" />
                           Ver Reporte
                        </Button>
                     </div>
                  </CardHeader>

                  <CardContent>
                     {data.users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No hay actividad para este día</p>
                     ) : (
                        <Accordion type="single" collapsible className="w-full">
                           {data.users.map((user) => (
                              <AccordionItem key={user.user_id} value={user.user_id}>
                                 <AccordionTrigger className="hover:no-underline">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                                       <div className="flex-1">
                                          <span className="font-medium">{user.user_name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">{user.user_email}</span>
                                       </div>
                                       <div className="flex items-center gap-4 text-sm">
                                          <Badge variant="outline">{user.summary.total_orders} órdenes</Badge>

                                          <div>
                                             <span className="text-muted-foreground">Total: </span>
                                             <span className="font-mono text-muted-foreground">
                                                {formatCurrency(user.summary.total_billed_cents)}
                                             </span>
                                          </div>

                                          <div>
                                             <span className="text-muted-foreground">Cobrado: </span>
                                             <span className="font-mono text-green-600">
                                                {formatCurrency(user.summary.grand_total_collected_cents)}
                                             </span>
                                          </div>
                                          <div>
                                             <span className=" text-muted-foreground">Pendiente: </span>
                                             <span
                                                className={cn(
                                                   "font-mono",
                                                   user.summary.total_pending_cents > 0
                                                      ? "text-red-600"
                                                      : "text-muted-foreground"
                                                )}
                                             >
                                                {formatCurrency(user.summary.total_pending_cents)}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </AccordionTrigger>
                                 <AccordionContent>
                                    <div className="space-y-4 pt-4">
                                       {/* User Payment Breakdown */}
                                       {user.payment_breakdown.length > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                             {user.payment_breakdown.map((p) => (
                                                <Badge key={p.method} variant="secondary" className="text-xs">
                                                   {formatPaymentMethod(p.method)}:{" "}
                                                   {formatCurrency(p.total_amount_cents)}
                                                </Badge>
                                             ))}
                                          </div>
                                       )}

                                       {/* User Orders Table */}
                                       <OrdersTable orders={user.orders} />
                                    </div>
                                 </AccordionContent>
                              </AccordionItem>
                           ))}
                        </Accordion>
                     )}
                  </CardContent>
               </Card>
            </>
         )}
      </div>
   );
}
