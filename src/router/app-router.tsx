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
import { AgenciesPage } from "@/pages/settings/agencies-page";
import ProtectedRoute from "./protected-route";
import InvoicesPage from "@/pages/orders/invoices-page";
import { UserPage } from "@/pages/settings/user-page";
import InvoiceDetailsPage from "@/pages/orders/invoice-details-page";
import { CustomsPage } from "@/pages/settings/customs-page";
import ProvidersServicesPage from "@/pages/settings/providers-services-page";
import { EditOrderPage } from "@/pages/orders/edit-order-page";
import { queryClient } from "@/lib/query-client";
import api from "@/api/api";
import { useAppStore } from "@/stores/app-store";
import { ReceiversPage } from "@/pages/settings/receiver-page";

const useLoadInitialData = () => {
	const session = useAppStore((state) => state.session);

	queryClient.ensureQueryData({
		queryKey: ["get-invoices", 0, 20],
		queryFn: () => api.invoices.get(0, 20),
		staleTime: 1000 * 60 * 60 * 24 * 30,
		gcTime: 1000 * 60 * 60 * 24 * 30,
	});
	if (session?.user) {
		queryClient.ensureQueryData({
			queryKey: ["get-agencies", 0, 20],
			queryFn: () => api.agencies.get(),
			staleTime: 1000 * 60 * 60 * 24 * 30,
			gcTime: 1000 * 60 * 60 * 24 * 30,
		});
		queryClient.ensureQueryData({
			queryKey: ["get-customers", 0, 20],
			queryFn: () => api.customer.get(0, 20),
			staleTime: 1000 * 60 * 60 * 24 * 30,
			gcTime: 1000 * 60 * 60 * 24 * 30,
		});
		queryClient.ensureQueryData({
			queryKey: ["get-rates"],
			queryFn: () => api.rates.getByAgencyId(session?.user?.agency_id),
			staleTime: 1000 * 60 * 60 * 24 * 30,
			gcTime: 1000 * 60 * 60 * 24 * 30,
		});
	}
};

export const AppRouter = () => {
	useLoadInitialData();

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
						<Route path=":invoiceId/edit" element={<EditOrderPage />} />
						<Route path=":invoiceId" element={<InvoiceDetailsPage />} />
					</Route>
					<Route path="settings">
						<Route index element={<Navigate to="providers" replace />} />
						<Route path="providers" element={<ProvidersServicesPage />} />
						<Route path="agencies" element={<AgenciesPage />} />
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
