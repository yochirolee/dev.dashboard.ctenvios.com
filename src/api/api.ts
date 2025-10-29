import axios from "axios";
import {
   type Customer,
   type Receiver,
   type Customs,
   type Agency,
   type Provider,
   type Service,
   type ShippingRate,
   type Order,
   type Payment,
   type User,
   type Product,
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
   baseURL: import.meta.env.VITE_API_URL,
   headers: { "Content-Type": "application/json" },
};

export const axiosInstance = axios.create(config);

// Add request interceptor to include session token in headers
axiosInstance.interceptors.request.use(
   async (config) => {
      try {
         // Get the current session from BetterAuth
         const token = useAppStore.getState().session?.token;
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
   }
);

// Add response interceptor for better error handling with React Query
axiosInstance.interceptors.response.use(
      (response) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
         status: response.status,
         hasData: !!response.data
      });
      return response;
   },
   (error) => {
      console.error(`❌ ${error.config.method?.toUpperCase()} ${error.config.url}`, {
         status: error.response?.status,
         hasData: !!error.response?.data
      });
      // Handle 401 Unauthorized responses
      if (error.response?.status === 401) {
         useAppStore.setState({ session: null, user: null, agency: null });
         window.location.href = "/login";
      }

      // Let React Query handle the error
      return Promise.reject(error);
   }
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
   orders: {
      search: async (search: string, page: number | 1, limit: number | 20, startDate: string, endDate: string) => {
         const response = await axiosInstance.get("/orders", {
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
         const response = await axiosInstance.get(`/orders/${id}`);
         return response.data;
      },
      create: async (data: Order) => {
         const response = await axiosInstance.post("/orders", data);
         return response.data;
      },
      getHistory: async (order_id: number) => {
         const response = await axiosInstance.get(`/orders/${order_id}/history`);
         return response.data;
      },

      payOrder: async (order_id: number, data: Payment) => {
         const response = await axiosInstance.post(`/orders/${order_id}/payments`, data);
         return response.data;
      },
      deletePayment: async (payment_id: number) => {
         const response = await axiosInstance.delete(`/orders/${payment_id}/payments`);
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
      //get with services and shipping rates
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
      update: async (id: number, data: Agency) => {
         const response = await axiosInstance.put(`/agencies/${id}`, data);
         return response.data;
      },
      getActivesServicesRates: async (id: number) => {
         const response = await axiosInstance.get(`/agencies/${id}/actives-services-rates`);
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
      create: async (data: ShippingRate) => {
         const response = await axiosInstance.post("/shipping-rates", data);
         console.log(response.data, "response on create");
         return response.data;
      },
      /*    createBaseRate: async (data: ShippingRate) => {
         const response = await axiosInstance.post("/shipping-rates/base-rate", data);
         return response.data;
      },
      updateBaseRate: async (data: ShippingRate) => {
         const response = await axiosInstance.put(`/shipping-rates/base-rate/${data.id}`, data);
         return response.data;
      },
      update: async (data: ShippingRate) => {
         const response = await axiosInstance.put(`/shipping-rates/${data.id}`, data);
         return response.data;
      },

      delete: async (id: number) => {
         const response = await axiosInstance.delete(`/shipping-rates/${id}`);
         return response.data;
      }, */
   },
   roles: {
      get: async () => {
         const response = await axiosInstance.get("/roles");
         return response.data;
      },
   },
   analytics: {
      getSales: async () => {
         const response = await axiosInstance.get("/analytics/sales");

         return response.data;
      },
   },
   products: {
      get: async () => {
         const response = await axiosInstance.get("/products");
         return response.data;
      },
      create: async (data: Product) => {
         const response = await axiosInstance.post("/products", data);
         return response.data;
      },
      update: async (id: number, data: Product) => {
         const response = await axiosInstance.put(`/products/${id}`, data);
         return response.data;
      },
      delete: async (id: number) => {
         const response = await axiosInstance.delete(`/products/${id}`);
         return response.data;
      },
   },
};

export default api;
