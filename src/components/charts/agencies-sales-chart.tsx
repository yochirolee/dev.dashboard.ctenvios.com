import React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAnalytics } from "@/hooks/use-analytics";

interface DailySale {
   day: string;
   total: number;
}

interface Agency {
   agencyId: number;
   agencyName: string;
   daily: DailySale[];
   totalSales: number;
}

interface ChartDataItem {
   agencyName: string;
   totalSales: number;
   fill: string;
}

const chartConfig = {
   totalSales: {
      label: "Total Sales",
      color: "hsl(var(--chart-1))",
   },
   label: {
      color: "hsl(var(--background))",
   },
} satisfies ChartConfig;

const CHART_COLORS = [
   "hsl(var(--chart-1))",
   "hsl(var(--chart-2))",
   "hsl(var(--chart-3))",
   "hsl(var(--chart-4))",
   "hsl(var(--chart-5))",
] as const;

const splitText = (text: string, maxLength: number): string[] => {
   const words = text.split(" ");
   const lines: string[] = [];
   let currentLine = "";

   words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxLength) {
         currentLine = testLine;
      } else {
         if (currentLine) lines.push(currentLine);
         currentLine = word;
      }
   });

   if (currentLine) lines.push(currentLine);
   return lines;
};

interface CustomLabelProps {
   x?: string | number;
   y?: string | number;
   width?: string | number;
   height?: string | number;
   value?: string | number;
}

const CustomAgencyLabel = ({ x, y, height, value }: CustomLabelProps): React.ReactElement => {
   const lines = splitText(String(value || ""), 10);
   const lineHeight = 13;
   const xPos = Number(x) || 0;
   const yPos = Number(y) || 0;
   const barHeight = Number(height) || 0;
   const startY = yPos + barHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

   return (
      <text x={xPos - 8} y={startY} textAnchor="end" className="fill-foreground font-medium" fontSize={10}>
         {lines.map((line, index) => (
            <tspan key={index} x={xPos - 8} dy={index === 0 ? 0 : lineHeight}>
               {line}
            </tspan>
         ))}
      </text>
   );
};

export function AgenciesSalesChart(): React.ReactElement {
   const { data, isLoading } = useAnalytics.getDailySalesByAgency();
   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data found</div>;

   const chartData: ChartDataItem[] =
      data?.agencies.map((agency: Agency, index: number) => ({
         agencyName: agency.agencyName,
         totalSales: agency.totalSales,
         fill: CHART_COLORS[index % CHART_COLORS.length],
      })) ?? [];

   const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "USD",
      }).format(value);
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Agency Sales Performance</CardTitle>
            <CardDescription>Total sales by agency</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig}>
               <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{
                     left: 65,
                     right: 80,
                  }}
               >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                     dataKey="agencyName"
                     type="category"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     tickFormatter={(value) => value.slice(0, 3)}
                     hide
                  />
                  <XAxis dataKey="totalSales" type="number" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="totalSales" layout="vertical" radius={4}>
                     <LabelList dataKey="agencyName" position="left" content={CustomAgencyLabel} />

                     <LabelList
                        dataKey="totalSales"
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={formatCurrency}
                     />
                  </Bar>
               </BarChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
               Grand Total: {formatCurrency(data.grandTotal)} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
               Showing sales performance across {data.agencies.length}{" "}
               {data.agencies.length === 1 ? "agency" : "agencies"}
            </div>
         </CardFooter>
      </Card>
   );
}
