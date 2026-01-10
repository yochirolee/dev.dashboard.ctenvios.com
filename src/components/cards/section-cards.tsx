import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDashboard } from "@/hooks/use-financial-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (cents: number): string => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
   }).format(cents / 100);
};

export function SectionCards() {
   const { data, isLoading, isError } = useFinancialDashboard();

   if (isLoading) {
      return (
         <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-0">
            {[...Array(4)].map((_, i) => (
               <Card key={i} className="@container/card">
                  <CardHeader className="relative">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-8 w-32 mt-2" />
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-3 w-3/4" />
                  </CardFooter>
               </Card>
            ))}
         </div>
      );
   }

   if (isError || !data) {
      return (
         <div className="flex items-center justify-center p-8 text-muted-foreground">
            <p>Error al cargar los datos del dashboard</p>
         </div>
      );
   }

   const { today, month, growth_percentage, top_debtors } = data;

   const isGrowthPositive = growth_percentage >= 0;
   const totalDebt = top_debtors.reduce((acc, d) => acc + d.total_debt_cents, 0);
   const pendingToday = today.total_billed_cents - today.total_paid_cents;
   const hasPendingToday = pendingToday > 0;

   return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-0">
         {/* Today's Revenue */}
         <Card className="@container/card">
            <CardHeader className="relative">
               <CardDescription>Ventas de Hoy</CardDescription>
               <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {formatCurrency(today.total_billed_cents)}
               </CardTitle>
               <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                     {hasPendingToday ? <TrendingDownIcon className="size-3" /> : <TrendingUpIcon className="size-3" />}
                     {today.total_orders} órdenes
                  </Badge>
               </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Cobrado: {formatCurrency(today.total_paid_cents)}
                  {hasPendingToday ? <TrendingDownIcon className="size-4" /> : <TrendingUpIcon className="size-4" />}
               </div>
               <div className="text-muted-foreground">Pendiente: {formatCurrency(pendingToday)}</div>
            </CardFooter>
         </Card>

         {/* Monthly Revenue */}
         <Card className="@container/card">
            <CardHeader className="relative">
               <CardDescription>Ventas del Mes</CardDescription>
               <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {formatCurrency(month.total_billed_cents)}
               </CardTitle>
               <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                     <TrendingUpIcon className="size-3" />
                     {month.total_orders} órdenes
                  </Badge>
               </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Cobrado: {formatCurrency(month.total_paid_cents)} <TrendingUpIcon className="size-4" />
               </div>
               <div className="text-muted-foreground">Pendiente: {formatCurrency(month.total_pending_cents || 0)}</div>
            </CardFooter>
         </Card>

         {/* Growth Rate */}
         <Card className="@container/card">
            <CardHeader className="relative">
               <CardDescription>Tasa de Crecimiento</CardDescription>
               <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {growth_percentage.toFixed(1)}%
               </CardTitle>
               <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                     {isGrowthPositive ? (
                        <TrendingUpIcon className="size-3" />
                     ) : (
                        <TrendingDownIcon className="size-3" />
                     )}
                     {isGrowthPositive ? "+crecimiento" : "decrecimiento"}
                  </Badge>
               </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  {isGrowthPositive ? "Tendencia positiva" : "Tendencia negativa"}
                  {isGrowthPositive ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
               </div>
               <div className="text-muted-foreground">Comparado con el período anterior</div>
            </CardFooter>
         </Card>

         {/* Top Debtors */}
         <Card className="@container/card">
            <CardHeader className="relative">
               <CardDescription>Cuentas Pendientes</CardDescription>
               <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                  {formatCurrency(totalDebt)}
               </CardTitle>
               <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                     <TrendingDownIcon className="size-3" />
                     {top_debtors.length} clientes
                  </Badge>
               </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
               <div className="line-clamp-1 flex gap-2 font-medium">
                  Requiere atención <TrendingDownIcon className="size-4" />
               </div>
               <div className="text-muted-foreground">Mayor deudor: {top_debtors[0]?.customer_name || "N/A"}</div>
            </CardFooter>
         </Card>
      </div>
   );
}
