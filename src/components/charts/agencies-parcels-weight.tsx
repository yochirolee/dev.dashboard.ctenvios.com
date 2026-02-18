import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useAnalytics } from "@/hooks/use-analytics";
import { Spinner } from "@/components/ui/spinner";

interface PackagesWeightByAgencyResponse {
   agencies: Array<{
      agencyId: number;
      agencyName: string;
      packagesCount: number;
      totalWeight: number;
   }>;
   grandTotalPackages: number;
   grandTotalWeight: number;
}

interface ChartRow {
   agencyName: string;
   weight: number;
   packages: number;
}

const chartConfig = {
   weight: {
      label: "Weight (lbs)",
      color: "hsl(var(--chart-2))",
   },
   label: {
      color: "hsl(0 0% 100%)",
   },
} satisfies ChartConfig;

export function AgenciesParcelsWeightChart(): React.ReactElement {
   const { data, isLoading } = useAnalytics.getPackagesWeightByAgency();

   const { chartData, totals } = useMemo(() => {
      const raw = data as PackagesWeightByAgencyResponse | undefined;
      if (!raw) {
         return {
            chartData: [] as ChartRow[],
            totals: { grandTotalPackages: 0, grandTotalWeight: 0 },
         };
      }
      return {
         chartData: raw.agencies.map((a) => ({
            agencyName: a.agencyName,
            weight: Math.round(a.totalWeight * 100) / 100,
            packages: a.packagesCount,
         })),
         totals: {
            grandTotalPackages: raw.grandTotalPackages,
            grandTotalWeight: raw.grandTotalWeight,
         },
      };
   }, [data]);

   if (isLoading) {
      return (
         <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
               <Spinner className="h-8 w-8" />
            </CardContent>
         </Card>
      );
   }
   

   return (
      <Card>
         <CardHeader>
            <CardTitle>Paquetes y peso por agencia</CardTitle>
            <CardDescription>En agencias o listos para despacho</CardDescription>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig} className="aspect-video overflow-visible">
               <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{ right: 72 }}
               >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <YAxis
                     dataKey="agencyName"
                     type="category"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     hide
                  />
                  <XAxis dataKey="weight" type="number" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="weight" layout="vertical" fill="var(--color-weight)" radius={[0, 4, 4, 0]}>
                     <LabelList
                        dataKey="agencyName"
                        position="insideLeft"
                        offset={8}
                        className="fill-[var(--color-label)] font-medium"
                        fontSize={12}
                        formatter={(value: string) => (value.length > 14 ? value.slice(0, 11) + "…" : value)}
                     />
                     <LabelList
                        dataKey="weight"
                        position="right"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) => `${Number(value).toFixed(2)} lbs`}
                     />
                  </Bar>
               </BarChart>
            </ChartContainer>
         </CardContent>
         <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
               {totals.grandTotalPackages} paquetes · {totals.grandTotalWeight.toFixed(1)} lbs total
               <TrendingUp className="h-4 w-4 shrink-0" />
            </div>
            <div className="text-muted-foreground leading-none">
               Paquetes en agencias o listos para despacho
            </div>
         </CardFooter>
      </Card>
   );
}
