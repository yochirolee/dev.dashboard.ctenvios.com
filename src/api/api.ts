import axios from "axios";
import {
	type Customer,
	type Receiver,
	type Customs,
	type Agency,
	type Provider,
	type Service,
	type ShippingRate,
	type Invoice,
	type Payment,
	type User,
	agencySchema,
	userSchema,
} from "@/data/types";
import { useAppStore } from "@/stores/app-store";
import { toast } from "sonner";
import { z } from "zod";

const createAgencyFormSchema = z.object({
	agency: agencySchema,
	user: userSchema,
});

export type CreateAgencyFormSchema = z.infer<typeof createAgencyFormSchema>;

const config = {
	baseURL:
		import.meta.env.VITE_API_URL ||
		(import.meta.env.DEV
			? "http://localhost:3000/api/v1"
			: "https://api-ctenvios-com.vercel.app/api/v1"),
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
};

export const axiosInstance = axios.create(config);

// Add request interceptor to include session token in headers
axiosInstance.interceptors.request.use(
	async (config) => {
		try {
			// Get the current session from BetterAuth
			const token = localStorage.getItem("authToken");
			// If we have a session, include the session token in the headers
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			toast.error("Error al obtener la sesión");
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Add response interceptor for better error handling with React Query
axiosInstance.interceptors.response.use(
	(response) => response,

	(error) => {
		// Handle 401 Unauthorized responses
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			useAppStore.setState({ session: null });
			window.location.href = "/login";
		}

		// Let React Query handle the error
		return Promise.reject(error);
	},
);

const api = {
	customer: {
		get: async (page: number | 0, limit: number | 50) => {
			const response = await axiosInstance.get("/customers", {
				params: {
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		getReceivers: async (customerId: number, page: number | 0, limit: number | 50) => {
			const response = await axiosInstance.get(`/customers/${customerId}/receivers`, {
				params: {
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		search: async (query: string, page: number | 0, limit: number | 50) => {
			if (query === "" || query === undefined) {
				const response = await axiosInstance.get("/customers", {
					params: {
						page: page + 1,
						limit: limit,
					},
				});
				return response.data;
			}
			const response = await axiosInstance.get("/customers/search", {
				params: {
					query,
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		create: async (data: Customer) => {
			const response = await axiosInstance.post("/customers", data);
			return response.data;
		},
		update: async (id: number, data: Customer) => {
			const response = await axiosInstance.put(`/customers/${id}`, data);
			return response.data;
		},
	},
	provinces: {
		get: async () => {
			const response = await axiosInstance.get("/provinces");
			return response.data;
		},
	},
	receivers: {
		get: async (page: number | 0, limit: number | 50) => {
			const response = await axiosInstance.get("/receivers", {
				params: {
					page,
					limit,
				},
			});
			return response.data;
		},
		getByCI: async (ci: string) => {
			const response = await axiosInstance.get(`/receivers/ci/${ci}`);
			return response.data;
		},
		search: async (query: string, page: number | 0, limit: number | 50) => {
			if (query === "" || query === undefined) {
				const response = await axiosInstance.get("/receivers", {
					params: {
						page: page + 1,
						limit: limit,
					},
				});
				return response.data;
			}
			const response = await axiosInstance.get("/receivers/search", {
				params: {
					query,
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		create: async (data: Receiver, customerId?: number) => {
			const response = await axiosInstance.post("/receivers", data, {
				params: {
					customerId,
				},
			});
			return response.data;
		},
		update: async (id: number, data: Receiver) => {
			const response = await axiosInstance.put(`/receivers/${id}`, data);
			return response.data;
		},
	},
	invoices: {
		get: async (page: number | 1, limit: number | 25) => {
			const response = await axiosInstance.get("/invoices", {
				params: {
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		getByAgencyId: async (agency_id: number, page: number | 1, limit: number | 25) => {
			const response = await axiosInstance.get(`/invoices/agency/${agency_id}`, {
				params: { page: page + 1, limit: limit },
			});
			return response.data;
		},
		search: async (
			search: string,
			page: number | 1,
			limit: number | 20,
			startDate: string,
			endDate: string,
		) => {
			const response = await axiosInstance.get("/invoices/search", {
				params: {
					search,
					page: page + 1,
					limit: limit,
					startDate: startDate,
					endDate: endDate,
				},
			});
			return response.data;
		},
		getById: async (id: number) => {
			const response = await axiosInstance.get(`/invoices/${id}`);
			return response.data;
		},
		create: async (data: Invoice) => {
			const response = await axiosInstance.post("/invoices", data);
			return response.data;
		},
		getHistory: async (invoice_id: number) => {
			const response = await axiosInstance.get(`/invoices/${invoice_id}/history`);
			return response.data;
		},
		payments: {
			create: async (invoice_id: number, data: Payment) => {
				console.log(data, "on api");
				const response = await axiosInstance.post(`/payments/invoice/${invoice_id}`, data);
				return response.data;
			},
			delete: async (invoice_id: number, payment_id: number) => {
				const response = await axiosInstance.delete(
					`/invoices/${invoice_id}/payments/${payment_id}`,
				);
				return response.data;
			},
		},
	},

	users: {
		get: async (page: number | 1, limit: number | 25) => {
			const response = await axiosInstance.get("/users", {
				params: {
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		create: async (data: User) => {
			const response = await axiosInstance.post("/users/sign-up/email", data);
			return response.data;
		},

		getSession: async () => {
			const response = await axiosInstance.get("/users/get-session");
			return response.data;
		},
		signIn: async (email: string, password: string) => {
			const response = await axiosInstance.post("/users/sign-in/email", {
				email,
				password,
			});
			return response.data;
		},
		signOut: async () => {
			const response = await axiosInstance.post("/users/sign-out");
			return response.data;
		},
	},
	providers: {
		get: async () => {
			const response = await axiosInstance.get("/providers");
			return response.data;
		},
		getById: async (id: number) => {
			const response = await axiosInstance.get(`/providers/${id}`);
			return response.data;
		},
		create: async (data: Provider) => {
			const response = await axiosInstance.post("/providers", data);
			return response.data;
		},
	},
	agencies: {
		get: async () => {
			const response = await axiosInstance.get("/agencies");
			return response.data;
		},
		getById: async (id: number) => {
			const response = await axiosInstance.get(`/agencies/${id}`);
			return response.data;
		},
		getUsers: async (id: number) => {
			const response = await axiosInstance.get(`/agencies/${id}/users`);
			return response.data;
		},
		search: async (query: string, page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/agencies/search", {
				params: {
					query,
					page,
					limit,
				},
			});
			return response.data;
		},
		create: async (data: CreateAgencyFormSchema) => {
			const response = await axiosInstance.post("/agencies", data);

			return response.data;
		},
		getServices: async (id: number, is_active?: boolean) => {
			const response = await axiosInstance.get(`/agencies/${id}/services`, {
				params: {
					...(is_active !== undefined && { is_active }),
				},
			});
			return response.data;
		},
		getServiceShippingRates: async (
			agency_id: number,
			service_id: number,
			rate_type?: "WEIGHT" | "FIXED",
			is_active?: boolean,
		) => {
			const response = await axiosInstance.get(
				`/agencies/${agency_id}/service/${service_id}/shipping-rates`,
				{
					params: {
						rate_type,
						...(is_active !== undefined && { is_active }),
						...(rate_type !== undefined && { rate_type }),
					},
				},
			);
			return response.data;
		},

		update: async (id: number, data: Agency) => {
			const response = await axiosInstance.put(`/agencies/${id}`, data);
			return response.data;
		},
	},
	customs: {
		get: async (page: number | 1, limit: number | 25) => {
			const response = await axiosInstance.get("/customs-rates", {
				params: {
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		search: async (query: string, page: number | 1, limit: number | 25) => {
			const response = await axiosInstance.get("/customs-rates/search", {
				params: {
					query,
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		create: async (data: Customs) => {
			const response = await axiosInstance.post("/customs-rates", data);
			return response.data;
		},
		update: async (id: number, data: Customs) => {
			const response = await axiosInstance.put(`/customs-rates/${id}`, data);
			return response.data;
		},
		delete: async (id: number) => {
			const response = await axiosInstance.delete(`/customs-rates/${id}`);
			return response.data;
		},
	},
	services: {
		create: async (data: Service) => {
			const response = await axiosInstance.post("/services", data);
			return response.data;
		},
		get: async () => {
			const response = await axiosInstance.get("/services");
			return response.data;
		},
		getByAgencyId: async (agency_id: number) => {
			const response = await axiosInstance.get(`/services/agency/${agency_id}`);
			return response.data;
		},
	},
	shippingRates: {
		getBaseRate: async (agency_id: number, service_id: number) => {
			const response = await axiosInstance.get(
				`/shipping-rates/base_rate/agency/${agency_id}/service/${service_id}`,
			);
			return response.data;
		},
		create: async (data: ShippingRate) => {
			const response = await axiosInstance.post("/shipping-rates", data);
			return response.data;
		},
		update: async (data: ShippingRate) => {
			const response = await axiosInstance.put(`/shipping-rates/${data.id}`, data);
			return response.data;
		},
		getFixedRatesForAgencyAndService: async (agency_id: number, service_id: number) => {
			const response = await axiosInstance.get(
				`/shipping-rates/agency/${agency_id}/service/${service_id}/fixed`,
			);
			return response.data;
		},
		getByAgencyId: async (agency_id: number) => {
			const response = await axiosInstance.get(`/shipping-rates/agency/${agency_id}`);
			return response.data;
		},
		delete: async (id: number) => {
			const response = await axiosInstance.delete(`/shipping-rates/${id}`);
			return response.data;
		},
	},
	roles: {
		get: async () => {
			const response = await axiosInstance.get("/roles");
			return response.data;
		},
	},
	analytics: {
		getSales: async () => {
			console.log("getSales");
			const response = await axiosInstance.get("/analytics/sales");
			console.log(response.data, "response.data");
			return response.data;
		},
	},

	products: {
		getRates: async (agency_id: number, service_id: number) => {
			const response = await axiosInstance.get(
				`/products/shipping_rates/agency/${agency_id}/service/${service_id}`,
			);
			return response.data;
		},
	},
};

export default api;
