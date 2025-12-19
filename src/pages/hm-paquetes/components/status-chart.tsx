import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Shipment } from "../types";
import { normalizeStatusName, getEffectiveStatus } from "../utils/status-utils";

interface StatusChartProps {
   shipments: Shipment[];
}

const COLORS = [
   "hsl(var(--chart-1))",
   "hsl(var(--chart-2))",
   "hsl(var(--chart-3))",
   "hsl(var(--chart-4))",
   "hsl(var(--chart-5))",
];

export function StatusChart({ shipments }: StatusChartProps) {
   const chartData = useMemo(() => {
      const statusCounts = shipments.reduce((acc, shipment) => {
         const effectiveStatus = getEffectiveStatus(shipment) || "Sin estado";
         acc[effectiveStatus] = (acc[effectiveStatus] || 0) + 1;
         return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCounts).map(([status, count], index) => ({
         status,
         displayStatus: normalizeStatusName(status),
         count,
         fill: COLORS[index % COLORS.length],
      }));
   }, [shipments]);

   const chartConfig: ChartConfig = useMemo(() => {
      const config: ChartConfig = {};
      chartData.forEach((item, index) => {
         config[`status-${index}`] = {
            label: item.displayStatus,
            color: item.fill,
         };
      });
      return config;
   }, [chartData]);

   const total = shipments.length;

   if (total === 0) {
      return (
         <Card>
            <CardHeader>
               <CardTitle>Distribución por Estado</CardTitle>
               <CardDescription>No hay envíos para mostrar</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center h-[200px] text-muted-foreground">Sin datos</div>
            </CardContent>
         </Card>
      );
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Total de envíos: {total}</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <PieChart>
                  <ChartTooltip
                     content={
                        <ChartTooltipContent
                           formatter={(value: unknown) => {
                              const numValue = typeof value === "number" ? value : Number(value);
                              return `${numValue} envíos (${((numValue / total) * 100).toFixed(1)}%)`;
                           }}
                        />
                     }
                  />
                  <Pie
                     data={chartData}
                     dataKey="count"
                     nameKey="displayStatus"
                     cx="50%"
                     cy="50%"
                     outerRadius={80}
                     label={({ displayStatus, count }) => `${displayStatus}: ${count}`}
                  >
                     {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                  </Pie>
               </PieChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}

