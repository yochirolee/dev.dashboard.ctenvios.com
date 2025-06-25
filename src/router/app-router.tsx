import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/login-page";
import { DashboardLayout } from "@/layout/dashboard-layout";
import RegisterPage from "@/pages/register-page";
import { DashboardBarChart } from "@/components/charts/bar-chart";
import { DashboardAreaChart } from "@/components/charts/area-chart";
import { DashboardPieChart } from "@/components/charts/pie-chart";
import { SectionCards } from "@/components/cards/section-cards";
import { NewOrderPage } from "@/pages/orders/new-order-page";

import { InteractiveChart } from "@/components/charts/interactive-chart";
import { ZustandPage } from "@/pages/orders/zustand";
import { CustomersPage } from "@/pages/settings/customers-page";
import { AgenciesPage } from "@/pages/settings/agencies-page";
import { ReceiptsPage } from "@/pages/settings/receipts-page";
import ProtectedRoute from "./protected-route";
import InvoicesPage from "@/pages/orders/invoices-page";
import { UserPage } from "@/pages/settings/user-page";
import InvoiceDetailsPage from "@/pages/orders/invoice-details-page";
import { CustomsPage } from "@/pages/settings/customs-page";

export const AppRouter = () => {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />

			<Route path="/register" element={<RegisterPage />} />
			{/* Protected routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<DashboardLayout />}>
					{/* These are relative to /dashboard */}
					<Route index element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="orders" element={<InvoicesPage />} />
					<Route path="orders/new" element={<NewOrderPage />} />
					<Route path="orders/:invoiceId" element={<InvoiceDetailsPage />} />
					<Route path="zustand" element={<ZustandPage />} />
					<Route path="settings">
						<Route path="customers" element={<CustomersPage />} />
						<Route path="receipts" element={<ReceiptsPage />} />
						<Route path="agencies" element={<AgenciesPage />} />
						<Route path="users" element={<UserPage />} />
						<Route path="customs" element={<CustomsPage />} />
					</Route>
				</Route>
			</Route>

			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
};

const About = () => {
	return <div>About</div>;
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
					<div className="bg-muted p-4 rounded-lg">
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
