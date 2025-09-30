import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Invoice, Payment } from "@/data/types";

export const useInvoices = {
	get: (page: number, limit: number) => {
		return useQuery({
			queryKey: ["get-invoices", page, limit],
			queryFn: () => api.invoices.get(page, limit),
		});
	},

	search: (
		searchQuery: string,
		page: number,
		limit: number,
		startDate: string,
		endDate: string,
		
	) => {
		return useQuery({
			queryKey: ["get-invoices", "search", searchQuery, page, limit, startDate, endDate],
			queryFn: () => api.invoices.search(searchQuery, page, limit, startDate, endDate),
			staleTime: 1000 * 60 * 5,
		});
	},
	getById: (id: number) => {
		return useQuery({
			queryKey: ["get-invoice", id],
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
	pay: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ invoice_id, data }: { invoice_id: number; data: Payment }) => {
				return api.invoices.payments.create(invoice_id, data);
			},
			onSuccess: (data: any) => {
				queryClient.invalidateQueries({ queryKey: ["get-invoice", data?.id] });
				queryClient.invalidateQueries({ queryKey: ["get-invoices"] });
				queryClient.invalidateQueries({ queryKey: ["get-invoice-history", data?.id] });
				options?.onSuccess?.();
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
};
