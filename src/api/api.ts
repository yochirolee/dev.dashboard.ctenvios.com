import axios from "axios";
import type { Customer, Receipt, Customs, Agency, Provider, Service, Rate } from "@/data/types";
import type { User } from "better-auth/types";

const config = {
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
};

export const axiosInstance = axios.create(config);

// Add response interceptor for better error handling with React Query
axiosInstance.interceptors.response.use(
	(response) => response,

	(error) => {
		// Let React Query handle the error
		return Promise.reject(error);
	},
);

const api = {
	customer: {
		get: async (page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/customers", {
				params: {
					page,
					limit,
				},
			});
			return response.data;
		},
		getReceipts: async (customerId: string) => {
			const response = await axiosInstance.get(`/customers/${customerId}/receipts`);
			return response.data;
		},
		search: async (query: string, page: number | 1, limit: number | 50) => {
			if (query === "" || query === undefined) {
				const response = await axiosInstance.get("/customers", {
					params: {
						page,
						limit,
					},
				});
				return response.data;
			}
			const response = await axiosInstance.get("/customers/search", {
				params: {
					query,
					page,
					limit,
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
		get: async (page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/receipts", {
				params: {
					page,
					limit,
				},
			});
			return response.data;
		},
		search: async (query: string, page: number | 1, limit: number | 50) => {
			if (query === "" || query === undefined) {
				console.log("query is empty");
				const response = await axiosInstance.get("/receipts", {
					params: {
						page,
						limit,
					},
				});
				return response.data;
			}
			const response = await axiosInstance.get("/receipts/search", {
				params: {
					query,
					page,
					limit,
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
		get: async (page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/invoices", {
				params: {
					page,
					limit,
				},
			});
			console.log(response.data, "response.data in Api");
			return response.data;
		},
		search: async (search: string, page: number | 1, limit: number | 50) => {
			const response = await axiosInstance.get("/invoices/search", {
				params: {
					search,
					page,
					limit,
				},
			});
			return response.data;
		},
		getById: async (id: number) => {
			const response = await axiosInstance.get(`/invoices/${id}`);
			return response.data;
		},
	},
	users: {
		get: async () => {
			const response = await axiosInstance.get("/users");
			return response.data;
		},
		create: async (data: User) => {
			console.log(data, "data in Api");
			const response = await axiosInstance.post("/users/sign-up/email", data);
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
		get: async () => {
			const response = await axiosInstance.get("/customs-rates");
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
		update: async (id: number, data: Rate) => {
			const response = await axiosInstance.put(`/rates/${id}`, data);
			return response.data;
		},
	},
};

export default api;
