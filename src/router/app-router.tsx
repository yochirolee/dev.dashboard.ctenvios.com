import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/login-page";
import { DashboardLayout } from "@/layout/dashboard-layout";
import { DashboardBarChart } from "@/components/charts/bar-chart";
import { DashboardAreaChart } from "@/components/charts/area-chart";
import { DashboardPieChart } from "@/components/charts/pie-chart";
import { SectionCards } from "@/components/cards/section-cards";
import { NewOrderPage } from "@/pages/orders/new-order-page";
import { InteractiveChart } from "@/components/charts/interactive-chart";
import { CustomersPage } from "@/pages/settings/customers-page";
import { AgenciesPage } from "@/pages/settings/agencies/agencies-page";
import ProtectedRoute from "./protected-route";
import InvoicesPage from "@/pages/orders/orders-page";
import { UserPage } from "@/pages/settings/user-page";
import { CustomsPage } from "@/pages/settings/customs-page";
import ProvidersServicesPage from "@/pages/settings/providers-services-page";
import { EditOrderPage } from "@/pages/orders/edit-order-page";
import { ReceiversPage } from "@/pages/settings/receiver-page";
import { NewAgencyPage } from "@/pages/settings/agencies/new-agency-page";
import { DispatchPage } from "@/pages/logistics/dispatch-page";
import { ContainersPage } from "@/pages/logistics/containers-page";
import { FlightsPage } from "@/pages/logistics/flights-page";
import OrderDetailsPage from "@/pages/orders/order-details-page";

export const AppRouter = () => {
   return (
      <Routes>
         <Route path="/login" element={<LoginPage />} />
         {/* Protected routes */}
         <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
               {/* These are relative to /dashboard */}
               <Route index element={<Home />} />
               <Route path="orders">
                  <Route index element={<Navigate to="list" replace />} />
                  <Route path="list" element={<InvoicesPage />} />
                  <Route path="new" element={<NewOrderPage />} />
                  <Route path=":orderId/edit" element={<EditOrderPage />} />
                  <Route path=":orderId" element={<OrderDetailsPage />} />
               </Route>
               <Route path="logistics">
                  <Route path="dispatch" element={<DispatchPage />} />
                  <Route path="containers" element={<ContainersPage />} />
                  <Route path="flights" element={<FlightsPage />} />
               </Route>
               <Route path="settings">
                  <Route index element={<Navigate to="providers" replace />} />
                  <Route path="providers" element={<ProvidersServicesPage />} />
                  <Route path="agencies" element={<AgenciesPage />} />
                  <Route path="agencies/new" element={<NewAgencyPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="receivers" element={<ReceiversPage />} />
                  <Route path="users" element={<UserPage />} />
                  <Route path="customs" element={<CustomsPage />} />
               </Route>
            </Route>
         </Route>

         <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
   );
};

const Home = () => {
   return (
      <div className="@container/main  ">
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
               <div className="grid xl:col-span-3">
                  <InteractiveChart />
               </div>
               <DashboardAreaChart />
               <DashboardPieChart />
               <DashboardBarChart />
            </div>
         </div>
      </div>
   );
};
