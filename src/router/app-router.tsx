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
import { ContainersPage } from "@/pages/logistics/containers-page";
import { FlightsPage } from "@/pages/logistics/flights-page";
import OrderDetailsPage from "@/pages/orders/order-details-page";
import { HomePage } from "@/pages/home-page";
import { CreateDispatchPage } from "@/pages/logistics/Dispatch/create-dispatch-page";
import { ReceiveDispatchPage } from "@/pages/logistics/Dispatch/receive-dispatch-page";
import { DispatchPageLists } from "@/pages/logistics/dispatch-page-list";
import { AppLogsPage } from "@/pages/app-logs/app-logs-page";
import { PartnersLogsPage } from "@/pages/app-logs/partners-logs-page";
import IssuesPage from "@/pages/issues/issues-page";
import NewIssuePage from "@/pages/issues/new-issue-page";

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
               <Route element={<ProtectedRoute allowedRoles={["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"]} />}>
                  <Route path="logistics">
                     <Route index element={<Navigate to="dispatch" replace />} />
                     <Route path="dispatch">
                        <Route index element={<Navigate to="list" replace />} />
                        <Route path="list" element={<DispatchPageLists />} />
                        <Route path="create/:dispatchId" element={<CreateDispatchPage />} />
                        <Route path="receive/" element={<ReceiveDispatchPage />} />
                     </Route>
                     <Route path="containers" element={<ContainersPage />} />
                     <Route path="flights" element={<FlightsPage />} />
                  </Route>
               </Route>
               <Route element={<ProtectedRoute allowedRoles={["ROOT", "ADMINISTRATOR", "AGENCY_ADMIN"]} />}>
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
               <Route element={<ProtectedRoute allowedRoles={["ROOT", "ADMINISTRATOR"]} />}>
                  <Route path="logs">
                     <Route index element={<Navigate to="app-logs" replace />} />
                     <Route path="app-logs" element={<AppLogsPage />} />
                     <Route path="partners-logs" element={<PartnersLogsPage />} />
                  </Route>
               </Route>
               <Route path="issues">
                  <Route index element={<IssuesPage />} />
                  <Route path="new" element={<NewIssuePage />} />
                  <Route path=":issueId" element={<IssuesPage />} />
               </Route>
            </Route>
         </Route>

         <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
   );
};
