import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Order, Payment } from "@/data/types";

export const useOrders = {
   search: (searchQuery: string, page: number, limit: number, startDate: string, endDate: string) => {
      return useQuery({
         queryKey: ["get-orders", "search", searchQuery, page, limit, startDate, endDate],
         queryFn: () => api.orders.search(searchQuery, page, limit, startDate, endDate),
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
         onSuccess: async (data: any) => {
            await queryClient.invalidateQueries({ queryKey: ["get-order", data?.id] });
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
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
            await queryClient.invalidateQueries({ queryKey: ["get-order"] });
            await queryClient.invalidateQueries({ queryKey: ["get-orders"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
