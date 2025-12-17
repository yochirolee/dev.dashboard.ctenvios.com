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
   type Discount,
   type ParcelStatus,
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
      return response;
   },
   (error) => {
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
      getParcelsByOrderId: async (order_id: number) => {
         const response = await axiosInstance.get(`/orders/${order_id}/parcels`);
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
      delete: async (order_id: number) => {
         const response = await axiosInstance.delete(`/orders/${order_id}`);
         return response.data;
      },
      deleteDiscount: async (discount_id: number) => {
         const response = await axiosInstance.delete(`/orders/${discount_id}/discounts`);
         return response.data;
      },
      createDiscount: async (order_id: number, data: Discount) => {
         const response = await axiosInstance.post(`/orders/${order_id}/discounts`, data);
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
      servicesWithRates: async (id: number) => {
         const response = await axiosInstance.get(`/agencies/${id}/services-with-rates`);
         return response.data;
      },
      getActiveServicesWithRates: async (id: number) => {
         const response = await axiosInstance.get(`/agencies/${id}/active-services-with-rates`);
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
      update: async (id: number, data: Service) => {
         const response = await axiosInstance.put(`/services/${id}`, data);
         return response.data;
      },
   },
   shippingRates: {
      create: async (data: ShippingRate) => {
         const response = await axiosInstance.post("/shipping-rates", data);
         console.log(response.data, "response on create");
         return response.data;
      },
      update: async (rate_id: number, data: ShippingRate) => {
         const response = await axiosInstance.put(`/shipping-rates/${rate_id}`, data);
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
         const response = await axiosInstance.get("/analytics/sales");

         return response.data;
      },
      getDailySalesByAgency: async () => {
         const response = await axiosInstance.get("/analytics/daily-sales-by-agency");
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
      addService: async (product_id: number, service_id: number) => {
         const response = await axiosInstance.post(`/products/${product_id}/connect-service`, { service_id });
         return response.data;
      },
   },

   dispatch: {
      get: async (page: number | 1, limit: number | 25) => {
         const response = await axiosInstance.get("/dispatches", {
            params: {
               page: page + 1,
               limit: limit,
            },
         });
         return response.data;
      },

      getById: async (dispatch_id: number) => {
         const response = await axiosInstance.get(`/dispatches/${dispatch_id}`);
         return response.data;
      },
      create: async () => {
         const response = await axiosInstance.post("/dispatches");
         return response.data;
      },
      deleteDispatch: async (dispatch_id: number) => {
         const response = await axiosInstance.delete(`/dispatches/${dispatch_id}`);
         return response.data;
      },
      addParcel: async (dispatch_id: number, hbl: string) => {
         const response = await axiosInstance.post(`/dispatches/${dispatch_id}/add-parcel`, { hbl });
         return response.data;
      },
      removeParcel: async (dispatch_id: number, hbl: string) => {
         console.log(dispatch_id, hbl, "dispatch_id and hbl on remove parcel");
         const response = await axiosInstance.delete(`/dispatches/${dispatch_id}/remove-parcel/${hbl}`);
         return response.data;
      },
      readyForDispatch: async (page: number = 1, limit: number = 20) => {
         const response = await axiosInstance.get(`/dispatches/ready-for-dispatch`, {
            params: {
               page,
               limit,
            },
         });
         return response.data;
      },
      getParcelsByDispatchId: async (
         dispatch_id: number,
         page: number = 1,
         limit: number = 20,
         status?: ParcelStatus
      ) => {
         const response = await axiosInstance.get(`/dispatches/${dispatch_id}/parcels`, {
            params: {
               page: page + 1,
               limit,
               status,
            },
         });
         return response.data;
      },
      finishDispatch: async (dispatch_id: number) => {
         const response = await axiosInstance.post(`/dispatches/${dispatch_id}/complete-dispatch`);
         return response.data;
      },
   },
   logs: {
      getAppLogs: async (
         page: number = 1,
         limit: number = 20,
         filters?: {
            level?: string;
            source?: string;
            status_code?: number;
            user_id?: string;
            path?: string;
            method?: string;
            startDate?: Date;
            endDate?: Date;
         }
      ) => {
         const params: Record<string, string | number> = {
            page: page + 1,
            limit,
         };

         if (filters) {
            if (filters.level) params.level = filters.level;
            if (filters.source) params.source = filters.source;
            if (filters.status_code !== undefined) params.status_code = filters.status_code;
            if (filters.user_id) params.user_id = filters.user_id;
            if (filters.path) params.path = filters.path;
            if (filters.method) params.method = filters.method;
            if (filters.startDate) params.startDate = filters.startDate.toISOString();
            if (filters.endDate) params.endDate = filters.endDate.toISOString();
         }

         const response = await axiosInstance.get(`/logs`, {
            params,
         });
         return response.data;
      },
      toggleAppLogs: async (currentAppLogsStatus: boolean) => {
         const response = await axiosInstance.put(`/config/logging-status`, {
            enabled: !currentAppLogsStatus,
         });
         return response.data;
      },
      logStatus: async () => {
         const response = await axiosInstance.get(`/config/logging-status`);
         return response.data;
      },
      deleteAllLogs: async () => {
         const response = await axiosInstance.delete(`/logs`);
         return response.data;
      },
   },
   issues: {
      getAll: async (
         page: number = 1,
         limit: number = 20,
         filters?: {
            status?: string;
            priority?: string;
            type?: string;
            order_id?: string;
            parcel_id?: string;
            assigned_to_id?: string;
         }
      ) => {
         const params: Record<string, string | number> = {
            page: page + 1,
            limit,
         };

         if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.type) params.type = filters.type;
            if (filters.order_id) params.order_id = filters.order_id;
            if (filters.parcel_id) params.parcel_id = filters.parcel_id;
            if (filters.assigned_to_id) params.assigned_to_id = filters.assigned_to_id;
         }

         const response = await axiosInstance.get(`/issues`, {
            params,
         });
         return response.data;
      },
      getById: async (id: number) => {
         const response = await axiosInstance.get(`/issues/${id}`);
         return response.data;
      },
      create: async (data: any) => {
         const response = await axiosInstance.post(`/issues`, data);
         return response.data;
      },
      update: async (id: number, data: any) => {
         const response = await axiosInstance.patch(`/issues/${id}`, data);
         return response.data;
      },
      resolve: async (id: number, data?: { resolution_notes?: string }) => {
         const response = await axiosInstance.post(`/issues/${id}/resolve`, data || {});
         return response.data;
      },
      delete: async (id: number) => {
         const response = await axiosInstance.delete(`/issues/${id}`);
         return response.data;
      },
      getComments: async (id: number) => {
         const response = await axiosInstance.get(`/issues/${id}/comments`);
         return response.data;
      },
      addComment: async (id: number, data: { content: string; is_internal?: boolean }) => {
         const response = await axiosInstance.post(`/issues/${id}/comments`, data);
         return response.data;
      },
      deleteComment: async (id: number, commentId: number) => {
         const response = await axiosInstance.delete(`/issues/${id}/comments/${commentId}`);
         return response.data;
      },
      getAttachments: async (id: number) => {
         const response = await axiosInstance.get(`/issues/${id}/attachments`);
         return response.data;
      },
      addAttachment: async (id: number, data: any) => {
         const response = await axiosInstance.post(`/issues/${id}/attachments`, data);
         return response.data;
      },
      deleteAttachment: async (id: number, attachmentId: number) => {
         const response = await axiosInstance.delete(`/issues/${id}/attachments/${attachmentId}`);
         return response.data;
      },
   },
   // Legacy Issues API (used for legacy invoices) will be removed in the future
   legacyIssues: {
      getAll: async (
         page: number = 1,
         limit: number = 20,
         filters?: {
            status?: string;
            priority?: string;
            type?: string;
            order_id?: string;
            parcel_id?: string;
            assigned_to_id?: string;
         }
      ) => {
         const params: Record<string, string | number> = {
            page: page + 1,
            limit,
         };

         if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.type) params.type = filters.type;
            if (filters.order_id) params.order_id = filters.order_id;
            if (filters.parcel_id) params.parcel_id = filters.parcel_id;
            if (filters.assigned_to_id) params.assigned_to_id = filters.assigned_to_id;
         }

         const response = await axiosInstance.get(`/legacy-issues`, {
            params,
         });
         return response.data;
      },
      getById: async (id: number) => {
         const response = await axiosInstance.get(`/legacy-issues/${id}`);
         return response.data;
      },
      create: async (data: any) => {
         const response = await axiosInstance.post(`/legacy-issues`, data);
         return response.data;
      },
      update: async (id: number, data: any) => {
         const response = await axiosInstance.patch(`/legacy-issues/${id}`, data);
         return response.data;
      },
      resolve: async (id: number, data?: { resolution_notes?: string }) => {
         const response = await axiosInstance.post(`/legacy-issues/${id}/resolve`, data || {});
         return response.data;
      },
      delete: async (id: number) => {
         const response = await axiosInstance.delete(`/legacy-issues/${id}`);
         return response.data;
      },
      getComments: async (id: number) => {
         const response = await axiosInstance.get(`/legacy-issues/${id}/comments`);
         return response.data;
      },
      addComment: async (id: number, data: { content: string; is_internal?: boolean }) => {
         const response = await axiosInstance.post(`/legacy-issues/${id}/comments`, data);
         return response.data;
      },
      deleteComment: async (id: number, commentId: number) => {
         const response = await axiosInstance.delete(`/legacy-issues/${id}/comments/${commentId}`);
         return response.data;
      },
      getAttachments: async (id: number) => {
         const response = await axiosInstance.get(`/legacy-issues/${id}/attachments`);
         return response.data;
      },
      addAttachment: async (id: number, data: any) => {
         const response = await axiosInstance.post(`/legacy-issues/${id}/attachments`, data);
         return response.data;
      },
      deleteAttachment: async (id: number, attachmentId: number) => {
         const response = await axiosInstance.delete(`/legacy-issues/${id}/attachments/${attachmentId}`);
         return response.data;
      },
      getParcelsByOrderId: async (order_id: number) => {
         const response = await axiosInstance.get(`/legacy/orders/${order_id}/parcels`);
         return response.data;
      },
   },
};

export default api;
