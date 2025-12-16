import { SectionCards } from "@/components/cards/section-cards";
import { InteractiveChart } from "@/components/charts/interactive-chart";
import { DashboardAreaChart } from "@/components/charts/area-chart";
import { DashboardPieChart } from "@/components/charts/pie-chart";
import { DashboardBarChart } from "@/components/charts/bar-chart";
import { AgenciesSalesChart } from "@/components/charts/agencies-sales-chart";
export function HomePage() {
   return (
      <div className="@container/main p-2 md:p-4">
         <div className="flex flex-col">
            <h3 className=" font-bold">Dashboard</h3>
            <p className="text-sm text-gray-500 ">
               Welcome to the dashboard. Here you can see your stats and analytics.
            </p>
         </div>
         <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
               <div className="bg-muted py-2 md:p-4 rounded-lg">
                  <SectionCards />
               </div>
            </div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-1  xl:grid-cols-4">
               <div className="grid xl:col-span-2">
                  <InteractiveChart />
               </div>
               <AgenciesSalesChart />
               <DashboardAreaChart />
               <DashboardPieChart />
               <DashboardBarChart />
            </div>
         </div>
      </div>
   );
}
