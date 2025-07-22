import axios from "axios";
import type {
	Customer,
	Receipt,
	Customs,
	Agency,
	Provider,
	Service,
	Rate,
	Invoice,
} from "@/data/types";
import type { User } from "better-auth/types";
import { useAppStore } from "@/stores/app-store";

const config = {
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
	timeout: 10000,
};

console.log(config.baseURL, "config");

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
			console.log(error, "error in Api");
			// If there's an error getting the session, continue without the token
			console.log("Failed to get session for API request:", error);
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
			console.log(response, "response");
			return response.data;
		},
		getReceipts: async (customerId: number, page: number | 0, limit: number | 50) => {
			const response = await axiosInstance.get(`/customers/${customerId}/receipts`, {
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
	receipts: {
		get: async (page: number | 0, limit: number | 50) => {
			const response = await axiosInstance.get("/receipts", {
				params: {
					page,
					limit,
				},
			});
			return response.data;
		},
		search: async (query: string, page: number | 0, limit: number | 50) => {
			if (query === "" || query === undefined) {
				const response = await axiosInstance.get("/receipts", {
					params: {
						page: page + 1,
						limit: limit,
					},
				});
				return response.data;
			}
			const response = await axiosInstance.get("/receipts/search", {
				params: {
					query,
					page: page + 1,
					limit: limit,
				},
			});
			return response.data;
		},
		create: async (data: Receipt, customerId?: number) => {
			const response = await axiosInstance.post("/receipts", data, {
				params: {
					customerId,
				},
			});
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
		search: async (search: string, page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/invoices/search", {
				params: {
					search,
					page: page + 1,
					limit: limit,
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
			console.log(data, "data in Api");
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
		create: async (data: Agency) => {
			const response = await axiosInstance.post("/agencies", data);
			return response.data;
		},
		getServices: async (id: number) => {
			const response = await axiosInstance.get(`/agencies/${id}/services`);
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
	},
	rates: {
		create: async (data: Rate) => {
			const response = await axiosInstance.post("/rates", data);
			return response.data;
		},
		update: async (id: number, data: Rate) => {
			console.log(data, "Rates data in Api");
			const response = await axiosInstance.put(`/rates/${id}`, data);
			return response.data;
		},
		getByAgencyId: async (agency_id: number) => {
			const response = await axiosInstance.get(`/rates/agency/${agency_id}`);
			return response.data;
		},
		delete: async (id: number) => {
			const response = await axiosInstance.delete(`/rates/${id}`);
			return response.data;
		},
	},
};

export default api;
