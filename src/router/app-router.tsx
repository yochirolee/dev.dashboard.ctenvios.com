import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/login-page";
import { DashboardLayout } from "@/layout/dashboard-layout";
import { NewOrderPage } from "@/pages/orders/new-order-page";
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
import { HomePage } from "@/pages/home-page";

export const AppRouter = () => {
   return (
      <Routes>
         <Route path="/login" element={<LoginPage />} />
         {/* Protected routes */}
         <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
               {/* These are relative to /dashboard */}
               <Route index element={<HomePage />} />
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


