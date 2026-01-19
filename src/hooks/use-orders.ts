import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Discount, Order, Payment } from "@/data/types";

export const useOrders = {
   search: (
      searchQuery: string,
      page: number,
      limit: number,
      startDate: string,
      endDate: string,
      payment_status?: string,
      agency_id?: number
   ) => {
      return useQuery({
         queryKey: ["get-orders", "search", searchQuery, page, limit, startDate, endDate, payment_status, agency_id],
         queryFn: () => api.orders.search(searchQuery, page, limit, startDate, endDate, payment_status, agency_id),
         staleTime: 1000 * 60 * 5,
      });
   },
   getById: (id: number) => {
      return useQuery({
         queryKey: ["get-orders", id],
         queryFn: () => api.orders.getById(id),
         enabled: !!id,
      });
   },
   getParcelsByOrderId: (order_id: number) => {
      return useQuery({
         queryKey: ["get-orders-parcels", order_id],
         queryFn: () => api.orders.getParcelsByOrderId(order_id),
         enabled: !!order_id,
      });
   },
   getHistory: (invoice_id: number) => {
      return useQuery({
         queryKey: ["get-orders-history", invoice_id],
         queryFn: () => api.orders.getHistory(invoice_id),
         enabled: !!invoice_id,
      });
   },
   create: (options?: { onSuccess?: (data: Order) => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: Order) => api.orders.create(data),
         onSuccess: (data: Order) => {
            queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.(data);
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   payOrder: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ order_id, data }: { order_id: number; data: Payment }) => {
            return api.orders.payOrder(order_id, data);
         },
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            await queryClient.invalidateQueries({
               queryKey: ["financial-dashboard"],
            });
            await queryClient.invalidateQueries({ queryKey: ["financial-reports", "daily-closing"] });

            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   deletePayment: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (payment_id: number) => api.orders.deletePayment(payment_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            await queryClient.invalidateQueries({ queryKey: ["financial-dashboard"] });
            await queryClient.invalidateQueries({ queryKey: ["financial-reports", "daily-closing"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   delete: (options?: { onSuccess?: (order_id: number, reason: string) => void; onError?: (error: any, reason: string) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ order_id, reason }: { order_id: number; reason: string }) => api.orders.delete(order_id, reason),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.(variables.order_id, variables.reason);
         },
         onError: (error, variables) => {
            options?.onError?.(error, variables.reason);
         },
      });
   },
   restore: (options?: { onSuccess?: (order_id: number) => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ order_id }: { order_id: number }) => api.orders.restore(order_id),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.(variables.order_id);
         },
      });
   },
   addDiscount: (order_id: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: Discount) => api.orders.createDiscount(order_id, data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   deleteDiscount: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (discount_id: number) => api.orders.deleteDiscount(discount_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
