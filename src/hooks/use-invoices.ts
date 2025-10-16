import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Invoice, Payment } from "@/data/types";

export const useInvoices = {
   search: (searchQuery: string, page: number, limit: number, startDate: string, endDate: string) => {
      return useQuery({
         queryKey: ["get-invoices", "search", searchQuery, page, limit, startDate, endDate],
         queryFn: () => api.invoices.search(searchQuery, page, limit, startDate, endDate),
         staleTime: 1000 * 60 * 5,
      });
   },
   getById: (id: number) => {
      return useQuery({
         queryKey: ["get-order", id],
         queryFn: () => api.invoices.getById(id),
         enabled: !!id,
      });
   },
   getHistory: (invoice_id: number) => {
      return useQuery({
         queryKey: ["get-invoice-history", invoice_id],
         queryFn: () => api.invoices.getHistory(invoice_id),
         enabled: !!invoice_id,
      });
   },
   create: (options?: { onSuccess?: (data: Invoice) => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: Invoice) => api.invoices.create(data),
         onSuccess: (data: Invoice) => {
            queryClient.invalidateQueries({ queryKey: ["get-invoices"] });
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
         mutationFn: ({ invoice_id, data }: { invoice_id: number; data: Payment }) => {
            return api.invoices.payOrder(invoice_id, data);
         },
         onSuccess: async (data: any) => {
            await queryClient.invalidateQueries({ queryKey: ["get-order", data?.id] });
            queryClient.invalidateQueries({ queryKey: ["get-orders-history", data?.id] });
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
         mutationFn: (payment_id: number) => api.invoices.deletePayment(payment_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["get-order"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
